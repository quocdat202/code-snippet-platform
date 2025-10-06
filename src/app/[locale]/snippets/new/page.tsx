"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { analyzeComplexity } from "@/lib/complexity-analyzer";
import { useTranslations } from "next-intl";

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
];

export default function NewSnippetPage() {
  const router = useRouter();
  const t = useTranslations("snippet");

  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    language: "JavaScript",
    topics: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const topicsArray = formData.topics
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      const complexity = analyzeComplexity(formData.code);

      const response = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          topics: topicsArray,
          complexity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create snippet");
      }

      const snippet = await response.json();
      toast.success("Snippet created successfully!");
      router.push(`/snippets/${snippet.id}`);
    } catch (error) {
      toast.error("Failed to create snippet");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Snippet</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("title")} *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder={t("titlePlaceholder")}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("description")}
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder={t("descriptionPlaceholder")}
          />
        </div>

        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("language")} *
          </label>
          <select
            id="language"
            required
            value={formData.language}
            onChange={(e) =>
              setFormData({ ...formData, language: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="topics"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("topics")}
          </label>
          <input
            type="text"
            id="topics"
            value={formData.topics}
            onChange={(e) =>
              setFormData({ ...formData, topics: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder={t("topicsPlaceholder")}
          />
        </div>

        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Code *
          </label>
          <textarea
            id="code"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            rows={15}
            placeholder={t("codePlaceholder")}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? t("loading") : t("create")}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
