"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { deletePageAction } from "@/app/actions/page-actions";

interface DeletePageButtonProps {
  pageId: string;
  pageTitle: string;
  redirectTo?: string;
}

export function DeletePageButton({
  pageId,
  pageTitle,
  redirectTo,
}: DeletePageButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deletePageAction(pageId);

      if (!result.success) {
        setError(result.message || "Failed to delete page.");
        return;
      }

      setOpen(false);

      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            aria-label={`Delete ${pageTitle}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {pageTitle}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this page and its association with any
            uploaded images. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
