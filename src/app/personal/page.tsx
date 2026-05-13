import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PRODUCTS } from "@/lib/products";

export const metadata: Metadata = { title: "Personal banking" };

export default function PersonalPage() {
  const personal = Object.values(PRODUCTS).filter((p) => p.category === "Personal");

  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
            Personal banking
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight tracking-tight text-balance lg:text-6xl">
            One account, every product, fully online.
          </h1>
          <p className="mt-5 max-w-2xl text-white/75">
            Whether you&apos;re saving for a first home or moving family wealth across
            generations — every Nova Trust product is built around the same idea:
            transparent, fast, and human when it counts.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {personal.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.slug}
                href={`/personal/${p.slug}`}
                className="group rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-navy-900 text-white">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">
                  {p.title}
                </h2>
                {p.rate && (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-violet-500">
                    {p.rate.label} · {p.rate.value}
                  </p>
                )}
                <p className="mt-3 text-sm text-muted-foreground">{p.subhead}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-violet-500">
                  Explore <ArrowUpRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
