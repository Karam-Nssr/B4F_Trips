"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ActionForm } from "@/components/shared/action-form";
import type { SeatLayout } from "@/features/seat-map/lib/build-seat-layout";
import { SubmitButton } from "@/components/shared/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const seatNumberById = new Map(
    layout.rows.flatMap((row) =>
      row.slots.flatMap((slot) =>
        slot.kind === "seat"
          ? [[slot.seat.id, slot.seat.seatNumber] as const]
          : [],
      ),
    ),
  );
  const seatNumbers = selectedSeats.map(
    (seatId) => seatNumberById.get(seatId) ?? seatId,
  );

  return (
    <ActionForm
      action="create-reservation"
      className="grid gap-5 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]"
    >
      <input type="hidden" name="trip" value={tripId} />
      {selectedSeats.map((seatId) => (
        <input key={seatId} type="hidden" name="seat" value={seatId} />
      ))}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Choose a seat</CardTitle>
          <p className="text-sm text-slate-500">
            Select from the current trip availability.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mx-auto max-w-sm rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 border-b border-slate-200 pb-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Bus front
              </p>
              <p className="mt-1 text-xs text-slate-500">Driver</p>
            </div>
            <div className="space-y-2" role="group" aria-label="Trip seat layout">
              {layout.rows.map((row) => (
                <div
                  key={row.rowNumber}
                  className="grid items-center gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${layout.trackCount}, minmax(0, 1fr))`,
                  }}
                >
                  {row.slots.map((slot, index) => {
                    if (slot.kind !== "seat") {
                      return (
                        <span
                          aria-hidden="true"
                          key={`${slot.kind}-${row.rowNumber}-${index}`}
                          className="h-9"
                        />
                      );
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
                          setSelectedSeats((current) =>
                            isSelected
                              ? current.filter((id) => id !== slot.seat.id)
                              : [...current, slot.seat.id],
                          );
                        }}
                        className={`h-9 min-w-0 rounded-md border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          unavailable
                            ? "cursor-not-allowed border-slate-200 bg-slate-200 text-slate-500"
                            : isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-primary bg-white text-primary hover:bg-blue-50"
                        }`}
                      >
                        {slot.seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Rear
            </p>
          </div>
          <div
            className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500"
            aria-label="Seat key"
          >
            <span>
              <span className="mr-1.5 inline-block h-3 w-3 rounded border border-primary bg-white align-middle" />
              Available
            </span>
            <span>
              <span className="mr-1.5 inline-block h-3 w-3 rounded bg-slate-200 align-middle" />
              Reserved
            </span>
            <span>
              <span className="mr-1.5 inline-block h-3 w-3 rounded bg-primary align-middle" />
              Selected
            </span>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Passenger details</CardTitle>
            <p className="text-sm text-slate-500">
              Enter the passenger details for each selected seat.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedSeats.length ? (
              selectedSeats.map((seatId, index) => (
                <fieldset
                  key={seatId}
                  className="grid gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0 sm:grid-cols-2"
                >
                  <legend className="mb-2 text-sm font-semibold text-slate-800">
                    Seat {seatNumbers[index]} passenger
                  </legend>
                  <label
                    htmlFor={`passengerName-${seatId}`}
                    className="space-y-2 text-sm text-slate-700"
                  >
                    Passenger name
                    <Input
                      id={`passengerName-${seatId}`}
                      name={`passengerName-${seatId}`}
                      autoComplete={index === 0 ? "name" : "off"}
                      minLength={2}
                      required
                    />
                  </label>
                  <label
                    htmlFor={`passengerPhone-${seatId}`}
                    className="space-y-2 text-sm text-slate-700"
                  >
                    Mobile number
                    <Input
                      id={`passengerPhone-${seatId}`}
                      name={`passengerPhone-${seatId}`}
                      type="tel"
                      dir="ltr"
                      autoComplete={index === 0 ? "tel" : "off"}
                      minLength={7}
                      required
                    />
                  </label>
                </fieldset>
              ))
            ) : (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                Select an available seat to enter passenger details.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Reservation summary</CardTitle>
            <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
              {selectedSeats.length
                ? `Seat${selectedSeats.length === 1 ? "" : "s"} ${seatNumbers.join(", ")}`
                : "No seats"}
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              {selectedSeats.length} passenger
              {selectedSeats.length === 1 ? "" : "s"} ·{" "}
              {price.toLocaleString()} SYP per seat
            </p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-slate-200 pt-4">
              <div>
                <p className="text-xs text-slate-500">Total fare</p>
                <p className="mt-1 text-2xl font-medium text-slate-900">
                  {(selectedSeats.length * price).toLocaleString()} SYP
                </p>
              </div>
              <SubmitButton disabled={!selectedSeats.length}>
                Confirm reservation
              </SubmitButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </ActionForm>
  );
};
