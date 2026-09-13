import { BtnLink } from "@/components/Btn";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Section from "@/components/Section";

export default function NotFound() {
  return (
    <Section tone="teal" className="flex min-h-[70vh] items-center">
      <Container>
        <Eyebrow tone="gold">404 · Off the reel</Eyebrow>
        <h1 className="mt-4 max-w-[16ch] text-[clamp(36px,5vw,64px)]">
          This frame didn&apos;t make the final cut.
        </h1>
        <div className="mt-8">
          <BtnLink href="/" variant="ghost">
            Back to the home page
          </BtnLink>
        </div>
      </Container>
    </Section>
  );
}
