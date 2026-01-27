"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark, Code2, Sparkles, Search } from "lucide-react";
import SnippetCard from "@/components/SnippetCard";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const }
  }
};

interface Snippet {
  id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  complexity: string | null;
  topics: string[];
  isPublic: boolean;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  forkCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
      color: string;
    };
  }[];
  _count: {
    likes: number;
    comments: number;
  };
}

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("bookmarks");
  const [bookmarks, setBookmarks] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookmarks?page=${page}&limit=12`);
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.bookmarks);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (session) {
      fetchBookmarks();
    }
  }, [session, fetchBookmarks]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent"
            />
          </div>
          <p className="text-gray-500">Loading your bookmarks...</p>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4 mb-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, delay: 0.3 }}
              className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-orange-500/25"
            >
              <Bookmark className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-white">{t("title")}</h1>
              <p className="text-gray-300 mt-1">Your saved code snippets collection</p>
            </div>
          </motion.div>

          <AnimatePresence>
            {bookmarks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/80"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{bookmarks.length} snippets saved</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 32.5C672 35 768 40 864 42.5C960 45 1056 45 1152 42.5C1248 40 1344 35 1392 32.5L1440 30V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z" fill="#F9FAFB" />
          </svg>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {bookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              className="relative inline-block mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-100">
                <Code2 className="w-16 h-16 text-amber-500 mx-auto" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t("empty")}</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">{t("emptyDescription")}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25"
            >
              <Search className="w-5 h-5" />
              Explore Snippets
            </motion.button>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {bookmarks.map((snippet, index) => (
                <motion.div
                  key={snippet.id}
                  custom={index}
                  variants={cardVariant}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <SnippetCard snippet={snippet} />
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center items-center gap-4 mt-12"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-purple-300 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t("previous")}
                </motion.button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                    <motion.button
                      key={p}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl font-medium transition-all ${
                        p === page
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                          : "bg-white border-2 border-gray-200 text-gray-600 hover:border-purple-300"
                      }`}
                    >
                      {p}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-purple-300 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t("next")}
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
