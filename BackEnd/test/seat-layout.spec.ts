import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';
import { buildSeatLayout } from '../src/seats/seat-layout.js';

describe('buildSeatLayout', () => {
  it.each([
    ['ORDINARY', 'LARGE', 45],
    ['ORDINARY', 'MEDIUM', 37],
    ['FIRST_CLASS', 'LARGE', 33],
    ['FIRST_CLASS', 'MEDIUM', 27],
    ['BUSINESS', 'LARGE', 22],
    ['BUSINESS', 'MEDIUM', 18],
  ])('%s %s buses have %i seats', (busClass, size, capacity) => {
    const busId = new Types.ObjectId();
    const seats = buildSeatLayout({
      _id: busId,
      busClass,
      size,
    });

    expect(seats).toHaveLength(capacity);
    expect(seats.every((seat) => seat.bus.equals(busId))).toBe(true);
    expect(seats.map((seat) => seat.seatNumber)).toEqual(
      Array.from({ length: capacity }, (_, index) => String(index + 1)),
    );
  });
});
