import type { ReactNode } from "react";

type PostAuthor = {
  name?: string | null;
  image?: string | null;
};

type PostHeaderProps = {
  title: string;
  shortDescription?: string | null;
  createdAt: Date | string;
  author?: PostAuthor | null;
  category?: string | null;
};

function formatPublishedDate(date: Date | string) {
  const parsedDate = date instanceof Date ? date : new Date(date);

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(parsedDate);
}

function getInitials(name?: string | null) {
  if (!name) return "A";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function MetaDot() {
  return (
    <span aria-hidden="true" className="h-1 w-1 rounded-full bg-neutral-300" />
  );
}

function AuthorAvatar({ author }: { author?: PostAuthor | null }) {
  if (author?.image) {
    return (
      <img
        src={author.image}
        alt={author.name ?? "Author"}
        className="h-11 w-11 rounded-full object-cover ring-1 ring-black/5"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white"
    >
      {getInitials(author?.name)}
    </div>
  );
}

export function PostHeader({
  title,
  shortDescription,
  createdAt,
  author,
  category = "Article",
}: PostHeaderProps) {
  const authorName = author?.name ?? "Anonymous";

  return (
    <header className="mx-auto max-w-5xl px-6 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-20 lg:px-10 lg:pb-20 lg:pt-24">
      <div className="mx-auto max-w-4xl">
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-neutral-500">
          {category && (
            <>
              <span className="text-neutral-900">{category}</span>
              <MetaDot />
            </>
          )}

          <time dateTime={new Date(createdAt).toISOString()}>
            Published {formatPublishedDate(createdAt)}
          </time>
        </div>

        {/* Title */}
        <h1 className="mt-7 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.035em] text-neutral-950 sm:text-5xl sm:leading-[1.08] lg:text-6xl lg:leading-[1.04]">
          {title}
        </h1>

        {/* Description */}
        {shortDescription && (
          <p className="mt-7 max-w-3xl text-pretty text-lg leading-8 text-neutral-600 sm:mt-8 sm:text-xl sm:leading-9">
            {shortDescription}
          </p>
        )}

        {/* Author */}
        <div className="mt-9 flex items-center gap-3">
          <AuthorAvatar author={author} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {authorName}
            </p>

            <p className="mt-0.5 text-sm text-neutral-500">Author</p>
          </div>
        </div>
      </div>
    </header>
  );
}
