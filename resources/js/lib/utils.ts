import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
    console.warn('MathJax not loaded');
    return;
  }

  // Render equations in the element
  try {
    mathJax.typesetPromise([element]).catch((err: any) => {
      console.warn('MathJax rendering error:', err);
    });
  } catch (error) {
    console.warn('Error rendering math equations:', error);
  }
}
