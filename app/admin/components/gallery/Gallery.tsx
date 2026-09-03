"use client";

import { useEffect, useState } from "react";
import { getGalleryData } from "@/app/actions/gallery-fetch";
import { GalleryGrid, GalleryItemData } from "./gallery-grid";
import { Loader2 } from "lucide-react";

export default function Gallery() {
  const [items, setItems] = useState<GalleryItemData[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getGalleryData();
        setItems(data.items);
        setCurrentUserId(data.currentUserId);
      } catch (err) {
        console.error("Failed to load gallery items:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <GalleryGrid items={items} currentUserId={currentUserId ?? undefined} />
  );
}
