import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Code2, Clock } from "lucide-react";
import { Metadata } from "next";

interface ProfilePageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

async function getUserWithSnippets(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      snippets: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return user;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await getUserWithSnippets(id);

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${user.name || user.email}'s Profile - Code Snippets`,
    description: `View code snippets shared by ${user.name || user.email}`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const user = await getUserWithSnippets(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {user.name || "Anonymous User"}
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            <span>{user.snippets.length} snippets</span>
          </div>
        </div>
      </div>

      {/* Snippets Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Public Snippets</h2>
        {user.snippets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Code2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No public snippets yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.snippets.map((snippet) => (
              <Link
                key={snippet.id}
                href={`/snippets/${snippet.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                  {snippet.title}
                </h3>
                {snippet.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {snippet.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {snippet.language}
                  </span>
                  {snippet.complexity && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{snippet.complexity}</span>
                    </div>
                  )}
                </div>
                {snippet.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
