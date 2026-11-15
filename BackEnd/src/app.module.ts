import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module.js';
import { BusModule } from './buses/bus.module.js';
import { ReservationModule } from './reservations/reservation.module.js';
import { SeatModule } from './seats/seat.module.js';
import { TripModule } from './trips/trip.module.js';
import { UserModule } from './users/user.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGO_URI'),
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    BusModule,
    SeatModule,
    TripModule,
    ReservationModule,
  ],
})
export class AppModule {}
