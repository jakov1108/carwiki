import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { BlogPost } from "@shared/schema";
import { ArrowLeft, Calendar, User } from "lucide-react";

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const postSlug = params?.slug;

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog", postSlug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${postSlug}`);
      if (!res.ok) throw new Error("Failed to fetch blog post");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Učitavam...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-400">Članak nije pronađen</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/blog" className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span>Povratak na blog</span>
        </Link>

        <article className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-96 object-cover"
          />

          <div className="p-8">
            <div className="mb-6">
              <span className="bg-blue-600 px-3 py-1 rounded text-sm font-medium">
                {post.category}
              </span>
            </div>

            <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

            <div className="flex items-center space-x-6 text-slate-400 mb-8">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(post.date).toLocaleDateString('hr-HR')}</span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
