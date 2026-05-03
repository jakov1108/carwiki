export type SpecUnitField =
  | "displacement"
  | "power"
  | "torque"
  | "acceleration"
  | "topSpeed"
  | "consumption"
  | "weight"
  | "length"
  | "width"
  | "height"
  | "wheelbase"
  | "trunkCapacity"
  | "fuelTankCapacity";

type UnitFormatter = {
  defaultUnit: string | ((value: string, options?: SpecUnitOptions) => string);
  acceptedUnits: string[];
};

type SpecUnitOptions = {
  fuelType?: string | null;
};

const unitFormatters: Record<SpecUnitField, UnitFormatter> = {
  displacement: {
    defaultUnit: (value) => {
      const numericValue = Number(value.replace(",", ".").replace(/[^\d.]/g, ""));
      return numericValue > 0 && numericValue < 20 ? "L" : "ccm";
    },
    acceptedUnits: ["ccm", "cm3", "cm³", "l"],
  },
  power: {
    defaultUnit: "KS",
    acceptedUnits: ["KS", "HP", "kW"],
  },
  torque: {
    defaultUnit: "Nm",
    acceptedUnits: ["Nm", "lb-ft", "lb ft", "ft-lb", "ft lb"],
  },
  acceleration: {
    defaultUnit: "s",
    acceptedUnits: ["s", "sec", "sek", "sekundi"],
  },
  topSpeed: {
    defaultUnit: "km/h",
    acceptedUnits: ["km/h", "kmh", "kph", "mph"],
  },
  consumption: {
    defaultUnit: (_value, options) =>
      options?.fuelType && /elektr/i.test(options.fuelType) ? "kWh/100 km" : "L/100 km",
    acceptedUnits: ["L/100km", "L/100 km", "L / 100 km", "L", "kWh/100km", "kWh/100 km", "kWh / 100 km", "kWh", "mpg"],
  },
  weight: {
    defaultUnit: "kg",
    acceptedUnits: ["kg", "t"],
  },
  length: {
    defaultUnit: "mm",
    acceptedUnits: ["mm", "cm", "m"],
  },
  width: {
    defaultUnit: "mm",
    acceptedUnits: ["mm", "cm", "m"],
  },
  height: {
    defaultUnit: "mm",
    acceptedUnits: ["mm", "cm", "m"],
  },
  wheelbase: {
    defaultUnit: "mm",
    acceptedUnits: ["mm", "cm", "m"],
  },
  trunkCapacity: {
    defaultUnit: "L",
    acceptedUnits: ["L", "lit", "litra", "litara"],
  },
  fuelTankCapacity: {
    defaultUnit: "L",
    acceptedUnits: ["L", "lit", "litra", "litara"],
  },
};

const specUnitFields = new Set<SpecUnitField>(Object.keys(unitFormatters) as SpecUnitField[]);

export function isSpecUnitField(value: string): value is SpecUnitField {
  return specUnitFields.has(value as SpecUnitField);
}

export function formatSpecWithUnit(
  value: unknown,
  field: SpecUnitField,
  options?: SpecUnitOptions,
): string {
  const text = typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
  if (!text || !/\d/.test(text)) return text;

  const formatter = unitFormatters[field];
  if (hasAcceptedUnit(text, formatter.acceptedUnits)) return text;

  const unit =
    typeof formatter.defaultUnit === "function"
      ? formatter.defaultUnit(text, options)
      : formatter.defaultUnit;

  return `${text} ${unit}`;
}

export function formatVariantSpec(
  variant: Partial<Record<SpecUnitField | "fuelType", unknown>>,
  field: SpecUnitField,
): string {
  return formatSpecWithUnit(variant[field], field, {
    fuelType: typeof variant.fuelType === "string" ? variant.fuelType : undefined,
  });
}

function hasAcceptedUnit(value: string, acceptedUnits: string[]): boolean {
  return acceptedUnits.some((unit) => {
    const escapedUnit = unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s*");
    return new RegExp(`(^|[^a-zA-Z])${escapedUnit}(?=$|[^a-zA-Z])`, "i").test(value);
  });
}
