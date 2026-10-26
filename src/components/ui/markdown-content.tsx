import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";

export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-4 text-[#1C1C19] leading-relaxed [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:text-[15px] [&_p]:text-[#1C1C19]/90 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_blockquote]:border-l-2 [&_blockquote]:border-[#B85C38] [&_blockquote]:bg-[#E7DECF]/50 [&_blockquote]:p-4 [&_blockquote]:text-sm [&_a]:text-[#23452F] [&_a]:underline [&_hr]:border-[#D6CBB9]",
        className
      )}
    >
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{content}</ReactMarkdown>
    </div>
  );
}
