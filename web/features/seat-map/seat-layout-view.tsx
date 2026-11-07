import { buildSeatLayout } from "@/features/seat-map/lib/build-seat-layout";
import type { MapSeat } from "@/features/seat-map/seat-map.types";

export const SeatLayoutView = ({ seats }: { seats: MapSeat[] }) => {
  const layout = buildSeatLayout(seats);

  if (!layout.rows.length) {
    return <p className="text-sm text-slate-500">No seat layout is available.</p>;
  }

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">Front</div>
      <div className="space-y-2">
        {layout.rows.map((row) => (
          <div key={row.rowNumber} className="grid items-center gap-2" style={{ gridTemplateColumns: `repeat(${layout.trackCount + 1}, minmax(0, 1fr))` }}>
            <span className="text-center text-xs text-slate-400">{row.rowNumber}</span>
            {row.slots.map((slot, index) => slot.kind === "seat"
              ? <span key={slot.seat.id} title={`Seat ${slot.seat.seatNumber}`} className="flex h-9 items-center justify-center rounded-lg border border-blue-200 bg-white text-xs font-semibold text-blue-700">{slot.seat.seatNumber}</span>
              : <span aria-hidden="true" key={`${slot.kind}-${row.rowNumber}-${index}`} className="h-9" />)}
          </div>
        ))}
      </div>
    </div>
  );
};
