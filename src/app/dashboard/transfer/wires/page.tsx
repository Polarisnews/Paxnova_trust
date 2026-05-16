import type { Metadata } from "next";
import { WireIntro } from "./WireIntro";

export const metadata: Metadata = { title: "Wires & global transfers" };

export default function WireIntroPage() {
  return <WireIntro />;
}
