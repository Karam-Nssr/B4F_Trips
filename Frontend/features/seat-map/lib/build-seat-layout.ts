export type SeatPosition = "LEFT" | "MIDDLE" | "RIGHT";

export type MapSeat = {
  id: string;
  seatNumber: string;
  row: number;
  column?: number;
  position?: SeatPosition;
  status?: "AVAILABLE" | "RESERVED" | "UNAVAILABLE";
};

export type SeatSlot =
  | { kind: "seat"; seat: MapSeat }
  | { kind: "aisle" }
  | { kind: "empty" };

export type SeatLayout = {
  rows: Array<{ rowNumber: number; slots: SeatSlot[] }>;
  leftCount: number;
  rightCount: number;
  hasMiddle: boolean;
  trackCount: number;
};

export const buildSeatLayout = (seats: MapSeat[]): SeatLayout => {
  const grouped = new Map<number, MapSeat[]>();

  for (const seat of seats) {
    const rowSeats = grouped.get(seat.row) ?? [];
    rowSeats.push(seat);
    grouped.set(seat.row, rowSeats);
  }

  const sortedRows = Array.from(grouped.entries()).sort(([a], [b]) => a - b);
  let leftCount = 0;
  let rightCount = 0;

  for (const [, rowSeats] of sortedRows) {
    const leftSeats = rowSeats
      .filter((seat) => seat.position === "LEFT")
      .sort(
        (a, b) =>
          ((a.column ?? Number.parseInt(a.seatNumber, 10)) || 0) -
          ((b.column ?? Number.parseInt(b.seatNumber, 10)) || 0),
      );
    const rightSeats = rowSeats
      .filter((seat) => seat.position === "RIGHT")
      .sort(
        (a, b) =>
          ((a.column ?? Number.parseInt(a.seatNumber, 10)) || 0) -
          ((b.column ?? Number.parseInt(b.seatNumber, 10)) || 0),
      );

    leftCount = Math.max(leftCount, leftSeats.length);
    rightCount = Math.max(rightCount, rightSeats.length);
  }

  const rows = sortedRows.map(([rowNumber, rowSeats]) => {
    const rowSlots: SeatSlot[] = Array.from(
      { length: leftCount + 1 + rightCount },
      () => ({ kind: "empty" }),
    );
    const leftSeats = rowSeats
      .filter((seat) => seat.position === "LEFT")
      .sort(
        (a, b) =>
          ((a.column ?? Number.parseInt(a.seatNumber, 10)) || 0) -
          ((b.column ?? Number.parseInt(b.seatNumber, 10)) || 0),
      );
    const rightSeats = rowSeats
      .filter((seat) => seat.position === "RIGHT")
      .sort(
        (a, b) =>
          ((a.column ?? Number.parseInt(a.seatNumber, 10)) || 0) -
          ((b.column ?? Number.parseInt(b.seatNumber, 10)) || 0),
      );
    const middleSeat = rowSeats.find((seat) => seat.position === "MIDDLE");

    leftSeats.forEach((seat, index) => {
      rowSlots[leftCount - leftSeats.length + index] = { kind: "seat", seat };
    });

    if (middleSeat) {
      rowSlots[leftCount] = { kind: "seat", seat: middleSeat };
    } else {
      rowSlots[leftCount] = { kind: "aisle" };
    }

    rightSeats.forEach((seat, index) => {
      rowSlots[leftCount + 1 + index] = { kind: "seat", seat };
    });

    return { rowNumber, slots: rowSlots };
  });

  return {
    rows,
    leftCount,
    rightCount,
    hasMiddle: seats.some((seat) => seat.position === "MIDDLE"),
    trackCount: leftCount + 1 + rightCount,
  };
};
