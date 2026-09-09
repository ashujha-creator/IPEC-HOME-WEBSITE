import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PostHeader } from "../components/PostHeader";
import { PostImageGallery } from "../components/PostImageGallery";
import { PostContent } from "../components/PostContent";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPost(slug: string) {
  return prisma.page.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },

    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      content: true,
      image: true,
      createdAt: true,
      updatedAt: true,

      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.shortDescription ?? undefined,

    openGraph: {
      title: post.title,
      description: post.shortDescription ?? undefined,

      images: post.image?.[0]
        ? [
            {
              url: post.image[0],
              alt: post.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.shortDescription ?? undefined,

      images: post.image?.[0] ? [post.image[0]] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const hasSingleImage =
    post.image && post.image.length === 1 && post.image[0] !== null;
  const hasNoContent =
    !post.content ||
    (typeof post.content === "object" &&
      Object.keys(post.content).length === 0);

  if (hasSingleImage && hasNoContent) {
    return (
      <div
        className="relative min-h-[500px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("${post.image[0]}")`,
        }}
      >
        {/* Render the image's data/content here */}
      </div>
    );
  }

  return (
    <main>
      <PostHeader
        title={post.title}
        shortDescription={post.shortDescription}
        createdAt={post.createdAt}
        author={post.author}
      />

      <PostImageGallery
        images={post.image ?? []}
        title={post.title}
        autoPlayInterval={5000}
      />

      <PostContent content={post.content} />
    </main>
  );
}
