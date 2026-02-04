import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Code2, Clock, Eye, GitFork, Lock, Calendar, Edit3, Sparkles } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";
import DeleteButton from "@/components/DeleteButton";
import ShareSection from "@/components/ShareSection";
import LikeButton from "@/components/LikeButton";
import BookmarkButton from "@/components/BookmarkButton";
import ForkButton from "@/components/ForkButton";
import CommentSection from "@/components/CommentSection";
import { Metadata } from "next";
import {
  AnimatedHero,
  AnimatedContent,
  AnimatedBadge,
  AnimatedSection,
  AnimatedCodeBlock,
  AnimatedActionBar,
  AnimatedButton,
} from "@/components/PageAnimations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SnippetPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: SnippetPageProps): Promise<Metadata> {
  const { id } = await params;
  const snippet = await prisma.snippet.findUnique({
    where: { id },
    select: { title: true, description: true, language: true },
  });

  if (!snippet) {
    return { title: "Snippet Not Found" };
  }

  return {
    title: `${snippet.title} - Code Snippet`,
    description: snippet.description || `${snippet.language} code snippet`,
  };
}

export default async function SnippetPage({ params }: SnippetPageProps) {
  const { id } = await params;
  const session = await auth();

  const snippet = await prisma.snippet.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      forkedFrom: {
        include: {
          originalSnippet: {
            select: {
              id: true,
              title: true,
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  if (!snippet) {
    notFound();
  }

  // Check access for private snippets
  if (!snippet.isPublic && snippet.userId !== session?.user?.id) {
    notFound();
  }

  // Check if user liked/bookmarked
  let isLiked = false;
  let isBookmarked = false;

  if (session?.user?.id) {
    const [like, bookmark] = await Promise.all([
      prisma.like.findUnique({
        where: {
          userId_snippetId: {
            userId: session.user.id,
            snippetId: id,
          },
        },
      }),
      prisma.bookmark.findUnique({
        where: {
          userId_snippetId: {
            userId: session.user.id,
            snippetId: id,
          },
        },
      }),
    ]);
    isLiked = !!like;
    isBookmarked = !!bookmark;
  }

  // Increment view count
  await prisma.snippet.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  const isOwner = session?.user?.id === snippet.userId;
  const shareUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/snippets/${snippet.id}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <AnimatedHero className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative max-w-5xl mx-auto px-4 py-16">
          {/* Title and Private Badge */}
          <AnimatedContent className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <AnimatedBadge delay={0.1} className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-full">
                  {snippet.language}
                </AnimatedBadge>
                {!snippet.isPublic && (
                  <AnimatedBadge delay={0.15} className="flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-sm text-white/80 text-sm rounded-full border border-white/20">
                    <Lock className="h-3 w-3" />
                    Private
                  </AnimatedBadge>
                )}
                {snippet.complexity && (
                  <AnimatedBadge delay={0.2} className="flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-sm text-white/80 text-sm rounded-full border border-white/20">
                    <Clock className="h-3 w-3" />
                    {snippet.complexity}
                  </AnimatedBadge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{snippet.title}</h1>

              {/* Forked from */}
              {snippet.forkedFrom && (
                <p className="text-sm text-gray-300 mb-4">
                  <GitFork className="h-4 w-4 inline mr-1" />
                  Forked from{" "}
                  <Link
                    href={`/snippets/${snippet.forkedFrom.originalSnippet.id}`}
                    className="text-cyan-400 hover:underline"
                  >
                    {snippet.forkedFrom.originalSnippet.title}
                  </Link>
                  {" "}by{" "}
                  <Link
                    href={`/profile/${snippet.forkedFrom.originalSnippet.user.id}`}
                    className="text-cyan-400 hover:underline"
                  >
                    {snippet.forkedFrom.originalSnippet.user.name ||
                      snippet.forkedFrom.originalSnippet.user.email}
                  </Link>
                </p>
              )}

              {snippet.description && (
                <p className="text-gray-300 text-lg max-w-3xl">{snippet.description}</p>
              )}
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <AnimatedButton>
                  <Link
                    href={`/snippets/${snippet.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </Link>
                </AnimatedButton>
                <DeleteButton snippetId={snippet.id} />
              </div>
            )}
          </AnimatedContent>

          {/* Author Card */}
          <Link
            href={`/profile/${snippet.user.id}`}
            className="inline-flex items-center gap-4 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
          >
            {snippet.user.avatarUrl ? (
              <img
                src={snippet.user.avatarUrl}
                alt=""
                className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-white/30">
                {(snippet.user.name || snippet.user.email).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-white">
                {snippet.user.name || snippet.user.email}
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Calendar className="w-3 h-3" />
                {new Date(snippet.createdAt).toLocaleDateString()}
              </div>
            </div>
          </Link>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-white/10">
                <Eye className="h-4 w-4 text-emerald-400" />
              </div>
              <span>{snippet.viewCount} views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-white/10">
                <GitFork className="h-4 w-4 text-amber-400" />
              </div>
              <span>{snippet.forkCount} forks</span>
            </div>
          </div>

          {/* Tags */}
          {snippet.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {snippet.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/?tag=${tag.slug}`}
                  className="px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform"
                  style={{ backgroundColor: `${tag.color}30`, color: tag.color, borderColor: `${tag.color}50` }}
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Legacy Topics */}
          {snippet.topics.length > 0 && snippet.tags.length === 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {snippet.topics.map((topic) => (
                <Link
                  key={topic}
                  href={`/?topic=${encodeURIComponent(topic)}`}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white/80 rounded-full text-sm hover:bg-white/20 transition-all border border-white/20"
                >
                  #{topic}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 32.5C672 35 768 40 864 42.5C960 45 1056 45 1152 42.5C1248 40 1344 35 1392 32.5L1440 30V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z" fill="#F9FAFB" />
          </svg>
        </div>
      </AnimatedHero>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Action Buttons */}
        <AnimatedActionBar className="flex flex-wrap gap-3 mb-8">
          <LikeButton
            snippetId={snippet.id}
            initialLiked={isLiked}
            initialCount={snippet.likeCount}
          />
          <BookmarkButton
            snippetId={snippet.id}
            initialBookmarked={isBookmarked}
          />
          <ForkButton snippetId={snippet.id} forkCount={snippet.forkCount} />
        </AnimatedActionBar>

        {/* Share Section */}
        <AnimatedSection className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Share This Snippet</h2>
          </div>
          <ShareSection shareUrl={shareUrl} />
        </AnimatedSection>

        {/* Code Block */}
        <AnimatedCodeBlock className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Source Code</h2>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
            <CodeBlock code={snippet.code} language={snippet.language} />
          </div>
        </AnimatedCodeBlock>

        {/* Comments Section */}
        <AnimatedSection>
          <CommentSection
            snippetId={snippet.id}
            initialCommentCount={snippet._count.comments}
          />
        </AnimatedSection>
      </div>
    </div>
  );
}
