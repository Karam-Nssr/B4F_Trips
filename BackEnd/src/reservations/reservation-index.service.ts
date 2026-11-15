import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { Connection, Model } from 'mongoose';
import { Reservation, ReservationDocument } from '../database/schemas.js';

@Injectable()
export class ReservationIndexService implements OnApplicationBootstrap {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Reservation.name)
    private readonly reservations: Model<ReservationDocument>,
  ) {}

  async onApplicationBootstrap() {
    const database = this.connection.db;
    if (!database) throw new Error('MongoDB connection is not initialized.');
    const exists = await database
      .listCollections({ name: this.reservations.collection.collectionName })
      .hasNext();
    if (!exists) await this.reservations.createCollection();

    const indexes = await this.reservations.collection.indexes();
    for (const index of indexes) {
      if (
        Object.keys(index.key).length === 1 &&
        index.key.bookingReference === 1 &&
        index.unique &&
        index.name
      ) {
        await this.reservations.collection.dropIndex(index.name);
      }
    }
    await this.reservations.createIndexes();
  }
}
