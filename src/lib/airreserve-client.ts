import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import * as cheerio from "cheerio";

const BASE_URL = "https://airreserve.net";

export interface AirReserveSlot {
  slotId: string;
  slotName: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  currentCount: number;
  schdlId?: string;
}

export class AirReserveClient {
  private client: AxiosInstance;
  private apiToken = "";
  private apiSid = "";
  private apiCsrf = "";

  constructor() {
    const jar = new CookieJar();
    this.client = wrapper(
      axios.create({
        jar,
        withCredentials: true,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
        maxRedirects: 10,
      })
    );
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      // Step 1: Get login page to extract form tokens
      const loginPageRes = await this.client.get(
        `${BASE_URL}/reserve/calendar/`
      );
      const $ = cheerio.load(loginPageRes.data);

      // Extract CSRF token from meta tag or form
      const csrfToken =
        $('meta[name="csrf-token"]').attr("content") ||
        $('input[name="_token"]').val() ||
        $('input[name="csrfmiddlewaretoken"]').val() ||
        "";

      // Find login form and extract action URL
      const loginForm = $("form").first();
      const formAction = loginForm.attr("action") || "/login";
      const formParams = this.extractFormParams($, loginForm);

      // Step 2: Submit login credentials
      const loginRes = await this.client.post(
        formAction.startsWith("http") ? formAction : `${BASE_URL}${formAction}`,
        new URLSearchParams({
          ...formParams,
          username: username,
          password: password,
          _token: csrfToken as string,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // Step 3: Extract API tokens from response
      const $res = cheerio.load(loginRes.data);
      this.apiCsrf =
        ($res('meta[name="csrf-token"]').attr("content") as string) ||
        csrfToken as string;

      // Check for notification page (some AirReserve accounts show a notice after login)
      const noticeForm = $res('form[action*="notice"]');
      if (noticeForm.length > 0) {
        const noticeAction = noticeForm.attr("action") || "";
        const noticeParams = this.extractFormParams($res, noticeForm);
        await this.client.post(
          noticeAction.startsWith("http")
            ? noticeAction
            : `${BASE_URL}${noticeAction}`,
          new URLSearchParams(noticeParams).toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
      }

      this.apiToken = "authenticated";
      return true;
    } catch (error) {
      console.error("AirReserve login failed:", error);
      return false;
    }
  }

  async searchCalendar(
    dateFrom: Date,
    dateTo: Date
  ): Promise<AirReserveSlot[]> {
    if (!this.apiToken) {
      throw new Error("Not authenticated. Call login() first.");
    }

    try {
      const fromStr = this.formatDate(dateFrom);
      const toStr = this.formatDate(dateTo);

      const res = await this.client.post(
        `${BASE_URL}/stateful/booking/lesson/search/calendar`,
        {
          dateFrom: fromStr,
          dateTo: toStr,
        },
        {
          headers: {
            "X-CSRF-TOKEN": this.apiCsrf,
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      const data = res.data?.dto || res.data;
      const slots: AirReserveSlot[] = [];

      if (data && typeof data === "object") {
        // data is organized by date: { "2026-03-29": [...], ... }
        for (const [, lessons] of Object.entries(data)) {
          if (!Array.isArray(lessons)) continue;
          for (const lesson of lessons as Array<Record<string, unknown>>) {
            const entity = lesson.slotEntity as Record<string, unknown> | undefined;
            if (!entity) continue;

            slots.push({
              slotId: lesson.slotId as string,
              slotName: (entity.slotNm as string) || "不明",
              startTime: this.parseAirDate(entity.fromDt as string),
              endTime: this.parseAirDate(entity.toDt as string),
              capacity: (entity.slotCapacityPaxCnt as number) || 0,
              currentCount: (entity.entryPaxCntTotal as number) || 0,
              schdlId: lesson.schdlId as string | undefined,
            });
          }
        }
      }

      return slots;
    } catch (error) {
      console.error("AirReserve calendar search failed:", error);
      throw error;
    }
  }

  // =============================================
  // 書き込み系API（双方向同期用）
  // =============================================

  /** 予約枠を編集する */
  async slotEdit(payload: Record<string, unknown>): Promise<boolean> {
    this.ensureAuthenticated();
    try {
      const res = await this.client.post(
        `${BASE_URL}/stateful/schdl/lesson/slot/edit/complete`,
        payload,
        { headers: this.authHeaders() }
      );
      return res.status >= 200 && res.status < 300;
    } catch (error) {
      console.error("AirReserve slotEdit failed:", error);
      return false;
    }
  }

  /** 予約枠を削除する */
  async slotDelete(schdlId: string): Promise<boolean> {
    this.ensureAuthenticated();
    try {
      const res = await this.client.post(
        `${BASE_URL}/stateful/schdl/lesson/slot/delete/complete`,
        { schdlId },
        { headers: this.authHeaders() }
      );
      return res.status >= 200 && res.status < 300;
    } catch (error) {
      console.error("AirReserve slotDelete failed:", error);
      return false;
    }
  }

  /** 予約枠の詳細情報を取得する */
  async slotInfo(schdlId: string): Promise<Record<string, unknown> | null> {
    this.ensureAuthenticated();
    try {
      const res = await this.client.post(
        `${BASE_URL}/stateful/schdl/lesson/slot/info`,
        { schdlId },
        { headers: this.authHeaders() }
      );
      return res.data?.dto || res.data || null;
    } catch (error) {
      console.error("AirReserve slotInfo failed:", error);
      return null;
    }
  }

  /** サービス情報を取得する */
  async svcInfo(schdlId: string): Promise<Record<string, unknown> | null> {
    this.ensureAuthenticated();
    try {
      const res = await this.client.post(
        `${BASE_URL}/stateful/schdl/lesson/svc/info`,
        { schdlId },
        { headers: this.authHeaders() }
      );
      return res.data?.dto || res.data || null;
    } catch (error) {
      console.error("AirReserve svcInfo failed:", error);
      return null;
    }
  }

  private ensureAuthenticated() {
    if (!this.apiToken) {
      throw new Error("Not authenticated. Call login() first.");
    }
  }

  private authHeaders() {
    return {
      "X-CSRF-TOKEN": this.apiCsrf,
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    };
  }

  async testConnection(
    username: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.login(username, password);
      if (result) {
        return { success: true, message: "接続に成功しました" };
      }
      return { success: false, message: "ログインに失敗しました" };
    } catch {
      return { success: false, message: "接続エラーが発生しました" };
    }
  }

  private extractFormParams(
    $: cheerio.CheerioAPI,
    form: cheerio.Cheerio<cheerio.Element>
  ): Record<string, string> {
    const params: Record<string, string> = {};
    form.find("input").each((_, el) => {
      const name = $(el).attr("name");
      const value = $(el).val();
      if (name && typeof value === "string") {
        params[name] = value;
      }
    });
    return params;
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}${m}${d}000000`;
  }

  private parseAirDate(dateStr: string): Date {
    // Format: YYYYMMDDHHmmss
    if (!dateStr || dateStr.length < 14) return new Date();
    const y = parseInt(dateStr.slice(0, 4));
    const m = parseInt(dateStr.slice(4, 6)) - 1;
    const d = parseInt(dateStr.slice(6, 8));
    const h = parseInt(dateStr.slice(8, 10));
    const min = parseInt(dateStr.slice(10, 12));
    return new Date(y, m, d, h, min);
  }
}
