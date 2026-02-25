import React from "react";

export function renderFormattedContent(content: string): React.ReactNode {
  if (!content) return null;

  if (isHtmlContent(content)) {
    return (
      <div
        className="prose dark:prose-invert prose-slate max-w-none
          prose-headings:text-slate-900 dark:prose-headings:text-white
          prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed
          prose-strong:text-slate-900 dark:prose-strong:text-white
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300
          prose-blockquote:border-blue-500 prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-300 prose-blockquote:not-italic
          prose-hr:border-slate-300 dark:prose-hr:border-slate-600
          prose-li:text-slate-700 dark:prose-li:text-slate-300
          prose-ul:list-disc prose-ol:list-decimal"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return renderLegacyContent(content);
}

function isHtmlContent(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith("<") && /<\/?[a-z][\s\S]*>/i.test(trimmed);
}

function renderLegacyContent(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim() === "---") {
      elements.push(<hr key={key++} className="my-6 border-slate-600" />);
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-2xl font-bold mt-6 mb-3 text-white">
          {formatInlineText(line.substring(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={key++} className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-slate-800/50 rounded-r italic text-slate-300">
          {formatInlineText(line.substring(2))}
        </blockquote>
      );
      continue;
    }
    if (line.startsWith("• ") || line.startsWith("- ")) {
      elements.push(
        <li key={key++} className="ml-6 list-disc text-slate-300">
          {formatInlineText(line.substring(2))}
        </li>
      );
      continue;
    }
    if (line.trim() === "") {
      elements.push(<div key={key++} className="h-4" />);
      continue;
    }
    elements.push(
      <p key={key++} className="text-slate-300 leading-relaxed mb-3">
        {formatInlineText(line)}
      </p>
    );
  }

  return <>{elements}</>;
}

function formatInlineText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let key = 0;
  let remaining = text;

  while (remaining.length > 0) {
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.substring(linkMatch[0].length);
      continue;
    }
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={key++} className="font-bold text-white">{boldMatch[1]}</strong>);
      remaining = remaining.substring(boldMatch[0].length);
      continue;
    }
    const italicMatch = remaining.match(/^_([^_]+)_/);
    if (italicMatch) {
      parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
      remaining = remaining.substring(italicMatch[0].length);
      continue;
    }
    const nextSpecial = remaining.search(/\[|\*\*|_/);
    if (nextSpecial === -1) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    } else if (nextSpecial === 0) {
      parts.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.substring(1);
    } else {
      parts.push(<span key={key++}>{remaining.substring(0, nextSpecial)}</span>);
      remaining = remaining.substring(nextSpecial);
    }
  }

  return <>{parts}</>;
}
