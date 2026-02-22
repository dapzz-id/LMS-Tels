import React, { useEffect, useRef } from 'react';
import { renderMath } from '@/lib/utils';

interface MathPreviewProps {
  content: string;
  className?: string;
}

const MathPreview: React.FC<MathPreviewProps> = ({ content, className = '' }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current && typeof window !== 'undefined' && (window as any).MathJax) {
      // Render math equations after a short delay to ensure DOM is updated
      const timer = setTimeout(() => {
        renderMath(previewRef.current);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [content]);

  // Process content to wrap math expressions with proper MathJax delimiters
  const processContent = (text: string) => {
    // Convert $...$ to \(...\) for inline math
    let processed = text.replace(/\$(.*?)\$/g, (match, p1) => `\\(${p1}\\)`);
    // Convert $$...$$ to \[...\] for block math
    processed = processed.replace(/\$\$(.*?)\$\$/g, (match, p1) => `\\[${p1}\\]`);
    return processed;
  };

  return (
    <div
      ref={previewRef}
      className={`math-preview whitespace-pre-wrap break-words p-3 bg-white border border-gray-300 rounded-md text-gray-800 ${className}`}
    >
      {processContent(content)}
    </div>
  );
};

export default MathPreview;
