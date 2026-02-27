/**
 * Converts any YouTube URL format to an embeddable URL.
 * Handles:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID  (left as-is)
 *   https://www.youtube.com/shorts/VIDEO_ID
 */
export function toYouTubeEmbedUrl(url: string): string {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");

    // Already an embed URL
    if (host === "youtube.com" && parsed.pathname.startsWith("/embed/")) {
      return url;
    }

    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = parsed.pathname.slice(1);
    } else if (host === "youtube.com") {
      if (parsed.pathname.startsWith("/watch")) {
        videoId = parsed.searchParams.get("v");
      } else if (parsed.pathname.startsWith("/shorts/")) {
        videoId = parsed.pathname.replace("/shorts/", "");
      }
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {
    // Not a valid URL, return as-is
  }

  return url;
}
