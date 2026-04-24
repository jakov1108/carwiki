import { QueryClient } from "@tanstack/react-query";

export const STATIC_QUERY_STALE_TIME = 10 * 60 * 1000;
export const STATIC_QUERY_GC_TIME = 60 * 60 * 1000;
export const LIVE_QUERY_STALE_TIME = 30 * 1000;
export const LIVE_QUERY_GC_TIME = 5 * 60 * 1000;

async function defaultQueryFn({ queryKey }: { queryKey: readonly unknown[] }): Promise<unknown> {
  const url = queryKey[0] as string;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: STATIC_QUERY_STALE_TIME,
      gcTime: STATIC_QUERY_GC_TIME,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

export async function apiRequest(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  
  return res.json();
}
