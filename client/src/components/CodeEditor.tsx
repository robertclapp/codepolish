import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: "typescript" | "javascript" | "vue" | "svelte" | "css" | "html";
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  minHeight?: string;
}

// Simple syntax highlighting tokens
const TOKEN_PATTERNS = {
  keyword: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|interface|type|enum|implements|private|public|protected|static|readonly|abstract|declare|namespace|module|require|yield)\b/g,
  string: /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g,
  comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
  number: /\b\d+\.?\d*\b/g,
  function: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
  jsx: /<\/?[A-Z][a-zA-Z0-9]*|<\/?[a-z][a-zA-Z0-9-]*(?:\s|>|\/)/g,
  property: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
  operator: /[+\-*/%=<>!&|^~?:]+/g,
  bracket: /[{}[\]()]/g,
  type: /:\s*([A-Z][a-zA-Z0-9_$]*)/g,
};

function highlightCode(code: string, language: string): string {
  if (!code) return "";

  // Escape HTML first
  let highlighted = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Store strings and comments to prevent re-highlighting
  const preserved: string[] = [];

  // Preserve strings
  highlighted = highlighted.replace(TOKEN_PATTERNS.string, (match) => {
    preserved.push(`<span class="token-string">${match}</span>`);
    return `__PRESERVED_${preserved.length - 1}__`;
  });

  // Preserve comments
  highlighted = highlighted.replace(TOKEN_PATTERNS.comment, (match) => {
    preserved.push(`<span class="token-comment">${match}</span>`);
    return `__PRESERVED_${preserved.length - 1}__`;
  });

  // Apply highlighting
  highlighted = highlighted
    .replace(TOKEN_PATTERNS.keyword, '<span class="token-keyword">$&</span>')
    .replace(TOKEN_PATTERNS.number, '<span class="token-number">$&</span>')
    .replace(TOKEN_PATTERNS.function, '<span class="token-function">$1</span>(')
    .replace(TOKEN_PATTERNS.type, ': <span class="token-type">$1</span>')
    .replace(/&lt;([A-Z][a-zA-Z0-9]*)/g, '&lt;<span class="token-jsx">$1</span>')
    .replace(/&lt;\/([A-Z][a-zA-Z0-9]*)/g, '&lt;/<span class="token-jsx">$1</span>');

  // Restore preserved tokens
  preserved.forEach((token, i) => {
    highlighted = highlighted.replace(`__PRESERVED_${i}__`, token);
  });

  return highlighted;
}

export function CodeEditor({
  value,
  onChange,
  language = "typescript",
  readOnly = false,
  className,
  placeholder = "Enter code here...",
  minHeight = "400px",
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync scroll between textarea and highlight layer
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Handle tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab" && !readOnly) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + "  " + value.substring(end);

      onChange?.(newValue);

      // Set cursor position after the tab
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  const highlighted = highlightCode(value, language);
  const lines = value.split("\n");

  return (
    <div
      className={cn(
        "relative rounded-md border bg-muted/30 font-mono text-sm overflow-hidden",
        isFocused && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        className
      )}
      style={{ minHeight }}
    >
      {/* Line numbers */}
      <div
        className="absolute left-0 top-0 bottom-0 w-12 bg-muted/50 border-r select-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="pt-3 pr-2 text-right text-muted-foreground">
          {lines.map((_, i) => (
            <div key={i} className="leading-6 h-6">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Highlighted code display */}
      <pre
        ref={highlightRef}
        className="absolute inset-0 ml-12 p-3 overflow-auto pointer-events-none whitespace-pre-wrap break-words"
        aria-hidden="true"
      >
        <code
          dangerouslySetInnerHTML={{ __html: highlighted || `<span class="text-muted-foreground">${placeholder}</span>` }}
        />
      </pre>

      {/* Actual textarea for input */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        readOnly={readOnly}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className={cn(
          "absolute inset-0 ml-12 p-3 bg-transparent text-transparent caret-foreground resize-none outline-none overflow-auto",
          readOnly && "cursor-default"
        )}
        style={{ minHeight }}
        placeholder=""
      />

      <style>{`
        .token-keyword { color: hsl(var(--primary)); font-weight: 500; }
        .token-string { color: hsl(142 71% 45%); }
        .token-comment { color: hsl(var(--muted-foreground)); font-style: italic; }
        .token-number { color: hsl(31 100% 50%); }
        .token-function { color: hsl(207 90% 54%); }
        .token-jsx { color: hsl(280 100% 70%); }
        .token-type { color: hsl(180 70% 50%); }
        .dark .token-string { color: hsl(142 71% 65%); }
        .dark .token-number { color: hsl(31 100% 70%); }
      `}</style>
    </div>
  );
}

export default CodeEditor;
