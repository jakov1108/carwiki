import { useState, useEffect, useRef } from "react";
import { useAuth } from "../lib/auth";
import { toYouTubeEmbedUrl } from "../lib/youtube";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { CarModel, CarGenerationWithModel, CarVariantWithDetails, BlogPost, ContactMessage } from "@shared/schema";
import { Plus, Edit, Trash2, X, Check, XCircle, Eye, Car, Layers, Settings, ChevronRight, ArrowLeft, FileText, Upload } from "lucide-react";
import { ObjectUploader } from "../components/ObjectUploader";
import MultiImageUploader from "../components/MultiImageUploader";
import RichTextEditor from "../components/RichTextEditor";
import ConfirmDialog from "../components/ConfirmDialog";
import ResponsiveImage from "../components/ResponsiveImage";
import { useToast } from "../components/Toast";
import { LIVE_QUERY_GC_TIME, LIVE_QUERY_STALE_TIME } from "../lib/queryClient";
import { formatVariantSpec } from "../lib/specUnits";
import type { AdminCarSubmission as CarSubmission, AdminImageItem as ImageItem, AdminTab as Tab } from "./admin/types";

type SubmissionImageData = {
  url: string;
  order?: number;
};

type SubmissionModelDraft = {
  brand: string;
  model: string;
  category: string;
  description: string;
  image: string;
  images?: SubmissionImageData[];
};

type SubmissionGenerationDraft = {
  name: string;
  yearStart: number;
  yearEnd: number | null;
  description: string;
  image: string;
  images?: SubmissionImageData[];
};

type SubmissionVariantDraft = Partial<Record<
  | "engineName"
  | "engineCode"
  | "displacement"
  | "fuelType"
  | "power"
  | "torque"
  | "acceleration"
  | "topSpeed"
  | "consumption"
  | "transmission"
  | "driveType"
  | "videoUrl"
  | "weight"
  | "length"
  | "width"
  | "height"
  | "wheelbase"
  | "trunkCapacity"
  | "fuelTankCapacity"
  | "detailedDescription"
  | "pros"
  | "cons",
  string
>> & {
  reliability?: number;
};

type SubmissionUpdatePayload = {
  mode: string;
  modelId: string | null;
  generationId: string | null;
  model: SubmissionModelDraft | null;
  generation: SubmissionGenerationDraft | null;
  variant: SubmissionVariantDraft;
};

const DEFAULT_REVIEW_IMAGE = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200";

function parseSubmissionJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function imageItemsFromDraft(image?: string | null, images?: SubmissionImageData[]) {
  const urls = [
    ...(Array.isArray(images) ? images.map((item) => item.url) : []),
    image,
  ].filter((url): url is string => typeof url === "string" && url.trim().length > 0);

  return Array.from(new Set(urls)).map((url) => ({ url }));
}

function imagePayloadFromItems(images: ImageItem[]) {
  return images
    .filter((image) => image.url.trim().length > 0)
    .map((image, index) => ({ url: image.url.trim(), order: index }));
}

function linesFromText(value?: string) {
  return (value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function yearRange(start?: number, end?: number | null) {
  if (!start) return "";
  return `${start}${end ? `-${end}` : "-danas"}`;
}

function getYouTubeReviewEmbedUrl(url?: string | null) {
  if (!url?.trim()) return "";

  const embedUrl = toYouTubeEmbedUrl(url.trim());

  try {
    const parsed = new URL(embedUrl);
    const host = parsed.hostname.replace("www.", "");

    if (host === "youtube.com" && parsed.pathname.startsWith("/embed/")) {
      return embedUrl;
    }
  } catch {
    return "";
  }

  return "";
}

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("cars");
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();
  const isAdminUser = user?.role === "admin";

  // Hierarchical navigation state
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [selectedGenerationId, setSelectedGenerationId] = useState<string | null>(null);

  // Modal states
  const [showModelForm, setShowModelForm] = useState(false);
  const [showGenerationForm, setShowGenerationForm] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] = useState<CarSubmission | null>(null);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    typeToConfirm?: string;
    variant?: "danger" | "warning";
    confirmLabel?: string;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const showConfirm = (opts: Omit<typeof confirmDialog, "open">) => {
    setConfirmDialog({ ...opts, open: true });
  };

  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; submissionId: string; notes: string }>(
    { open: false, submissionId: "", notes: "" }
  );
  
  const [editingModel, setEditingModel] = useState<CarModel | null>(null);
  const [editingGeneration, setEditingGeneration] = useState<CarGenerationWithModel | null>(null);
  const [editingVariant, setEditingVariant] = useState<CarVariantWithDetails | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  // Data queries
  const adminQueryOptions = { enabled: isAdminUser, staleTime: LIVE_QUERY_STALE_TIME, gcTime: LIVE_QUERY_GC_TIME };
  const { data: models } = useQuery<CarModel[]>({ queryKey: ["/api/models"], ...adminQueryOptions });
  const { data: generations } = useQuery<CarGenerationWithModel[]>({ queryKey: ["/api/generations"], ...adminQueryOptions });
  const { data: variants } = useQuery<CarVariantWithDetails[]>({ queryKey: ["/api/variants/admin/all"], ...adminQueryOptions });
  const { data: posts } = useQuery<BlogPost[]>({ queryKey: ["/api/blog"], ...adminQueryOptions });
  const { data: messages } = useQuery<ContactMessage[]>({ queryKey: ["/api/contact"], ...adminQueryOptions });
  const { data: submissions } = useQuery<CarSubmission[]>({ queryKey: ["/api/submissions"], ...adminQueryOptions });
  
  // Filter pending submissions
  const pendingSubmissions = submissions?.filter(s => s.status === "pending") || [];

  // Delete mutations
  const deleteModel = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/models/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/variants"] });
      toastSuccess("Model obrisan.");
    },
    onError: () => toastError("Greška pri brisanju modela."),
  });

  const deleteGeneration = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/generations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/variants"] });
      toastSuccess("Generacija obrisana.");
    },
    onError: () => toastError("Greška pri brisanju generacije."),
  });

  const deleteVariant = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/variants/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/variants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/variants/admin/all"] });
      toastSuccess("Varijanta obrisana.");
    },
    onError: () => toastError("Greška pri brisanju varijante."),
  });

  const deleteBlog = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toastSuccess("Blog post obrisan.");
    },
    onError: () => toastError("Greška pri brisanju blog posta."),
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      toastSuccess("Poruka obrisana.");
    },
    onError: () => toastError("Greška pri brisanju poruke."),
  });

  // Submission mutations
  const approveSubmission = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/submissions/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to approve");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/variants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/variants/admin/all"] });
      setReviewingSubmission(null);
      toastSuccess("✅ Prijedlog odobren i dodan u bazu.");
    },
    onError: () => toastError("Greška pri odobravanju prijedloga."),
  });

  const rejectSubmission = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const res = await fetch(`/api/submissions/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      setReviewingSubmission(null);
      toastSuccess("Prijedlog odbijen.");
    },
    onError: () => toastError("Greška pri odbijanju prijedloga."),
  });

  const updateSubmission = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SubmissionUpdatePayload }) => {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update");
      }
      return res.json() as Promise<CarSubmission>;
    },
    onSuccess: (submission) => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      setReviewingSubmission(submission);
      toastSuccess("Prijedlog ažuriran.");
    },
    onError: () => toastError("Greška pri spremanju prijedloga."),
  });

  const deleteSubmission = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      setReviewingSubmission(null);
      toastSuccess("Prijedlog obrisan.");
    },
    onError: () => toastError("Greška pri brisanju prijedloga."),
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

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => {
              setActiveTab("cars");
              setSelectedBrand(null);
              setSelectedModelId(null);
              setSelectedGenerationId(null);
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === "cars"
                ? "bg-blue-600 text-white keep-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Car className="w-4 h-4" />
            Automobili
          </button>
          <button
            onClick={() => setActiveTab("blog")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === "blog"
                ? "bg-blue-600 text-white keep-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Blog ({posts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded-lg font-semibold transition relative flex items-center gap-2 ${
              activeTab === "submissions"
                ? "bg-green-600 text-white keep-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Upload className="w-4 h-4" />
            Prijedlozi ({pendingSubmissions.length})
            {pendingSubmissions.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white keep-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingSubmissions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              activeTab === "messages"
                ? "bg-blue-600 text-white keep-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Poruke ({messages?.length || 0})
          </button>
        </div>

        {/* Submissions Tab */}
        {activeTab === "submissions" && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-green-400">Prijedlozi korisnika</h2>
            {pendingSubmissions.length === 0 ? (
              <div className="bg-slate-800 p-8 rounded-lg text-center border border-slate-700">
                <Upload className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p className="text-slate-400">Nema novih prijedloga za pregled.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingSubmissions.map((submission) => {
                  const modelData = parseSubmissionJson<SubmissionModelDraft | null>(submission.modelData, null);
                  const generationData = parseSubmissionJson<SubmissionGenerationDraft | null>(submission.generationData, null);
                  const variantData = parseSubmissionJson<SubmissionVariantDraft>(submission.variantData, {});
                  
                  // Get existing model/generation names if extending
                  const existingModel = submission.modelId ? models?.find(m => m.id === submission.modelId) : null;
                  const existingGeneration = submission.generationId ? generations?.find(g => g.id === submission.generationId) : null;
                  const modelTitle = submission.mode === "new" && modelData
                    ? `${modelData.brand} ${modelData.model}`
                    : existingModel
                      ? `${existingModel.brand} ${existingModel.model}`
                      : "Model nije pronađen";
                  const generationTitle = generationData?.name || existingGeneration?.name || "";
                  const reviewImage =
                    generationData?.image ||
                    generationData?.images?.[0]?.url ||
                    existingGeneration?.image ||
                    modelData?.image ||
                    modelData?.images?.[0]?.url ||
                    existingModel?.image ||
                    DEFAULT_REVIEW_IMAGE;
                  
                  return (
                    <div key={submission.id} className="bg-slate-800 p-5 rounded-lg border border-green-500/50 shadow-sm shadow-green-950/20">
                      <div className="flex flex-col xl:flex-row justify-between gap-5">
                        <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900 xl:w-64">
                          <ResponsiveImage
                            src={reviewImage}
                            targetWidth={520}
                            resize="cover"
                            alt={`${modelTitle} ${generationTitle}`}
                            className="h-44 w-full object-cover"
                          />
                          <div className="px-3 py-2 text-xs text-slate-400">
                            {generationData?.image || modelData?.image ? "Slika iz prijedloga" : "Postojeća ili zamjenska slika"}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              submission.mode === "new" 
                                ? "bg-blue-600 text-white keep-white" 
                                : "bg-purple-600 text-white keep-white"
                            }`}>
                              {submission.mode === "new" ? "Novi auto" : "Nadogradnja"}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(submission.createdAt).toLocaleDateString('hr-HR')}
                            </span>
                          </div>
                          
                          {/* Model info */}
                          <h3 className="text-xl font-bold text-white">
                            {modelTitle}
                          </h3>
                          
                          {/* Generation info */}
                          <p className="text-lg text-blue-400">
                            {generationTitle}
                            {generationData && ` (${yearRange(generationData.yearStart, generationData.yearEnd)})`}
                          </p>
                          
                          {/* Variant info */}
                          <div className="mt-3 p-3 bg-slate-900 rounded">
                            <p className="font-semibold text-cyan-400">{variantData.engineName}</p>
                            <p className="text-slate-300">{formatVariantSpec(variantData, "power")} • {variantData.fuelType} • {variantData.transmission}</p>
                            <p className="text-sm text-slate-400">
                              Pogon: {variantData.driveType} • Ubrzanje: {formatVariantSpec(variantData, "acceleration")} • Potrošnja: {formatVariantSpec(variantData, "consumption")}
                            </p>
                            {variantData.torque && (
                              <p className="text-sm text-slate-400">Okretni moment: {formatVariantSpec(variantData, "torque")}</p>
                            )}
                            {variantData.topSpeed && (
                              <p className="text-sm text-slate-400">Max brzina: {formatVariantSpec(variantData, "topSpeed")}</p>
                            )}
                            
                            {/* Dimenzije ako postoje */}
                            {(variantData.weight || variantData.length || variantData.width || variantData.height) && (
                              <div className="mt-2 pt-2 border-t border-slate-700">
                                <p className="text-xs text-slate-500 font-medium mb-1">Dimenzije:</p>
                                <p className="text-xs text-slate-400">
                                  {variantData.weight && `Masa: ${formatVariantSpec(variantData, "weight")}`}
                                  {variantData.length && ` • Dužina: ${formatVariantSpec(variantData, "length")}`}
                                  {variantData.width && ` • Širina: ${formatVariantSpec(variantData, "width")}`}
                                  {variantData.height && ` • Visina: ${formatVariantSpec(variantData, "height")}`}
                                </p>
                                {(variantData.wheelbase || variantData.trunkCapacity || variantData.fuelTankCapacity) && (
                                  <p className="text-xs text-slate-400">
                                    {variantData.wheelbase && `Međuosovinski razmak: ${formatVariantSpec(variantData, "wheelbase")}`}
                                    {variantData.trunkCapacity && ` • Prtljažnik: ${formatVariantSpec(variantData, "trunkCapacity")}`}
                                    {variantData.fuelTankCapacity && ` • Spremnik: ${formatVariantSpec(variantData, "fuelTankCapacity")}`}
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {/* Detaljni opis */}
                            {variantData.detailedDescription && (
                              <div className="mt-2 pt-2 border-t border-slate-700">
                                <p className="text-xs text-slate-500 font-medium mb-1">Detaljan opis:</p>
                                <p className="text-xs text-slate-400 line-clamp-3">{variantData.detailedDescription}</p>
                              </div>
                            )}
                            
                            {/* Prednosti i nedostaci */}
                            {(variantData.pros || variantData.cons) && (
                              <div className="mt-2 pt-2 border-t border-slate-700 grid grid-cols-2 gap-2">
                                {variantData.pros && (
                                  <div>
                                    <p className="text-xs text-green-400 font-medium mb-1">Prednosti:</p>
                                    <p className="text-xs text-slate-400 whitespace-pre-line line-clamp-3">{variantData.pros}</p>
                                  </div>
                                )}
                                {variantData.cons && (
                                  <div>
                                    <p className="text-xs text-red-400 font-medium mb-1">Nedostaci:</p>
                                    <p className="text-xs text-slate-400 whitespace-pre-line line-clamp-3">{variantData.cons}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <p className="text-xs text-blue-400 mt-3">
                            Poslao: {submission.submittedByName}
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-2 min-w-[150px]">
                          <button
                            onClick={() => setReviewingSubmission(submission)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white keep-white rounded flex items-center justify-center gap-2"
                          >
                            <Eye className="w-5 h-5" />
                            <span>Pregledaj / uredi</span>
                          </button>
                          <button
                            onClick={() => {
                              showConfirm({
                                title: "Odobriti prijedlog?",
                                description: "Odobravanjem ovog prijedloga kreirat će se novi model/generacija/varijanta u bazi podataka.",
                                onConfirm: () => approveSubmission.mutate(submission.id),
                                variant: "warning",
                                confirmLabel: "Odobri",
                              });
                            }}
                            disabled={approveSubmission.isPending}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white keep-white rounded flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <Check className="w-5 h-5" />
                            <span>Odobri</span>
                          </button>
                          <button
                            onClick={() => setRejectDialog({ open: true, submissionId: submission.id, notes: "" })}
                            disabled={rejectSubmission.isPending}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white keep-white rounded flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <XCircle className="w-5 h-5" />
                            <span>Odbij</span>
                          </button>
                          <button
                            onClick={() => showConfirm({
                              title: "Obrisati prijedlog?",
                              description: "Jeste li sigurni da želite obrisati ovaj prijedlog korisnika?",
                              onConfirm: () => deleteSubmission.mutate(submission.id),
                              variant: "danger",
                            })}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-5 h-5" />
                            <span>Obriši</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Cars Tab - Hierarchical Navigation */}
        {activeTab === "cars" && (
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6 text-sm">
              <button 
                onClick={() => { setSelectedBrand(null); setSelectedModelId(null); setSelectedGenerationId(null); }}
                className={`hover:text-blue-400 ${!selectedBrand ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
              >
                Marke
              </button>
              {selectedBrand && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <button 
                    onClick={() => { setSelectedModelId(null); setSelectedGenerationId(null); }}
                    className={`hover:text-blue-400 ${selectedBrand && !selectedModelId ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
                  >
                    {selectedBrand}
                  </button>
                </>
              )}
              {selectedModelId && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <button 
                    onClick={() => { setSelectedGenerationId(null); }}
                    className={`hover:text-blue-400 ${selectedModelId && !selectedGenerationId ? 'text-blue-400 font-bold' : 'text-slate-400'}`}
                  >
                    {models?.find(m => m.id === selectedModelId)?.model}
                  </button>
                </>
              )}
              {selectedGenerationId && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <span className="text-blue-400 font-bold">
                    {generations?.find(g => g.id === selectedGenerationId)?.name}
                  </span>
                </>
              )}
            </div>

            {/* Level 1: Brands */}
            {!selectedBrand && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Odaberi marku</h2>
                  <button
                    onClick={() => { setEditingModel(null); setShowModelForm(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white keep-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Dodaj novi model
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...new Set(models?.map(m => m.brand))].sort().map(brand => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className="bg-slate-800 hover:bg-slate-700 p-6 rounded-lg border border-slate-700 text-left transition"
                    >
                      <h3 className="text-xl font-bold">{brand}</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        {models?.filter(m => m.brand === brand).length} modela
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Level 2: Models for selected brand */}
            {selectedBrand && !selectedModelId && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedBrand(null)} className="p-2 hover:bg-slate-800 rounded">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold">{selectedBrand} - Modeli</h2>
                  </div>
                  <button
                    onClick={() => { setEditingModel(null); setShowModelForm(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white keep-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Dodaj model
                  </button>
                </div>
                <div className="grid gap-4">
                  {models?.filter(m => m.brand === selectedBrand).map(model => (
                    <div key={model.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                      <button
                        onClick={() => setSelectedModelId(model.id)}
                        className="flex items-center gap-4 flex-1 text-left hover:bg-slate-700 p-2 rounded transition"
                      >
                        <img src={model.image} alt={model.model} className="w-16 h-16 object-cover rounded" />
                        <div>
                          <h3 className="text-lg font-bold">{model.model}</h3>
                          <p className="text-slate-400 text-sm">{model.category}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 ml-auto" />
                      </button>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => { setEditingModel(model); setShowModelForm(true); }} className="p-2 bg-blue-600 hover:bg-blue-700 text-white keep-white rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => showConfirm({
                          title: "Obrisati model?",
                          description: `Brisanjem modela "${model.brand} ${model.model}" obrisat će se i SVE generacije i varijante koje mu pripadaju.\n\nOva radnja se NE MOŽE poništiti.`,
                          onConfirm: () => deleteModel.mutate(model.id),
                          typeToConfirm: "OBRIŠI",
                          variant: "danger",
                        })} className="p-2 bg-red-600 hover:bg-red-700 text-white keep-white rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Level 3: Generations for selected model */}
            {selectedModelId && !selectedGenerationId && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedModelId(null)} className="p-2 hover:bg-slate-800 rounded">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold">
                      {models?.find(m => m.id === selectedModelId)?.brand} {models?.find(m => m.id === selectedModelId)?.model} - Generacije
                    </h2>
                  </div>
                  <button
                    onClick={() => { setEditingGeneration(null); setShowGenerationForm(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white keep-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Dodaj generaciju
                  </button>
                </div>
                <div className="grid gap-4">
                  {generations?.filter(g => g.modelId === selectedModelId).map(gen => (
                    <div key={gen.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                      <button
                        onClick={() => setSelectedGenerationId(gen.id)}
                        className="flex items-center gap-4 flex-1 text-left hover:bg-slate-700 p-2 rounded transition"
                      >
                        <img src={gen.image} alt={gen.name} className="w-16 h-16 object-cover rounded" />
                        <div>
                          <h3 className="text-lg font-bold">{gen.name}</h3>
                          <p className="text-slate-400 text-sm">{gen.yearStart} - {gen.yearEnd || "danas"}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 ml-auto" />
                      </button>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => { setEditingGeneration(gen); setShowGenerationForm(true); }} className="p-2 bg-blue-600 hover:bg-blue-700 text-white keep-white rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => showConfirm({
                          title: "Obrisati generaciju?",
                          description: `Brisanjem generacije "${gen.name}" obrisat će se i SVE varijante motora koje joj pripadaju.\n\nOva radnja se NE MOŽE poništiti.`,
                          onConfirm: () => deleteGeneration.mutate(gen.id),
                          typeToConfirm: "OBRIŠI",
                          variant: "danger",
                        })} className="p-2 bg-red-600 hover:bg-red-700 text-white keep-white rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {generations?.filter(g => g.modelId === selectedModelId).length === 0 && (
                    <div className="bg-slate-800 p-8 rounded-lg text-center border border-slate-700">
                      <p className="text-slate-400">Nema generacija. Dodajte prvu generaciju.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Level 4: Variants for selected generation */}
            {selectedGenerationId && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedGenerationId(null)} className="p-2 hover:bg-slate-800 rounded">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold">
                      {generations?.find(g => g.id === selectedGenerationId)?.model?.brand}{" "}
                      {generations?.find(g => g.id === selectedGenerationId)?.model?.model}{" "}
                      {generations?.find(g => g.id === selectedGenerationId)?.name} - Motori
                    </h2>
                  </div>
                  <button
                    onClick={() => { setEditingVariant(null); setShowVariantForm(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white keep-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Dodaj motor
                  </button>
                </div>
                <div className="grid gap-4">
                  {variants?.filter(v => v.generationId === selectedGenerationId).map(variant => (
                    <div key={variant.id} className={`bg-slate-800 p-4 rounded-lg border ${
                      variant.status === "pending" ? "border-yellow-500/50" : 
                      variant.status === "rejected" ? "border-red-500/50" : "border-slate-700"
                    } flex justify-between items-center`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold">{variant.engineName}</h3>
                          {variant.status !== "approved" && (
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              variant.status === "pending" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                            }`}>
                              {variant.status === "pending" ? "Na čekanju" : "Odbijeno"}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">{formatVariantSpec(variant, "power")} • {variant.fuelType} • {variant.transmission}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingVariant(variant); setShowVariantForm(true); }} className="p-2 bg-blue-600 hover:bg-blue-700 text-white keep-white rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => showConfirm({
                          title: "Obrisati varijantu?",
                          description: `Jeste li sigurni da želite obrisati varijantu "${variant.engineName}"?\n\nOva radnja se ne može poništiti.`,
                          onConfirm: () => deleteVariant.mutate(variant.id),
                          variant: "danger",
                        })} className="p-2 bg-red-600 hover:bg-red-700 text-white keep-white rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {variants?.filter(v => v.generationId === selectedGenerationId).length === 0 && (
                    <div className="bg-slate-800 p-8 rounded-lg text-center border border-slate-700">
                      <p className="text-slate-400">Nema motora. Dodajte prvi motor.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blog Tab */}
        {activeTab === "blog" && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => {
                  setEditingBlog(null);
                  setShowBlogForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white keep-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Dodaj Blog Post</span>
              </button>
            </div>

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
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white keep-white rounded"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => showConfirm({
                          title: "Obrisati blog post?",
                          description: `Jeste li sigurni da želite obrisati blog post "${post.title}"?`,
                          onConfirm: () => deleteBlog.mutate(post.id),
                          variant: "danger",
                        })}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white keep-white rounded"
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

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="grid gap-4">
            {messages?.length === 0 ? (
              <div className="bg-slate-800 p-8 rounded-lg text-center border border-slate-700">
                <p className="text-slate-400">Nema poruka.</p>
              </div>
            ) : (
              messages?.map((message) => (
                <div key={message.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-start">
                    <div className="mb-2">
                      <h3 className="font-bold">{message.name}</h3>
                      <p className="text-sm text-slate-400">{message.email}</p>
                      <p className="text-xs text-slate-500">{new Date(message.date).toLocaleString('hr-HR')}</p>
                    </div>
                    <button
                      onClick={() => showConfirm({
                        title: "Obrisati poruku?",
                        description: `Obrisati poruku od ${message.name} (${message.email})?`,
                        onConfirm: () => deleteMessage.mutate(message.id),
                        variant: "danger",
                      })}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white keep-white rounded"
                      title="Obriši poruku"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-slate-300 mt-4">{message.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Forms */}
        {showModelForm && (
          <ModelForm
            model={editingModel}
            models={models}
            preselectedBrand={selectedBrand}
            onClose={() => {
              setShowModelForm(false);
              setEditingModel(null);
            }}
          />
        )}

        {showGenerationForm && (
          <GenerationForm
            generation={editingGeneration}
            models={models || []}
            preselectedModelId={selectedModelId}
            onClose={() => {
              setShowGenerationForm(false);
              setEditingGeneration(null);
            }}
          />
        )}

        {showVariantForm && (
          <VariantForm
            variant={editingVariant}
            models={models || []}
            generations={generations || []}
            preselectedGenerationId={selectedGenerationId}
            onClose={() => {
              setShowVariantForm(false);
              setEditingVariant(null);
            }}
          />
        )}

        {showBlogForm && (
          <BlogForm
            post={editingBlog}
            onClose={() => {
              setShowBlogForm(false);
              setEditingBlog(null);
            }}
          />
        )}

        {reviewingSubmission && (
          <SubmissionReviewModal
            submission={reviewingSubmission}
            models={models || []}
            generations={generations || []}
            onClose={() => setReviewingSubmission(null)}
            onSave={(data) => updateSubmission.mutateAsync({ id: reviewingSubmission.id, data })}
            onApprove={async () => {
              await approveSubmission.mutateAsync(reviewingSubmission.id);
            }}
            onReject={(notes) => rejectSubmission.mutateAsync({ id: reviewingSubmission.id, notes })}
            isSaving={updateSubmission.isPending}
            isApproving={approveSubmission.isPending}
            isRejecting={rejectSubmission.isPending}
          />
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          description={confirmDialog.description}
          typeToConfirm={confirmDialog.typeToConfirm}
          variant={confirmDialog.variant || "danger"}
          confirmLabel={confirmDialog.confirmLabel ?? "Obriši"}
          cancelLabel="Odustani"
        />

        {/* Reject Submission Dialog */}
        {rejectDialog.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setRejectDialog({ open: false, submissionId: "", notes: "" })}
            />
            <div className="relative bg-slate-800 rounded-xl border border-red-500/30 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
              <button
                onClick={() => setRejectDialog({ open: false, submissionId: "", notes: "" })}
                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 mb-5">
                <div className="p-2 rounded-full bg-red-900/20 shrink-0">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Odbij prijedlog</h3>
                  <p className="text-sm text-slate-400 mt-1">Navedi razlog odbijanja — korisnik će ga vidjeti uz status prijedloga.</p>
                </div>
              </div>

              <textarea
                autoFocus
                rows={4}
                value={rejectDialog.notes}
                onChange={(e) => setRejectDialog(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="npr. Nedostaju podaci o motoru, pogrešna kategorija, duplikat..."
                className="w-full bg-slate-900 border border-slate-600 hover:border-slate-500 focus:border-red-500 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none transition"
              />
              <p className="text-xs text-slate-500 mt-1.5 mb-5">Razlog je opcionalan, ali preporučen.</p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRejectDialog({ open: false, submissionId: "", notes: "" })}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition"
                >
                  Odustani
                </button>
                <button
                  onClick={() => {
                    rejectSubmission.mutate({ id: rejectDialog.submissionId, notes: rejectDialog.notes || undefined });
                    setRejectDialog({ open: false, submissionId: "", notes: "" });
                  }}
                  disabled={rejectSubmission.isPending}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white keep-white rounded-lg text-sm font-medium transition"
                >
                  {rejectSubmission.isPending ? "Učitavam..." : "Odbij prijedlog"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== FORMS ==========

function SubmissionReviewModal({
  submission,
  models,
  generations,
  onClose,
  onSave,
  onApprove,
  onReject,
  isSaving,
  isApproving,
  isRejecting,
}: {
  submission: CarSubmission;
  models: CarModel[];
  generations: CarGenerationWithModel[];
  onClose: () => void;
  onSave: (data: SubmissionUpdatePayload) => Promise<unknown>;
  onApprove: () => Promise<unknown>;
  onReject: (notes?: string) => Promise<unknown>;
  isSaving: boolean;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const submittedModel = parseSubmissionJson<SubmissionModelDraft | null>(submission.modelData, null);
  const submittedGeneration = parseSubmissionJson<SubmissionGenerationDraft | null>(submission.generationData, null);
  const submittedVariant = parseSubmissionJson<SubmissionVariantDraft>(submission.variantData, {});
  const existingModel = submission.modelId ? models.find((model) => model.id === submission.modelId) : null;
  const existingGeneration = submission.generationId
    ? generations.find((generation) => generation.id === submission.generationId)
    : null;

  const canEditModel = submission.mode === "new" && !!submittedModel;
  const canEditGeneration = !!submittedGeneration;
  const [modelDraft, setModelDraft] = useState<SubmissionModelDraft>(() => ({
    brand: submittedModel?.brand || existingModel?.brand || "",
    model: submittedModel?.model || existingModel?.model || "",
    category: submittedModel?.category || existingModel?.category || "SUV",
    description: submittedModel?.description || existingModel?.description || "",
    image: submittedModel?.image || existingModel?.image || "",
    images: submittedModel?.images || [],
  }));
  const [generationDraft, setGenerationDraft] = useState<SubmissionGenerationDraft>(() => ({
    name: submittedGeneration?.name || existingGeneration?.name || "",
    yearStart: submittedGeneration?.yearStart || existingGeneration?.yearStart || new Date().getFullYear(),
    yearEnd: submittedGeneration?.yearEnd ?? existingGeneration?.yearEnd ?? null,
    description: submittedGeneration?.description || existingGeneration?.description || "",
    image: submittedGeneration?.image || existingGeneration?.image || "",
    images: submittedGeneration?.images || [],
  }));
  const [variantDraft, setVariantDraft] = useState<SubmissionVariantDraft>(() => ({
    fuelType: "Benzin",
    driveType: "FWD",
    reliability: 3,
    ...submittedVariant,
  }));
  const [modelImages, setModelImages] = useState<ImageItem[]>(() =>
    imageItemsFromDraft(modelDraft.image, submittedModel?.images)
  );
  const [generationImages, setGenerationImages] = useState<ImageItem[]>(() =>
    imageItemsFromDraft(generationDraft.image, submittedGeneration?.images)
  );
  const [rejectNotes, setRejectNotes] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const [mobileActionsVisible, setMobileActionsVisible] = useState(true);

  const fieldClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";
  const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400";
  const editorPanelClass = "rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/30 dark:shadow-none";
  const previewPanelClass = "rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/60 dark:shadow-none";
  const specCardClass = "rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-transparent dark:shadow-none";
  const modelImage = modelImages[0]?.url || modelDraft.image || DEFAULT_REVIEW_IMAGE;
  const generationImage = generationImages[0]?.url || generationDraft.image || modelImage;
  const previewTitle = `${modelDraft.brand} ${modelDraft.model}`.trim() || "Novi automobil";
  const previewRange = yearRange(generationDraft.yearStart, generationDraft.yearEnd);
  const pros = linesFromText(variantDraft.pros);
  const cons = linesFromText(variantDraft.cons);
  const videoEmbedUrl = getYouTubeReviewEmbedUrl(variantDraft.videoUrl);

  const updateVariantField = (field: keyof SubmissionVariantDraft, value: string | number) => {
    setVariantDraft((prev) => ({ ...prev, [field]: value }));
  };

  const canSave = Boolean(
    variantDraft.engineName?.trim() &&
      variantDraft.power?.trim() &&
      variantDraft.acceleration?.trim() &&
      variantDraft.consumption?.trim() &&
      variantDraft.transmission?.trim() &&
      (!canEditModel || (modelDraft.brand.trim() && modelDraft.model.trim() && modelDraft.description.trim() && modelImages.length > 0)) &&
      (!canEditGeneration || (generationDraft.name.trim() && generationDraft.description.trim() && generationImages.length > 0))
  );

  const buildPayload = (): SubmissionUpdatePayload => {
    const nextModelImages = imagePayloadFromItems(modelImages);
    const nextGenerationImages = imagePayloadFromItems(generationImages);

    return {
      mode: submission.mode,
      modelId: submission.modelId,
      generationId: submission.generationId,
      model: canEditModel
        ? {
            ...modelDraft,
            image: nextModelImages[0]?.url || modelDraft.image,
            images: nextModelImages,
          }
        : null,
      generation: canEditGeneration
        ? {
            ...generationDraft,
            yearStart: Number(generationDraft.yearStart),
            yearEnd: generationDraft.yearEnd ? Number(generationDraft.yearEnd) : null,
            image: nextGenerationImages[0]?.url || generationDraft.image,
            images: nextGenerationImages,
          }
        : null,
      variant: {
        ...variantDraft,
        reliability: Number(variantDraft.reliability || 3),
        videoUrl: videoEmbedUrl || variantDraft.videoUrl || "",
      },
    };
  };

  const handleSave = async () => {
    setLocalError(null);
    try {
      await onSave(buildPayload());
    } catch (error: any) {
      setLocalError(error?.message || "Greška pri spremanju prijedloga.");
    }
  };

  const handleSaveAndApprove = async () => {
    setLocalError(null);
    try {
      await onSave(buildPayload());
      await onApprove();
      onClose();
    } catch (error: any) {
      setLocalError(error?.message || "Greška pri odobravanju prijedloga.");
    }
  };

  const handleReject = async () => {
    setLocalError(null);
    try {
      await onReject(rejectNotes.trim() || undefined);
      onClose();
    } catch (error: any) {
      setLocalError(error?.message || "Greška pri odbijanju prijedloga.");
    }
  };

  useEffect(() => {
    lastScrollTopRef.current = 0;
    setMobileActionsVisible(true);
  }, [submission.id]);

  const handleReviewScroll = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
      return;
    }

    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const nextScrollTop = scrollArea.scrollTop;
    const delta = nextScrollTop - lastScrollTopRef.current;
    if (Math.abs(delta) < 8) return;

    setMobileActionsVisible(delta > 0 || nextScrollTop < 24);
    lastScrollTopRef.current = nextScrollTop;
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 md:p-5">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/15 dark:text-green-300">
                {submission.mode === "new" ? "Novi auto" : "Nadogradnja"}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-500">
                Poslao {submission.submittedByName} • {new Date(submission.createdAt).toLocaleString("hr-HR")}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">Pregled prijedloga</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div
          ref={scrollAreaRef}
          onScroll={handleReviewScroll}
          className="grid flex-1 overflow-y-auto xl:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)]"
        >
          <div className="border-b border-slate-200 bg-slate-50 xl:border-b-0 xl:border-r dark:border-slate-800 dark:bg-slate-900">
            <div className="relative min-h-[380px] overflow-hidden">
              <ResponsiveImage
                src={generationImage}
                targetWidth={1100}
                resize="cover"
                alt={`${previewTitle} ${generationDraft.name}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/10" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-200">
                  Ovako bi kartica izgledala nakon odobrenja
                </p>
                <h3 className="text-4xl font-bold text-white keep-white">
                  {previewTitle} {generationDraft.name}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
                  {generationDraft.description || modelDraft.description || "Opis nije unesen."}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    ["Snaga", formatVariantSpec(variantDraft, "power") || "-"],
                    ["0-100", formatVariantSpec(variantDraft, "acceleration") || "-"],
                    ["Potrošnja", formatVariantSpec(variantDraft, "consumption") || "-"],
                    ["Pogon", variantDraft.driveType || "-"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2 backdrop-blur">
                      <p className="text-[11px] uppercase tracking-wide text-white/60">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-white keep-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className={previewPanelClass}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">Model</p>
                  <h4 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{previewTitle}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{modelDraft.description || "Opis modela nije unesen."}</p>
                </div>
                <div className={previewPanelClass}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">Generacija</p>
                  <h4 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                    {generationDraft.name || "-"} {previewRange && <span className="text-slate-500 dark:text-slate-400">({previewRange})</span>}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{generationDraft.description || "Opis generacije nije unesen."}</p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-lg font-bold text-slate-950 dark:text-white">{variantDraft.engineName || "Varijanta bez oznake motora"}</h4>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {[
                    ["Gorivo", variantDraft.fuelType],
                    ["Mjenjač", variantDraft.transmission],
                    ["Moment", formatVariantSpec(variantDraft, "torque")],
                    ["Max brzina", formatVariantSpec(variantDraft, "topSpeed")],
                    ["Masa", formatVariantSpec(variantDraft, "weight")],
                    ["Prtljažnik", formatVariantSpec(variantDraft, "trunkCapacity")],
                  ].map(([label, value]) => (
                    <div key={label} className={specCardClass}>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-500">{label}</p>
                      <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{value || "-"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {variantDraft.detailedDescription && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Detaljan opis</h4>
                  <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{variantDraft.detailedDescription}</p>
                </div>
              )}

              {(pros.length > 0 || cons.length > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-green-700 dark:text-green-300">Prednosti</h4>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      {pros.map((item) => <li key={item}>+ {item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-red-700 dark:text-red-300">Nedostaci</h4>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                      {cons.map((item) => <li key={item}>- {item}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {variantDraft.videoUrl && (
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/40 dark:shadow-none">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">Video pregled</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">YouTube embed iz korisničkog prijedloga</p>
                    </div>
                    {videoEmbedUrl && (
                      <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
                        YouTube
                      </span>
                    )}
                  </div>
                  {videoEmbedUrl ? (
                    <div className="aspect-video overflow-hidden rounded-lg border border-slate-200 bg-black dark:border-slate-800">
                      <iframe
                        src={videoEmbedUrl}
                        title={`Video pregled za ${previewTitle} ${generationDraft.name}`.trim()}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-950/30 dark:text-yellow-200">
                      Video link nije prepoznat kao YouTube URL. Podržani su watch, youtu.be, shorts i embed linkovi.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 bg-slate-100 p-5 dark:bg-slate-900">
            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">Uredi podatke prije odobrenja</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Promjene se spremaju u pending prijedlog, a odobravanje zatim koristi ažurirane podatke.
                </p>
              </div>

              <div className={editorPanelClass}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-slate-950 dark:text-white">Model</h4>
                  {!canEditModel && <span className="text-xs text-slate-500 dark:text-slate-500">Postojeći model, nije dio prijedloga</span>}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Marka</label>
                    <input
                      value={modelDraft.brand}
                      onChange={(e) => setModelDraft({ ...modelDraft, brand: e.target.value })}
                      disabled={!canEditModel}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Model</label>
                    <input
                      value={modelDraft.model}
                      onChange={(e) => setModelDraft({ ...modelDraft, model: e.target.value })}
                      disabled={!canEditModel}
                      className={fieldClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Kategorija</label>
                    <select
                      value={modelDraft.category}
                      onChange={(e) => setModelDraft({ ...modelDraft, category: e.target.value })}
                      disabled={!canEditModel}
                      className={fieldClass}
                    >
                      <option>Compact</option>
                      <option>Sedan</option>
                      <option>SUV</option>
                      <option>Sports</option>
                      <option>Electric</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Opis modela</label>
                    <textarea
                      value={modelDraft.description}
                      onChange={(e) => setModelDraft({ ...modelDraft, description: e.target.value })}
                      disabled={!canEditModel}
                      rows={3}
                      className={fieldClass}
                    />
                  </div>
                </div>
                {canEditModel && (
                  <div className="mt-4">
                    <MultiImageUploader images={modelImages} onChange={setModelImages} maxImages={6} />
                  </div>
                )}
              </div>

              <div className={editorPanelClass}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-slate-950 dark:text-white">Generacija</h4>
                  {!canEditGeneration && <span className="text-xs text-slate-500 dark:text-slate-500">Postojeća generacija, nije dio prijedloga</span>}
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className={labelClass}>Naziv</label>
                    <input
                      value={generationDraft.name}
                      onChange={(e) => setGenerationDraft({ ...generationDraft, name: e.target.value })}
                      disabled={!canEditGeneration}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Od</label>
                    <input
                      type="number"
                      value={generationDraft.yearStart}
                      onChange={(e) => setGenerationDraft({ ...generationDraft, yearStart: parseInt(e.target.value) || new Date().getFullYear() })}
                      disabled={!canEditGeneration}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Do</label>
                    <input
                      type="number"
                      value={generationDraft.yearEnd ?? ""}
                      onChange={(e) => setGenerationDraft({ ...generationDraft, yearEnd: e.target.value ? parseInt(e.target.value) : null })}
                      disabled={!canEditGeneration}
                      placeholder="danas"
                      className={fieldClass}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelClass}>Opis generacije</label>
                    <textarea
                      value={generationDraft.description}
                      onChange={(e) => setGenerationDraft({ ...generationDraft, description: e.target.value })}
                      disabled={!canEditGeneration}
                      rows={3}
                      className={fieldClass}
                    />
                  </div>
                </div>
                {canEditGeneration && (
                  <div className="mt-4">
                    <MultiImageUploader images={generationImages} onChange={setGenerationImages} maxImages={8} />
                  </div>
                )}
              </div>

              <div className={editorPanelClass}>
                <h4 className="mb-4 font-semibold text-slate-950 dark:text-white">Varijanta</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ["Oznaka motora", "engineName", "npr. B5 AWD Mild Hybrid"],
                    ["Kod motora", "engineCode", "npr. B420T2"],
                    ["Zapremnina", "displacement", "npr. 1969 ccm"],
                    ["Snaga", "power", "npr. 250 KS"],
                    ["Moment", "torque", "npr. 350 Nm"],
                    ["Ubrzanje", "acceleration", "npr. 7.7 s"],
                    ["Max brzina", "topSpeed", "npr. 180 km/h"],
                    ["Potrošnja", "consumption", "npr. 8.4 L/100km"],
                    ["Mjenjač", "transmission", "npr. 8-stupanjski automatski"],
                    ["Masa", "weight", "npr. 2080 kg"],
                    ["Dužina", "length", "npr. 4953 mm"],
                    ["Širina", "width", "npr. 1923 mm"],
                    ["Visina", "height", "npr. 1776 mm"],
                    ["Međuosovinski razmak", "wheelbase", "npr. 2984 mm"],
                    ["Prtljažnik", "trunkCapacity", "npr. 709 L"],
                    ["Spremnik goriva", "fuelTankCapacity", "npr. 71 L"],
                  ].map(([label, field, placeholder]) => (
                    <div key={field}>
                      <label className={labelClass}>{label}</label>
                      <input
                        value={(variantDraft[field as keyof SubmissionVariantDraft] as string) || ""}
                        onChange={(e) => updateVariantField(field as keyof SubmissionVariantDraft, e.target.value)}
                        placeholder={placeholder}
                        className={fieldClass}
                      />
                    </div>
                  ))}

                  <div>
                    <label className={labelClass}>Gorivo</label>
                    <select
                      value={variantDraft.fuelType || "Benzin"}
                      onChange={(e) => updateVariantField("fuelType", e.target.value)}
                      className={fieldClass}
                    >
                      <option value="Benzin">Benzin</option>
                      <option value="Dizel">Dizel</option>
                      <option value="Hibrid">Hibrid</option>
                      <option value="Električni">Električni</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Pogon</label>
                    <select
                      value={variantDraft.driveType || "FWD"}
                      onChange={(e) => updateVariantField("driveType", e.target.value)}
                      className={fieldClass}
                    >
                      <option>FWD</option>
                      <option>RWD</option>
                      <option>AWD</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Pouzdanost</label>
                    <select
                      value={variantDraft.reliability || 3}
                      onChange={(e) => updateVariantField("reliability", parseInt(e.target.value))}
                      className={fieldClass}
                    >
                      <option value={1}>1 - Loše</option>
                      <option value={2}>2 - Ispod prosjeka</option>
                      <option value={3}>3 - Prosječno</option>
                      <option value={4}>4 - Dobro</option>
                      <option value={5}>5 - Odlično</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Video URL</label>
                    <input
                      value={variantDraft.videoUrl || ""}
                      onChange={(e) => updateVariantField("videoUrl", e.target.value)}
                      onBlur={(e) => updateVariantField("videoUrl", toYouTubeEmbedUrl(e.target.value))}
                      placeholder="https://youtube.com/watch?v=..."
                      className={fieldClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Detaljan opis</label>
                    <textarea
                      value={variantDraft.detailedDescription || ""}
                      onChange={(e) => updateVariantField("detailedDescription", e.target.value)}
                      rows={4}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Prednosti</label>
                    <textarea
                      value={variantDraft.pros || ""}
                      onChange={(e) => updateVariantField("pros", e.target.value)}
                      rows={4}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nedostaci</label>
                    <textarea
                      value={variantDraft.cons || ""}
                      onChange={(e) => updateVariantField("cons", e.target.value)}
                      rows={4}
                      className={fieldClass}
                    />
                  </div>
                </div>
              </div>
            </section>

            {localError && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200">
                {localError}
              </div>
            )}

            {!canSave && (
              <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-950/30 dark:text-yellow-200">
                Za spremanje su potrebni: slike/opisi za nove dijelove te oznaka motora, snaga, ubrzanje, potrošnja i mjenjač.
              </div>
            )}

            <div
              className={`sticky bottom-0 -mx-5 -mb-5 border-t border-slate-200 bg-white/95 px-5 py-4 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] backdrop-blur transition-[transform,opacity] duration-200 ease-out dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-[0_-12px_30px_rgba(0,0,0,0.35)] md:translate-y-0 md:opacity-100 ${
                mobileActionsVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[calc(100%+1rem)] opacity-0"
              }`}
            >
              <div className="mb-3">
                <label className={labelClass}>Razlog odbijanja</label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  rows={2}
                  placeholder="Opcionalna napomena korisniku ako prijedlog odbijaš..."
                  className={fieldClass}
                />
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave || isSaving}
                  className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white keep-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {isSaving ? "Spremam..." : "Spremi promjene"}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndApprove}
                  disabled={!canSave || isSaving || isApproving}
                  className="rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white keep-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {isApproving ? "Odobravam..." : "Spremi i odobri"}
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isRejecting}
                  className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white keep-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {isRejecting ? "Odbijam..." : "Odbij prijedlog"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelForm({ model, models, preselectedBrand, onClose }: { model: CarModel | null; models?: CarModel[]; preselectedBrand?: string | null; onClose: () => void }) {
  // Get unique brands from existing models
  const existingBrands = models 
    ? [...new Set(models.map(m => m.brand))].sort()
    : [];
  
  // If we have a preselected brand, don't show "new brand" mode
  const [useNewBrand, setUseNewBrand] = useState(!model && !preselectedBrand && existingBrands.length === 0);
  const [formData, setFormData] = useState({
    brand: model?.brand || preselectedBrand || "",
    model: model?.model || "",
    category: model?.category || "Compact",
    image: model?.image || "",
    description: model?.description || "",
  });
  
  // Multi-image state
  const [images, setImages] = useState<ImageItem[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Load existing images when editing
  useEffect(() => {
    if (model?.id && !imagesLoaded) {
      fetch(`/api/images/model/${model.id}`)
        .then(res => res.json())
        .then((data: { id: string; url: string }[]) => {
          if (data.length > 0) {
            setImages(data.map(img => ({ id: img.id, url: img.url })));
          } else if (model.image) {
            // No images in new table yet — fall back to legacy single image
            setImages([{ url: model.image }]);
          }
          setImagesLoaded(true);
        })
        .catch(() => {
          if (model.image) {
            setImages([{ url: model.image }]);
          }
          setImagesLoaded(true);
        });
    } else if (!model && !imagesLoaded) {
      setImagesLoaded(true);
    }
  }, [model, imagesLoaded]);

  const saveModel = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Use first image as main image for backward compatibility
      const dataWithImage = { ...data, image: images[0]?.url || "" };
      
      const url = model ? `/api/models/${model.id}` : "/api/models";
      const method = model ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataWithImage),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Greška: ${res.status}`);
      }
      const savedModel = await res.json();
      
      // Save images to the images table
      if (images.length > 0) {
        await fetch("/api/images/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType: "model",
            entityId: savedModel.id,
            images: images.map((img, index) => ({ url: img.url, order: index }))
          }),
          credentials: "include",
        });
      }
      
      return savedModel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
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
          <h2 className="text-2xl font-bold">{model ? "Uredi" : "Dodaj"} Model</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); saveModel.mutate(formData); }} className="space-y-4">
          {/* Brand/Model toggle - outside grid for proper alignment */}
          {!model && existingBrands.length > 0 && (
            <div className="flex gap-2">
              <span className="text-sm text-slate-400 mr-2">Marka:</span>
              <button
                type="button"
                onClick={() => { setUseNewBrand(false); setFormData({ ...formData, brand: "" }); }}
                className={`px-3 py-1 rounded text-sm ${!useNewBrand ? 'bg-blue-600 text-white keep-white' : 'bg-slate-700 text-slate-300'}`}
              >
                Postojeća
              </button>
              <button
                type="button"
                onClick={() => { setUseNewBrand(true); setFormData({ ...formData, brand: "" }); }}
                className={`px-3 py-1 rounded text-sm ${useNewBrand ? 'bg-blue-600 text-white keep-white' : 'bg-slate-700 text-slate-300'}`}
              >
                Nova marka
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Marka *</label>
              {useNewBrand || existingBrands.length === 0 ? (
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                  placeholder="npr. Volkswagen, BMW"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                />
              ) : (
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                >
                  <option value="">Odaberi marku...</option>
                  {existingBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Model *</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
                placeholder="npr. Golf, 3 Series"
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kategorija *</label>
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

          <div>
            <label className="block text-sm font-medium mb-2">Opis *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              placeholder="Kratki opis modela..."
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
            />
          </div>

          <MultiImageUploader
            images={images}
            onChange={setImages}
            maxImages={10}
          />

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saveModel.isPending || images.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white keep-white px-6 py-3 rounded-lg font-semibold"
            >
              {saveModel.isPending ? "Spremam..." : "Spremi"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg">
              Odustani
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GenerationForm({ 
  generation, 
  models, 
  preselectedModelId,
  onClose 
}: { 
  generation: CarGenerationWithModel | null; 
  models: CarModel[];
  preselectedModelId?: string | null;
  onClose: () => void;
}) {
  // Get preselected model's brand for editing
  const preselectedModel = preselectedModelId 
    ? models.find(m => m.id === preselectedModelId) 
    : generation?.model 
      ? models.find(m => m.id === generation.modelId)
      : null;

  // Hierarchical selection state
  const [selectedBrand, setSelectedBrand] = useState<string>(preselectedModel?.brand || "");
  
  const [formData, setFormData] = useState({
    modelId: generation?.modelId || preselectedModelId || "",
    name: generation?.name || "",
    yearStart: generation?.yearStart || new Date().getFullYear(),
    yearEnd: generation?.yearEnd || null as number | null,
    image: generation?.image || "",
    description: generation?.description || "",
  });
  
  // Multi-image state
  const [images, setImages] = useState<ImageItem[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Load existing images when editing
  useEffect(() => {
    if (generation?.id && !imagesLoaded) {
      fetch(`/api/images/generation/${generation.id}`)
        .then(res => res.json())
        .then((data: { id: string; url: string }[]) => {
          if (data.length > 0) {
            setImages(data.map(img => ({ id: img.id, url: img.url })));
          } else if (generation.image) {
            // No images in new table yet — fall back to legacy single image
            setImages([{ url: generation.image }]);
          }
          setImagesLoaded(true);
        })
        .catch(() => {
          if (generation.image) {
            setImages([{ url: generation.image }]);
          }
          setImagesLoaded(true);
        });
    } else if (!generation && !imagesLoaded) {
      setImagesLoaded(true);
    }
  }, [generation, imagesLoaded]);

  // Get unique brands
  const brands = [...new Set(models.map(m => m.brand))].sort();
  
  // Get models for selected brand
  const brandModels = selectedBrand 
    ? models.filter(m => m.brand === selectedBrand).sort((a, b) => a.model.localeCompare(b.model))
    : [];

  const saveGeneration = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Use first image as main image for backward compatibility
      const dataWithImage = { ...data, image: images[0]?.url || "" };
      
      const url = generation ? `/api/generations/${generation.id}` : "/api/generations";
      const method = generation ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataWithImage),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Greška: ${res.status}`);
      }
      const savedGeneration = await res.json();
      
      // Save images to the images table
      if (images.length > 0) {
        await fetch("/api/images/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType: "generation",
            entityId: savedGeneration.id,
            images: images.map((img, index) => ({ url: img.url, order: index }))
          }),
          credentials: "include",
        });
      }
      
      return savedGeneration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
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
          <h2 className="text-2xl font-bold">{generation ? "Uredi" : "Dodaj"} Generaciju</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); saveGeneration.mutate(formData); }} className="space-y-4">
          {/* Hierarchical selection: Brand -> Model */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Marka *</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setFormData({ ...formData, modelId: "" });
                }}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              >
                <option value="">Odaberi marku...</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Model *</label>
              <select
                value={formData.modelId}
                onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                required
                disabled={!selectedBrand}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 disabled:opacity-50"
              >
                <option value="">Odaberi model...</option>
                {brandModels.map((m) => (
                  <option key={m.id} value={m.id}>{m.model}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Naziv generacije *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="npr. MK7, E90, B8"
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Godina početka *</label>
              <input
                type="number"
                value={formData.yearStart}
                onChange={(e) => setFormData({ ...formData, yearStart: parseInt(e.target.value) })}
                required
                min="1900"
                max={new Date().getFullYear() + 2}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Godina kraja (prazno ako se proizvodi)</label>
              <input
                type="number"
                value={formData.yearEnd || ""}
                onChange={(e) => setFormData({ ...formData, yearEnd: e.target.value ? parseInt(e.target.value) : null })}
                min="1900"
                max={new Date().getFullYear() + 2}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Opis *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              placeholder="Opis ove generacije..."
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
            />
          </div>

          <MultiImageUploader
            images={images}
            onChange={setImages}
            maxImages={10}
          />

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saveGeneration.isPending || images.length === 0 || !formData.modelId}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white keep-white px-6 py-3 rounded-lg font-semibold"
            >
              {saveGeneration.isPending ? "Spremam..." : "Spremi"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg">
              Odustani
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VariantForm({ 
  variant, 
  models,
  generations, 
  preselectedGenerationId,
  onClose 
}: { 
  variant: CarVariantWithDetails | null; 
  models: CarModel[];
  generations: CarGenerationWithModel[];
  preselectedGenerationId?: string | null;
  onClose: () => void;
}) {
  // Get preselected generation's model and brand for editing
  const preselectedGeneration = preselectedGenerationId 
    ? generations.find(g => g.id === preselectedGenerationId) 
    : variant?.generation 
      ? generations.find(g => g.id === variant.generationId)
      : null;
  const preselectedModel = preselectedGeneration?.model;
  
  // Hierarchical selection state
  const [selectedBrand, setSelectedBrand] = useState<string>(preselectedModel?.brand || "");
  const [selectedModelId, setSelectedModelId] = useState<string>(preselectedModel?.id || "");
  
  const [formData, setFormData] = useState({
    generationId: variant?.generationId || preselectedGenerationId || "",
    engineName: variant?.engineName || "",
    engineCode: variant?.engineCode || "",
    displacement: variant?.displacement || "",
    fuelType: variant?.fuelType || "Benzin",
    power: variant?.power || "",
    torque: variant?.torque || "",
    acceleration: variant?.acceleration || "",
    topSpeed: variant?.topSpeed || "",
    consumption: variant?.consumption || "",
    transmission: variant?.transmission || "",
    driveType: variant?.driveType || "FWD",
    videoUrl: variant?.videoUrl || "",
    reliability: variant?.reliability || 3,
    // Novi atributi
    weight: variant?.weight || "",
    length: variant?.length || "",
    width: variant?.width || "",
    height: variant?.height || "",
    wheelbase: variant?.wheelbase || "",
    trunkCapacity: variant?.trunkCapacity || "",
    fuelTankCapacity: variant?.fuelTankCapacity || "",
    detailedDescription: variant?.detailedDescription || "",
    pros: variant?.pros || "",
    cons: variant?.cons || "",
  });
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get unique brands
  const brands = [...new Set(models.map(m => m.brand))].sort();
  
  // Get models for selected brand
  const brandModels = selectedBrand 
    ? models.filter(m => m.brand === selectedBrand).sort((a, b) => a.model.localeCompare(b.model))
    : [];
  
  // Get generations for selected model
  const modelGenerations = selectedModelId
    ? generations.filter(g => g.modelId === selectedModelId).sort((a, b) => b.yearStart - a.yearStart)
    : [];

  const saveVariant = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = variant ? `/api/variants/${variant.id}` : "/api/variants";
      const method = variant ? "PUT" : "POST";
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
      queryClient.invalidateQueries({ queryKey: ["/api/variants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/variants/admin/all"] });
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
          <h2 className="text-2xl font-bold">{variant ? "Uredi" : "Dodaj"} Varijantu</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); saveVariant.mutate(formData); }} className="space-y-4">
          {/* Hierarchical selection: Brand -> Model -> Generation */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Marka *</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModelId("");
                  setFormData({ ...formData, generationId: "" });
                }}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              >
                <option value="">Odaberi...</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Model *</label>
              <select
                value={selectedModelId}
                onChange={(e) => {
                  setSelectedModelId(e.target.value);
                  setFormData({ ...formData, generationId: "" });
                }}
                required
                disabled={!selectedBrand}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 disabled:opacity-50"
              >
                <option value="">Odaberi...</option>
                {brandModels.map((m) => (
                  <option key={m.id} value={m.id}>{m.model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Generacija *</label>
              <select
                value={formData.generationId}
                onChange={(e) => setFormData({ ...formData, generationId: e.target.value })}
                required
                disabled={!selectedModelId}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 disabled:opacity-50"
              >
                <option value="">Odaberi...</option>
                {modelGenerations.map((g) => (
                  <option key={g.id} value={g.id}>{g.name} ({g.yearStart}-{g.yearEnd || "danas"})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Oznaka motora *</label>
              <input
                type="text"
                value={formData.engineName}
                onChange={(e) => setFormData({ ...formData, engineName: e.target.value })}
                required
                placeholder="npr. 2.0 TDI, 1.4 TSI"
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Kod motora</label>
              <input
                type="text"
                value={formData.engineCode}
                onChange={(e) => setFormData({ ...formData, engineCode: e.target.value })}
                placeholder="npr. CRLB, CZEA"
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Zapremnina</label>
              <input
                type="text"
                value={formData.displacement}
                onChange={(e) => setFormData({ ...formData, displacement: e.target.value })}
                placeholder="npr. 1968 ccm"
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Vrsta goriva *</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              >
                <option value="Benzin">Benzin</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hibrid</option>
                <option value="Electric">Električni</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Snaga *</label>
              <input
                type="text"
                value={formData.power}
                onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                required
                placeholder="npr. 150 KS"
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Moment</label>
              <input
                type="text"
                value={formData.torque}
                onChange={(e) => setFormData({ ...formData, torque: e.target.value })}
                placeholder="npr. 340 Nm"
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ubrzanje (0-100) *</label>
              <input
                type="text"
                value={formData.acceleration}
                onChange={(e) => setFormData({ ...formData, acceleration: e.target.value })}
                required
                placeholder="npr. 8.6s"
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max brzina</label>
              <input
                type="text"
                value={formData.topSpeed}
                onChange={(e) => setFormData({ ...formData, topSpeed: e.target.value })}
                placeholder="npr. 216 km/h"
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Potrošnja *</label>
              <input
                type="text"
                value={formData.consumption}
                onChange={(e) => setFormData({ ...formData, consumption: e.target.value })}
                required
                placeholder="npr. 4.5L/100km"
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mjenjač *</label>
              <input
                type="text"
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                required
                placeholder="npr. 6-brzinski ručni, 7-DSG"
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pogon *</label>
              <select
                value={formData.driveType}
                onChange={(e) => setFormData({ ...formData, driveType: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              >
                <option>FWD</option>
                <option>RWD</option>
                <option>AWD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pouzdanost (1-5)</label>
              <select
                value={formData.reliability}
                onChange={(e) => setFormData({ ...formData, reliability: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              >
                <option value={1}>1 - Loše</option>
                <option value={2}>2 - Ispod prosjeka</option>
                <option value={3}>3 - Prosječno</option>
                <option value={4}>4 - Dobro</option>
                <option value={5}>5 - Odlično</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Video URL (opciono)</label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              onBlur={(e) => setFormData({ ...formData, videoUrl: toYouTubeEmbedUrl(e.target.value) })}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
            />
          </div>

          {/* Težina i dimenzije */}
          <div className="border-t border-slate-700 pt-6 mt-6">
            <h4 className="text-lg font-semibold mb-4 text-blue-400">Težina i Dimenzije (opciono)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Masa</label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="1350 kg"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Dužina</label>
                <input
                  type="text"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  placeholder="4258 mm"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Širina</label>
                <input
                  type="text"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  placeholder="1799 mm"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Visina</label>
                <input
                  type="text"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="1442 mm"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Međuosovinski razmak</label>
                <input
                  type="text"
                  value={formData.wheelbase}
                  onChange={(e) => setFormData({ ...formData, wheelbase: e.target.value })}
                  placeholder="2631 mm"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Prtljažnik</label>
                <input
                  type="text"
                  value={formData.trunkCapacity}
                  onChange={(e) => setFormData({ ...formData, trunkCapacity: e.target.value })}
                  placeholder="380 L"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Spremnik goriva</label>
                <input
                  type="text"
                  value={formData.fuelTankCapacity}
                  onChange={(e) => setFormData({ ...formData, fuelTankCapacity: e.target.value })}
                  placeholder="50 L"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                />
              </div>
            </div>
          </div>

          {/* Detaljni opis i prednosti/nedostaci */}
          <div className="border-t border-slate-700 pt-6 mt-6">
            <h4 className="text-lg font-semibold mb-4 text-blue-400">Detaljni Opis (opciono)</h4>
            <div>
              <label className="block text-sm font-medium mb-2">O ovoj varijanti</label>
              <textarea
                value={formData.detailedDescription}
                onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                placeholder="Detaljniji tekst o karakteru motora, iskustvu vožnje, za koga je namijenjen..."
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-green-400">Prednosti (svaka u novom redu)</label>
                <textarea
                  value={formData.pros}
                  onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                  placeholder="Niska potrošnja&#10;Pouzdani motor&#10;Odlična vozna dinamika"
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-red-400">Nedostaci (svaka u novom redu)</label>
                <textarea
                  value={formData.cons}
                  onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                  placeholder="Skupa održavanje&#10;Mali prtljažnik&#10;Bučan motor"
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saveVariant.isPending || !formData.generationId}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white keep-white px-6 py-3 rounded-lg font-semibold"
            >
              {saveVariant.isPending ? "Spremam..." : "Spremi"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg">
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
  
  // Multi-image state
  const [images, setImages] = useState<ImageItem[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const queryClient = useQueryClient();

  // Load existing images when editing
  useEffect(() => {
    if (post?.id && !imagesLoaded) {
      fetch(`/api/images/blog/${post.id}`)
        .then(res => res.json())
        .then((data: { id: string; url: string }[]) => {
          if (data.length > 0) {
            setImages(data.map(img => ({ id: img.id, url: img.url })));
          } else if (post.image) {
            // No images in new table yet — fall back to legacy single image
            setImages([{ url: post.image }]);
          }
          setImagesLoaded(true);
        })
        .catch(() => {
          if (post.image) {
            setImages([{ url: post.image }]);
          }
          setImagesLoaded(true);
        });
    } else if (!post && !imagesLoaded) {
      setImagesLoaded(true);
    }
  }, [post, imagesLoaded]);

  const saveBlog = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Use first image as main image for backward compatibility
      const dataWithImage = { ...data, image: images[0]?.url || "" };
      
      const url = post ? `/api/blog/${post.id}` : "/api/blog";
      const method = post ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataWithImage),
      });
      if (!res.ok) throw new Error("Failed to save");
      const savedPost = await res.json();
      
      // Save images to the images table
      if (images.length > 0) {
        await fetch("/api/images/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entityType: "blog",
            entityId: savedPost.id,
            images: images.map((img, index) => ({ url: img.url, order: index }))
          }),
          credentials: "include",
        });
      }
      
      return savedPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
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

        <form onSubmit={(e) => { e.preventDefault(); saveBlog.mutate(formData); }} className="space-y-4">
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
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              required
              rows={12}
              placeholder="Unesite sadržaj članka..."
            />
          </div>

          <MultiImageUploader
            images={images}
            onChange={setImages}
            maxImages={10}
          />

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saveBlog.isPending || images.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white keep-white px-6 py-3 rounded-lg font-semibold"
            >
              {saveBlog.isPending ? "Spremam..." : "Spremi"}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg">
              Odustani
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
