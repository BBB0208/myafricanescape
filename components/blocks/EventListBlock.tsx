import { stegaClean } from "next-sanity";
import AskMayButton from "@/components/AskMayButton";
import { BtnLink } from "@/components/Btn";
import Container from "@/components/Container";
import EventCard from "@/components/EventCard";
import JsonLd from "@/components/JsonLd";
import Section from "@/components/Section";
import SectionHead from "@/components/SectionHead";
import { externalProps, isConciergeLink, resolveHref, type LinkValue } from "@/lib/links";
import { MUTED_TEXT, toTone } from "@/lib/tone";
import type { BlockOf } from "@/sanity/lib/types";

/* RSVP goes to the event's link, or to May when there isn't one. */
function Rsvp({ link, label }: { link: LinkValue; label: string }) {
  const href = isConciergeLink(link) ? null : resolveHref(link);
  if (!href) {
    return (
      <AskMayButton variant="default" size="small">
        {label}
      </AskMayButton>
    );
  }
  return (
    <BtnLink href={href} size="small" {...externalProps(link)}>
      {label}
    </BtnLink>
  );
}

export default function EventListBlock({ block }: { block: BlockOf<"eventList"> }) {
  const tone = toTone(block.tone);
  const limit = typeof block.limit === "number" && block.limit > 0 ? block.limit : undefined;
  const events = (block.events ?? []).slice(0, limit);
  const rsvpLabel = block.rsvpLabel || "RSVP";

  // schema.org Events — eligible for event rich results in search
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": events.map((event) => ({
      "@type": "Event",
      name: event.title,
      startDate: event.date,
      description: event.description ?? undefined,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Place", name: event.city, address: event.city },
    })),
  };

  return (
    <Section id={stegaClean(block.anchorId) || undefined} tone={tone}>
      {events.length ? <JsonLd data={jsonLd} /> : null}
      <Container>
        <SectionHead eyebrow={block.eyebrow} title={block.title} aside={block.aside} tone={tone} />
        {events.length ? (
          events.map((event, i) => (
            <EventCard
              key={event._id}
              event={event}
              index={i}
              action={<Rsvp link={event.rsvp} label={rsvpLabel} />}
            />
          ))
        ) : (
          <p className={MUTED_TEXT[tone]}>{block.emptyMessage}</p>
        )}
      </Container>
    </Section>
  );
}
