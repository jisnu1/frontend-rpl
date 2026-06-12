import React from 'react';

interface MarkdownRendererProps {
  text: string;
  className?: string;
}

export default function MarkdownRenderer({ text, className = "space-y-1.5" }: MarkdownRendererProps) {
  if (!text) return null;

  // 1. Escape HTML first to prevent XSS
  let escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Bold (**text**) -> <strong>
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>');
  
  // 3. Italic (*text*) -> <em> (Since bold asterisks are already replaced by tags, single asterisks are safe)
  escaped = escaped.replace(/\*(.*?)\*/g, '<em class="italic font-bold text-slate-800">$1</em>');
  
  // 4. Italic (_text_) -> <em>
  escaped = escaped.replace(/_(.*?)_/g, '<em class="italic font-bold text-slate-800">$1</em>');

  // 5. Inline Code (`code`) -> <code>
  escaped = escaped.replace(/`(.*?)`/g, '<code class="bg-slate-100 text-red-500 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-200">$1</code>');

  const lines = escaped.split('\n');

  return (
    <div className={className}>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        
        // Handle Bullet Lists (- or *)
        if (trimmed.startsWith('- ')) {
          return (
            <li
              key={index}
              className="list-disc ml-5 text-xs font-medium text-slate-650 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: trimmed.substring(2) }}
            />
          );
        }
        if (trimmed.startsWith('* ')) {
          return (
            <li
              key={index}
              className="list-disc ml-5 text-xs font-medium text-slate-650 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: trimmed.substring(2) }}
            />
          );
        }
        
        // Handle regular paragraph lines
        return (
          <p
            key={index}
            className="text-xs font-medium text-slate-650 leading-relaxed min-h-[1rem]"
            dangerouslySetInnerHTML={{ __html: line }}
          />
        );
      })}
    </div>
  );
}
