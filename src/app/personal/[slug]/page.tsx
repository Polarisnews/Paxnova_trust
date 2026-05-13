import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PRODUCTS } from "@/lib/products";

export async function generateStaticParams() {
  return Object.keys(PRODUCTS).map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const product = PRODUCTS[slug];
  if (!product) return { title: "Not found" };
  return { title: product.title, description: product.subhead };
}

export default async function ProductPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const product = PRODUCTS[slug];
  if (!product) notFound();
  const Icon = product.icon;

  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <Link
            href="/personal"
            className="text-xs text-white/60 hover:text-white"
          >
            ← Personal banking
          </Link>
          <div className="mt-6 grid items-end gap-10 lg:grid-cols-[1fr_320px]">
            <div>
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-white/10 text-gold-300">
                <Icon className="size-5" />
              </span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
                {product.title}
              </p>
              <h1 className="mt-2 font-display text-5xl font-semibold leading-tight tracking-tight text-balance lg:text-6xl">
                {product.hero}
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-white/75 text-pretty">
                {product.subhead}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={`/apply?product=${product.applyAs ?? product.slug}`}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-semibold text-navy-900 shadow-glow-gold hover:bg-gold-300"
                >
                  {product.cta}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center rounded-full border border-white/25 bg-white/5 px-6 text-sm font-semibold backdrop-blur hover:bg-white/10"
                >
                  Talk to a banker
                </Link>
              </div>
            </div>

            {product.rate && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-white/60">
                  {product.rate.label}
                </p>
                <p className="mt-1 font-display text-5xl font-semibold text-gold-300">
                  {product.rate.value}
                </p>
                <p className="mt-2 text-xs text-white/60">Updated daily</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              What you get
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2">
              {product.features.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-violet-500" />
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="text-sm text-muted-foreground">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rates & fees
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              {product.fees.map((f) => (
                <div key={f.label} className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd className="font-mono font-semibold">{f.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section className="bg-card/30 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Common questions
          </h2>
          <Accordion className="mt-6">
            {product.faqs.map((f, i) => (
              <AccordionItem key={i} value={String(i)}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-balance">
          Ready to open your {product.title.toLowerCase()}?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Online in 3 minutes. Funded the same business day.
        </p>
        <Link
          href={`/apply?product=${product.applyAs ?? product.slug}`}
          className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-violet-500 px-8 text-sm font-semibold text-white shadow-glow-violet hover:bg-violet-600"
        >
          {product.cta}
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </>
  );
}
