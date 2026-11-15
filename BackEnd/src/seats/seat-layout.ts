import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import type { Types } from 'mongoose';
import type { BusDocument } from '../database/schemas.js';

export interface NewSeat {
  bus: Types.ObjectId;
  seatNumber: string;
  row: number;
  position: 'LEFT' | 'MIDDLE' | 'RIGHT';
  column: number;
}

export function buildSeatLayout(bus: Pick<BusDocument, '_id' | 'busClass' | 'size'>): NewSeat[] {
  const rowCount = bus.size === 'LARGE' ? 11 : 9;
  const seats: NewSeat[] = [];
  let seatNumber = 1;
  const add = (row: number, position: NewSeat['position'], column: number) => {
    seats.push({
      bus: bus._id,
      seatNumber: String(seatNumber++),
      row,
      position,
      column,
    });
  };

  if (bus.busClass === 'ORDINARY') {
    for (let row = 1; row < rowCount; row++) {
      add(row, 'LEFT', 1);
      add(row, 'LEFT', 2);
      add(row, 'RIGHT', 3);
      add(row, 'RIGHT', 4);
    }
    add(rowCount, 'LEFT', 1);
    add(rowCount, 'LEFT', 2);
    add(rowCount, 'MIDDLE', 3);
    add(rowCount, 'RIGHT', 4);
    add(rowCount, 'RIGHT', 5);
  } else if (bus.busClass === 'FIRST_CLASS') {
    for (let row = 1; row <= rowCount; row++) {
      add(row, 'LEFT', 1);
      add(row, 'RIGHT', 2);
      add(row, 'RIGHT', 3);
    }
  } else if (bus.busClass === 'BUSINESS') {
    for (let row = 1; row <= rowCount; row++) {
      add(row, 'LEFT', 1);
      add(row, 'RIGHT', 2);
    }
  }
  return seats;
}

export function assertSeatCount(seats: NewSeat[], capacity: number): void {
  if (seats.length !== capacity) {
    throw new InternalServerErrorException(
      `Generated seat count (${seats.length}) does not match bus capacity (${capacity}).`,
    );
  }
}

export function ensureNoDuplicateSeats(seatIds: string[]): void {
  if (new Set(seatIds).size !== seatIds.length) {
    throw new BadRequestException('A seat cannot be booked more than once.');
  }
}
