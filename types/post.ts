export interface Post {
  idx: number;
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  authorId: string;
  createdAt: string;
  updatedAt: string;
  image: string[];
}
