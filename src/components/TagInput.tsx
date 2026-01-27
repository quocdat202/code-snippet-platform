"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";

interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  maxTags?: number;
}

export default function TagInput({
  selectedTags,
  onTagsChange,
  maxTags = 5,
}: TagInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTags = async () => {
      if (!query.trim()) {
        // Load popular tags
        setIsLoading(true);
        try {
          const response = await fetch("/api/tags?popular=true");
          if (response.ok) {
            const tags = await response.json();
            setSuggestions(
              tags.filter(
                (t: Tag) => !selectedTags.some((st) => st.id === t.id)
              )
            );
          }
        } catch (error) {
          console.error("Failed to fetch tags:", error);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/tags?search=${encodeURIComponent(query)}`);
        if (response.ok) {
          const tags = await response.json();
          setSuggestions(
            tags.filter((t: Tag) => !selectedTags.some((st) => st.id === t.id))
          );
        }
      } catch (error) {
        console.error("Failed to search tags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchTags, 300);
    return () => clearTimeout(debounce);
  }, [query, selectedTags]);

  const handleAddTag = (tag: Tag) => {
    if (selectedTags.length >= maxTags) return;
    onTagsChange([...selectedTags, tag]);
    setQuery("");
    setIsOpen(false);
  };

  const handleRemoveTag = (tagId: number) => {
    onTagsChange(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!query.trim() || selectedTags.length >= maxTags) return;

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: query.trim() }),
      });

      if (response.ok) {
        const tag = await response.json();
        handleAddTag(tag);
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tags ({selectedTags.length}/{maxTags})
      </label>

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
          >
            #{tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="hover:opacity-70"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      {selectedTags.length < maxTags && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Search or create tags..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-gray-500">Loading...</div>
              ) : (
                <>
                  {suggestions.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleAddTag(tag)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span
                        className="px-2 py-1 rounded text-sm"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                      >
                        #{tag.name}
                      </span>
                      <Plus className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}

                  {query.trim() && !suggestions.some(
                    (t) => t.name.toLowerCase() === query.trim().toLowerCase()
                  ) && (
                    <button
                      onClick={handleCreateTag}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 text-blue-600 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create tag &quot;{query.trim()}&quot;
                    </button>
                  )}

                  {suggestions.length === 0 && !query.trim() && (
                    <div className="p-3 text-center text-gray-500">
                      No tags found. Type to search or create.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
