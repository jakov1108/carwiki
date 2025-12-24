import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Car, BlogPost, ContactMessage } from "@shared/schema";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { ObjectUploader } from "../components/ObjectUploader";

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"cars" | "blog" | "messages">("cars");
  const [showCarForm, setShowCarForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const queryClient = useQueryClient();

  const { data: cars } = useQuery<Car[]>({ queryKey: ["/api/cars"] });
  const { data: posts } = useQuery<BlogPost[]>({ queryKey: ["/api/blog"] });
  const { data: messages } = useQuery<ContactMessage[]>({ queryKey: ["/api/contact"] });

  const deleteCar = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cars"] }),
  });

  const deleteBlog = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/blog"] }),
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-400">Učitavanje...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Admin Panel
        </h1>

        <div className="flex space-x-2 mb-8">
          <button
            onClick={() => setActiveTab("cars")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "cars"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Automobili ({cars?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("blog")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "blog"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Blog ({posts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === "messages"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Poruke ({messages?.length || 0})
          </button>
        </div>

        {activeTab === "cars" && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => {
                  setEditingCar(null);
                  setShowCarForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Dodaj Automobil</span>
              </button>
            </div>

            {showCarForm && (
              <CarForm
                car={editingCar}
                onClose={() => {
                  setShowCarForm(false);
                  setEditingCar(null);
                }}
              />
            )}

            <div className="grid gap-4">
              {cars?.map((car) => (
                <div key={car.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-4">
                      <img src={car.image} alt={car.model} className="w-24 h-24 object-cover rounded" />
                      <div>
                        <h3 className="text-xl font-bold">{car.brand} {car.model}</h3>
                        <p className="text-slate-400">{car.year} - {car.category}</p>
                        <p className="text-sm text-slate-500 mt-2">{car.engine} - {car.power}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingCar(car);
                          setShowCarForm(true);
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => confirm("Jeste li sigurni?") && deleteCar.mutate(car.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "blog" && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => {
                  setEditingBlog(null);
                  setShowBlogForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Dodaj Blog Post</span>
              </button>
            </div>

            {showBlogForm && (
              <BlogForm
                post={editingBlog}
                onClose={() => {
                  setShowBlogForm(false);
                  setEditingBlog(null);
                }}
              />
            )}

            <div className="grid gap-4">
              {posts?.map((post) => (
                <div key={post.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-4">
                      <img src={post.image} alt={post.title} className="w-24 h-24 object-cover rounded" />
                      <div>
                        <h3 className="text-xl font-bold">{post.title}</h3>
                        <p className="text-slate-400">{post.category} - {post.author}</p>
                        <p className="text-sm text-slate-500 mt-2">{new Date(post.date).toLocaleDateString('hr-HR')}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingBlog(post);
                          setShowBlogForm(true);
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => confirm("Jeste li sigurni?") && deleteBlog.mutate(post.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="grid gap-4">
            {messages?.map((message) => (
              <div key={message.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="mb-2">
                  <h3 className="font-bold">{message.name}</h3>
                  <p className="text-sm text-slate-400">{message.email}</p>
                  <p className="text-xs text-slate-500">{new Date(message.date).toLocaleString('hr-HR')}</p>
                </div>
                <p className="text-slate-300 mt-4">{message.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CarForm({ car, onClose }: { car: Car | null; onClose: () => void }) {
  const [formData, setFormData] = useState({
    brand: car?.brand || "",
    model: car?.model || "",
    year: car?.year || new Date().getFullYear(),
    description: car?.description || "",
    image: car?.image || "",
    engine: car?.engine || "",
    power: car?.power || "",
    acceleration: car?.acceleration || "",
    consumption: car?.consumption || "",
    driveType: car?.driveType || "",
    category: car?.category || "Compact",
    videoUrl: car?.videoUrl || "",
    reliability: car?.reliability || 3,
  });
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const saveCar = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = car ? `/api/cars/${car.id}` : "/api/cars";
      const method = car ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Greška: ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{car ? "Uredi" : "Dodaj"} Automobil</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveCar.mutate(formData);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Marka</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Godina</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Kategorija</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              >
                <option>Compact</option>
                <option>Sedan</option>
                <option>SUV</option>
                <option>Sports</option>
                <option>Electric</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Opis</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Slika</label>
            <ObjectUploader
              currentImage={formData.image}
              onUploadComplete={(imagePath) => setFormData({ ...formData, image: imagePath })}
            />
            {formData.image && (
              <p className="text-xs text-slate-500 mt-1">
                Trenutna slika: {formData.image.startsWith("/uploads/") ? "Uploadana slika" : formData.image}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Motor</label>
              <input
                type="text"
                value={formData.engine}
                onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Snaga</label>
              <input
                type="text"
                value={formData.power}
                onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ubrzanje</label>
              <input
                type="text"
                value={formData.acceleration}
                onChange={(e) => setFormData({ ...formData, acceleration: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Potrošnja</label>
              <input
                type="text"
                value={formData.consumption}
                onChange={(e) => setFormData({ ...formData, consumption: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pogon</label>
              <input
                type="text"
                value={formData.driveType}
                onChange={(e) => setFormData({ ...formData, driveType: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pouzdanost (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.reliability}
                onChange={(e) => setFormData({ ...formData, reliability: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Video URL (opciono)</label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saveCar.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {saveCar.isPending ? "Spremam..." : "Spremi"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              Odustani
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BlogForm({ post, onClose }: { post: BlogPost | null; onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: post?.title || "",
    content: post?.content || "",
    author: post?.author || "",
    image: post?.image || "",
    category: post?.category || "Vijesti",
    excerpt: post?.excerpt || "",
    date: post?.date || new Date().toISOString(),
  });
  const queryClient = useQueryClient();

  const saveBlog = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = post ? `/api/blog/${post.id}` : "/api/blog";
      const method = post ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{post ? "Uredi" : "Dodaj"} Blog Post</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveBlog.mutate(formData);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Naslov</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Autor</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Kategorija</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sažetak</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              required
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sadržaj</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={10}
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL Slike</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saveBlog.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              {saveBlog.isPending ? "Spremam..." : "Spremi"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              Odustani
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
