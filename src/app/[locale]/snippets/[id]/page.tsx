import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Calendar, User, Code2, Clock } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
import DeleteButton from "@/components/DeleteButton";
import ShareSection from "@/components/ShareSection";
import { Metadata } from "next";
export const dynamic = "force-dynamic";
export const revalidate = 0;
interface SnippetPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

async function getSnippet(id: string) {
  const snippet = await prisma.snippet.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return snippet;
}

export async function generateMetadata({
  params,
}: SnippetPageProps): Promise<Metadata> {
  const { id } = await params;
  const snippet = await getSnippet(id);

  if (!snippet) {
    return {
      title: "Snippet Not Found",
    };
  }

  return {
    title: `${snippet.title} - Code Snippet`,
    description: snippet.description || `${snippet.language} code snippet`,
    openGraph: {
      title: snippet.title,
      description: snippet.description || `${snippet.language} code snippet`,
      type: "article",
    },
  };
}

export default async function SnippetPage({ params }: SnippetPageProps) {
  const { id } = await params;
  const snippet = await getSnippet(id);
  const session = await auth();

  if (!snippet) {
    notFound();
  }

  const isOwner = session?.user?.id === snippet.userId;
  const shareUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/snippets/${snippet.id}`;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-4xl font-bold text-gray-900">{snippet.title}</h1>
          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/snippets/${snippet.id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit
              </Link>
              <DeleteButton snippetId={snippet.id} />
            </div>
          )}
        </div>

        {snippet.description && (
          <p className="text-gray-600 text-lg mb-4">{snippet.description}</p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <Link
              href={`/profile/${snippet.user.id}`}
              className="hover:text-blue-600"
            >
              {snippet.user.name || snippet.user.email}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            <span>{snippet.language}</span>
          </div>
          {snippet.complexity && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Complexity: {snippet.complexity}</span>
            </div>
          )}
        </div>

        {/* Topics */}
        {snippet.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {snippet.topics.map((topic) => (
              <Link
                key={topic}
                href={`/?topic=${encodeURIComponent(topic)}`}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
              >
                #{topic}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Code Block */}
      <div className="mb-8">
        <CodeBlock code={snippet.code} language={snippet.language} />
      </div>

      {/* Share Section */}
      <ShareSection shareUrl={shareUrl} />
    </div>
  );
}
