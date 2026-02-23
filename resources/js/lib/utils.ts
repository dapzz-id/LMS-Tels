import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toAbsoluteAssetUrl(path?: string | null, fallback = ""): string {
  if (!path) {
    return fallback
  }

  const normalizedPath = path.trim()

  if (!normalizedPath) {
    return fallback
  }

  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://") ||
    normalizedPath.startsWith("//") ||
    normalizedPath.startsWith("data:") ||
    normalizedPath.startsWith("blob:")
  ) {
    return normalizedPath
  }

  const withLeadingSlash = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${withLeadingSlash}`
  }

  const appUrl = (import.meta.env.VITE_APP_URL || "").replace(/\/+$/, "")
  if (appUrl) {
    return `${appUrl}${withLeadingSlash}`
  }

  return withLeadingSlash
}

/**
 * Render mathematical equations using MathJax
 * @param element - The DOM element containing LaTeX equations
 */
export function renderMath(element: HTMLElement | null) {
  if (!element || typeof window === 'undefined') return;

  // Check if MathJax is available
  const mathJax = (window as any).MathJax;
  if (!mathJax) {
    
    return;
  }

  // Render equations in the element
  try {
    mathJax.typesetPromise([element]).catch((err: any) => {
      
    });
  } catch (error) {
    
  }
}
