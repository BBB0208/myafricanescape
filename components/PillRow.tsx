import { cn } from "@/lib/cn";

const TONES = {
  ink: "border-ink/20 text-ink/70",
  cream: "border-cream/20 text-cream/75",
} as const;

export default function PillRow({
  items,
  tone = "ink",
}: {
  items: string[];
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="mt-[22px] flex flex-wrap gap-2.5">
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            "rounded-full border px-3.5 py-2 font-eyebrow text-[12.5px] tracking-[.06em]",
            TONES[tone],
          )}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
