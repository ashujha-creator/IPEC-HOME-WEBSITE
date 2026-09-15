import PostsComponnet from "@/components/data/Post_Rendering";
export default function AllPosts() {
  return (
    <section
      aria-label="Posts"
      className="w-full *:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 *:py-10"
    >
      <PostsComponnet />
    </section>
  );
}
