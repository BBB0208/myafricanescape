import { BtnLink } from "@/components/Btn";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Section from "@/components/Section";

/* Shown at / until a home page is chosen in Site settings. */
export default function SetupNotice() {
  return (
    <Section tone="teal" className="flex min-h-[70vh] items-center">
      <Container>
        <Eyebrow tone="gold">Almost there</Eyebrow>
        <h1 className="mt-4 max-w-[18ch] text-[clamp(36px,5vw,64px)]">No home page has been chosen yet.</h1>
        <p className="mt-5 max-w-[52ch] text-[17px] text-cream/75">
          Open the Studio, create a page, and pick it as the Home page in Site settings — or run{" "}
          <code className="font-mono text-gold">npm run seed</code> to load the full site.
        </p>
        <div className="mt-8">
          <BtnLink href="/studio" variant="ghost">
            Open the Studio
          </BtnLink>
        </div>
      </Container>
    </Section>
  );
}
