import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Code2, Clock, User } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Snippet Platform - Share and Discover Code",
  description:
    "A platform for developers to share code snippets, tag them by language and topic, and analyze time complexity",
  openGraph: {
    title: "Code Snippet Platform",
    description: "Share and discover code snippets",
    type: "website",
  },
};

async function getSnippets(searchParams: {
  language?: string;
  topic?: string;
}) {
  const where: {
    isPublic: boolean;
    language?: string;
    topics?: { has: string };
  } = { isPublic: true };

  if (searchParams.language) {
    where.language = searchParams.language;
  }

  if (searchParams.topic) {
    where.topics = { has: searchParams.topic };
  }

  const snippets = await prisma.snippet.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return snippets;
}

async function getLanguages() {
  const snippets = await prisma.snippet.findMany({
    where: { isPublic: true },
    select: { language: true },
    distinct: ["language"],
  });

  return snippets.map((s) => s.language);
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ language?: string; topic?: string }>;
}) {
  const searchParamsResolved = await searchParams;
  const snippets = await getSnippets(searchParamsResolved);
  const languages = await getLanguages();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Code Snippet Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Share and discover code snippets with complexity analysis
        </p>
        <Link
          href="/snippets/new"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Share Your Code
        </Link>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Filter by Language</h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className={`px-4 py-2 rounded-md ${
              !searchParamsResolved.language
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </Link>
          {languages.map((lang) => (
            <Link
              key={lang}
              href={`/?language=${encodeURIComponent(lang)}`}
              className={`px-4 py-2 rounded-md ${
                searchParamsResolved.language === lang
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {lang}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">
          {searchParamsResolved.language || searchParamsResolved.topic
            ? "Filtered Snippets"
            : "Latest Snippets"}
        </h2>

        {snippets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Code2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No snippets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snippets.map((snippet) => (
              <Link
                key={snippet.id}
                href={`/snippets/${snippet.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
              >
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                  {snippet.title}
                </h3>
                {snippet.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {snippet.description}
                  </p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {snippet.language}
                    </span>
                    {snippet.complexity && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="font-mono">{snippet.complexity}</span>
                      </div>
                    )}
                  </div>

                  {snippet.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {snippet.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t">
                    <User className="h-4 w-4" />
                    <span className="truncate">
                      {snippet.user.name || snippet.user.email}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
