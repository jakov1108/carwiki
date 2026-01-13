import { useRef, useState } from "react";
import { Bold, Italic, Heading2, List, Link as LinkIcon, Quote, Minus } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Unesite tekst...",
  rows = 10,
  required = false,
  className = "",
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showHelp, setShowHelp] = useState(false);

  const insertFormatting = (before: string, after: string = before, placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newValue =
      value.substring(0, start) +
      before +
      textToInsert +
      after +
      value.substring(end);

    onChange(newValue);

    // Restore cursor position after React re-renders
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(
        start + before.length,
        newCursorPos
      );
    }, 0);
  };

  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    // Find the start of the current line
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    
    const newValue =
      value.substring(0, lineStart) +
      prefix +
      value.substring(lineStart);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Bold,
      label: "Podebljano (Ctrl+B)",
      action: () => insertFormatting("**", "**", "podebljani tekst"),
      shortcut: "b",
    },
    {
      icon: Italic,
      label: "Kurziv (Ctrl+I)",
      action: () => insertFormatting("_", "_", "kurziv tekst"),
      shortcut: "i",
    },
    {
      icon: Heading2,
      label: "Naslov",
      action: () => insertAtLineStart("## "),
    },
    {
      icon: List,
      label: "Lista",
      action: () => insertAtLineStart("• "),
    },
    {
      icon: Quote,
      label: "Citat",
      action: () => insertAtLineStart("> "),
    },
    {
      icon: LinkIcon,
      label: "Link",
      action: () => insertFormatting("[", "](url)", "tekst linka"),
    },
    {
      icon: Minus,
      label: "Horizontalna linija",
      action: () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const needsNewlineBefore = start > 0 && value[start - 1] !== "\n";
        const newValue =
          value.substring(0, start) +
          (needsNewlineBefore ? "\n" : "") +
          "---\n" +
          value.substring(start);
        onChange(newValue);
      },
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "b") {
        e.preventDefault();
        insertFormatting("**", "**", "podebljani tekst");
      } else if (e.key === "i") {
        e.preventDefault();
        insertFormatting("_", "_", "kurziv tekst");
      }
    }
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-slate-900 border border-slate-700 rounded-t-lg border-b-0">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.action}
            title={button.label}
            className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-300 hover:text-white"
          >
            <button.icon className="w-4 h-4" />
          </button>
        ))}
        
        <div className="flex-1" />
        
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs text-slate-400 hover:text-slate-300 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
        >
          {showHelp ? "Sakrij pomoć" : "?"}
        </button>
      </div>

      {/* Help section */}
      {showHelp && (
        <div className="p-3 bg-slate-900/50 border-x border-slate-700 text-xs text-slate-400 space-y-1">
          <p><strong className="text-slate-300">**tekst**</strong> → <strong>podebljano</strong></p>
          <p><strong className="text-slate-300">_tekst_</strong> → <em>kurziv</em></p>
          <p><strong className="text-slate-300">## Naslov</strong> → Naslov sekcije</p>
          <p><strong className="text-slate-300">• stavka</strong> → Lista</p>
          <p><strong className="text-slate-300">&gt; tekst</strong> → Citat</p>
          <p><strong className="text-slate-300">[tekst](url)</strong> → Link</p>
          <p><strong className="text-slate-300">---</strong> → Horizontalna linija</p>
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full bg-slate-900 border border-slate-700 rounded-b-lg px-4 py-3 focus:outline-none focus:border-blue-500 resize-y min-h-[200px] font-mono text-sm"
      />
    </div>
  );
}

// Function to render markdown-like syntax to JSX
export function renderFormattedContent(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Horizontal rule
    if (line.trim() === "---") {
      elements.push(<hr key={key++} className="my-6 border-slate-600" />);
      continue;
    }

    // Heading (## )
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-2xl font-bold mt-6 mb-3 text-white">
          {formatInlineText(line.substring(3))}
        </h2>
      );
      continue;
    }

    // Quote (> )
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={key++} className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-slate-800/50 rounded-r italic text-slate-300">
          {formatInlineText(line.substring(2))}
        </blockquote>
      );
      continue;
    }

    // List item (• or - )
    if (line.startsWith("• ") || line.startsWith("- ")) {
      elements.push(
        <li key={key++} className="ml-6 list-disc text-slate-300">
          {formatInlineText(line.substring(2))}
        </li>
      );
      continue;
    }

    // Empty line = paragraph break
    if (line.trim() === "") {
      elements.push(<div key={key++} className="h-4" />);
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="text-slate-300 leading-relaxed mb-3">
        {formatInlineText(line)}
      </p>
    );
  }

  return <>{elements}</>;
}

// Helper function to format inline text (bold, italic, links)
function formatInlineText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let key = 0;
  let remaining = text;

  while (remaining.length > 0) {
    // Check for link [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.substring(linkMatch[0].length);
      continue;
    }

    // Check for bold **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={key++} className="font-bold text-white">{boldMatch[1]}</strong>);
      remaining = remaining.substring(boldMatch[0].length);
      continue;
    }

    // Check for italic _text_
    const italicMatch = remaining.match(/^_([^_]+)_/);
    if (italicMatch) {
      parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
      remaining = remaining.substring(italicMatch[0].length);
      continue;
    }

    // Find next special character or end
    const nextSpecial = remaining.search(/\[|\*\*|_/);
    if (nextSpecial === -1) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    } else if (nextSpecial === 0) {
      // Special char at start but didn't match pattern - treat as regular text
      parts.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.substring(1);
    } else {
      parts.push(<span key={key++}>{remaining.substring(0, nextSpecial)}</span>);
      remaining = remaining.substring(nextSpecial);
    }
  }

  return <>{parts}</>;
}
