import { prisma } from "./prisma";
import { AirReserveClient, AirReserveSlot } from "./airreserve-client";

export interface SyncResult {
  success: boolean;
  added: number;
  updated: number;
  cancelled: number;
  pushed: number;
  pushErrors: string[];
  errors: string[];
  syncedAt: Date;
}

/** AirReserveクライアントを認証済みで取得 */
async function getAuthenticatedClient(): Promise<AirReserveClient | null> {
  const config = await prisma.airReserveConfig.findFirst({
    where: { isActive: true },
  });
  if (!config) return null;

  const client = new AirReserveClient();
  const ok = await client.login(config.username, config.password);
  return ok ? client : null;
}

// =============================================
// アプリ → AirReserve（予約をAirReserveに反映）
// =============================================

/** ローカル予約をAirReserveに書き込む */
export async function pushToAirReserve(reservationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { customer: true, staff: true, menu: true },
  });

  if (!reservation) {
    return { success: false, error: "予約が見つかりません" };
  }

  const client = await getAuthenticatedClient();
  if (!client) {
    return { success: false, error: "AirReserveに接続できません" };
  }

  try {
    // 予約名を組み立て
    const customerName = reservation.customer?.lastName ?? reservation.customer?.lastKana ?? "不明";
    const menuName = reservation.menu?.name ?? "";
    const slotName = `${customerName} ${menuName}`.trim();

    if (reservation.airReserveSlotId) {
      // 既存の予約を更新
      const slotInfo = await client.slotInfo(reservation.airReserveSlotId);
      if (!slotInfo) {
        return { success: false, error: "AirReserve側の予約情報が取得できません" };
      }

      const ok = await client.slotEdit({
        ...slotInfo,
        slotNm: slotName,
        fromDt: formatToAirDate(reservation.startTime),
        toDt: formatToAirDate(reservation.endTime),
      });

      return ok
        ? { success: true }
        : { success: false, error: "AirReserveへの更新に失敗しました" };
    } else {
      // 新規予約 → AirReserveにはslotEditで新規作成
      // 注: AirReserveの非公式APIでは新規枠作成のエンドポイントが
      //     不明確なため、編集APIで対応を試みる
      const ok = await client.slotEdit({
        slotNm: slotName,
        fromDt: formatToAirDate(reservation.startTime),
        toDt: formatToAirDate(reservation.endTime),
        slotCapacityPaxCnt: 1,
      });

      if (ok) {
        // 同期ソースを更新（次回同期でマッチングできるようにする）
        await prisma.reservation.update({
          where: { id: reservationId },
          data: { syncSource: "BIDIRECTIONAL" },
        });
        return { success: true };
      }
      return { success: false, error: "AirReserveへの登録に失敗しました" };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
    };
  }
}

/** ローカルで削除した予約をAirReserveからも削除 */
export async function deleteFromAirReserve(airReserveSlotId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const client = await getAuthenticatedClient();
  if (!client) {
    return { success: false, error: "AirReserveに接続できません" };
  }

  try {
    const ok = await client.slotDelete(airReserveSlotId);
    return ok
      ? { success: true }
      : { success: false, error: "AirReserveからの削除に失敗しました" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
    };
  }
}

function formatToAirDate(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${y}${mo}${d}${h}${mi}00`;
}

export async function syncFromAirReserve(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    added: 0,
    updated: 0,
    cancelled: 0,
    pushed: 0,
    pushErrors: [],
    errors: [],
    syncedAt: new Date(),
  };

  // 1. 設定を取得
  const config = await prisma.airReserveConfig.findFirst({
    where: { isActive: true },
  });

  if (!config) {
    result.errors.push("AirReserve設定が見つかりません");
    return result;
  }

  // 2. AirReserveにログイン
  const client = new AirReserveClient();
  const loginSuccess = await client.login(config.username, config.password);

  if (!loginSuccess) {
    result.errors.push("AirReserveへのログインに失敗しました");
    return result;
  }

  // 3. 今日〜2ヶ月先の予約を取得
  const now = new Date();
  const twoMonthsLater = new Date();
  twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);

  let slots: AirReserveSlot[];
  try {
    slots = await client.searchCalendar(now, twoMonthsLater);
  } catch (error) {
    result.errors.push(
      `予約データの取得に失敗: ${error instanceof Error ? error.message : "不明なエラー"}`
    );
    return result;
  }

  // 4. 各予約を同期
  const processedSlotIds = new Set<string>();

  for (const slot of slots) {
    try {
      processedSlotIds.add(slot.slotId);

      // 既存の同期済み予約を検索
      const existing = await prisma.reservation.findUnique({
        where: { airReserveSlotId: slot.slotId },
      });

      if (existing) {
        // 既存予約を更新（時刻変更があった場合）
        const startChanged =
          existing.startTime.getTime() !== slot.startTime.getTime();
        const endChanged =
          existing.endTime.getTime() !== slot.endTime.getTime();
        const noteChanged = existing.note !== slot.slotName;

        if (startChanged || endChanged || noteChanged) {
          await prisma.reservation.update({
            where: { id: existing.id },
            data: {
              startTime: slot.startTime,
              endTime: slot.endTime,
              note: slot.slotName,
            },
          });
          result.updated++;
        }
      } else {
        // 新規予約を作成（AirReserve同期）
        await prisma.reservation.create({
          data: {
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: "CONFIRMED",
            note: `[AirReserve] ${slot.slotName} (${slot.currentCount}/${slot.capacity}名)`,
            airReserveSlotId: slot.slotId,
            syncSource: "AIRRESERVE",
            // customer, staff, menu は null（AirReserveからはマッピング不可）
          },
        });
        result.added++;
      }
    } catch (error) {
      result.errors.push(
        `Slot ${slot.slotId} の同期失敗: ${error instanceof Error ? error.message : "不明"}`
      );
    }
  }

  // 5. AirReserveに存在しなくなった予約をキャンセル
  try {
    const airReserveReservations = await prisma.reservation.findMany({
      where: {
        syncSource: "AIRRESERVE",
        status: { not: "CANCELLED" },
        startTime: { gte: now },
      },
    });

    for (const reservation of airReserveReservations) {
      if (
        reservation.airReserveSlotId &&
        !processedSlotIds.has(reservation.airReserveSlotId)
      ) {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: "CANCELLED" },
        });
        result.cancelled++;
      }
    }
  } catch (error) {
    result.errors.push(
      `キャンセル処理失敗: ${error instanceof Error ? error.message : "不明"}`
    );
  }

  // 6. 最終同期日時を更新
  await prisma.airReserveConfig.update({
    where: { id: config.id },
    data: { lastSync: result.syncedAt },
  });

  result.success = result.errors.length === 0;
  return result;
}
