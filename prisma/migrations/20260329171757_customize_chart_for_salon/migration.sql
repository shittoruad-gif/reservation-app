/*
  Warnings:

  - You are about to drop the column `materials` on the `charts` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_charts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "reservation_id" TEXT,
    "treatment_date" DATETIME NOT NULL,
    "chief_complaint" TEXT,
    "body_condition" TEXT,
    "treatment_area" TEXT,
    "treatment_detail" TEXT NOT NULL,
    "pain_level" TEXT,
    "mobility_note" TEXT,
    "home_exercise" TEXT,
    "staff_memo" TEXT,
    "next_proposal" TEXT,
    "photo_urls" TEXT,
    "notion_page_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "charts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "charts_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_charts" ("created_at", "customer_id", "id", "next_proposal", "notion_page_id", "photo_urls", "reservation_id", "staff_memo", "treatment_date", "treatment_detail", "updated_at") SELECT "created_at", "customer_id", "id", "next_proposal", "notion_page_id", "photo_urls", "reservation_id", "staff_memo", "treatment_date", "treatment_detail", "updated_at" FROM "charts";
DROP TABLE "charts";
ALTER TABLE "new_charts" RENAME TO "charts";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
