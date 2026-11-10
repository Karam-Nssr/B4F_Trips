export const getBusinessDate = (date = new Date()): string => {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Damascus",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};

export const isValidDateOnly = (value: string): boolean => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

export const getDateKey = (value: string): string => value.slice(0, 10);

export const formatArchiveDate = (value: string): string => {
  const dateKey = getDateKey(value);
  if (!isValidDateOnly(dateKey)) return value;
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

export const isBeforeBusinessDate = (value: string): boolean =>
  isValidDateOnly(value) && value < getBusinessDate();
