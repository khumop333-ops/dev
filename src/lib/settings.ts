import { cache } from "react";
import { prisma } from "./prisma";
import { defaultSiteConfig, type SiteConfig } from "@/config/site";

export const STORE_SETTINGS_KEY = "store_config";

export const getStoreSettings = cache(async (): Promise<SiteConfig> => {
  try {
    const record = await prisma.siteSetting.findUnique({
      where: { key: STORE_SETTINGS_KEY },
    });

    if (!record || !record.valueJson || typeof record.valueJson !== "object") {
      return defaultSiteConfig;
    }

    const overrides = record.valueJson as Partial<SiteConfig> & {
      weekdaysHours?: string;
      saturdayHours?: string;
      sundayHours?: string;
      deliveryAreasText?: string;
    };

    const deliveryAreas =
      typeof overrides.deliveryAreasText === "string"
        ? overrides.deliveryAreasText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(overrides.deliveryAreas)
        ? overrides.deliveryAreas
        : defaultSiteConfig.deliveryAreas;

    const addressLine1 = overrides.addressLine1 ?? defaultSiteConfig.addressLine1;
    const city = overrides.city ?? defaultSiteConfig.city;
    const province = overrides.province ?? defaultSiteConfig.province;
    const postalCode = overrides.postalCode ?? defaultSiteConfig.postalCode;

    return {
      ...defaultSiteConfig,
      ...overrides,
      fullAddress: `${addressLine1}, ${city}, ${province}, ${postalCode}`,
      deliveryAreas,
      hours: {
        ...defaultSiteConfig.hours,
        ...(overrides.hours ?? {}),
        weekdays:
          overrides.weekdaysHours ??
          overrides.hours?.weekdays ??
          defaultSiteConfig.hours.weekdays,
        saturday:
          overrides.saturdayHours ??
          overrides.hours?.saturday ??
          defaultSiteConfig.hours.saturday,
        sunday:
          overrides.sundayHours ??
          overrides.hours?.sunday ??
          defaultSiteConfig.hours.sunday,
      },
    };
  } catch {
    return defaultSiteConfig;
  }
});
