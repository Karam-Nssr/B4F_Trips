export const SYRIAN_CITIES = [
  "Aleppo",
  "Damascus",
  "Daraa",
  "Hama",
  "Homs",
  "Latakia",
  "Raqqa",
  "Tartus",
  "Deir ez-Zor",
  "As-Suwayda",
  "Idlib",
  "Quneitra",
  "Al-Hasakah",
  "Qamishli",
];

export const BUS_CONFIGS = [
  { busClass: "ORDINARY", size: "LARGE", capacity: 45, rows: 11 },
  { busClass: "ORDINARY", size: "MEDIUM", capacity: 37, rows: 9 },
  { busClass: "FIRST_CLASS", size: "LARGE", capacity: 33, rows: 11 },
  { busClass: "FIRST_CLASS", size: "MEDIUM", capacity: 27, rows: 9 },
  { busClass: "BUSINESS", size: "LARGE", capacity: 22, rows: 11 },
  { busClass: "BUSINESS", size: "MEDIUM", capacity: 18, rows: 9 },
] as const;

export const TRIP_STATUS_COLOR = {
  SCHEDULED: "default",
  COMPLETED: "success",
  CANCELLED: "warning",
} as const;
