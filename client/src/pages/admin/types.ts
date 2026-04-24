export interface AdminImageItem {
  id?: string;
  url: string;
  isNew?: boolean;
}

export interface AdminCarSubmission {
  id: string;
  submittedBy: string;
  submittedByName: string;
  status: string;
  mode: string;
  modelId: string | null;
  generationId: string | null;
  modelData: string | null;
  generationData: string | null;
  variantData: string;
  adminNotes: string | null;
  createdAt: string;
}

export type AdminTab = "cars" | "pending" | "submissions" | "blog" | "messages";
