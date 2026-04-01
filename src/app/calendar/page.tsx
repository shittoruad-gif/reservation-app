"use client";

import { ReservationCalendar } from "@/components/calendar/reservation-calendar";

export default function CalendarPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">予約カレンダー</h1>
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <ReservationCalendar />
      </div>
    </div>
  );
}
