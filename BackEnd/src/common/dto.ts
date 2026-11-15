import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  Matches,
  ValidateNested,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(7)
  phone!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class CreateBusDto {
  @IsString()
  @MinLength(1)
  busNumber!: string;

  @IsIn(['ORDINARY', 'FIRST_CLASS', 'BUSINESS'])
  busClass!: string;

  @IsIn(['LARGE', 'MEDIUM'])
  size!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;
}

export class CreateTripDto {
  @IsString()
  @MinLength(1)
  from!: string;

  @IsString()
  @MinLength(1)
  to!: string;

  @IsString()
  @MinLength(1)
  bus!: string;

  @IsString()
  @MinLength(1)
  departureDate!: string;

  @Matches(/^\d{2}:\d{2}$/)
  departureTime!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;
}

export class CreateScheduleDto {
  @IsString()
  @MinLength(1)
  from!: string;

  @IsString()
  @MinLength(1)
  to!: string;

  @IsString()
  @MinLength(1)
  bus!: string;

  @Matches(/^\d{2}:\d{2}$/)
  departureTime!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsIn(['DAILY', 'WEEKLY', 'MONTHLY'])
  frequency!: string;

  @IsString()
  @MinLength(1)
  startDate!: string;

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  daysOfWeek?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  dayOfMonth?: number;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class CreateReservationDto {
  @IsString()
  @MinLength(1)
  trip!: string;

  @IsString()
  @MinLength(1)
  seat!: string;

  @IsString()
  @MinLength(2)
  passengerName!: string;

  @IsString()
  @MinLength(7)
  passengerPhone!: string;
}

export class PassengerDto {
  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsString()
  @Matches(/^\+?[0-9\s()-]{7,20}$/)
  phone!: string;

  @IsString()
  @MinLength(5)
  nationalId!: string;
}

export class CheckoutPassengerDto {
  @IsString()
  @MinLength(1)
  seatId!: string;

  @ValidateNested()
  @Type(() => PassengerDto)
  passenger!: PassengerDto;
}

export class CheckoutDto {
  @IsString()
  @MinLength(1)
  tripId!: string;

  @ArrayMinSize(1)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutPassengerDto)
  passengers!: CheckoutPassengerDto[];

  @IsIn(['SIMULATED_ONLINE'])
  paymentMethod!: string;
}
