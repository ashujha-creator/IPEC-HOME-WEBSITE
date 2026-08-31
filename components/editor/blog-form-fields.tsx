"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { CreateBlogFormValues } from "@/lib/vaildation/blog";

interface BlogFormFieldsProps {
  form: UseFormReturn<CreateBlogFormValues>;
}

export function BlogFormFields({ form }: BlogFormFieldsProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-6">
      {/* Blog Title Field */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="block text-base font-semibold text-slate-900 dark:text-slate-100"
        >
          Post Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          placeholder="Enter a catchy blog title..."
          className="w-full px-4 py-3 text-lg font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300 transition"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-red-500 font-medium">
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Short Description Field */}
      <div className="space-y-2">
        <label
          htmlFor="shortDescription"
          className="block text-base font-semibold text-slate-900 dark:text-slate-100"
        >
          Short Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="shortDescription"
          rows={3}
          placeholder="Write a brief overview for preview cards and SEO..."
          className="w-full p-3 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300 transition resize-none"
          {...register("shortDescription")}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          A summary displayed on the blog feed (10-300 characters).
        </p>
        {errors.shortDescription && (
          <p className="text-sm text-red-500 font-medium">
            {errors.shortDescription.message}
          </p>
        )}
      </div>

      {/* Main Content Area */}
      <div className="space-y-2">
        <label
          htmlFor="content"
          className="block text-base font-semibold text-slate-900 dark:text-slate-100"
        >
          Body Content{" "}
          <span className="text-slate-500 dark:text-slate-400 font-normal">
            (Optional if uploading images)
          </span>
        </label>
        <textarea
          id="content"
          rows={10}
          placeholder="Tell your story... (Markdown formatting supported)"
          className="w-full p-4 text-sm font-mono leading-relaxed rounded-lg border border-slate-200 dark:border-slate-800 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300 transition"
          {...register("content")}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          You can post text with images, text only, or leave this empty and
          submit images only.
        </p>
        {errors.content && (
          <p className="text-sm text-red-500 font-medium">
            {errors.content.message}
          </p>
        )}
      </div>
    </div>
  );
}
