"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ActionForm } from "@/components/shared/action-form";
import type { SeatLayout } from "@/features/seat-map/lib/build-seat-layout";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";

type SeatMapPickerProps = {
  tripId: string;
  layout: SeatLayout;
  price: number;
};

export const SeatMapPicker = ({
  tripId,
  layout,
  price,
}: SeatMapPickerProps) => {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  useEffect(() => {
    const refreshWhileVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const interval = window.setInterval(refreshWhileVisible, 15000);
    document.addEventListener("visibilitychange", refreshWhileVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhileVisible);
    };
  }, [router]);

  useEffect(() => {
    const availableIds = new Set(
      layout.rows.flatMap((row) =>
        row.slots.flatMap((slot) =>
          slot.kind === "seat" && slot.seat.status === "AVAILABLE"
            ? [slot.seat.id]
            : [],
        ),
      ),
    );
    setSelectedSeats((current) => current.filter((id) => availableIds.has(id)));
  }, [layout]);

  const seatNumbers = layout.rows
    .flatMap((row) => row.slots)
    .filter((slot) => slot.kind === "seat" && selectedSeats.includes(slot.seat.id))
    .map((slot) => slot.kind === "seat" ? slot.seat.seatNumber : "");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 text-xs text-slate-600" aria-label="Seat key">
        <span><span className="mr-1 inline-block h-3 w-3 rounded border border-slate-300 bg-white" />Available</span>
        <span><span className="mr-1 inline-block h-3 w-3 rounded bg-slate-300" />Reserved</span>
        <span><span className="mr-1 inline-block h-3 w-3 rounded bg-primary" />Selected</span>
      </div>
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6">
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
          Front · Driver
        </div>
        <div className="space-y-2" role="group" aria-label="Trip seat layout">
          {layout.rows.map((row) => (
            <div key={row.rowNumber} className="grid items-center gap-2" style={{ gridTemplateColumns: `repeat(${layout.trackCount + 1}, minmax(0, 1fr))` }}>
              <span className="text-center text-xs text-slate-400">{row.rowNumber}</span>
              {row.slots.map((slot, index) => {
                if (slot.kind === "aisle") {
                  return <span aria-hidden="true" key={`aisle-${index}`} className="h-9" />;
                }
                if (slot.kind === "empty") {
                  return <span aria-hidden="true" key={`empty-${index}`} className="h-9" />;
                }
                const isSelected = selectedSeats.includes(slot.seat.id);
                const unavailable = slot.seat.status !== "AVAILABLE";
                return (
                  <button
                    key={slot.seat.id}
                    type="button"
                    aria-disabled={unavailable}
                    aria-label={`Seat ${slot.seat.seatNumber}, row ${slot.seat.row}, ${unavailable ? "reserved" : isSelected ? "selected" : "available"}`}
                    aria-pressed={isSelected}
                    onClick={() => {
                      if (unavailable) return;
                      setSelectedSeats((current) => isSelected
                        ? current.filter((id) => id !== slot.seat.id)
                        : [...current, slot.seat.id]);
                    }}
                    className={`h-9 min-w-0 rounded-lg border px-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      unavailable
                        ? "cursor-not-allowed border-slate-300 bg-slate-300 text-slate-600"
                        : isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    {slot.seat.seatNumber}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <ActionForm action="create-reservation" className="space-y-4">
        <input type="hidden" name="trip" value={tripId} />
        {selectedSeats.map((seatId) => <input key={seatId} type="hidden" name="seat" value={seatId} />)}
        {selectedSeats.map((seatId, index) => {
          const seatNumber = seatNumbers[index];
          return (
            <fieldset key={seatId} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
              <legend className="px-1 text-sm font-medium text-slate-700">Seat {seatNumber} passenger</legend>
              <div className="space-y-2">
                <label htmlFor={`passengerName-${seatId}`} className="text-sm text-slate-600">Passenger name</label>
                <Input id={`passengerName-${seatId}`} name={`passengerName-${seatId}`} autoComplete={index === 0 ? "name" : "off"} minLength={2} required />
              </div>
              <div className="space-y-2">
                <label htmlFor={`passengerPhone-${seatId}`} className="text-sm text-slate-600">Phone</label>
                <Input id={`passengerPhone-${seatId}`} name={`passengerPhone-${seatId}`} type="tel" dir="ltr" autoComplete={index === 0 ? "tel" : "off"} minLength={7} required />
              </div>
            </fieldset>
          );
        })}
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700" aria-live="polite">
          {selectedSeats.length
            ? `Selected seats ${seatNumbers.join(", ")} · Total fare: ${selectedSeats.length * price} SYP`
            : `Select available seats · ${price} SYP per seat`}
        </p>
        <SubmitButton className="w-full" disabled={!selectedSeats.length}>Confirm booking</SubmitButton>
      </ActionForm>
    </div>
  );
};
