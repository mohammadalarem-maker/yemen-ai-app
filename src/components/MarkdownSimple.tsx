import React from "react";

interface MarkdownSimpleProps {
  content: string;
}

export function MarkdownSimple({ content }: MarkdownSimpleProps) {
  if (!content) return null;

  // Split lines
  const lines = content.split("\n");
  let inCodeBlock = false;
  let codeContent: string[] = [];

  return (
    <div className="space-y-2 text-sm leading-relaxed text-gray-100 font-sans">
      {lines.map((line, idx) => {
        // Toggle Code block
        if (line.trim().startsWith("```")) {
          if (inCodeBlock) {
            inCodeBlock = false;
            const codeOutput = codeContent.join("\n");
            codeContent = [];
            return (
              <pre key={idx} className="bg-black/40 text-rose-300 font-mono p-3 rounded-lg text-xs overflow-x-auto border border-white/10 my-2 dir-ltr text-left">
                <code>{codeOutput}</code>
              </pre>
            );
          } else {
            inCodeBlock = true;
            return null;
          }
        }

        if (inCodeBlock) {
          codeContent.push(line);
          return null;
        }

        const trimmed = line.trim();

        // Headers
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-base font-bold text-[#D9A14E] pt-2 pb-1">
              {parseBold(trimmed.substring(4))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-lg font-bold text-white pt-2 pb-1 border-b border-white/10">
              {parseBold(trimmed.substring(3))}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-xl font-extrabold text-white pt-3 pb-1">
              {parseBold(trimmed.substring(2))}
            </h2>
          );
        }

        // Bullet lists
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pr-4 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D71920] mt-1.5 shrink-0" />
              <span>{parseBold(trimmed.substring(2))}</span>
            </div>
          );
        }

        // Numbered lists
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pr-4 my-1">
              <span className="font-bold text-[#D9A14E] shrink-0 text-xs mt-0.5">{numMatch[1]}.</span>
              <span>{parseBold(numMatch[2])}</span>
            </div>
          );
        }

        // Standard empty line
        if (trimmed === "") {
          return <div key={idx} className="h-2" />;
        }

        // Default paragraph
        return <p key={idx} className="text-gray-200">{parseBold(line)}</p>;
      })}
    </div>
  );
}

// Simple bold / italic parser
function parseBold(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.substring(2, part.length - 2)}
        </strong>
      );
    }
    return part;
  });
}
