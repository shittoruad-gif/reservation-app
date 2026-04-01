"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CustomerSearch } from "@/components/customers/customer-search";

interface Chart {
  id: string;
  customerId: string | null;
  treatmentDate: string;
  chiefComplaint: string | null;
  bodyCondition: string | null;
  treatmentArea: string | null;
  treatmentDetail: string;
  painLevel: string | null;
  mobilityNote: string | null;
  homeExercise: string | null;
  staffMemo: string | null;
  nextProposal: string | null;
  photoUrls: string | null;
  customer: {
    lastName: string | null;
    firstName: string | null;
    lastKana: string;
  } | null;
}

export default function ChartDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [chart, setChart] = useState<Chart | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  // Edit form state
  const [customerId, setCustomerId] = useState("");
  const [treatmentDate, setTreatmentDate] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [bodyCondition, setBodyCondition] = useState("");
  const [treatmentArea, setTreatmentArea] = useState("");
  const [treatmentDetail, setTreatmentDetail] = useState("");
  const [painLevel, setPainLevel] = useState("");
  const [mobilityNote, setMobilityNote] = useState("");
  const [homeExercise, setHomeExercise] = useState("");
  const [staffMemo, setStaffMemo] = useState("");
  const [nextProposal, setNextProposal] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchChart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/charts/${id}`);
      if (!res.ok) throw new Error();
      const data: Chart = await res.json();
      setChart(data);
      populateForm(data);
    } catch (error) {
      console.error("カルテの取得に失敗しました", error);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: Chart) => {
    setCustomerId(data.customerId ?? "");
    setTreatmentDate(data.treatmentDate?.split("T")[0] ?? "");
    setChiefComplaint(data.chiefComplaint ?? "");
    setBodyCondition(data.bodyCondition ?? "");
    setTreatmentArea(data.treatmentArea ?? "");
    setTreatmentDetail(data.treatmentDetail ?? "");
    setPainLevel(data.painLevel ?? "");
    setMobilityNote(data.mobilityNote ?? "");
    setHomeExercise(data.homeExercise ?? "");
    setStaffMemo(data.staffMemo ?? "");
    setNextProposal(data.nextProposal ?? "");
    try {
      const urls = data.photoUrls ? JSON.parse(data.photoUrls) : [];
      setPhotoUrls(Array.isArray(urls) ? urls : []);
    } catch {
      setPhotoUrls([]);
    }
  };

  useEffect(() => {
    if (id) fetchChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      const res = await fetch("/api/charts/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setPhotoUrls((prev) => [...prev, ...data.urls]);
      }
    } catch (error) {
      console.error("写真のアップロードに失敗しました", error);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!treatmentDetail) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/charts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId || undefined,
          treatmentDate,
          chiefComplaint: chiefComplaint || null,
          bodyCondition: bodyCondition || null,
          treatmentArea: treatmentArea || null,
          treatmentDetail,
          painLevel: painLevel || null,
          mobilityNote: mobilityNote || null,
          homeExercise: homeExercise || null,
          staffMemo: staffMemo || null,
          nextProposal: nextProposal || null,
          photoUrls: photoUrls.length > 0 ? JSON.stringify(photoUrls) : null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setChart(updated);
        populateForm(updated);
        setEditing(false);
      }
    } catch (error) {
      console.error("カルテの更新に失敗しました", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/charts/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/charts");
      }
    } catch (error) {
      console.error("カルテの削除に失敗しました", error);
    }
  };

  const handleSyncNotion = async () => {
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await fetch(`/api/charts/${id}/sync-notion`, {
        method: "POST",
      });
      if (res.ok) {
        setSyncMessage("Notionへの同期が完了しました");
      } else {
        const data = await res.json().catch(() => ({}));
        setSyncMessage(data.error ?? "Notion同期に失敗しました");
      }
    } catch {
      setSyncMessage("Notion同期に失敗しました");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(""), 5000);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}/${m}/${day}`;
  };

  const customerName = (customer: Chart["customer"]) => {
    if (!customer) return "-";
    if (customer.lastName) {
      return `${customer.lastName}${customer.firstName ? ` ${customer.firstName}` : ""}`;
    }
    return customer.lastKana;
  };

  const parsedPhotos = (() => {
    if (!chart?.photoUrls) return [];
    try {
      const urls = JSON.parse(chart.photoUrls);
      return Array.isArray(urls) ? urls : [];
    } catch {
      return [];
    }
  })();

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">カルテが見つかりません</p>
      </div>
    );
  }

  const DetailField = ({
    label,
    value,
  }: {
    label: string;
    value: string | null | undefined;
  }) => {
    if (!value) return null;
    return (
      <div>
        <Label className="text-muted-foreground text-xs">{label}</Label>
        <p className="mt-1 whitespace-pre-wrap">{value}</p>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">施術カルテ詳細</h1>
        <div className="flex gap-2">
          {!editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              編集
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleSyncNotion}
            disabled={syncing}
          >
            {syncing ? "同期中..." : "Notionに同期"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            削除
          </Button>
        </div>
      </div>

      {syncMessage && (
        <div
          className={`mb-4 rounded-md p-3 text-sm ${
            syncMessage.includes("完了")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {syncMessage}
        </div>
      )}

      {editing ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>顧客</Label>
            <CustomerSearch value={customerId} onChange={setCustomerId} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentDate">施術日</Label>
            <Input
              id="treatmentDate"
              type="date"
              value={treatmentDate}
              onChange={(e) => setTreatmentDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">主訴・来院理由</Label>
            <Textarea
              id="chiefComplaint"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              rows={3}
              placeholder="例: 腰痛、肩こり、姿勢改善 など"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyCondition">身体の状態・所見</Label>
            <Textarea
              id="bodyCondition"
              value={bodyCondition}
              onChange={(e) => setBodyCondition(e.target.value)}
              rows={3}
              placeholder="例: 右肩挙上制限あり、腰部筋緊張 など"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentArea">施術部位</Label>
            <Textarea
              id="treatmentArea"
              value={treatmentArea}
              onChange={(e) => setTreatmentArea(e.target.value)}
              rows={2}
              placeholder="例: 腰部、肩甲骨周囲、頸部 など"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatmentDetail">
              施術内容 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="treatmentDetail"
              value={treatmentDetail}
              onChange={(e) => setTreatmentDetail(e.target.value)}
              rows={4}
              placeholder="例: 整体（骨盤矯正）、美容鍼20本、ピラティス（コアトレーニング） など"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="painLevel">痛みレベル</Label>
            <Input
              id="painLevel"
              value={painLevel}
              onChange={(e) => setPainLevel(e.target.value)}
              placeholder="例: 施術前 7/10 → 施術後 3/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobilityNote">姿勢・可動域メモ</Label>
            <Textarea
              id="mobilityNote"
              value={mobilityNote}
              onChange={(e) => setMobilityNote(e.target.value)}
              rows={3}
              placeholder="例: 前屈制限改善、肩関節外転90°→120° など"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="homeExercise">ホームケア・セルフエクササイズ</Label>
            <Textarea
              id="homeExercise"
              value={homeExercise}
              onChange={(e) => setHomeExercise(e.target.value)}
              rows={3}
              placeholder="例: 腸腰筋ストレッチ、キャット&カウ 各10回 など"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="staffMemo">施術者メモ</Label>
            <Textarea
              id="staffMemo"
              value={staffMemo}
              onChange={(e) => setStaffMemo(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextProposal">次回提案</Label>
            <Textarea
              id="nextProposal"
              value={nextProposal}
              onChange={(e) => setNextProposal(e.target.value)}
              rows={3}
              placeholder="例: 1週間後に再来院、次回は美容鍼を追加 など"
            />
          </div>

          <div className="space-y-2">
            <Label>写真アップロード</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
            {uploading && (
              <p className="text-sm text-muted-foreground">アップロード中...</p>
            )}
            {photoUrls.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {photoUrls.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`写真 ${i + 1}`}
                      className="h-24 w-24 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!treatmentDetail || saving}
            >
              {saving ? "保存中..." : "保存"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(false);
                if (chart) populateForm(chart);
              }}
            >
              キャンセル
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <Label className="text-muted-foreground text-xs">顧客</Label>
            <p className="mt-1">{customerName(chart.customer)}</p>
          </div>

          <div>
            <Label className="text-muted-foreground text-xs">施術日</Label>
            <p className="mt-1">{formatDate(chart.treatmentDate)}</p>
          </div>

          <DetailField label="主訴・来院理由" value={chart.chiefComplaint} />
          <DetailField label="身体の状態・所見" value={chart.bodyCondition} />
          <DetailField label="施術部位" value={chart.treatmentArea} />

          <div>
            <Label className="text-muted-foreground text-xs">施術内容</Label>
            <p className="mt-1 whitespace-pre-wrap">{chart.treatmentDetail}</p>
          </div>

          <DetailField label="痛みレベル" value={chart.painLevel} />
          <DetailField label="姿勢・可動域メモ" value={chart.mobilityNote} />
          <DetailField label="ホームケア・セルフエクササイズ" value={chart.homeExercise} />
          <DetailField label="施術者メモ" value={chart.staffMemo} />
          <DetailField label="次回提案" value={chart.nextProposal} />

          {parsedPhotos.length > 0 && (
            <div>
              <Label className="text-muted-foreground text-xs">写真</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {parsedPhotos.map((url: string, i: number) => (
                  <img
                    key={i}
                    src={url}
                    alt={`写真 ${i + 1}`}
                    className="h-32 w-32 object-cover rounded-md border"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button variant="outline" onClick={() => router.push("/charts")}>
              一覧に戻る
            </Button>
          </div>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カルテの削除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            このカルテを削除してもよろしいですか？この操作は取り消せません。
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
