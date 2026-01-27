"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Heart, MessageSquare, UserPlus, GitFork, Check, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: number;
  type: string;
  isRead: boolean;
  createdAt: string;
  message?: string;
  actor?: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  snippet?: {
    id: string;
    title: string;
  };
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: "easeOut" as const }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notifications?page=${page}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session, fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const getIcon = (type: string) => {
    const iconClasses = "w-5 h-5";
    switch (type) {
      case "like":
        return (
          <div className="p-2 rounded-xl bg-gradient-to-br from-red-100 to-pink-100">
            <Heart className={`${iconClasses} text-red-500`} />
          </div>
        );
      case "comment":
        return (
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
            <MessageSquare className={`${iconClasses} text-blue-500`} />
          </div>
        );
      case "follow":
        return (
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
            <UserPlus className={`${iconClasses} text-green-500`} />
          </div>
        );
      case "fork":
        return (
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100">
            <GitFork className={`${iconClasses} text-purple-500`} />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-xl bg-gradient-to-br from-gray-100 to-slate-100">
            <Bell className={`${iconClasses} text-gray-500`} />
          </div>
        );
    }
  };

  const getMessage = (notification: Notification) => {
    const actorName =
      notification.actor?.name ||
      notification.actor?.email?.split("@")[0] ||
      "Someone";

    switch (notification.type) {
      case "like":
        return (
          <>
            <span className="font-semibold text-gray-900">{actorName}</span>
            <span className="text-gray-600"> liked your snippet </span>
            <span className="font-medium text-purple-600">&quot;{notification.snippet?.title}&quot;</span>
          </>
        );
      case "comment":
        return notification.message ? (
          <>
            <span className="font-semibold text-gray-900">{actorName}</span>
            <span className="text-gray-600"> {notification.message}</span>
          </>
        ) : (
          <>
            <span className="font-semibold text-gray-900">{actorName}</span>
            <span className="text-gray-600"> commented on </span>
            <span className="font-medium text-purple-600">&quot;{notification.snippet?.title}&quot;</span>
          </>
        );
      case "follow":
        return (
          <>
            <span className="font-semibold text-gray-900">{actorName}</span>
            <span className="text-gray-600"> started following you</span>
          </>
        );
      case "fork":
        return (
          <>
            <span className="font-semibold text-gray-900">{actorName}</span>
            <span className="text-gray-600"> forked your snippet </span>
            <span className="font-medium text-purple-600">&quot;{notification.snippet?.title}&quot;</span>
          </>
        );
      default:
        return <span className="text-gray-600">{notification.message || "New notification"}</span>;
    }
  };

  const getLink = (notification: Notification) => {
    if (notification.snippet) {
      return `/snippets/${notification.snippet.id}`;
    }
    if (notification.type === "follow" && notification.actor) {
      return `/profile/${notification.actor.id}`;
    }
    return "#";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

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
          <p className="text-gray-500">Loading notifications...</p>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative max-w-3xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/25"
              >
                <Bell className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold text-white">{t("title")}</h1>
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse"
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-gray-300 mt-1">Stay updated with your activity</p>
              </div>
            </div>
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Check className="w-4 h-4" />
                  {t("markAllRead")}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/80"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{notifications.length} notifications</span>
            </motion.div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
            <path d="M0 60L48 55C96 50 192 40 288 35C384 30 480 30 576 32.5C672 35 768 40 864 42.5C960 45 1056 45 1152 42.5C1248 40 1344 35 1392 32.5L1440 30V60H1392C1344 60 1248 60 1152 60C1056 60 960 60 864 60C768 60 672 60 576 60C480 60 384 60 288 60C192 60 96 60 48 60H0Z" fill="#F9FAFB" />
          </svg>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-20"></div>
              <motion.div
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl border border-cyan-100"
              >
                <Bell className="w-16 h-16 text-cyan-500 mx-auto" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t("empty")}</h2>
            <p className="text-gray-500 max-w-md mx-auto">{t("emptyDescription")}</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-3"
            >
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  custom={index}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.01, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href={getLink(notification)}
                    className={`flex items-start gap-4 p-5 rounded-2xl transition-all duration-200 ${
                      !notification.isRead
                        ? "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 shadow-sm"
                        : "bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md"
                    }`}
                  >
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">{getMessage(notification)}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0 mt-2"
                      />
                    )}
                  </Link>
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
