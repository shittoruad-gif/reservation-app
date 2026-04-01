-- CreateTable
CREATE TABLE "staffs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "name_kana" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "last_name" TEXT,
    "first_name" TEXT,
    "last_kana" TEXT NOT NULL,
    "first_kana" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "menus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "resource_id" TEXT,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reservations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staffs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
