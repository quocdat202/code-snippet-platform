"use client";

import { useState } from "react";
import { GitFork } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ForkButtonProps {
  snippetId: string;
  forkCount: number;
}

export default function ForkButton({ snippetId, forkCount }: ForkButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(forkCount);

  const handleFork = async () => {
    if (!session) {
      toast.error("Please login to fork snippets");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/snippets/${snippetId}/fork`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to fork");

      const forkedSnippet = await response.json();
      setCount((prev) => prev + 1);
      toast.success("Snippet forked!");
      router.push(`/snippets/${forkedSnippet.id}/edit`);
    } catch {
      toast.error("Failed to fork snippet");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFork}
      disabled={isLoading}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
      title="Fork this snippet"
    >
      <GitFork className="h-5 w-5" />
      <span className="font-medium">{count}</span>
    </button>
  );
}
