"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  GitFork,
  Check,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

export default function NotificationDropdown() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (session) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?limit=10");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "fork":
        return <GitFork className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
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
            <strong>{actorName}</strong> liked your snippet{" "}
            {notification.snippet && (
              <strong>&quot;{notification.snippet.title}&quot;</strong>
            )}
          </>
        );
      case "comment":
        return (
          <>
            <strong>{actorName}</strong>{" "}
            {notification.message || "commented on your snippet"}{" "}
            {notification.snippet && (
              <strong>&quot;{notification.snippet.title}&quot;</strong>
            )}
          </>
        );
      case "follow":
        return (
          <>
            <strong>{actorName}</strong> started following you
          </>
        );
      case "fork":
        return (
          <>
            <strong>{actorName}</strong> forked your snippet{" "}
            {notification.snippet && (
              <strong>&quot;{notification.snippet.title}&quot;</strong>
            )}
          </>
        );
      default:
        return notification.message || "New notification";
    }
  };

  const getLink = (notification: Notification) => {
    if (notification.snippet) {
      return `/snippets/${notification.snippet.id}`;
    }
    if (notification.type === "follow" && notification.actor) {
      return `/profile/${notification.actor.id}`;
    }
    return "/notifications";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  if (!session) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getLink(notification)}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {getMessage(notification)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </Link>
              ))
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-center text-sm text-blue-600 hover:bg-gray-50 border-t"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
