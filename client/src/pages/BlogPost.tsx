import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { BlogPost, Image } from "@shared/schema";
import { ArrowLeft, Calendar, User } from "lucide-react";
import ImageCarousel from "../components/ImageCarousel";
import { renderFormattedContent } from "../components/RichTextEditor";

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

  const { data: images } = useQuery<Image[]>({
    queryKey: ["/api/images/blog", post?.id],
    queryFn: async () => {
      const res = await fetch(`/api/images/blog/${post?.id}`);
      if (!res.ok) throw new Error("Failed to fetch images");
      return res.json();
    },
    enabled: !!post?.id,
  });

  // Combine main image with additional images, filtering out duplicates
  const additionalImages = images?.map(img => img.url).filter(url => url !== post?.image) || [];
  const allImages = post ? [post.image, ...additionalImages] : [];

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
          <ImageCarousel
            images={allImages}
            autoPlay={true}
            autoPlayInterval={6000}
            className="h-96"
            aspectRatio="wide"
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
              {renderFormattedContent(post.content)}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
