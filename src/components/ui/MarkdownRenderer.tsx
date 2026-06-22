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
  
  // 3. Italic (*text*) -> <em>
  escaped = escaped.replace(/\*(.*?)\*/g, '<em class="italic font-bold text-slate-800">$1</em>');
  
  // 4. Italic (_text_) -> <em>
  escaped = escaped.replace(/_(.*?)_/g, '<em class="italic font-bold text-slate-800">$1</em>');

  // 5. Inline Code (`code`) -> <code>
  escaped = escaped.replace(/`(.*?)`/g, '<code class="bg-slate-100 text-red-500 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-200">$1</code>');

  const lines = escaped.split('\n');

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const renderedElements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Code Block Toggle
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block, render it
        const codeContent = codeBlockLines.join('\n');
        renderedElements.push(
          <pre key={`code-${index}`} className="bg-slate-950 text-slate-100 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto my-3 border border-slate-800 shadow-md">
            <code>{codeContent}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      renderedElements.push(<hr key={index} className="my-4 border-slate-200" />);
      return;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h1 key={index} className="text-base font-extrabold text-slate-800 mt-5 mb-2.5 pb-1 border-b border-slate-100" dangerouslySetInnerHTML={{ __html: trimmed.substring(2) }} />
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h2 key={index} className="text-sm font-extrabold text-slate-800 mt-4 mb-2" dangerouslySetInnerHTML={{ __html: trimmed.substring(3) }} />
      );
      return;
    }
    if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h3 key={index} className="text-xs font-black text-slate-800 mt-3.5 mb-1.5" dangerouslySetInnerHTML={{ __html: trimmed.substring(4) }} />
      );
      return;
    }
    if (trimmed.startsWith('#### ')) {
      renderedElements.push(
        <h4 key={index} className="text-[11px] font-black text-slate-700 mt-3 mb-1" dangerouslySetInnerHTML={{ __html: trimmed.substring(5) }} />
      );
      return;
    }

    // Bullet Lists (- or *)
    if (trimmed.startsWith('- ')) {
      renderedElements.push(
        <li key={index} className="list-disc ml-5 text-xs font-medium text-slate-650 leading-relaxed my-1" dangerouslySetInnerHTML={{ __html: trimmed.substring(2) }} />
      );
      return;
    }
    if (trimmed.startsWith('* ')) {
      renderedElements.push(
        <li key={index} className="list-disc ml-5 text-xs font-medium text-slate-650 leading-relaxed my-1" dangerouslySetInnerHTML={{ __html: trimmed.substring(2) }} />
      );
      return;
    }

    // Numbered Lists (e.g. 1. )
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      renderedElements.push(
        <li key={index} className="list-decimal ml-5 text-xs font-medium text-slate-650 leading-relaxed my-1" dangerouslySetInnerHTML={{ __html: numberedMatch[2] }} />
      );
      return;
    }

    // Blockquotes
    if (trimmed.startsWith('&gt; ') || trimmed.startsWith('> ')) {
      const content = trimmed.startsWith('&gt; ') ? trimmed.substring(5) : trimmed.substring(2);
      renderedElements.push(
        <blockquote key={index} className="border-l-4 border-slate-200 pl-3.5 italic text-xs font-medium text-slate-500 leading-relaxed my-3 bg-slate-50/50 py-1 rounded-r-lg" dangerouslySetInnerHTML={{ __html: content }} />
      );
      return;
    }

    // Empty space/paragraphs
    if (trimmed === '') {
      renderedElements.push(<div key={index} className="h-1.5" />);
      return;
    }

    // Default Paragraph
    renderedElements.push(
      <p key={index} className="text-xs font-medium text-slate-650 leading-relaxed min-h-[1rem]" dangerouslySetInnerHTML={{ __html: line }} />
    );
  });

  // If there's an unclosed code block, render it anyway
  if (inCodeBlock && codeBlockLines.length > 0) {
    const codeContent = codeBlockLines.join('\n');
    renderedElements.push(
      <pre key="code-unclosed" className="bg-slate-950 text-slate-100 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto my-3 border border-slate-800 shadow-md">
        <code>{codeContent}</code>
      </pre>
    );
  }

  return (
    <div className={className}>
      {renderedElements}
    </div>
  );
}
