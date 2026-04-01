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

interface Customer {
  id: string;
  lastName: string;
  firstName: string;
  lastKana: string;
  firstKana: string;
  phone: string;
  email: string;
}

interface CustomerForm {
  lastName: string;
  firstName: string;
  lastKana: string;
  firstKana: string;
  phone: string;
  email: string;
}

const initialForm: CustomerForm = {
  lastName: "",
  firstName: "",
  lastKana: "",
  firstKana: "",
  phone: "",
  email: "",
};

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerForm>(initialForm);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
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

  const openEditDialog = (item: Customer) => {
    setEditingId(item.id);
    setForm({
      lastName: item.lastName,
      firstName: item.firstName,
      lastKana: item.lastKana,
      firstKana: item.firstKana,
      phone: item.phone,
      email: item.email,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await fetch(`/api/customers/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/customers", {
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
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    fetchItems();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">顧客管理</h1>
        <Button onClick={openCreateDialog}>新規登録</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">読み込み中...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">名前</th>
              <th className="text-left p-3">フリガナ</th>
              <th className="text-left p-3">電話番号</th>
              <th className="text-left p-3">メール</th>
              <th className="text-left p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="p-3">
                  {item.lastName} {item.firstName}
                </td>
                <td className="p-3">
                  {item.lastKana} {item.firstKana}
                </td>
                <td className="p-3">{item.phone}</td>
                <td className="p-3">{item.email}</td>
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
                <td colSpan={5} className="p-3 text-center text-muted-foreground">
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
              {editingId ? "顧客編集" : "顧客新規登録"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">姓</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">名</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastKana">
                  セイ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastKana"
                  required
                  value={form.lastKana}
                  onChange={(e) =>
                    setForm({ ...form, lastKana: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstKana">メイ</Label>
                <Input
                  id="firstKana"
                  value={form.firstKana}
                  onChange={(e) =>
                    setForm({ ...form, firstKana: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">電話番号</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メール</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
