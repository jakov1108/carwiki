import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";

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
  className = "",
}: RichTextEditorProps) {
  const lastValueRef = useRef<string>(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-400 underline hover:text-blue-300" },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[250px] px-4 py-3 focus:outline-none text-slate-200 leading-relaxed",
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML();
      lastValueRef.current = html;
      onChange(html);
    },
  });

  // Sync external value changes (e.g. when editing an existing post)
  useEffect(() => {
    if (editor && value !== lastValueRef.current) {
      lastValueRef.current = value;
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("URL linka:", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) return null;

  return (
    <div className={`rich-text-editor rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Poništi (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Ponovi (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Podebljano (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Kurziv (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Podcrtano (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Naslov H2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Lista s točkama"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numerirana lista"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Citat"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontalna linija"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
          title="Dodaj link"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="bg-white dark:bg-slate-900">
        <style>{`
          .tiptap-editor .tiptap h2 { font-size: 1.5rem; font-weight: 700; margin: 1.2rem 0 0.6rem; color: #1e293b; }
          .tiptap-editor .tiptap h3 { font-size: 1.2rem; font-weight: 600; margin: 1rem 0 0.5rem; color: #1e293b; }
          .tiptap-editor .tiptap p { margin-bottom: 0.75rem; color: #1e293b; }
          .tiptap-editor .tiptap ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
          .tiptap-editor .tiptap ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
          .tiptap-editor .tiptap li { margin-bottom: 0.25rem; color: #1e293b; }
          .tiptap-editor .tiptap blockquote { border-left: 4px solid #3b82f6; padding: 0.5rem 1rem; margin: 1rem 0; background: rgba(241,245,249,0.8); border-radius: 0 0.25rem 0.25rem 0; color: #475569; font-style: italic; }
          .tiptap-editor .tiptap hr { border: none; border-top: 1px solid #cbd5e1; margin: 1.5rem 0; }
          .tiptap-editor .tiptap strong { font-weight: 700; color: #0f172a; }
          .tiptap-editor .tiptap em { font-style: italic; }
          .tiptap-editor .tiptap u { text-decoration: underline; }
          .tiptap-editor .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #94a3b8; float: left; height: 0; pointer-events: none; }
          .dark .tiptap-editor .tiptap h2 { color: #f1f5f9; }
          .dark .tiptap-editor .tiptap h3 { color: #f1f5f9; }
          .dark .tiptap-editor .tiptap p { color: #e2e8f0; }
          .dark .tiptap-editor .tiptap li { color: #e2e8f0; }
          .dark .tiptap-editor .tiptap blockquote { background: rgba(30,41,59,0.5); color: #94a3b8; }
          .dark .tiptap-editor .tiptap hr { border-top-color: #475569; }
          .dark .tiptap-editor .tiptap strong { color: #fff; }
          .dark .tiptap-editor .tiptap p.is-editor-empty:first-child::before { color: #64748b; }
        `}</style>
        <div className="tiptap-editor">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

// ── Toolbar helpers ──────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
      } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />;
}

// ── Render helpers (blog post page) ─────────────────────────────────────────

/**
 * Renders content for display. Handles both:
 *  - HTML content from Tiptap (new posts)
 *  - Legacy custom-format content (**, _text_, ## heading, • list, > quote, ---)
 */
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

