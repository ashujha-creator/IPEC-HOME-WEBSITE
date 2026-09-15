import BlogForm from "@/components/forms/BlogForms";
export default function CreateBlogPage() {
  return (
    <>
      <main className="min-h-screen align-middle flex  bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-xl">
          <div className="mb-8">
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
              <BlogForm />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
