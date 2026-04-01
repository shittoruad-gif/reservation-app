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

interface Resource {
  id: string;
  name: string;
  type: string;
}

interface ResourceForm {
  name: string;
  type: string;
}

const initialForm: ResourceForm = { name: "", type: "" };

export default function ResourcesPage() {
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ResourceForm>(initialForm);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resources");
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

  const openEditDialog = (item: Resource) => {
    setEditingId(item.id);
    setForm({ name: item.name, type: item.type });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await fetch(`/api/resources/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setDialogOpen(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("削除してもよろしいですか？")) return;
    await fetch(`/api/resources/${id}`, { method: "DELETE" });
    fetchItems();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">リソース管理</h1>
        <Button onClick={openCreateDialog}>新規登録</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">読み込み中...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">リソース名</th>
              <th className="text-left p-3">種別</th>
              <th className="text-left p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.type}</td>
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
                <td colSpan={3} className="p-3 text-center text-muted-foreground">
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
              {editingId ? "リソース編集" : "リソース新規登録"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">リソース名</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">種別</Label>
              <Input
                id="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
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
