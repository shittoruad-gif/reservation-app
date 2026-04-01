import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // スタッフ
  const staff1 = await prisma.staff.create({
    data: { name: "佐藤 花子", nameKana: "サトウ ハナコ" },
  });
  const staff2 = await prisma.staff.create({
    data: { name: "鈴木 一郎", nameKana: "スズキ イチロウ" },
  });

  // メニュー
  const menu1 = await prisma.menu.create({
    data: { name: "カット", duration: 60, price: 5000 },
  });
  const menu2 = await prisma.menu.create({
    data: { name: "カラー", duration: 90, price: 8000 },
  });
  const menu3 = await prisma.menu.create({
    data: { name: "パーマ", duration: 120, price: 10000 },
  });
  await prisma.menu.create({
    data: { name: "トリートメント", duration: 30, price: 3000 },
  });

  // リソース
  const resource1 = await prisma.resource.create({
    data: { name: "セット面1", type: "seat" },
  });
  const resource2 = await prisma.resource.create({
    data: { name: "セット面2", type: "seat" },
  });
  await prisma.resource.create({
    data: { name: "シャンプー台1", type: "shampoo" },
  });

  // 顧客
  const customer1 = await prisma.customer.create({
    data: {
      lastName: "田中",
      firstName: "太郎",
      lastKana: "タナカ",
      firstKana: "タロウ",
      phone: "090-1234-5678",
    },
  });
  const customer2 = await prisma.customer.create({
    data: {
      lastName: "山田",
      firstName: "美咲",
      lastKana: "ヤマダ",
      firstKana: "ミサキ",
      phone: "080-9876-5432",
      email: "yamada@example.com",
    },
  });
  await prisma.customer.create({
    data: {
      lastName: "高橋",
      firstName: "健太",
      lastKana: "タカハシ",
      firstKana: "ケンタ",
      phone: "070-5555-1234",
    },
  });

  // サンプル予約
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.reservation.create({
    data: {
      customerId: customer1.id,
      staffId: staff1.id,
      menuId: menu1.id,
      resourceId: resource1.id,
      startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000),
      endTime: new Date(today.getTime() + 11 * 60 * 60 * 1000),
      status: "CONFIRMED",
    },
  });

  await prisma.reservation.create({
    data: {
      customerId: customer2.id,
      staffId: staff2.id,
      menuId: menu2.id,
      resourceId: resource2.id,
      startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000),
      endTime: new Date(today.getTime() + 15.5 * 60 * 60 * 1000),
      status: "CONFIRMED",
      note: "初回来店",
    },
  });

  // 明日の予約
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  await prisma.reservation.create({
    data: {
      customerId: customer1.id,
      staffId: staff2.id,
      menuId: menu3.id,
      resourceId: resource1.id,
      startTime: new Date(tomorrow.getTime() + 11 * 60 * 60 * 1000),
      endTime: new Date(tomorrow.getTime() + 13 * 60 * 60 * 1000),
      status: "CONFIRMED",
    },
  });

  console.log("シードデータの投入が完了しました");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
