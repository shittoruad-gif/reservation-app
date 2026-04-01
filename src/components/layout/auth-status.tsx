"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LogIn } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function AuthStatus() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (loading) return null;

  if (!user) {
    return (
      <div className="border-t p-3">
        <a
          href="/login"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <LogIn className="h-4 w-4" />
          ログイン
        </a>
      </div>
    );
  }

  return (
    <div className="border-t p-3">
      <div className="mb-1 px-3 text-xs text-gray-400">{user.name}</div>
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      >
        <LogOut className="h-4 w-4" />
        ログアウト
      </button>
    </div>
  );
}
