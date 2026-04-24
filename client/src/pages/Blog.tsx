import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { BlogPost } from "@shared/schema";
import { Calendar, User } from "lucide-react";
import ResponsiveImage from "../components/ResponsiveImage";
import { BlogCardSkeleton } from "../components/Skeleton";
import { usePageMeta } from "../lib/seo";

export default function Blog() {
  usePageMeta({
    title: "Auto Wiki Blog",
    description: "Čitajte članke o automobilima, tehnologiji, povijesti modela i trendovima u auto industriji.",
    type: "article",
  });

  const { data: posts, isLoading, isError } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold mb-2">Greška pri učitavanju bloga</p>
          <p className="text-slate-400 text-sm">Provjerite internetsku vezu i pokušajte ponovo.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white keep-white rounded-lg text-sm transition">Pokušaj ponovo</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Auto Wiki Blog
          </h1>
          <BlogCardSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Auto Wiki Blog
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {posts?.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug || post.id}`} className="block bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition">
              <ResponsiveImage
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
                targetWidth={960}
                responsiveWidths={[400, 640, 960, 1280]}
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={78}
                resize="cover"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="bg-blue-600 px-3 py-1 rounded text-sm font-medium keep-white">
                    {post.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-3 hover:text-blue-400 transition">
                  {post.title}
                </h2>
                <p className="text-slate-400 mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString('hr-HR')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts?.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Trenutno nema blog članaka.
          </div>
        )}
      </div>
    </div>
  );
}
