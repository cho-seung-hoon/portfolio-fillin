import { format } from "date-fns";
import { ko, enUS, ja } from "date-fns/locale";

export function formatDateWithLocale(date: Date | string, formatStr: string = "P"): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Simple browser locale detection
    const browserLang = navigator.language || "ko-KR";

    // Map common browser locales to date-fns locales
    const localeMap: Record<string, any> = {
        "ko-KR": ko,
        "ko": ko,
        "en-US": enUS,
        "en": enUS,
        "ja-JP": ja,
        "ja": ja
    };

    const selectedLocale = localeMap[browserLang] || ko; // Fallback to ko

    return format(dateObj, formatStr, { locale: selectedLocale });
}

export function formatDateTimeWithLocale(date: Date | string): string {
    return formatDateWithLocale(date, "Pp");
}
