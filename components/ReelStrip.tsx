/* The signature motif: a strip of film with sprocket holes punched
   through it, used as a divider under every hero. It advances slowly,
   one sprocket at a time, like film through a gate. */
export default function ReelStrip() {
  return (
    <div aria-hidden className="relative h-[22px] overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-[calc(100%+26px)] opacity-90 motion-safe:animate-reel">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_10px,transparent_10px_26px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,var(--color-cream)_3.5px,transparent_3.6px)] bg-[length:26px_22px] bg-[position:8px_center] bg-repeat-x" />
      </div>
    </div>
  );
}
