"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { analyzeComplexity } from "@/lib/complexity-analyzer";

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

export default function EditSnippetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    language: "JavaScript",
    topics: "",
  });

  useEffect(() => {
    async function fetchSnippet() {
      try {
        const response = await fetch(`/api/snippets/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch snippet");
        }
        const snippet = await response.json();

        if (session?.user?.id !== snippet.userId) {
          toast.error("You do not have permission to edit this snippet");
          router.push(`/snippets/${id}`);
          return;
        }

        setFormData({
          title: snippet.title,
          description: snippet.description || "",
          code: snippet.code,
          language: snippet.language,
          topics: snippet.topics.join(", "),
        });
      } catch {
        toast.error("Failed to load snippet");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchSnippet();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [id, router, session, status]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);

      try {
        const topicsArray = formData.topics
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t);

        const complexity = analyzeComplexity(formData.code);

        const response = await fetch(`/api/snippets/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            topics: topicsArray,
            complexity,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update snippet");
        }

        toast.success("Snippet updated successfully!");
        router.push(`/snippets/${id}`);
      } catch {
        toast.error("Failed to update snippet");
      } finally {
        setIsSaving(false);
      }
    },
    [id, formData, router]
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Snippet</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title *
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
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Language *
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
            Topics (comma separated)
          </label>
          <input
            type="text"
            id="topics"
            value={formData.topics}
            onChange={(e) =>
              setFormData({ ...formData, topics: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
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
