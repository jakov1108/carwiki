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
      editor.commands.setContent(value || "", { emitUpdate: false });
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
          ? "bg-blue-600 text-white keep-white"
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
// Re-export for backward compatibility
export { renderFormattedContent } from "./FormattedContent";

