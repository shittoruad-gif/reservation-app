-- CreateTable
CREATE TABLE "airreserve_config" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "last_sync" DATETIME,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT,
    "staff_id" TEXT,
    "menu_id" TEXT,
    "resource_id" TEXT,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "note" TEXT,
    "air_reserve_slot_id" TEXT,
    "sync_source" TEXT NOT NULL DEFAULT 'LOCAL',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reservations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reservations_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staffs" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reservations_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reservations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_reservations" ("created_at", "customer_id", "end_time", "id", "menu_id", "note", "resource_id", "staff_id", "start_time", "status", "updated_at") SELECT "created_at", "customer_id", "end_time", "id", "menu_id", "note", "resource_id", "staff_id", "start_time", "status", "updated_at" FROM "reservations";
DROP TABLE "reservations";
ALTER TABLE "new_reservations" RENAME TO "reservations";
CREATE UNIQUE INDEX "reservations_air_reserve_slot_id_key" ON "reservations"("air_reserve_slot_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
