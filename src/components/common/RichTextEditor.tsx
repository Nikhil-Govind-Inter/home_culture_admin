import React, { useState } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  RemoveFormatting,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Image as ImageIcon,
  Smile,
  Link as LinkIcon,
  Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconSelector } from "./IconSelector";
import { ImageUploadModal } from "./ImageUploadModal";

// Enter inserts a <br> line break instead of starting a new paragraph/heading (lists keep their normal Enter behaviour).
const EnterInsertsLineBreak = Extension.create({
  name: "enterInsertsLineBreak",
  priority: 1000,
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (editor.isActive("listItem")) return false;
        return editor.commands.setHardBreak();
      },
    };
  },
});

interface RichTextEditorProps {
  label?: string;
  value?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  maxLength?: number;
  height?: string;
  dir?: "ltr" | "rtl";
}

export function RichTextEditor({
  label,
  value = "",
  onChange,
  placeholder = "Start typing...",
  className,
  required = false,
  maxLength,
  height,
  dir,
}: RichTextEditorProps) {
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4 cursor-pointer",
        },
      }),
      TextStyle,
      Color,
      EnterInsertsLineBreak,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      const textContent = editor.getText();
      
      if (maxLength && textContent.length > maxLength) {
        // Truncate content to maxLength
        const truncatedText = textContent.substring(0, maxLength);
        editor.commands.setContent(truncatedText);
        return;
      }
      
      onChange(content);
    },
    editorProps: {
      attributes: {
        dir,
        class: cn(
          "prose prose-sm max-w-none focus:outline-none p-3",
          "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ps-5 [&_ol]:ps-5 [&_blockquote]:border-s-4 [&_blockquote]:ps-4 [&_blockquote]:italic",
          "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-3",
          "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2",
          "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2",
          "[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-2",
          "[&_h5]:text-base [&_h5]:font-semibold [&_h5]:mt-2 [&_h5]:mb-1",
          "[&_h6]:text-xs [&_h6]:font-semibold [&_h6]:normal-case [&_h6]:mt-2 [&_h6]:mb-1",
          "[&_p]:text-base",
          "prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground",
          "prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground",
          "prose-blockquote:text-muted-foreground prose-blockquote:border-border",
          "prose-a:text-primary prose-a:underline",
          "prose-img:rounded-md prose-img:border"
          , dir === "rtl" && "text-right"
        ),
      },
      handleKeyDown: (view, event) => {
        if (maxLength) {
          const currentLength = editor?.getText().length || 0;
          
          // Allow backspace, delete, and navigation keys
          if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
            return false;
          }
          
          // Allow Ctrl/Cmd shortcuts
          if (event.ctrlKey || event.metaKey) {
            return false;
          }
          
          // Prevent new characters if at max length
          if (currentLength >= maxLength && event.key.length === 1) {
            event.preventDefault();
            return true;
          }
        }
        
        return false;
      },
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleIconSelect = (emoji: string) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji).run();
    }
  };

  const handleImageInsert = (src: string, alt: string, title?: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src, alt, title }).run();
    }
  };

  // Apply a heading only to the selected text (or the current line when nothing is selected),
  // by splitting the surrounding block instead of converting the whole block.
  const toggleHeadingOnSelection = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    if (!editor) return;
    const { $from, $to, empty } = editor.state.selection;
    const parent = $from.parent;

    // Toggle off, or fall back to default behaviour for multi-block selections
    if (
      (parent.type.name === "heading" && parent.attrs.level === level) ||
      $from.parent !== $to.parent ||
      !parent.isTextblock
    ) {
      editor.chain().focus().toggleHeading({ level }).run();
      return;
    }

    const blockStart = $from.start();
    const blockEnd = blockStart + parent.content.size;
    let from = $from.pos;
    let to = $to.pos;

    if (empty) {
      // Expand to the current line (between hard breaks)
      let lineStart = blockStart;
      let lineEnd = blockEnd;
      let endFound = false;
      parent.forEach((node, offset) => {
        if (node.type.name !== "hardBreak") return;
        const pos = blockStart + offset;
        if (pos < from) {
          lineStart = pos + node.nodeSize;
        } else if (!endFound) {
          lineEnd = pos;
          endFound = true;
        }
      });
      from = lineStart;
      to = lineEnd;
    }

    let selFrom = from;
    let selTo = to;

    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        // Split after the range (dropping a hard break at the boundary)
        if (to < blockEnd) {
          if (tr.doc.nodeAt(to)?.type.name === "hardBreak") tr.delete(to, to + 1);
          const $t = tr.doc.resolve(to);
          if ($t.parentOffset < $t.parent.content.size) tr.split(to);
        }
        // Split before the range
        let f = from;
        let t = to;
        if (f > blockStart && tr.doc.nodeAt(f - 1)?.type.name === "hardBreak") {
          tr.delete(f - 1, f);
          f -= 1;
          t -= 1;
        }
        if (f > blockStart) {
          tr.split(f);
          f += 2;
          t += 2;
        }
        selFrom = f;
        selTo = t;
        return true;
      })
      .command(({ commands }) => commands.setTextSelection({ from: selFrom, to: selTo }))
      .toggleHeading({ level })
      .run();
  };

  const handleLinkToggle = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, disabled, children }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
  }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="border rounded-md">
        {/* Toolbar */}
        <div className="border-b bg-muted/50 p-2">
          <div className="flex flex-wrap gap-1">
            {/* Text Formatting */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() =>
                editor.chain().focus().unsetAllMarks().clearNodes().run()
              }
            >
              <RemoveFormatting className="h-4 w-4" />
            </ToolbarButton>

            {/* Text Color */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 relative"
                >
                  <Palette className="h-4 w-4" />
                  {editor.getAttributes('textStyle').color && (
                    <div
                      className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white"
                      style={{ backgroundColor: editor.getAttributes('textStyle').color }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Color Picker</Label>
                    <input
                      type="color"
                      value={editor.getAttributes('textStyle').color || '#000000'}
                      className="w-full h-10 rounded border border-input bg-background cursor-pointer"
                      onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                      title="Select color"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Hex Color</Label>
                    <input
                      type="text"
                      placeholder="#000000"
                      defaultValue={editor.getAttributes('textStyle').color || ''}
                      className="w-full px-3 py-2 text-sm rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      onChange={(e) => {
                        const color = e.target.value;
                        if (color.match(/^#[0-9A-F]{6}$/i)) {
                          editor.chain().focus().setColor(color).run();
                        }
                      }}
                      onBlur={(e) => {
                        const color = e.target.value;
                        if (color && !color.startsWith('#')) {
                          e.target.value = '#' + color;
                        }
                      }}
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editor.chain().focus().unsetColor().run()}
                    className="w-full"
                  >
                    Reset Color
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="mx-1 h-8" />

            {/* Headings */}
            <ToolbarButton
              onClick={() => toggleHeadingOnSelection(1)}
              isActive={editor.isActive("heading", { level: 1 })}
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => toggleHeadingOnSelection(2)}
              isActive={editor.isActive("heading", { level: 2 })}
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => toggleHeadingOnSelection(3)}
              isActive={editor.isActive("heading", { level: 3 })}
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => toggleHeadingOnSelection(4)}
              isActive={editor.isActive("heading", { level: 4 })}
            >
              <Heading4 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => toggleHeadingOnSelection(5)}
              isActive={editor.isActive("heading", { level: 5 })}
            >
              <Heading5 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => toggleHeadingOnSelection(6)}
              isActive={editor.isActive("heading", { level: 6 })}
            >
              <Heading6 className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={editor.isActive("paragraph")}
            >
              <Type className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-8" />

            {/* Lists */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-8" />

            {/* Media & Links */}
            <ToolbarButton
              onClick={() => setShowImageModal(true)}
            >
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => setShowIconSelector(true)}
            >
              <Smile className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={handleLinkToggle}
              isActive={editor.isActive("link")}
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="mx-1 h-8" />

            {/* Undo/Redo */}
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor */}
        <EditorContent
          editor={editor}
          className="p-3 overflow-y-auto"
          style={{ height: height ?? "300px" }}
          placeholder={placeholder}
        />
        
        {/* Character counter */}
        {maxLength && (
          <div className="px-3 py-2 border-t bg-muted/30 text-sm text-muted-foreground text-right">
            {editor?.getText().length || 0}/{maxLength} characters
          </div>
        )}
      </div>

      {/* Modals */}
      <IconSelector
        isOpen={showIconSelector}
        onClose={() => setShowIconSelector(false)}
        onSelectIcon={handleIconSelect}
      />

      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsertImage={handleImageInsert}
      />
    </div>
  );
}
