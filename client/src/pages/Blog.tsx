import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { BlogPost } from "@shared/schema";
import { Calendar, User } from "lucide-react";

export default function Blog() {
  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Učitavam...</div>
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
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
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
