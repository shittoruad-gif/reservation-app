"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Customer {
  id: string;
  lastName: string | null;
  firstName: string | null;
  lastKana: string;
  firstKana: string | null;
  phone: string | null;
}

interface Props {
  value: string;
  onChange: (customerId: string) => void;
}

export function CustomerSearch({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load selected customer if value is provided
  useEffect(() => {
    if (value && !selectedCustomer) {
      fetch(`/api/customers/${value}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.id) setSelectedCustomer(data);
        })
        .catch(() => {});
    }
  }, [value, selectedCustomer]);

  useEffect(() => {
    if (query.length < 1) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers/search?kana=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.customers ?? []);
        setShowResults(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (customer: Customer) => {
      setSelectedCustomer(customer);
      onChange(customer.id);
      setShowResults(false);
      setQuery("");
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setSelectedCustomer(null);
    onChange("");
  }, [onChange]);

  const [newLastKana, setNewLastKana] = useState("");
  const [newFirstKana, setNewFirstKana] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const handleCreate = async () => {
    if (!newLastKana) return;
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lastKana: newLastKana,
        firstKana: newFirstKana || undefined,
        phone: newPhone || undefined,
      }),
    });
    if (res.ok) {
      const customer = await res.json();
      handleSelect(customer);
      setShowNewDialog(false);
      setNewLastKana("");
      setNewFirstKana("");
      setNewPhone("");
    }
  };

  if (selectedCustomer) {
    const displayName = selectedCustomer.lastName ?? selectedCustomer.lastKana;
    const displayKana = [selectedCustomer.lastKana, selectedCustomer.firstKana].filter(Boolean).join(" ");
    return (
      <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
        <span className="flex-1 text-sm">
          {displayName}
          {selectedCustomer.firstName ? ` ${selectedCustomer.firstName}` : ""}
          <span className="ml-2 text-gray-500">({displayKana})</span>
        </span>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          変更
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        placeholder="フリガナで検索（例: タナカ）"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setShowResults(true)}
      />

      {showResults && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
          {loading && <div className="p-3 text-sm text-gray-500">検索中...</div>}
          {!loading && results.length === 0 && query.length >= 1 && (
            <div className="p-3">
              <p className="text-sm text-gray-500">一致する顧客が見つかりません</p>
              <Button
                variant="link"
                className="mt-1 h-auto p-0 text-sm"
                onClick={() => {
                  setNewLastKana(query);
                  setShowNewDialog(true);
                  setShowResults(false);
                }}
              >
                + 新規顧客として登録
              </Button>
            </div>
          )}
          {results.map((c) => (
            <button
              key={c.id}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
              onClick={() => handleSelect(c)}
            >
              <div className="font-medium">
                {c.lastName ?? c.lastKana}
                {c.firstName ? ` ${c.firstName}` : ""}
              </div>
              <div className="text-gray-500">
                {c.lastKana}
                {c.firstKana ? ` ${c.firstKana}` : ""}
                {c.phone ? ` | ${c.phone}` : ""}
              </div>
            </button>
          ))}
          {!loading && results.length > 0 && (
            <div className="border-t p-2">
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => {
                  setShowNewDialog(true);
                  setShowResults(false);
                }}
              >
                + 新規顧客として登録
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規顧客登録</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>フリガナ（セイ）<span className="text-red-500">*</span></Label>
              <Input value={newLastKana} onChange={(e) => setNewLastKana(e.target.value)} placeholder="タナカ" />
            </div>
            <div>
              <Label>フリガナ（メイ）</Label>
              <Input value={newFirstKana} onChange={(e) => setNewFirstKana(e.target.value)} placeholder="タロウ" />
            </div>
            <div>
              <Label>電話番号</Label>
              <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="090-1234-5678" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>キャンセル</Button>
            <Button onClick={handleCreate} disabled={!newLastKana}>登録</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
