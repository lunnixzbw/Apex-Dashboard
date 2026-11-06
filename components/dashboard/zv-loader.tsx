import Image from "next/image";

// Zevion logo with pulsing rings and a sliding bar. Used by every loading screen in the dashboard.
export function ZvLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-7" role="status" aria-live="polite">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="zv-ring absolute inset-0 rounded-full border border-site-ink/30" />
        <span className="zv-ring absolute inset-0 rounded-full border border-site-ink/20" style={{ animationDelay: "0.9s" }} />
        <div className="zv-float relative flex h-20 w-20 items-center justify-center rounded-3xl border border-site-ink/15 bg-site-card shadow-xl">
          <Image src="/logo.png" alt="" width={44} height={44} priority className="site-logo" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <p className="font-outfit text-sm font-semibold tracking-wide text-site-ink">{label}</p>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-site-ink/10">
          <div className="zv-bar h-full w-1/3 rounded-full bg-site-ink" />
        </div>
      </div>
    </div>
  );
}

export const Skel = ({ className = "" }: { className?: string }) => <div className={`zv-skel rounded-2xl ${className}`} />;
