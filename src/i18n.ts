import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { LOCALES } from "./constant";

export default getRequestConfig(async ({ locale }) => {
  // console.log("🤔🤔🤔 ~ original locale:", locale, typeof locale);

  let actualLocale: string = locale || "en";

  if (!locale) {
    try {
      const headersList = await headers();
      const pathname =
        headersList.get("x-pathname") ||
        headersList.get("x-invoke-path") ||
        headersList.get("referer") ||
        "";

      const pathMatch = pathname.match(/\/([a-z]{2})(\/|$)/);
      if (pathMatch && LOCALES.includes(pathMatch[1])) {
        actualLocale = pathMatch[1];
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (!LOCALES.includes(actualLocale)) {
    actualLocale = "en";
  }

  return {
    locale: actualLocale,
    messages: (await import(`../messages/${actualLocale}.json`)).default,
  };
});
