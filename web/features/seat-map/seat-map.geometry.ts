export const BUS_CLASS_GEOMETRY = {
  ORDINARY: {
    seatWidth: 30,
    seatHeight: 24,
    rowGap: 12,
    columnGap: 9,
  },
  FIRST_CLASS: {
    seatWidth: 34,
    seatHeight: 28,
    rowGap: 14,
    columnGap: 10,
  },
  BUSINESS: {
    seatWidth: 38,
    seatHeight: 30,
    rowGap: 18,
    columnGap: 12,
  },
} as const;

export type BusClass = keyof typeof BUS_CLASS_GEOMETRY;

export const getSeatGeometry = (busClass: BusClass) => BUS_CLASS_GEOMETRY[busClass];
