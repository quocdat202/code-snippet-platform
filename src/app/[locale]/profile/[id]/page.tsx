import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Code2,
  MapPin,
  Globe,
  Heart,
  Users,
  Eye,
  GitFork,
  Sparkles,
  Edit3,
} from "lucide-react";
import { Metadata } from "next";
import SnippetCard from "@/components/SnippetCard";
import FollowButton from "@/components/FollowButton";
import {
  AnimatedHero,
  AnimatedAvatar,
  AnimatedContent,
  AnimatedStatsGrid,
  AnimatedStatItem,
  AnimatedSnippetsGrid,
  AnimatedSnippetCard,
  AnimatedMeta,
  AnimatedSection,
  AnimatedEmptyState,
  AnimatedButton,
} from "@/components/PageAnimations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
      _count: {
        select: {
          followers: true,
          following: true,
        },
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
    description: user.bio || `View code snippets shared by ${user.name || user.email}`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const session = await auth();
  const user = await getUserWithSnippets(id);

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === user.id;

  // Check if current user is following this profile
  let isFollowing = false;
  if (session?.user?.id && !isOwnProfile) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: user.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  // Calculate total stats
  const totalViews = user.snippets.reduce((acc, s) => acc + s.viewCount, 0);
  const totalLikes = user.snippets.reduce((acc, s) => acc + s.likeCount, 0);
  const totalForks = user.snippets.reduce((acc, s) => acc + s.forkCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <AnimatedHero className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            {/* Avatar */}
            <AnimatedAvatar className="flex-shrink-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full blur opacity-75"></div>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || "User avatar"}
                    className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/20"
                  />
                ) : (
                  <div className="relative w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white text-5xl md:text-6xl font-bold border-4 border-white/20">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </AnimatedAvatar>

            {/* User Info */}
            <AnimatedContent className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {user.name || "Anonymous User"}
                  </h1>
                  <p className="text-gray-300 text-lg">{user.email}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {isOwnProfile ? (
                    <AnimatedButton>
                      <Link
                        href="/profile/edit"
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </Link>
                    </AnimatedButton>
                  ) : session?.user ? (
                    <FollowButton
                      userId={user.id}
                      initialFollowing={isFollowing}
                    />
                  ) : null}
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-gray-200 text-lg mb-6 max-w-2xl">{user.bio}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-6">
                {user.location && (
                  <AnimatedMeta index={0}>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                      <MapPin className="h-4 w-4 text-cyan-400" />
                      <span>{user.location}</span>
                    </div>
                  </AnimatedMeta>
                )}
                {user.website && (
                  <AnimatedMeta index={1}>
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/20 transition-all"
                    >
                      <Globe className="h-4 w-4 text-green-400" />
                      <span>Website</span>
                    </a>
                  </AnimatedMeta>
                )}
                {user.github && (
                  <AnimatedMeta index={2}>
                    <a
                      href={`https://github.com/${user.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/20 transition-all"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span>{user.github}</span>
                    </a>
                  </AnimatedMeta>
                )}
                {user.twitter && (
                  <AnimatedMeta index={3}>
                    <a
                      href={`https://twitter.com/${user.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/20 transition-all"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span>@{user.twitter}</span>
                    </a>
                  </AnimatedMeta>
                )}
                <AnimatedMeta index={4}>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                    <Calendar className="h-4 w-4 text-amber-400" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </AnimatedMeta>
              </div>

              {/* Stats Row */}
              <AnimatedStatsGrid className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <AnimatedStatItem className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="h-5 w-5 text-cyan-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{user._count.followers}</p>
                  <p className="text-xs text-gray-400">Followers</p>
                </AnimatedStatItem>
                <AnimatedStatItem className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{user._count.following}</p>
                  <p className="text-xs text-gray-400">Following</p>
                </AnimatedStatItem>
                <AnimatedStatItem className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Code2 className="h-5 w-5 text-pink-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{user.snippets.length}</p>
                  <p className="text-xs text-gray-400">Snippets</p>
                </AnimatedStatItem>
                <AnimatedStatItem className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Eye className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{totalViews}</p>
                  <p className="text-xs text-gray-400">Views</p>
                </AnimatedStatItem>
                <AnimatedStatItem className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Heart className="h-5 w-5 text-red-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{totalLikes}</p>
                  <p className="text-xs text-gray-400">Likes</p>
                </AnimatedStatItem>
                <AnimatedStatItem className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <GitFork className="h-5 w-5 text-amber-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{totalForks}</p>
                  <p className="text-xs text-gray-400">Forks</p>
                </AnimatedStatItem>
              </AnimatedStatsGrid>
            </AnimatedContent>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 32.5C672 35 768 40 864 42.5C960 45 1056 45 1152 42.5C1248 40 1344 35 1392 32.5L1440 30V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z" fill="#F9FAFB" />
          </svg>
        </div>
      </AnimatedHero>

      {/* Snippets Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <AnimatedSection className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Public Snippets</h2>
          {user.snippets.length > 0 && (
            <span className="ml-2 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
              {user.snippets.length}
            </span>
          )}
        </AnimatedSection>

        {user.snippets.length === 0 ? (
          <AnimatedEmptyState className="text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100">
                <Code2 className="w-16 h-16 text-purple-500 mx-auto" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No public snippets yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {isOwnProfile
                ? "Share your first code snippet with the community!"
                : "This user hasn't shared any public snippets yet."}
            </p>
            {isOwnProfile && (
              <AnimatedButton className="inline-block mt-6">
                <Link
                  href="/snippets/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                  Create Snippet
                </Link>
              </AnimatedButton>
            )}
          </AnimatedEmptyState>
        ) : (
          <AnimatedSnippetsGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.snippets.map((snippet) => (
              <AnimatedSnippetCard key={snippet.id}>
                <SnippetCard snippet={snippet} />
              </AnimatedSnippetCard>
            ))}
          </AnimatedSnippetsGrid>
        )}
      </div>
    </div>
  );
}
