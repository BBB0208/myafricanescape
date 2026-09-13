import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import { dayAndMonth } from "@/lib/dates";

export type AmaraEvent = {
  title?: string | null;
  date?: string | null;
  city?: string | null;
  description?: string | null;
};

export default function EventCard({
  event,
  action,
  index,
}: {
  event: AmaraEvent;
  action?: ReactNode;
  index?: number;
}) {
  const { day, month } = dayAndMonth(event.date);
  return (
    <Reveal index={index} className="grid grid-cols-[120px_1fr_auto] items-center gap-6 border-t border-ink/12 py-[26px] last:border-b mobile:grid-cols-[70px_1fr]">
      <div className="rounded-xl bg-ink px-2.5 py-3.5 text-center text-cream">
        <div className="font-display text-[28px] leading-none font-extrabold">{day}</div>
        <div className="font-eyebrow text-[12px] tracking-[.08em] text-gold">{month}</div>
      </div>
      <div>
        <div className="mb-1 font-eyebrow text-[12px] tracking-[.08em] text-sunset">{event.city}</div>
        <div className="mb-1.5 text-[21px]">{event.title}</div>
        {event.description ? (
          <div className="max-w-[56ch] text-[14.5px] text-ink/70">{event.description}</div>
        ) : null}
      </div>
      {action ? <div className="mobile:col-span-full">{action}</div> : null}
    </Reveal>
  );
}
