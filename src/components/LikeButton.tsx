"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface LikeButtonProps {
  snippetId: string;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({
  snippetId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!session) {
      toast.error("Please login to like snippets");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/snippets/${snippetId}/like`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to like");

      const data = await response.json();
      setIsLiked(data.liked);
      setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
    } catch {
      toast.error("Failed to update like");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isLiked
          ? "bg-red-100 text-red-600 hover:bg-red-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } disabled:opacity-50`}
    >
      <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
      <span className="font-medium">{likeCount}</span>
    </button>
  );
}
