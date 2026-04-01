import { z } from "zod";

export const createReservationSchema = z.object({
  customerId: z.string().min(1, "顧客を選択してください"),
  staffId: z.string().min(1, "担当スタッフを選択してください"),
  menuId: z.string().min(1, "メニューを選択してください"),
  resourceId: z.string().nullable().optional(),
  startTime: z.string().min(1, "開始日時を指定してください"),
  endTime: z.string().min(1, "終了日時を指定してください"),
  note: z.string().optional(),
});

export const updateReservationSchema = createReservationSchema.partial().extend({
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]).optional(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;

export const createCustomerSchema = z.object({
  lastName: z.string().optional(),
  firstName: z.string().optional(),
  lastKana: z.string().min(1, "フリガナ（セイ）は必須です"),
  firstKana: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("正しいメールアドレスを入力してください").optional().or(z.literal("")),
  note: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const createStaffSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  nameKana: z.string().min(1, "フリガナは必須です"),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const createMenuSchema = z.object({
  name: z.string().min(1, "メニュー名は必須です"),
  duration: z.number().min(5, "5分以上を指定してください"),
  price: z.number().min(0, "0円以上を指定してください"),
});

export type CreateMenuInput = z.infer<typeof createMenuSchema>;

export const createResourceSchema = z.object({
  name: z.string().min(1, "リソース名は必須です"),
  type: z.string().min(1, "種別は必須です"),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
