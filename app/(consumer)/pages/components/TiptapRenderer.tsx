import type { ReactNode } from "react";

type TiptapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

type TiptapNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: TiptapMark[];
  content?: TiptapNode[];
};

type TiptapDocument = {
  type: "doc";
  content?: TiptapNode[];
};

type TiptapRendererProps = {
  content: TiptapDocument | string | null | undefined;
};

function isTiptapDocument(value: unknown): value is TiptapDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const valueAsObject = value as Record<string, unknown>;

  return valueAsObject.type === "doc";
}

function parseContent(
  content: TiptapDocument | string | null | undefined,
): TiptapDocument | null {
  if (content == null) {
    return null;
  }

  // Already a Tiptap document.
  if (typeof content === "object") {
    return isTiptapDocument(content) ? content : null;
  }

  const value = content.trim();

  if (!value) {
    return null;
  }

  /*
   * Try JSON only if the string actually looks like JSON.
   *
   * This prevents ordinary article text from unnecessarily
   * going through JSON.parse().
   */
  if (value.startsWith("{") || value.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(value);

      if (isTiptapDocument(parsed)) {
        return parsed;
      }
    } catch {
      // Not valid JSON.
    }
  }

  /*
   * The database currently contains plain text.
   *
   * Convert each paragraph separated by a blank line
   * into a simple paragraph node.
   */
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: "paragraph" as const,
      content: [
        {
          type: "text" as const,
          text: paragraph,
        },
      ],
    }));

  return {
    type: "doc",
    content: paragraphs,
  };
}

function renderMarks(text: ReactNode, marks: TiptapMark[] = []): ReactNode {
  return marks.reduce<ReactNode>((result, mark, index) => {
    switch (mark.type) {
      case "bold":
        return <strong key={index}>{result}</strong>;

      case "italic":
        return <em key={index}>{result}</em>;

      case "strike":
        return <s key={index}>{result}</s>;

      case "code":
        return (
          <code
            key={index}
            className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.9em] text-neutral-800"
          >
            {result}
          </code>
        );

      case "underline":
        return <u key={index}>{result}</u>;

      case "link": {
        const href =
          typeof mark.attrs?.href === "string" ? mark.attrs.href : undefined;

        if (!href) {
          return result;
        }

        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900"
          >
            {result}
          </a>
        );
      }

      default:
        return result;
    }
  }, text);
}

function renderInlineContent(nodes?: TiptapNode[]): ReactNode {
  if (!nodes?.length) {
    return null;
  }

  return nodes.map((node, index) => {
    if (node.type === "text") {
      return (
        <span key={index}>{renderMarks(node.text ?? "", node.marks)}</span>
      );
    }

    return <span key={index}>{renderNode(node, index)}</span>;
  });
}

function renderNode(node: TiptapNode, index: number): ReactNode {
  const children = node.content;

  switch (node.type) {
    case "paragraph":
      return <p key={index}>{renderInlineContent(children)}</p>;

    case "heading": {
      const level =
        typeof node.attrs?.level === "number" ? node.attrs.level : 2;

      if (level === 3) {
        return <h3 key={index}>{renderInlineContent(children)}</h3>;
      }

      if (level >= 4) {
        return <h4 key={index}>{renderInlineContent(children)}</h4>;
      }

      return <h2 key={index}>{renderInlineContent(children)}</h2>;
    }

    case "bulletList":
      return (
        <ul key={index}>
          {children?.map((item, itemIndex) => renderNode(item, itemIndex))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={index}>
          {children?.map((item, itemIndex) => renderNode(item, itemIndex))}
        </ol>
      );

    case "listItem":
      return (
        <li key={index}>
          {children?.map((child, childIndex) => renderNode(child, childIndex))}
        </li>
      );

    case "blockquote":
      return (
        <blockquote key={index}>
          {children?.map((child, childIndex) => renderNode(child, childIndex))}
        </blockquote>
      );

    case "codeBlock": {
      const language =
        typeof node.attrs?.language === "string"
          ? node.attrs.language
          : undefined;

      const code = children?.map((child) => child.text ?? "").join("") ?? "";

      return (
        <figure key={index} className="my-8">
          {language && (
            <figcaption className="rounded-t-xl border border-b-0 border-neutral-800 bg-neutral-900 px-4 py-2 font-mono text-xs text-neutral-400">
              {language}
            </figcaption>
          )}

          <pre
            className={[
              "overflow-x-auto border border-neutral-800 bg-neutral-950 p-5",
              language ? "rounded-b-xl" : "rounded-xl",
            ].join(" ")}
          >
            <code className="font-mono text-sm leading-7 text-neutral-200">
              {code}
            </code>
          </pre>
        </figure>
      );
    }

    case "hardBreak":
      return <br key={index} />;

    case "horizontalRule":
      return (
        <hr
          key={index}
          className="my-12 border-0 border-t border-neutral-200"
        />
      );

    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";

      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";

      if (!src) {
        return null;
      }

      return (
        <figure key={index} className="my-10">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="w-full rounded-2xl object-cover"
          />

          {alt && (
            <figcaption className="mt-3 text-center text-sm text-neutral-500">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    default:
      return (
        <div key={index}>
          {children?.map((child, childIndex) => renderNode(child, childIndex))}
        </div>
      );
  }
}

export function TiptapRenderer({ content }: TiptapRendererProps) {
  const document = parseContent(content);

  if (!document?.content?.length) {
    return (
      <p className="text-neutral-500">
        This article doesn&apose;t have any content yet.
      </p>
    );
  }

  return <>{document.content.map((node, index) => renderNode(node, index))}</>;
}
