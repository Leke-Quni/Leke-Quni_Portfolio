import ReactMarkdown from "react-markdown";
import { RemoteImage } from "@/components/RemoteImage";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-neutral prose-invert max-w-none">
      <ReactMarkdown
        components={{
          img: ({ src, alt }) =>
            typeof src === "string" ? (
              <RemoteImage
                src={src}
                alt={alt ?? ""}
                width={1200}
                height={800}
                sizes="(max-width: 768px) 100vw, 768px"
                className="h-auto w-full rounded-md"
              />
            ) : null,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
