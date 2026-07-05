export type Gender = "M" | "F";

export type BirthInfoInput = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: Gender;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  birthplace?: string;
};

export type NormalizedBirthInfo = Required<
  Pick<
    BirthInfoInput,
    | "year"
    | "month"
    | "day"
    | "hour"
    | "minute"
    | "gender"
    | "timezone"
    | "latitude"
    | "longitude"
    | "birthplace"
  >
>;

const DEFAULT_TIMEZONE = "Asia/Seoul";
const DEFAULT_LATITUDE = 37.5665;
const DEFAULT_LONGITUDE = 126.978;
const DEFAULT_BIRTHPLACE = "서울";

export function normalizeBirthInfo(input: BirthInfoInput): NormalizedBirthInfo {
  assertIntegerInRange(input.year, 1900, 2100, "year");
  assertIntegerInRange(input.month, 1, 12, "month");
  assertIntegerInRange(input.day, 1, 31, "day");
  assertIntegerInRange(input.hour, 0, 23, "hour");
  assertIntegerInRange(input.minute, 0, 59, "minute");

  const date = new Date(Date.UTC(input.year, input.month - 1, input.day));
  if (
    date.getUTCFullYear() !== input.year ||
    date.getUTCMonth() !== input.month - 1 ||
    date.getUTCDate() !== input.day
  ) {
    throw new Error("birth date is not a valid calendar date");
  }

  return {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    gender: input.gender,
    timezone: input.timezone ?? DEFAULT_TIMEZONE,
    latitude: input.latitude ?? DEFAULT_LATITUDE,
    longitude: input.longitude ?? DEFAULT_LONGITUDE,
    birthplace: input.birthplace ?? DEFAULT_BIRTHPLACE,
  };
}

function assertIntegerInRange(
  value: number,
  min: number,
  max: number,
  label: string,
): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${label} must be an integer between ${min} and ${max}`);
  }
}
