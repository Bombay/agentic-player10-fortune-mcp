import { filterCities, formatCityName, type City } from "@orrery/core/cities";

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
  birthplace: string;
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

  const location = resolveBirthLocation(input);

  return {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    gender: input.gender,
    timezone: location.timezone,
    latitude: location.latitude,
    longitude: location.longitude,
    birthplace: location.birthplace,
  };
}

function resolveBirthLocation(input: BirthInfoInput): Pick<
  NormalizedBirthInfo,
  "birthplace" | "latitude" | "longitude" | "timezone"
> {
  const birthplace = input.birthplace?.trim();
  if (!birthplace) {
    throw new Error("birthplace is required");
  }

  if ((input.latitude == null) !== (input.longitude == null)) {
    throw new Error("latitude and longitude must be provided together");
  }

  if (input.latitude != null && input.longitude != null) {
    const latitude = input.latitude;
    const longitude = input.longitude;
    assertNumberInRange(latitude, -90, 90, "latitude");
    assertNumberInRange(longitude, -180, 180, "longitude");

    return {
      birthplace,
      latitude,
      longitude,
      timezone: input.timezone ?? DEFAULT_TIMEZONE,
    };
  }

  const matches = findBirthplaceMatches(birthplace);
  if (matches.length === 0) {
    throw new Error(
      "birthplace could not be resolved; provide a supported city name or explicit latitude/longitude",
    );
  }
  if (matches.length > 1) {
    const options = matches.map(formatCityName).join(", ");
    throw new Error(`birthplace is ambiguous; include the region. Candidates: ${options}`);
  }

  const city = matches[0];
  return {
    birthplace: formatCityName(city),
    latitude: city.lat,
    longitude: city.lon,
    timezone: input.timezone ?? inferTimezone(city),
  };
}

function findBirthplaceMatches(query: string): City[] {
  const matches = filterCities(query);
  const normalizedQuery = normalizePlaceName(query);
  const exactMatches = matches.filter((city) =>
    cityAliases(city).some((alias) => normalizePlaceName(alias) === normalizedQuery),
  );

  return exactMatches.length > 0 ? exactMatches : matches;
}

function cityAliases(city: City): string[] {
  return [
    city.name,
    formatCityName(city),
    city.region ? `${city.name} ${city.region}` : "",
    city.region ? `${city.name} (${city.region})` : "",
    city.country ? `${city.name} ${city.country}` : "",
    city.country ? `${city.name}, ${city.country}` : "",
    city.region ?? "",
  ].filter((value) => value.length > 0);
}

function normalizePlaceName(value: string): string {
  return value.replace(/[(),]/g, " ").replace(/\s+/g, "").toLocaleLowerCase("ko-KR");
}

function inferTimezone(city: City): string {
  if (!city.country) return DEFAULT_TIMEZONE;

  const timezonesByCountry: Record<string, string> = {
    일본: "Asia/Tokyo",
    북한: "Asia/Pyongyang",
    중국: "Asia/Shanghai",
    대만: "Asia/Taipei",
    몽골: "Asia/Ulaanbaatar",
    태국: "Asia/Bangkok",
    베트남: "Asia/Ho_Chi_Minh",
    인도네시아: "Asia/Jakarta",
    싱가포르: "Asia/Singapore",
    말레이시아: "Asia/Kuala_Lumpur",
    필리핀: "Asia/Manila",
    미얀마: "Asia/Yangon",
    캄보디아: "Asia/Phnom_Penh",
    라오스: "Asia/Vientiane",
    인도: "Asia/Kolkata",
    방글라데시: "Asia/Dhaka",
    파키스탄: "Asia/Karachi",
    네팔: "Asia/Kathmandu",
    스리랑카: "Asia/Colombo",
    카자흐스탄: "Asia/Almaty",
    우즈베키스탄: "Asia/Tashkent",
    키르기스스탄: "Asia/Bishkek",
    타지키스탄: "Asia/Dushanbe",
    투르크메니스탄: "Asia/Ashgabat",
    이란: "Asia/Tehran",
    이라크: "Asia/Baghdad",
    사우디아라비아: "Asia/Riyadh",
    아랍에미리트: "Asia/Dubai",
    카타르: "Asia/Qatar",
    쿠웨이트: "Asia/Kuwait",
    튀르키예: "Europe/Istanbul",
    이스라엘: "Asia/Jerusalem",
    레바논: "Asia/Beirut",
    요르단: "Asia/Amman",
    시리아: "Asia/Damascus",
    조지아: "Asia/Tbilisi",
    아제르바이잔: "Asia/Baku",
    아르메니아: "Asia/Yerevan",
    영국: "Europe/London",
    프랑스: "Europe/Paris",
    독일: "Europe/Berlin",
    네덜란드: "Europe/Amsterdam",
    벨기에: "Europe/Brussels",
    룩셈부르크: "Europe/Luxembourg",
  };

  return timezonesByCountry[city.country] ?? DEFAULT_TIMEZONE;
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

function assertNumberInRange(
  value: number,
  min: number,
  max: number,
  label: string,
): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${label} must be a number between ${min} and ${max}`);
  }
}
