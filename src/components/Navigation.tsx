"use client";

import { LOCALES } from "@/constant";
import { Code2, LogOut, Menu, Plus, User, X, Bookmark, FolderOpen } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationDropdown from "./NotificationDropdown";

export default function Navigation() {
  const t = useTranslations("common");
  useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLanguageChange = (newLocale: string) => {
    setIsMenuOpen(false);

    const segments = pathname.split("/").filter((segment) => segment !== "");

    const currentLocaleInPath = LOCALES.includes(segments[0])
      ? segments[0]
      : null;

    let newPath: string;
    if (currentLocaleInPath) {
      segments[0] = newLocale;
      newPath = "/" + segments.join("/");
    } else {
      newPath = `/${newLocale}${pathname}`;
    }
    router.push(newPath);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Code2 className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl hidden sm:inline">
              CodeSnippets
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {session ? (
              <>
                <Link
                  href="/snippets/new"
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t("create")}</span>
                </Link>
                <Link
                  href="/bookmarks"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                  title="Bookmarks"
                >
                  <Bookmark className="h-5 w-5" />
                </Link>
                <Link
                  href="/collections"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                  title="Collections"
                >
                  <FolderOpen className="h-5 w-5" />
                </Link>
                <NotificationDropdown />
                <Link
                  href={`/profile/${session.user?.id}`}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("logout")}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t("register")}
                </Link>
                {/* <div className="relative">
                  <select
                    id="language"
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="appearance-none bg-white pl-2 pr-8 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  >
                    {LOCALES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div> */}
                <LanguageSwitcher />
              </>
            )}
          </div>

          {/* Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {session ? (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/snippets/new"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus className="h-4 w-4" />
                  <span>{t("create")}</span>
                </Link>
                <Link
                  href={`/profile/${session.user?.id}`}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t("logout")}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("register")}
                </Link>
                <div className="px-4 py-2">
                  <div className="relative w-[20%]">
                    <select
                      id="language-mobile"
                      onChange={(e) => {
                        handleLanguageChange(e.target.value);
                        setIsMenuOpen(false);
                      }}
                      className="appearance-none bg-white w-full pl-2 pr-8 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    >
                      {LOCALES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
