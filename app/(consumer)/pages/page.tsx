/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Post } from "@/types/post";
import Link from "next/link";

interface Pagination {
  limit: number;
  hasNextPage: boolean;
  nextCursor: string | null;
}

interface PostsResponse {
  data: Post[];
  pagination: Pagination;
  requestId?: string;
}

const PAGE_SIZE = 20;

export default function PostsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPosts = useCallback(async (cursor?: string) => {
    const controller = new AbortController();

    // Abort previous request.
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    const isLoadingMore = Boolean(cursor);

    try {
      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
      });

      if (cursor) {
        params.set("cursor", cursor);
      }

      const response = await fetch(`/api/posts?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts (${response.status})`);
      }

      const result: PostsResponse = await response.json();

      console.log("[PostsClient] API response:", result);

      if (!result || !Array.isArray(result.data)) {
        throw new Error("Invalid API response");
      }

      if (isLoadingMore) {
        setPosts((current) => {
          const existingIds = new Set(current.map((post) => post.id));

          const newPosts = result.data.filter(
            (post) => !existingIds.has(post.id),
          );

          return [...current, ...newPosts];
        });
      } else {
        setPosts(result.data);
      }

      setNextCursor(result.pagination?.nextCursor ?? null);
      setHasNextPage(result.pagination?.hasNextPage ?? false);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load posts.");
      }
    } finally {
      // Only update loading state if this request wasn't aborted.
      if (!controller.signal.aborted) {
        if (isLoadingMore) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    fetchPosts();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchPosts]);

  const handleLoadMore = async () => {
    if (!nextCursor || !hasNextPage || loadingMore) {
      return;
    }

    await fetchPosts(nextCursor);
  };

  const handleRetry = () => {
    setPosts([]);
    setNextCursor(null);
    setHasNextPage(false);
    setError(null);

    fetchPosts();
  };

  /*
   * Initial loading
   */
  if (loading) {
    return (
      <div
        className="flex min-h-48 w-full items-center justify-center"
        role="status"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <span className="sr-only">Loading posts...</span>
      </div>
    );
  }

  /*
   * Initial request failed
   */
  if (error && posts.length === 0) {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700"
        role="alert"
      >
        <p className="font-semibold">Unable to load posts</p>

        <p className="mt-1 text-sm">{error}</p>

        <button
          type="button"
          onClick={handleRetry}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  /*
   * Empty result
   */
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
        <p className="font-medium">No posts found.</p>
        <p className="mt-1 text-sm">There are currently no published posts.</p>
      </div>
    );
  }

  /*
   * Posts
   */
  return (
    <section
      aria-label="Posts"
      className="w-full *:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 *:py-10"
    >
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const imageUrl = post.image?.[0];

          return (
            <article
              key={post.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl"
            >
              {/* Image */}
              <Link
                href={`/pages/${post.slug}`}
                className="relative block aspect-[16/10] overflow-hidden bg-gray-100"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <span className="text-sm font-medium text-gray-400">
                      No image
                    </span>
                  </div>
                )}

                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                {/* Status */}
                <div className="mb-3">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    {post.status}
                  </span>
                </div>

                {/* Title */}
                <Link href={`/pages/${post.slug}`} className="block">
                  <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-indigo-600 sm:text-[22px]">
                    {post.title}
                  </h2>
                </Link>

                {/* Description */}
                {post.shortDescription && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                    {post.shortDescription}
                  </p>
                )}

                {/* Read more */}
                <Link
                  href={`/pages/${post.slug}`}
                  className="mt-auto flex items-center gap-1.5 pt-5 text-sm font-semibold text-gray-900 transition-colors group-hover:text-indigo-600"
                >
                  Read more
                  <svg
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a1 1 0 011-1h10.586l-3.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 11H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* Error */}
      {error && posts.length > 0 && (
        <div
          className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Load more */}
      {hasNextPage && nextCursor && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="group inline-flex min-w-36 items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Loading...
              </>
            ) : (
              <>
                Load more
                <span className="transition-transform duration-200 group-hover:translate-y-0.5">
                  ↓
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* End state */}
      {!hasNextPage && posts.length > 0 && (
        <div className="mt-12 flex items-center justify-center gap-3 text-sm text-gray-400">
          <span className="h-px w-12 bg-gray-200" />
          <span>You&apos;ve reached the end</span>
          <span className="h-px w-12 bg-gray-200" />
        </div>
      )}
    </section>
  );
}
