-- CreateTable
CREATE TABLE "charts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "reservation_id" TEXT,
    "treatment_date" DATETIME NOT NULL,
    "treatment_detail" TEXT NOT NULL,
    "materials" TEXT,
    "staff_memo" TEXT,
    "next_proposal" TEXT,
    "photo_urls" TEXT,
    "notion_page_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "charts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "charts_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notion_config" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "api_key" TEXT NOT NULL,
    "database_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
