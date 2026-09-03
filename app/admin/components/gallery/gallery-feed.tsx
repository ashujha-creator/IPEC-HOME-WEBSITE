import { GalleryCard, type GalleryCardProps } from "./GalleryCard";

interface GalleryFeedProps {
  items: GalleryCardProps["item"][];
}

export function GalleryFeed({ items }: GalleryFeedProps) {
  if (!items || items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No gallery items found yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <GalleryCard key={item.id} item={item} />
      ))}
    </div>
  );
}
