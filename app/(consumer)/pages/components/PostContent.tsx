import { TiptapRenderer } from "./TiptapRenderer";

type PostContentProps = {
  content: unknown;
};

export function PostContent({ content }: PostContentProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-20 lg:py-24">
      <article
        className="
          prose
          prose-neutral
          max-w-none

          prose-p:text-[1.0625rem]
          prose-p:leading-8
          prose-p:text-neutral-700

          prose-headings:font-semibold
          prose-headings:tracking-[-0.025em]
          prose-headings:text-neutral-950

          prose-h2:mb-5
          prose-h2:mt-14
          prose-h2:text-3xl
          prose-h2:leading-tight

          prose-h3:mb-4
          prose-h3:mt-10
          prose-h3:text-2xl

          prose-a:text-neutral-950

          prose-blockquote:border-neutral-300
          prose-blockquote:text-neutral-600

          prose-li:text-neutral-700

          prose-strong:text-neutral-950
        "
      >
        <TiptapRenderer
          content={content as Parameters<typeof TiptapRenderer>[0]["content"]}
        />
      </article>
    </div>
  );
}
