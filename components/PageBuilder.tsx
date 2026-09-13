import { createDataAttribute } from "next-sanity";
import CardGridBlock from "@/components/blocks/CardGridBlock";
import CtaBannerBlock from "@/components/blocks/CtaBannerBlock";
import EditorialBlock from "@/components/blocks/EditorialBlock";
import EventListBlock from "@/components/blocks/EventListBlock";
import FeatureListBlock from "@/components/blocks/FeatureListBlock";
import HeroBlock from "@/components/blocks/HeroBlock";
import ListingGridBlock from "@/components/blocks/ListingGridBlock";
import MortgageCalculatorBlock from "@/components/blocks/MortgageCalculatorBlock";
import StatsBarBlock from "@/components/blocks/StatsBarBlock";
import Container from "@/components/Container";
import Section from "@/components/Section";
import { dataset, projectId, studioUrl } from "@/sanity/env";
import type { PageBlock, PageData } from "@/sanity/lib/types";

function renderBlock(block: PageBlock, index: number) {
  switch (block._type) {
    case "hero":
      return <HeroBlock block={block} priority={index === 0} />;
    case "statsBar":
      return <StatsBarBlock block={block} />;
    case "listingGrid":
      return <ListingGridBlock block={block} />;
    case "featureList":
      return <FeatureListBlock block={block} />;
    case "editorial":
      return <EditorialBlock block={block} />;
    case "cardGrid":
      return <CardGridBlock block={block} />;
    case "mortgageCalculator":
      return <MortgageCalculatorBlock block={block} />;
    case "eventList":
      return <EventListBlock block={block} />;
    case "ctaBanner":
      return <CtaBannerBlock block={block} />;
    default:
      return null;
  }
}

/* Renders a page's sections in order. The data-sanity attributes let the
   Presentation tool outline, add, move and remove sections in place. */
export default function PageBuilder({ page }: { page: PageData }) {
  // sections switched to "Hide this section" in the Studio are left out
  const blocks = (page.pageBuilder ?? []).filter((block) => block.hidden !== true);
  const attr = (path: string) =>
    createDataAttribute({
      baseUrl: studioUrl,
      projectId,
      dataset,
      id: page._id,
      type: page._type,
      path,
    }).toString();

  if (!blocks.length) {
    return (
      <Section>
        <Container>
          <h1 className="text-[clamp(32px,4vw,52px)]">{page.title}</h1>
          <p className="mt-4 text-ink/70">This page has no sections yet — add some in the Studio.</p>
        </Container>
      </Section>
    );
  }

  return (
    <div data-sanity={attr("pageBuilder")}>
      {blocks.map((block, index) => (
        <div key={block._key} data-sanity={attr(`pageBuilder[_key=="${block._key}"]`)}>
          {renderBlock(block, index)}
        </div>
      ))}
    </div>
  );
}
