"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, AtSign, Briefcase, Camera, Play } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { footerNav, siteConfig } from "@/lib/site";
import { toast } from "sonner";

const socialIcons = [
  { Icon: AtSign, label: "Follow on X", href: "https://x.com" },
  { Icon: Briefcase, label: "Connect on LinkedIn", href: "https://linkedin.com" },
  { Icon: Play, label: "Watch on YouTube", href: "https://youtube.com" },
  { Icon: Camera, label: "Follow on Instagram", href: "https://instagram.com" },
];

export function Footer() {
  const [email, setEmail] = useState("");

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Thanks — you're subscribed.", {
      description: "Watch your inbox for our next dispatch.",
    });
    setEmail("");
  };

  return (
    <footer className="mt-24 border-t border-border bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <Logo variant="mono-light" size={28} />
            <p className="mt-4 max-w-sm text-sm text-white/70">
              {siteConfig.description}
            </p>

            <form onSubmit={onSubscribe} className="mt-6 flex gap-2">
              <Input
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email for newsletter"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:border-violet-300"
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Subscribe"
                className="rounded-md bg-gold-500 text-navy-900 hover:bg-gold-300"
              >
                <ArrowRight className="size-4" />
              </Button>
            </form>

            <div className="mt-6 flex gap-2">
              {socialIcons.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {footerNav.map((col) => (
            <div key={col.heading}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/60">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/80 transition hover:text-gold-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-white/10 pt-8 text-xs text-white/60">
          <p className="max-w-3xl">{siteConfig.routine.fdicNotice}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 {siteConfig.name}. All rights reserved.</p>
            <p>Equal Housing Lender · Member FDIC</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
