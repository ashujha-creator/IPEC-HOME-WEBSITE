"use client";
import React, { useEffect, useState } from "react";
import ImageCarousel from "../components/image";
import ContentSection from "../components/Content";

const ParentComponent = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const mockData: string[] = [
        "https://picsum.photos/id/1018/1200/800",
        "https://picsum.photos/id/1015/1200/800",
        "https://picsum.photos/id/1019/1200/800",
      ];
      setImageUrls(mockData);
    };

    fetchImages();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-start px-4 py-10">
      {/* Top Component: Carousel */}
      <ImageCarousel images={imageUrls} />

      {/* Bottom Component: Page Content */}
      <ContentSection />
    </div>
  );
};

export default ParentComponent;
