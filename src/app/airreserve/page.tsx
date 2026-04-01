"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SyncResult {
  success: boolean;
  added: number;
  updated: number;
  cancelled: number;
  errors: string[];
  syncedAt: string;
}

export default function AirReservePage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [configured, setConfigured] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncing, setSyncing] = useState(false);

  // 設定読み込み
  useEffect(() => {
    fetch("/api/airreserve/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.configured) {
          setConfigured(true);
          setUsername(data.username);
          setLastSync(data.lastSync);
        }
      });
  }, []);

  // 設定保存
  const handleSave = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/airreserve/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setConfigured(true);
        setTestResult("設定を保存しました");
      } else {
        setTestResult(data.error || "保存に失敗しました");
      }
    } catch {
      setTestResult("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // 接続テスト
  const handleTest = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/airreserve/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      setTestResult(data.success ? "接続成功" : `接続失敗: ${data.message}`);
    } catch {
      setTestResult("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // 手動同期
  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/airreserve/sync", { method: "POST" });
      const data = await res.json();
      setSyncResult(data);
      if (data.syncedAt) {
        setLastSync(data.syncedAt);
      }
    } catch {
      setSyncResult({
        success: false,
        added: 0,
        updated: 0,
        cancelled: 0,
        errors: ["通信エラーが発生しました"],
        syncedAt: new Date().toISOString(),
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">AirReserve 連携設定</h1>

      {/* 接続設定 */}
      <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">ログイン情報</h2>
        <div className="max-w-md space-y-4">
          <div>
            <Label>ユーザー名（メールアドレス）</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="example@email.com"
            />
          </div>
          <div>
            <Label>パスワード</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={configured ? "変更する場合のみ入力" : "パスワード"}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading || !username || !password}>
              {loading ? "保存中..." : "設定を保存"}
            </Button>
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={loading || !username || !password}
            >
              {loading ? "テスト中..." : "接続テスト"}
            </Button>
          </div>
          {testResult && (
            <div
              className={`rounded p-3 text-sm ${
                testResult.includes("成功") || testResult.includes("保存")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {testResult}
            </div>
          )}
        </div>
      </div>

      {/* 同期セクション */}
      <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">データ同期</h2>

        {lastSync && (
          <p className="mb-4 text-sm text-gray-500">
            最終同期: {new Date(lastSync).toLocaleString("ja-JP")}
          </p>
        )}

        <Button onClick={handleSync} disabled={syncing || !configured}>
          {syncing ? "同期中..." : "今すぐ同期"}
        </Button>

        {!configured && (
          <p className="mt-2 text-sm text-gray-500">
            先にログイン情報を保存してください
          </p>
        )}

        {syncResult && (
          <div className="mt-4 rounded border p-4">
            <div
              className={`mb-2 font-medium ${
                syncResult.success ? "text-green-700" : "text-red-700"
              }`}
            >
              {syncResult.success ? "同期完了" : "同期中にエラーが発生"}
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="rounded bg-blue-50 p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {syncResult.added}
                </div>
                <div className="text-gray-600">新規追加</div>
              </div>
              <div className="rounded bg-yellow-50 p-3 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {syncResult.updated}
                </div>
                <div className="text-gray-600">更新</div>
              </div>
              <div className="rounded bg-red-50 p-3 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {syncResult.cancelled}
                </div>
                <div className="text-gray-600">キャンセル</div>
              </div>
            </div>
            {syncResult.errors.length > 0 && (
              <div className="mt-3 rounded bg-red-50 p-3 text-sm text-red-600">
                {syncResult.errors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 説明 */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">同期について</h2>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>
            <strong>双方向同期</strong>: AirReserve ↔ このアプリで予約データが相互に反映されます
          </li>
          <li>AirReserveから取得した予約はカレンダー上で<span className="font-medium text-purple-600">紫色</span>で表示されます</li>
          <li>このアプリで予約を登録・編集・削除すると、AirReserveにも自動で反映されます</li>
          <li>「今すぐ同期」ボタンでAirReserve側の最新データを取り込めます</li>
          <li>今日から2ヶ月先までの予約が同期対象です</li>
        </ul>
      </div>
    </div>
  );
}
