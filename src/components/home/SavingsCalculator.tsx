"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";

const APY = 0.0485;

function projectGrowth(monthlyDeposit: number, years: number, openingDeposit = 0) {
  const monthlyRate = Math.pow(1 + APY, 1 / 12) - 1;
  const months = years * 12;
  const points: { month: number; year: number; balance: number; deposits: number }[] = [];
  let balance = openingDeposit;
  let totalDeposits = openingDeposit;

  for (let m = 0; m <= months; m++) {
    if (m > 0) {
      balance = balance * (1 + monthlyRate) + monthlyDeposit;
      totalDeposits += monthlyDeposit;
    }
    if (m === 0 || m % 6 === 0 || m === months) {
      points.push({
        month: m,
        year: Math.round((m / 12) * 10) / 10,
        balance: Math.round(balance * 100) / 100,
        deposits: Math.round(totalDeposits * 100) / 100,
      });
    }
  }
  return points;
}

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export function SavingsCalculator() {
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(10);
  const [opening, setOpening] = useState(1000);

  const data = useMemo(() => projectGrowth(monthly, years, opening), [
    monthly,
    years,
    opening,
  ]);
  const final = data[data.length - 1];
  const interest = final.balance - final.deposits;

  return (
    <section id="calculator" className="bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
            Compound the future
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            See how a Reserve Savings account grows.
          </h2>
          <p className="mt-3 text-muted-foreground">
            4.85% APY, FDIC-insured, no minimums. Move the sliders to model your plan.
          </p>
        </div>

        <div className="grid gap-8 rounded-3xl border border-border bg-card p-8 shadow-soft lg:grid-cols-[420px_1fr]">
          <div className="space-y-7">
            <Slider
              label="Opening deposit"
              value={opening}
              min={0}
              max={50000}
              step={250}
              format={currency}
              onChange={setOpening}
            />
            <Slider
              label="Monthly deposit"
              value={monthly}
              min={0}
              max={2500}
              step={25}
              format={currency}
              onChange={setMonthly}
            />
            <Slider
              label="Years"
              value={years}
              min={1}
              max={40}
              step={1}
              format={(n) => `${n} ${n === 1 ? "year" : "years"}`}
              onChange={setYears}
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Stat label="Total deposits" value={currency(final.deposits)} />
              <Stat
                label="Interest earned"
                value={currency(interest)}
                accent
              />
            </div>
            <motion.div
              key={final.balance}
              initial={{ scale: 0.96, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl bg-navy-900 p-5 text-white"
            >
              <p className="text-xs uppercase tracking-wider text-white/60">
                Projected balance in {years} {years === 1 ? "year" : "years"}
              </p>
              <p className="mt-1 font-display text-4xl font-semibold tracking-tight text-gold-300">
                {currency(final.balance)}
              </p>
            </motion.div>
          </div>

          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6E3FF3" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#6E3FF3" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="depositsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  unit="y"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v, name) => [currency(Number(v) || 0), String(name)]}
                  labelFormatter={(y) => `Year ${y}`}
                />
                <Area
                  type="monotone"
                  dataKey="deposits"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  fill="url(#depositsFill)"
                  name="Deposits"
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#6E3FF3"
                  strokeWidth={2.5}
                  fill="url(#balanceFill)"
                  name="Balance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  format: (n: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="font-mono text-sm font-semibold text-violet-500">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-violet-500"
      />
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 font-display text-xl font-semibold tracking-tight ${
          accent ? "text-violet-500" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
