"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface BookmarkButtonProps {
  snippetId: string;
  initialBookmarked: boolean;
}

export default function BookmarkButton({
  snippetId,
  initialBookmarked,
}: BookmarkButtonProps) {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookmark = async () => {
    if (!session) {
      toast.error("Please login to bookmark snippets");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/snippets/${snippetId}/bookmark`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to bookmark");

      const data = await response.json();
      setIsBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? "Bookmarked!" : "Bookmark removed");
    } catch {
      toast.error("Failed to update bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isBookmarked
          ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } disabled:opacity-50`}
      title={isBookmarked ? "Remove bookmark" : "Bookmark this snippet"}
    >
      <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
    </button>
  );
}
