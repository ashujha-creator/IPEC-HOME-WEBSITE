// types/blog.ts

export interface BlogImage {
  id: string;
  url: string;
  file?: File; // Present during initial selection before upload
  caption?: string;
  altText?: string;
}

export interface CreateBlogFormValues {
  title: string;
  shortDescription: string;
  content: string; // Markdown or HTML string
  images: BlogImage[];
  status: "DRAFT" | "PUBLISHED";
}
export interface PageStatus {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}
