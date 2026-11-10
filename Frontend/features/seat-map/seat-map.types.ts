export type SeatStatus = "AVAILABLE" | "RESERVED" | "UNAVAILABLE";
export type SeatPosition = "LEFT" | "MIDDLE" | "RIGHT";

export type MapSeat = {
  id: string;
  seatNumber: string;
  row: number;
  column?: number;
  position?: SeatPosition;
  status?: SeatStatus;
};

export type SeatVisualState =
  | "available"
  | "hover"
  | "focus-visible"
  | "selected"
  | "reserved"
  | "unavailable"
  | "conflict"
  | "just-changed";

export type SeatMapMode = "select" | "readonly";
