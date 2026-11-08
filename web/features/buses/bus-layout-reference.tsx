import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeatLayoutView } from "@/features/seat-map/seat-layout-view";
import { BUS_CONFIGS } from "@/features/buses/buses.constants";
import type { SeatPosition } from "@/features/seat-map/seat-map.types";

type BusConfig = (typeof BUS_CONFIGS)[number];

const classLabels: Record<BusConfig["busClass"], string> = {
  ORDINARY: "Ordinary",
  FIRST_CLASS: "First class",
  BUSINESS: "Business",
};

const classCodes: Record<BusConfig["busClass"], string> = {
  ORDINARY: "OR",
  FIRST_CLASS: "FC",
  BUSINESS: "BC",
};

const createLayoutSeats = (config: BusConfig) => {
  let seatNumber = 1;
  return Array.from({ length: config.rows }, (_, rowIndex) => {
    const positions: SeatPosition[] =
      config.busClass === "ORDINARY"
        ? rowIndex === config.rows - 1
          ? ["LEFT", "LEFT", "MIDDLE", "RIGHT", "RIGHT"]
          : ["LEFT", "LEFT", "RIGHT", "RIGHT"]
        : config.busClass === "FIRST_CLASS"
          ? ["LEFT", "RIGHT", "RIGHT"]
          : ["LEFT", "RIGHT"];

    return positions.map((position) => {
      const currentNumber = seatNumber++;
      return {
        id: `${config.busClass}-${config.size}-${currentNumber}`,
        seatNumber: String(currentNumber).padStart(2, "0"),
        row: rowIndex + 1,
        position,
      };
    });
  }).flat();
};

export const BusLayoutReference = () => (
  <div className="grid gap-4 xl:grid-cols-3">
    {BUS_CONFIGS.map((config) => (
      <Card key={`${config.busClass}-${config.size}`} className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{classLabels[config.busClass]}</CardTitle>
              <p className="mt-2 text-sm text-slate-500">
                {config.capacity} seats · {config.busClass === "ORDINARY" ? "2 + 2" : config.busClass === "FIRST_CLASS" ? "1 + 2" : "1 + 1"} layout
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {config.size === "LARGE" ? "Large" : "Medium"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {classCodes[config.busClass]}-{config.capacity}
          </p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between">
          <SeatLayoutView
            seats={createLayoutSeats(config)}
            className="max-w-[15rem] p-3"
            showRowNumbers={false}
          />
          <p className="mt-5 text-center text-xs text-slate-500">
            {config.rows} rows · Seat numbers run from front to rear
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);
