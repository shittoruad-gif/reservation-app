"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Chart {
  id: string;
  treatmentDate: string;
  treatmentDetail: string;
  customer: {
    lastName: string | null;
    firstName: string | null;
    lastKana: string;
  } | null;
}

export default function ChartsPage() {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/charts");
        const data = await res.json();
        setCharts(data);
      } catch (error) {
        console.error("カルテの取得に失敗しました", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCharts();
  }, []);

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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">施術カルテ</h1>
        <Link href="/charts/new">
          <Button>新規作成</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">読み込み中...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">施術日</th>
              <th className="text-left p-3">顧客名</th>
              <th className="text-left p-3">施術内容</th>
              <th className="text-left p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {charts.map((chart) => (
              <tr key={chart.id} className="border-b">
                <td className="p-3">{formatDate(chart.treatmentDate)}</td>
                <td className="p-3">{customerName(chart.customer)}</td>
                <td className="p-3">
                  <span className="line-clamp-1">{chart.treatmentDetail}</span>
                </td>
                <td className="p-3">
                  <Link href={`/charts/${chart.id}`}>
                    <Button variant="outline" size="sm">
                      詳細
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {charts.length === 0 && (
              <tr>
                <td colSpan={4} className="p-3 text-center text-muted-foreground">
                  カルテがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
