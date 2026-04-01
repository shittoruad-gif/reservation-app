"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NotionConfigPage() {
  const [apiKey, setApiKey] = useState("");
  const [databaseId, setDatabaseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/notion/config");
        if (res.ok) {
          const data = await res.json();
          if (data.apiKey) setApiKey(data.apiKey);
          if (data.databaseId) setDatabaseId(data.databaseId);
          setConfigured(!!data.apiKey && !!data.databaseId);
        }
      } catch (error) {
        console.error("設定の取得に失敗しました", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/notion/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, databaseId }),
      });
      if (res.ok) {
        setConfigured(true);
        setMessage("設定を保存しました");
      } else {
        setMessage("設定の保存に失敗しました");
      }
    } catch {
      setMessage("設定の保存に失敗しました");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Notion連携設定</h1>

      <div className="mb-6 rounded-md border p-4">
        <p className="text-sm font-medium">
          ステータス:{" "}
          {configured ? (
            <span className="text-green-600">設定済み</span>
          ) : (
            <span className="text-yellow-600">未設定</span>
          )}
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-md p-3 text-sm ${
            message.includes("保存しました")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="apiKey">APIキー</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="secret_..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="databaseId">データベースID</Label>
          <Input
            id="databaseId"
            value={databaseId}
            onChange={(e) => setDatabaseId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
        </div>

        <Button onClick={handleSave} disabled={saving || !apiKey || !databaseId}>
          {saving ? "保存中..." : "設定を保存"}
        </Button>
      </div>

      <div className="mt-8 rounded-md border p-4 space-y-3">
        <h2 className="text-lg font-semibold">設定方法</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">1. APIキーの取得</p>
            <p>
              Notion Integrations ページ（https://www.notion.so/my-integrations）にアクセスし、
              新しいインテグレーションを作成してください。作成後に表示される「Internal Integration Secret」がAPIキーです。
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">
              2. データベースIDの取得
            </p>
            <p>
              Notionでカルテ用のデータベースを作成し、そのページURLからデータベースIDを取得してください。
              URLの形式: https://www.notion.so/ワークスペース名/データベースID?v=...
              の「データベースID」部分（32桁の英数字）をコピーしてください。
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">
              3. インテグレーションの接続
            </p>
            <p>
              Notionデータベースページの右上「...」メニューから「コネクト」を選択し、
              作成したインテグレーションを接続してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
