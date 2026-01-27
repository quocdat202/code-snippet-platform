"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Send, Reply } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  isEdited: boolean;
  user: User;
  replies?: Comment[];
}

interface CommentSectionProps {
  snippetId: string;
  initialCommentCount: number;
}

export default function CommentSection({
  snippetId,
  initialCommentCount,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/snippets/${snippetId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [snippetId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (parentId?: number) => {
    const content = parentId ? replyContent : newComment;

    if (!content.trim()) return;

    if (!session) {
      toast.error("Please login to comment");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/snippets/${snippetId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          parentId,
        }),
      });

      if (!response.ok) throw new Error("Failed to post comment");

      const comment = await response.json();

      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies || []), comment] }
              : c
          )
        );
        setReplyContent("");
        setReplyingTo(null);
      } else {
        setComments((prev) => [comment, ...prev]);
        setNewComment("");
      }

      setCommentCount((prev) => prev + 1);
      toast.success("Comment posted!");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getUserInitial = (user: User) => {
    return (user.name || user.email).charAt(0).toUpperCase();
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? "ml-12 mt-3" : ""}`}>
      <div className="flex gap-3">
        <Link href={`/profile/${comment.user.id}`}>
          {comment.user.avatarUrl ? (
            <img
              src={comment.user.avatarUrl}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {getUserInitial(comment.user)}
            </div>
          )}
        </Link>
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <Link
                href={`/profile/${comment.user.id}`}
                className="font-medium text-gray-900 hover:text-blue-600"
              >
                {comment.user.name || comment.user.email.split("@")[0]}
              </Link>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
                {comment.isEdited && " (edited)"}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>

          {!isReply && session && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1 mt-2 text-sm text-gray-500 hover:text-blue-600"
            >
              <Reply className="h-4 w-4" />
              Reply
            </button>
          )}

          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(comment.id);
                  }
                }}
              />
              <button
                onClick={() => handleSubmit(comment.id)}
                disabled={isSubmitting || !replyContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}

          {comment.replies?.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      <h3 className="flex items-center gap-2 text-xl font-semibold mb-6">
        <MessageSquare className="h-5 w-5" />
        Comments ({commentCount})
      </h3>

      {session ? (
        <div className="flex gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {(session.user?.name || session.user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleSubmit()}
                disabled={isSubmitting || !newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Comment
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-600">
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>{" "}
            to leave a comment
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
