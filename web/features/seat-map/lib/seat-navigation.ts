import type { MapSeat } from "@/features/seat-map/seat-map.types";

export const getNextSeatByDirection = (
  seats: MapSeat[],
  currentSeatId: string,
  direction: "left" | "right" | "up" | "down",
) => {
  const currentSeat = seats.find((seat) => seat.id === currentSeatId);

  if (!currentSeat) {
    return seats[0]?.id ?? null;
  }

  const ordered = [...seats].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return (
      (a.column ?? (Number.parseInt(a.seatNumber, 10) || 0)) -
      (b.column ?? (Number.parseInt(b.seatNumber, 10) || 0))
    );
  });

  const currentIndex = ordered.findIndex((seat) => seat.id === currentSeatId);

  if (currentIndex === -1) return ordered[0]?.id ?? null;

  const deltaMap = {
    left: -1,
    right: 1,
    up: -1,
    down: 1,
  } as const;

  const nextIndex = currentIndex + deltaMap[direction];
  return ordered[nextIndex]?.id ?? ordered[currentIndex]?.id ?? null;
};
