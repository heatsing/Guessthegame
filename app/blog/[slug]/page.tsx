import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, blogPath } from "@/lib/blog";
import { findPlayGame } from "@/lib/play/games";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

function findPost(slug: string) {
  return posts.find((post) => post.slug === slug) ?? notFound();
}
export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const post = findPost((await params).slug);
  const metadata = pageMetadata(blogPath(post), post.title, post.summary);
  return { ...metadata, openGraph: { ...metadata.openGraph, type: "article" as const } };
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const post = findPost((await params).slug);
  const game = post.game && findPlayGame(post.game);
  return (
    <article>
      <Link className="text-sm underline" href="/blog">All guides</Link>
      <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">{post.title}</h1>
      <p className="mt-4 text-lg leading-relaxed">{post.summary}</p>
      <div className="static-copy">
        {post.sections.map(({ heading, paragraphs }) => (
          <section key={heading}><h2>{heading}</h2>{paragraphs.map((text) => <p key={text}>{text}</p>)}</section>
        ))}
        <section>
          <h2>Try it yourself</h2><p>{post.exercise.prompt}</p>
          <details className="my-4 rounded border border-[#dce1e8] p-4">
            <summary className="cursor-pointer font-semibold">Show the answer</summary>
            <p className="mt-3">{post.exercise.answer}</p>
          </details>
        </section>
        <p>{game ? <Link href={`/${game.slug}`} prefetch={false}>Play {game.name}</Link> : <Link href="/#games">Explore the games</Link>}</p>
      </div>
    </article>
  );
}
