"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCallback, useState } from "react";

export default function DeleteButton({ snippetId }: { snippetId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!confirm("Are you sure you want to delete?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/snippets/${snippetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Snippet deleted successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete snippet");
    } finally {
      setIsDeleting(false);
    }
  }, [snippetId, router]);

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
    >
      <Trash2 className="h-4 w-4" />
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
