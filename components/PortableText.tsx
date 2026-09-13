import { PortableText, stegaClean, type PortableTextComponents } from "next-sanity";
import { Em } from "@/components/Hero";

type Value = Parameters<typeof PortableText>[0]["value"];

/* Hero headlines: one block per line, "em" is the sunset accent. */
const HEADLINE: PortableTextComponents = {
  block: { normal: ({ children }) => <span className="block">{children}</span> },
  marks: { em: ({ children }) => <Em>{children}</Em> },
};

export function Headline({ value }: { value: Value | null | undefined }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return <PortableText value={value} components={HEADLINE} />;
}

function linkMark(): PortableTextComponents["marks"] {
  return {
    link: ({ value, children }) => {
      const href = stegaClean((value as { href?: string } | undefined)?.href) ?? "#";
      const external = /^https?:/.test(href);
      return (
        <a
          href={href}
          className="underline decoration-1 underline-offset-4"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  };
}

/* Paragraph copy. `paragraphClassName` is applied to every <p>. */
export function RichText({
  value,
  paragraphClassName,
}: {
  value: Value | null | undefined;
  paragraphClassName?: string;
}) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const components: PortableTextComponents = {
    block: { normal: ({ children }) => <p className={paragraphClassName}>{children}</p> },
    marks: linkMark(),
  };
  return <PortableText value={value} components={components} />;
}
