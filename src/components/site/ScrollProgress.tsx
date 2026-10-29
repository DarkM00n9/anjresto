export function ScrollProgress() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div className="scroll-progress h-full w-full origin-left scale-x-0 bg-[var(--color-primary)]" />
    </div>
  );
}
