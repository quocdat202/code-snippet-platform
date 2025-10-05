"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { useState } from "react";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLocale: string) => {
    // Remove ALL locale prefixes from pathname
    const segments = pathname.split("/").filter(Boolean);

    // Remove first segment if it's a locale
    if (segments[0] === "en" || segments[0] === "vi") {
      segments.shift();
    }

    // Build new path
    const pathWithoutLocale =
      segments.length > 0 ? `/${segments.join("/")}` : "";

    // Navigate to new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
    router.refresh();
    setIsOpen(false);
  };

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
        aria-label="Change language"
      >
        <Globe className="h-5 w-5 text-gray-600" />
        <span className="text-sm font-medium hidden sm:inline">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
        <span className="text-sm font-medium sm:hidden">
          {currentLanguage?.flag}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors first:rounded-t-md last:rounded-b-md ${
                  locale === lang.code
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.name}</span>
                {locale === lang.code && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
