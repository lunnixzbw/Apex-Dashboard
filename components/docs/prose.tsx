import React from "react";

export const H1 = ({ children }: { children: React.ReactNode }) => (
  <h1 className="font-outfit text-4xl font-bold tracking-tight text-site-ink sm:text-5xl">{children}</h1>
);
export const Lead = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-4 max-w-2xl text-base leading-relaxed text-site-muted sm:text-lg">{children}</p>
);
export const H2 = ({ children, id }: { children: React.ReactNode; id?: string }) => (
  <h2 id={id} className="mt-12 scroll-mt-24 font-outfit text-2xl font-semibold text-site-ink">{children}</h2>
);
export const P = ({ children }: { children: React.ReactNode }) => <p className="mt-3 text-[15px] leading-relaxed text-site-muted">{children}</p>;
export const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded-md border border-site-ink/10 bg-site-ink/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-site-ink">{children}</code>
);
export const Steps = ({ items }: { items: { title: string; body: React.ReactNode }[] }) => (
  <ol className="mt-5 space-y-4">
    {items.map((s, i) => (
      <li key={s.title} className="flex gap-4 rounded-2xl border border-site-ink/10 bg-site-card/70 p-5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-site-ink text-sm font-bold text-site-bg">{i + 1}</span>
        <div>
          <h3 className="font-semibold text-site-ink">{s.title}</h3>
          <div className="mt-1 text-sm leading-relaxed text-site-muted">{s.body}</div>
        </div>
      </li>
    ))}
  </ol>
);
export const Note = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-5 rounded-xl border border-site-ink/15 bg-site-ink/[0.04] p-4 text-sm leading-relaxed text-site-muted">{children}</div>
);
