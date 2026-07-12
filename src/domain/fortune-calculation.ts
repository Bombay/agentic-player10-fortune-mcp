import { calculateNatal } from "@orrery/core/natal";
import { calculateSaju } from "@orrery/core/saju";
import type {
  BirthInput,
  NatalChart,
  SajuResult,
  ZiweiChart,
} from "@orrery/core/types";
import { createChart } from "@orrery/core/ziwei";
import {
  type BirthInfoInput,
  type NormalizedBirthInfo,
  normalizeBirthInfo,
} from "./birth-info.js";

type SiteBirthInput = BirthInput & {
  timezone?: string;
};

const createSiteZiweiChart = createChart as (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  isMale: boolean,
  timezone?: string,
  longitude?: number,
) => ZiweiChart;

export type FortuneCalculation = {
  birth: NormalizedBirthInfo;
  saju: SajuResult;
  ziwei: ZiweiChart;
  natal: NatalChart;
};

export async function calculateFortune(
  input: BirthInfoInput,
): Promise<FortuneCalculation> {
  const birth = normalizeBirthInfo(input);
  const birthInput = toOrreryBirthInput(birth);
  const saju = calculateSaju(birthInput);
  const ziwei = createSiteZiweiChart(
    birth.year,
    birth.month,
    birth.day,
    birth.hour,
    birth.minute,
    birth.gender === "M",
    birth.timezone,
    birth.longitude,
  );
  const natal = await calculateNatal(birthInput, "P");

  return { birth, saju, ziwei, natal };
}

function toOrreryBirthInput(input: NormalizedBirthInfo): SiteBirthInput {
  return {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    gender: input.gender,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
  };
}
