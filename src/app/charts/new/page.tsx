"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomerSearch } from "@/components/customers/customer-search";

export default function NewChartPage() {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [treatmentDate, setTreatmentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
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
  const [saving, setSaving] = useState(false);

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
    if (!treatmentDetail || !customerId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          treatmentDate,
          chiefComplaint: chiefComplaint || undefined,
          bodyCondition: bodyCondition || undefined,
          treatmentArea: treatmentArea || undefined,
          treatmentDetail,
          painLevel: painLevel || undefined,
          mobilityNote: mobilityNote || undefined,
          homeExercise: homeExercise || undefined,
          staffMemo: staffMemo || undefined,
          nextProposal: nextProposal || undefined,
          photoUrls: photoUrls.length > 0 ? JSON.stringify(photoUrls) : undefined,
        }),
      });
      if (res.ok) {
        router.push("/charts");
      }
    } catch (error) {
      console.error("カルテの保存に失敗しました", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">新規カルテ作成</h1>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>
            顧客 <span className="text-red-500">*</span>
          </Label>
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
          <Button onClick={handleSave} disabled={!treatmentDetail || !customerId || saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/charts")}>
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  );
}
