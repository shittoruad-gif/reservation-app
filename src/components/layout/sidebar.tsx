"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, Users, Scissors, Box, UserCircle, ClipboardList, RefreshCw, Database } from "lucide-react";
import { AuthStatus } from "./auth-status";

const navItems = [
  { href: "/calendar", label: "予約カレンダー", icon: Calendar },
  { href: "/charts", label: "施術カルテ", icon: ClipboardList },
  { href: "/staffs", label: "スタッフ管理", icon: Users },
  { href: "/menus", label: "メニュー管理", icon: Scissors },
  { href: "/resources", label: "リソース管理", icon: Box },
  { href: "/customers", label: "顧客管理", icon: UserCircle },
  { href: "/airreserve", label: "AirReserve連携", icon: RefreshCw },
  { href: "/notion", label: "Notion連携", icon: Database },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-full w-56 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="text-lg font-bold text-gray-900">
          予約管理
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <AuthStatus />
    </aside>
  );
}
