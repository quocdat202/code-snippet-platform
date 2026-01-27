"use client";

import Link from "next/link";
import { Heart, MessageSquare, Eye, Clock } from "lucide-react";

interface Tag {
  tag: {
    id: string | number;
    name: string;
    slug: string;
    color: string;
  };
}

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

interface Snippet {
  id: string;
  title: string;
  description: string | null;
  language: string;
  complexity: string | null;
  isPublic: boolean;
  createdAt: string | Date;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  forkCount: number;
  user: User;
  tags: Tag[];
  _count?: {
    likes: number;
    comments: number;
    bookmarks?: number;
  };
}

interface SnippetCardProps {
  snippet: Snippet;
}

export default function SnippetCard({ snippet }: SnippetCardProps) {
  const likeCount = snippet.likeCount || snippet._count?.likes || 0;
  const commentCount = snippet.commentCount || snippet._count?.comments || 0;

  return (
    <Link
      href={`/snippets/${snippet.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 flex-1">
          {snippet.title}
        </h3>
        {!snippet.isPublic && (
          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            Private
          </span>
        )}
      </div>

      {snippet.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {snippet.description}
        </p>
      )}

      {/* Tags */}
      {snippet.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {snippet.tags.slice(0, 3).map(({ tag }) => (
            <span
              key={tag.id}
              className="px-2 py-1 rounded-full text-xs"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              #{tag.name}
            </span>
          ))}
          {snippet.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{snippet.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Meta info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            {snippet.language}
          </span>
          {snippet.complexity && (
            <span className="flex items-center gap-1 text-gray-500 text-xs">
              <Clock className="h-3 w-3" />
              {snippet.complexity}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-gray-500">
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {commentCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {snippet.viewCount}
          </span>
        </div>
      </div>

      {/* Author */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
        {snippet.user.avatarUrl ? (
          <img
            src={snippet.user.avatarUrl}
            alt=""
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
            {(snippet.user.name || snippet.user.email).charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm text-gray-600">
          {snippet.user.name || snippet.user.email.split("@")[0]}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(snippet.createdAt).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
