"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerSearch } from "@/components/customers/customer-search";

interface Props {
  open: boolean;
  onClose: (shouldRefresh?: boolean) => void;
  selectedDate: { start: Date; end: Date } | null;
  reservationId: string | null;
}

interface Staff { id: string; name: string; }
interface Menu { id: string; name: string; duration: number; price: number; }
interface Resource { id: string; name: string; }

function formatTime(date: Date) {
  return date.toTimeString().slice(0, 5);
}

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function ReservationModal({ open, onClose, selectedDate, reservationId }: Props) {
  const isEdit = !!reservationId;

  const [customerId, setCustomerId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [menuId, setMenuId] = useState("");
  const [resourceId, setResourceId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch("/api/staffs").then((r) => r.json()),
      fetch("/api/menus").then((r) => r.json()),
      fetch("/api/resources").then((r) => r.json()),
    ]).then(([s, m, r]) => {
      setStaffs(s.staffs ?? s ?? []);
      setMenus(m.menus ?? m ?? []);
      setResources(r.resources ?? r ?? []);
    });
  }, [open]);

  useEffect(() => {
    if (selectedDate && !isEdit) {
      setDate(formatDate(selectedDate.start));
      setStartTime(formatTime(selectedDate.start));
      setEndTime(formatTime(selectedDate.end));
    }
  }, [selectedDate, isEdit]);

  useEffect(() => {
    if (!reservationId || !open) return;
    fetch(`/api/reservations/${reservationId}`)
      .then((r) => r.json())
      .then((data) => {
        setCustomerId(data.customerId);
        setStaffId(data.staffId);
        setMenuId(data.menuId);
        setResourceId(data.resourceId ?? "");
        const s = new Date(data.startTime);
        const e = new Date(data.endTime);
        setDate(formatDate(s));
        setStartTime(formatTime(s));
        setEndTime(formatTime(e));
        setNote(data.note ?? "");
      });
  }, [reservationId, open]);

  const handleMenuChange = useCallback(
    (id: string) => {
      setMenuId(id);
      const menu = menus.find((m) => m.id === id);
      if (menu && startTime && date) {
        const start = new Date(`${date}T${startTime}:00`);
        start.setMinutes(start.getMinutes() + menu.duration);
        setEndTime(formatTime(start));
      }
    },
    [menus, startTime, date]
  );

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();
      const payload = {
        customerId,
        staffId,
        menuId,
        resourceId: resourceId || null,
        startTime: startDateTime,
        endTime: endDateTime,
        note: note || undefined,
      };
      const url = isEdit ? `/api/reservations/${reservationId}` : "/api/reservations";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "保存に失敗しました");
        return;
      }
      onClose(true);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!reservationId || !confirm("この予約を削除しますか？")) return;
    setLoading(true);
    try {
      await fetch(`/api/reservations/${reservationId}`, { method: "DELETE" });
      onClose(true);
    } catch {
      setError("削除に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCustomerId("");
    setStaffId("");
    setMenuId("");
    setResourceId("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setNote("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "予約編集" : "新規予約登録"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div>
            <Label>顧客 <span className="text-red-500">*</span></Label>
            <CustomerSearch value={customerId} onChange={setCustomerId} />
          </div>

          <div>
            <Label>メニュー <span className="text-red-500">*</span></Label>
            <Select value={menuId} onValueChange={handleMenuChange}>
              <SelectTrigger><SelectValue placeholder="メニューを選択" /></SelectTrigger>
              <SelectContent>
                {menus.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}（{m.duration}分 / ¥{m.price.toLocaleString()}）
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>担当スタッフ <span className="text-red-500">*</span></Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger><SelectValue placeholder="スタッフを選択" /></SelectTrigger>
              <SelectContent>
                {staffs.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>日付</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>開始</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} step="1800" />
            </div>
            <div>
              <Label>終了</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} step="1800" />
            </div>
          </div>

          <div>
            <Label>リソース</Label>
            <Select value={resourceId} onValueChange={setResourceId}>
              <SelectTrigger><SelectValue placeholder="リソースを選択（任意）" /></SelectTrigger>
              <SelectContent>
                {resources.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>メモ</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="備考..." rows={2} />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {isEdit && (
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              削除
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleClose}>キャンセル</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "保存中..." : "保存"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
