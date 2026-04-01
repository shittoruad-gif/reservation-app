"use client";

import { useCallback, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";
import { ReservationModal } from "./reservation-modal";

interface ReservationEvent {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  syncSource: string;
  note: string | null;
  customer: { lastName: string | null; lastKana: string } | null;
  menu: { name: string } | null;
  staff: { name: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "#3b82f6",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
  NO_SHOW: "#6b7280",
};

export function ReservationCalendar() {
  const calendarRef = useRef<FullCalendar>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchEvents = useCallback(
    async (
      info: { startStr: string; endStr: string },
      success: (events: EventInput[]) => void,
      failure: (error: Error) => void
    ) => {
      try {
        const res = await fetch(`/api/reservations?start=${encodeURIComponent(info.startStr)}&end=${encodeURIComponent(info.endStr)}`);
        const data = await res.json();
        const events: EventInput[] = (data.reservations ?? []).map((r: ReservationEvent) => {
          const isAirReserve = r.syncSource === "AIRRESERVE";
          let title: string;
          if (isAirReserve) {
            title = r.note ?? "AirReserve予約";
          } else {
            const customerName = r.customer?.lastName ?? r.customer?.lastKana ?? "不明";
            const menuName = r.menu?.name ?? "";
            title = `${customerName} ${menuName}`.trim();
          }
          const color = isAirReserve ? "#8b5cf6" : (STATUS_COLORS[r.status] ?? "#3b82f6");
          return {
            id: r.id,
            title,
            start: r.startTime,
            end: r.endTime,
            backgroundColor: color,
            borderColor: color,
          };
        });
        success(events);
      } catch (e) {
        failure(e as Error);
      }
    },
    []
  );

  const handleDateSelect = useCallback((info: DateSelectArg) => {
    setSelectedDate({ start: info.start, end: info.end });
    setSelectedId(null);
    setModalOpen(true);
  }, []);

  const handleEventClick = useCallback((info: EventClickArg) => {
    setSelectedId(info.event.id);
    setSelectedDate(null);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback((refresh?: boolean) => {
    setModalOpen(false);
    setSelectedDate(null);
    setSelectedId(null);
    if (refresh) calendarRef.current?.getApi().refetchEvents();
  }, []);

  return (
    <div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale="ja"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "今日",
          month: "月",
          week: "週",
          day: "日",
        }}
        slotMinTime="09:00:00"
        slotMaxTime="21:00:00"
        slotDuration="00:30:00"
        events={fetchEvents}
        selectable={true}
        selectMirror={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        allDaySlot={false}
        nowIndicator={true}
        height="auto"
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          meridiem: false,
          hour12: false,
        }}
      />
      <ReservationModal
        open={modalOpen}
        onClose={handleModalClose}
        selectedDate={selectedDate}
        reservationId={selectedId}
      />
    </div>
  );
}
