import Link from "next/link";
import { Calendar, Users, Scissors, Box, UserCircle, ClipboardList } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">ダッシュボード</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          href="/calendar"
          icon={Calendar}
          title="予約カレンダー"
          description="予約の確認・登録・編集"
        />
        <DashboardCard
          href="/charts"
          icon={ClipboardList}
          title="施術カルテ"
          description="施術記録の管理・写真添付"
        />
        <DashboardCard
          href="/staffs"
          icon={Users}
          title="スタッフ管理"
          description="スタッフの登録・編集"
        />
        <DashboardCard
          href="/menus"
          icon={Scissors}
          title="メニュー管理"
          description="メニューの登録・編集"
        />
        <DashboardCard
          href="/resources"
          icon={Box}
          title="リソース管理"
          description="設備の登録・編集"
        />
        <DashboardCard
          href="/customers"
          icon={UserCircle}
          title="顧客管理"
          description="顧客情報の管理"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-lg border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
        <Icon className="h-6 w-6 text-gray-600" />
      </div>
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
