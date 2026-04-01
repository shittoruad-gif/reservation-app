"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Menu {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface MenuForm {
  name: string;
  duration: string;
  price: string;
}

const initialForm: MenuForm = { name: "", duration: "", price: "" };

export default function MenusPage() {
  const [items, setItems] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MenuForm>(initialForm);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/menus");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("データの取得に失敗しました", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEditDialog = (item: Menu) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      duration: String(item.duration),
      price: String(item.price),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      duration: Number(form.duration),
      price: Number(form.price),
    };
    if (editingId) {
      await fetch(`/api/menus/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setDialogOpen(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("削除してもよろしいですか？")) return;
    await fetch(`/api/menus/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const formatPrice = (price: number) =>
    `¥${price.toLocaleString()}`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">メニュー管理</h1>
        <Button onClick={openCreateDialog}>新規登録</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">読み込み中...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">メニュー名</th>
              <th className="text-left p-3">所要時間</th>
              <th className="text-left p-3">料金</th>
              <th className="text-left p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.duration}分</td>
                <td className="p-3">{formatPrice(item.price)}</td>
                <td className="p-3 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(item)}
                  >
                    編集
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    削除
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="p-3 text-center text-muted-foreground">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "メニュー編集" : "メニュー新規登録"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">メニュー名</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">所要時間（分）</Label>
              <Input
                id="duration"
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">料金（円）</Label>
              <Input
                id="price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? "更新" : "登録"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
