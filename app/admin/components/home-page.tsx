"use client";
import React, { useState, ChangeEvent } from "react";
import { useCallback, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  Mail,
  Phone,
  AlertCircle,
  Save,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "./image-carousel";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
// Types
export interface ContactInfo {
  email: string;
  phone: string;
  emergencyPhone: string;
  address: string;
}

// Mock Backend Contact Data
const INITIAL_CONTACT_INFO: ContactInfo = {
  email: "admin@institution.edu",
  phone: "+1 (555) 019-2834",
  emergencyPhone: "+1 (555) 911-0000",
  address: "123 Campus Drive, Building A, Suite 400",
};

// Initial Mock Images for the Carousel Output
const Mock_Images = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1171&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop",
];

const UpdateHome = () => {
  // Image Upload State
  const [images, setImages] = useState<string[]>(Mock_Images);

  // Contact Info State (Backend Output & Editable Inputs)
  const [contactData, setContactData] =
    useState<ContactInfo>(INITIAL_CONTACT_INFO);
  const [isSaved, setIsSaved] = useState(false);

  // Remove image and release its object URL
  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setImages((prev) => {
      const imageToRemove = prev[indexToRemove];

      if (imageToRemove?.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove);
      }

      return prev.filter((_, index) => index !== indexToRemove);
    });
  }, []);
  // Handle image uploads safely
  const handleImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    // Reset input so selecting the same file again triggers onChange
    e.target.value = "";

    if (!files.length) return;

    setImages((prev) => {
      const remainingSlots = MAX_IMAGES - prev.length;

      if (remainingSlots <= 0) {
        return prev;
      }

      const validFiles = files.slice(0, remainingSlots).filter((file) => {
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
          console.warn(`Unsupported image type: ${file.type}`);
          return false;
        }

        if (file.size > MAX_FILE_SIZE) {
          console.warn(
            `Image exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB: ${file.name}`,
          );
          return false;
        }

        return true;
      });

      const newImageUrls = validFiles.map((file) => URL.createObjectURL(file));

      return [...prev, ...newImageUrls];
    });
  }, []);

  // Handle contact input changes
  const handleContactChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      setContactData((prev) => ({
        ...prev,
        [name]: value,
      }));

      setIsSaved(false);
    },
    [],
  );
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSaveContact = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        // Basic client-side validation
        if (!contactData.email?.trim()) {
          throw new Error("Name is required.");
        }

        if (!contactData.phone?.trim()) {
          throw new Error("Email is required.");
        }

        // Replace with your real API call
        const response = await fetch("/api/contact", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactData),
        });

        if (!response.ok) {
          throw new Error("Failed to save contact information.");
        }

        setIsSaved(true);

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          setIsSaved(false);
        }, 3000);
      } catch (error) {
        console.error("Failed to save contact information:", error);

        // Ideally replace with your toast/error state
        setIsSaved(false);
      }
    },
    [contactData],
  );

  // Cleanup object URLs and timers when component unmounts
  useEffect(() => {
    return () => {
      setImages((prev) => {
        prev.forEach((url) => {
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        });

        return prev;
      });

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  return (
    <div className="">
      <div className="grid gap-6 md:grid-cols-2">
        {/* LEFT COLUMN: IMAGE MANAGEMENT (INPUT & CAROUSEL OUTPUT) */}
        <div className="space-y-6">
          {/* Input: Multi-Image Uploader */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Banner Images
              </CardTitle>
              <CardDescription>
                Select and upload multiple image files to display on the home
                carousel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 border-border transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-1 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP (Multiple allowed)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Output: Carousel Component Placeholder */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Image Gallery Output</CardTitle>
                <CardDescription>
                  Preview uploaded carousel slides.
                </CardDescription>
              </div>
              <Badge variant="secondary">{images.length} Images</Badge>
            </CardHeader>
            <CardContent>
              {/* Carousel Output renderer will go here */}
              <ImageCarousel
                images={images}
                onRemoveImage={handleRemoveImage}
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: CONTACT INFORMATION (INPUT & OUTPUT) */}
        <div className="space-y-6">
          {/* Output: Existing Contact Info Display */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Current Contact Information (Backend Output)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span> {contactData.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Primary Phone:</span>{" "}
                {contactData.phone}
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="font-medium">Emergency Line:</span>{" "}
                {contactData.emergencyPhone}
              </div>
            </CardContent>
          </Card>

          {/* Input: Form to Update Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Update Contact Details</CardTitle>
              <CardDescription>
                Modify emergency numbers, email, and location info.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveContact} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    name="email"
                    value={contactData.email}
                    onChange={handleContactChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Number</label>
                  <Input
                    type="text"
                    name="phone"
                    value={contactData.phone}
                    onChange={handleContactChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-destructive flex items-center gap-1">
                    Emergency Contact Number
                  </label>
                  <Input
                    type="text"
                    name="emergencyPhone"
                    value={contactData.emergencyPhone}
                    onChange={handleContactChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full gap-2">
                  {isSaved ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaved ? "Saved Successfully!" : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UpdateHome;
