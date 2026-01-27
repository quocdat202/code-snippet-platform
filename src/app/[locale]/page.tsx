import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Code2,
  Search,
  Users,
  FolderHeart,
  Heart,
  GitFork,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";
import SnippetCard from "@/components/SnippetCard";
import {
  HeroContent,
  HeroBadge,
  HeroTitle,
  HeroDescription,
  HeroButtons,
  StatsGrid,
  StatItem,
  SectionHeader,
  TagsContainer,
  TagItem,
  SnippetsGrid,
  SnippetItem,
  FeaturesGrid,
  FeatureCard,
  ContributorsContainer,
  ContributorCard,
  CTAContent,
  CTATitle,
  CTADescription,
  CTAButton,
} from "@/components/HomeAnimations";

export const dynamic = "force-dynamic";
export const revalidate = 30;

async function getStats() {
  const [snippetCount, userCount, totalLikes, totalForks] = await Promise.all([
    prisma.snippet.count({ where: { isPublic: true } }),
    prisma.user.count(),
    prisma.snippet.aggregate({
      _sum: { likeCount: true },
      where: { isPublic: true },
    }),
    prisma.snippet.aggregate({
      _sum: { forkCount: true },
      where: { isPublic: true },
    }),
  ]);

  return {
    snippets: snippetCount,
    users: userCount,
    likes: totalLikes._sum.likeCount || 0,
    forks: totalForks._sum.forkCount || 0,
  };
}

async function getTrendingSnippets() {
  return prisma.snippet.findMany({
    where: { isPublic: true },
    orderBy: [{ likeCount: "desc" }, { viewCount: "desc" }],
    take: 4,
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
  });
}

async function getLatestSnippets() {
  return prisma.snippet.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    take: 4,
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
  });
}

async function getPopularTags() {
  return prisma.tag.findMany({
    orderBy: { usageCount: "desc" },
    take: 12,
  });
}

async function getTopContributors() {
  return prisma.user.findMany({
    orderBy: { snippetCount: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      snippetCount: true,
      totalLikesReceived: true,
    },
  });
}

export default async function HomePage() {
  const t = await getTranslations("home");

  const [stats, trendingSnippets, latestSnippets, popularTags, topContributors] =
    await Promise.all([
      getStats(),
      getTrendingSnippets(),
      getLatestSnippets(),
      getPopularTags(),
      getTopContributors(),
    ]);

  const features = [
    {
      icon: Code2,
      title: t("features.share.title"),
      description: t("features.share.description"),
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Search,
      title: t("features.discover.title"),
      description: t("features.discover.description"),
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: t("features.collaborate.title"),
      description: t("features.collaborate.description"),
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: FolderHeart,
      title: t("features.organize.title"),
      description: t("features.organize.description"),
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <HeroContent>
            <HeroBadge className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/80 mb-8">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Open Source Code Sharing Platform</span>
            </HeroBadge>

            <HeroTitle className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              {t("heroTitle")}{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t("heroTitleHighlight")}
              </span>
            </HeroTitle>

            <HeroDescription className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              {t("heroDescription")}
            </HeroDescription>

            <HeroButtons className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/snippets/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
              >
                <Code2 className="w-5 h-5" />
                {t("getStarted")}
              </Link>
              <Link
                href="/bookmarks"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
              >
                {t("browseSnippets")}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </HeroButtons>
          </HeroContent>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <StatsGrid className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-4">
                <Code2 className="w-7 h-7" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.snippets.toLocaleString()}
              </div>
              <div className="text-gray-500">{t("stats.totalSnippets")}</div>
            </StatItem>
            <StatItem className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-4">
                <Users className="w-7 h-7" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.users.toLocaleString()}
              </div>
              <div className="text-gray-500">{t("stats.totalUsers")}</div>
            </StatItem>
            <StatItem className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white mb-4">
                <Heart className="w-7 h-7" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.likes.toLocaleString()}
              </div>
              <div className="text-gray-500">{t("stats.totalLikes")}</div>
            </StatItem>
            <StatItem className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white mb-4">
                <GitFork className="w-7 h-7" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.forks.toLocaleString()}
              </div>
              <div className="text-gray-500">{t("stats.totalForks")}</div>
            </StatItem>
          </StatsGrid>
        </div>
      </section>

      {/* Popular Tags Section */}
      {popularTags.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {t("popularTags")}
              </h2>
            </SectionHeader>
            <TagsContainer className="flex flex-wrap gap-3">
              {popularTags.map((tag) => (
                <TagItem key={tag.id}>
                  <Link
                    href={`/bookmarks?tag=${tag.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all group"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-gray-700 group-hover:text-gray-900">
                      {tag.name}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {tag.usageCount}
                    </span>
                  </Link>
                </TagItem>
              ))}
            </TagsContainer>
          </div>
        </section>
      )}

      {/* Trending Snippets Section */}
      {trendingSnippets.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t("trendingSnippets")}
                </h2>
              </div>
              <Link
                href="/bookmarks?sort=trending"
                className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t("viewAll")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </SectionHeader>
            <SnippetsGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingSnippets.map((snippet) => (
                <SnippetItem key={snippet.id}>
                  <SnippetCard snippet={snippet} />
                </SnippetItem>
              ))}
            </SnippetsGrid>
          </div>
        </section>
      )}

      {/* Latest Snippets Section */}
      {latestSnippets.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <Clock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t("latestSnippets")}
                </h2>
              </div>
              <Link
                href="/bookmarks?sort=latest"
                className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                {t("viewAll")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </SectionHeader>
            <SnippetsGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestSnippets.map((snippet) => (
                <SnippetItem key={snippet.id}>
                  <SnippetCard snippet={snippet} />
                </SnippetItem>
              ))}
            </SnippetsGrid>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t("features.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("features.subtitle")}
            </p>
          </SectionHeader>
          <FeaturesGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-5 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </div>
      </section>

      {/* Top Contributors Section */}
      {topContributors.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader className="text-center mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t("topContributors")}
              </h2>
            </SectionHeader>
            <ContributorsContainer className="flex flex-wrap justify-center gap-6">
              {topContributors.map((user, index) => (
                <ContributorCard
                  key={user.id}
                  index={index}
                  className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all group"
                >
                  <Link
                    href={`/profile/${user.id}`}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-4">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name || ""}
                          className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-100 group-hover:ring-purple-200 transition-all"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold ring-4 ring-purple-100 group-hover:ring-purple-200 transition-all">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                      {index < 3 && (
                        <div
                          className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? "bg-yellow-400 text-yellow-900"
                              : index === 1
                              ? "bg-gray-300 text-gray-700"
                              : "bg-orange-400 text-orange-900"
                          }`}
                        >
                          #{index + 1}
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {user.name || user.email.split("@")[0]}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Code2 className="w-4 h-4" />
                        {user.snippetCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {user.totalLikesReceived}
                      </span>
                    </div>
                  </Link>
                </ContributorCard>
              ))}
            </ContributorsContainer>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <CTAContent>
            <CTATitle className="text-3xl sm:text-4xl font-bold text-white mb-6">
              {t("heroTitle")}{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                {t("heroTitleHighlight")}
              </span>
            </CTATitle>
            <CTADescription className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              {t("heroDescription")}
            </CTADescription>
            <CTAButton>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
              >
                {t("getStarted")}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </CTAButton>
          </CTAContent>
        </div>
      </section>
    </div>
  );
}
