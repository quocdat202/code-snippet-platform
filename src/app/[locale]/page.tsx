import { getTranslations } from "next-intl/server";
export const dynamic = "force-dynamic";
export const revalidate = 30;
export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-xl text-gray-600 mb-8">{t("subtitle")}</p>
      </div>
    </div>
  );
}
