"use client";

export default function BackgroundGradient() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-mesh-light"
    >
      <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-violet/10 blur-3xl animate-blob" />
      <div
        className="absolute top-1/3 -right-32 w-[24rem] h-[24rem] rounded-full bg-brand-green/10 blur-3xl animate-blob"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-[20rem] h-[20rem] rounded-full bg-amber/10 blur-3xl animate-blob"
        style={{ animationDelay: "-8s" }}
      />
    </div>
  );
}
