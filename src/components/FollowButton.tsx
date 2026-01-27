"use client";

import { useState } from "react";
import { UserPlus, UserMinus } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  userId,
  initialFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  // Don't show follow button for own profile
  if (session?.user?.id === userId) {
    return null;
  }

  const handleFollow = async () => {
    if (!session) {
      toast.error("Please login to follow users");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to follow");

      const data = await response.json();
      setIsFollowing(data.following);
      onFollowChange?.(data.following);
      toast.success(data.following ? "Followed!" : "Unfollowed");
    } catch {
      toast.error("Failed to update follow");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isFollowing
          ? "bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } disabled:opacity-50`}
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
