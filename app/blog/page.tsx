import Link from "next/link";
import { blogPath, posts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/blog", "Guessing Game Guides and Worked Examples", "Explore practical guides to movie clues, book titles, everyday estimates and logic puzzles.");

export default function BlogIndex() {
  return (
    <>
      <h1 className="font-serif text-4xl">Guessing Game Blog</h1>
      <ul className="mt-7 divide-y divide-[#dce1e8]">
        {posts.map((post) => (
          <li className="py-5" key={post.slug}>
            <h2><Link className="text-xl font-semibold hover:underline" href={blogPath(post)}>{post.title}</Link></h2>
            <p className="mt-2 leading-relaxed text-[color:var(--muted)]">{post.summary}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
