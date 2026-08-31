"use client";

import React, { useState } from "react";
import { useForm, Controller, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { blogFormSchema, CreateBlogFormValues } from "@/lib/vaildation/blog";
import { updatePageAction } from "@/app/actions/page-actions";
import { uploadBlogImagesAction } from "@/app/actions/uploadBlogImagesAction";
import { BlogFormFields } from "@/components/editor/blog-form-fields";
import { ImageUploader } from "@/components/editor/image-uploader";

interface EditBlogFormProps {
  pageId: string;
  initialValues: CreateBlogFormValues;
}

export function EditBlogForm({ pageId, initialValues }: EditBlogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateBlogFormValues>({
    resolver: zodResolver(blogFormSchema) as Resolver<CreateBlogFormValues>,
    defaultValues: initialValues,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const onSubmit = async (
    data: CreateBlogFormValues,
    status: "DRAFT" | "PUBLISHED",
  ) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // 1. Split images: kept remote URLs vs. newly added local files.
      //    Anything the user removed in the uploader is simply absent from
      //    data.images already, so no separate "removed" tracking needed.
      const existingUrls = data.images
        .filter((img) => !img.file && img.url && !img.url.startsWith("blob:"))
        .map((img) => img.url);

      const filesToUpload = data.images
        .map((img) => img.file)
        .filter((file): file is File => Boolean(file));

      let uploadedUrls: string[] = [];

      if (filesToUpload.length > 0) {
        const formData = new FormData();
        filesToUpload.forEach((file) => formData.append("files", file));

        const uploadResult = await uploadBlogImagesAction(formData);

        if (!uploadResult.success || !uploadResult.data) {
          throw new Error(
            uploadResult.message || "Failed to upload one or more images.",
          );
        }

        uploadedUrls = uploadResult.data.map((img) => img.url);
      }

      const imageUrls = [...existingUrls, ...uploadedUrls];

      // 2. Build update payload — send the full form each time (simpler,
      //    and updatePageAction validates whatever's present regardless).
      const result = await updatePageAction(pageId, {
        title: data.title,
        shortDescription: data.shortDescription,
        slug: data.slug || undefined,
        content: data.content,
        status,
        images: imageUrls,
      });

      if (!result.success) {
        setServerError(result.message || "Failed to update post.");
        return;
      }

      router.push(`/admin/pages/all/${pageId}`);
      router.refresh();
    } catch (error: unknown) {
      setServerError(
        (error as Error).message || "An unexpected error occurred.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <Link
              href={`/admin/pages/all/${pageId}`}
              className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-2 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Post
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Update the content, images, or status of this post.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => onSubmit(data, "DRAFT"))}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save as Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => onSubmit(data, "PUBLISHED"))}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Publish
            </button>
          </div>
        </div>

        {/* Global Server Error Alert */}
        {serverError && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium">
            {serverError}
          </div>
        )}

        {/* Form Body */}
        <form className="space-y-8">
          <BlogFormFields form={form} />

          <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-6">
            <label className="block text-base font-semibold">
              Media Gallery{" "}
              <span className="text-slate-500 dark:text-slate-400 font-normal">
                (Optional if writing body content)
              </span>
            </label>
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <ImageUploader
                  value={field.value || []}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {errors.content &&
            !errors.content.message?.includes("characters") && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium">
                {errors.content.message}
              </div>
            )}
        </form>
      </div>
    </div>
  );
}
