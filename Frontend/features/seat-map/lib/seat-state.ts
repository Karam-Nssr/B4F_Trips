import type { MapSeat, SeatVisualState } from "@/features/seat-map/seat-map.types";

export const deriveSeatVisualState = (
  seat: MapSeat,
  selection: string[],
  flags: {
    hovered?: boolean;
    focused?: boolean;
    reserved?: boolean;
    unavailable?: boolean;
    conflicted?: boolean;
    justChanged?: boolean;
  } = {},
): SeatVisualState => {
  if (flags.reserved || seat.status === "RESERVED") return "reserved";
  if (flags.unavailable || seat.status === "UNAVAILABLE") return "unavailable";
  if (flags.conflicted) return "conflict";
  if (selection.includes(seat.id)) return "selected";
  if (flags.justChanged) return "just-changed";
  if (flags.focused) return "focus-visible";
  if (flags.hovered) return "hover";

  return "available";
};
