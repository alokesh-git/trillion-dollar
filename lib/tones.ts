import type { Tone } from "@/lib/data";

const neutral = "bg-foreground/[0.07] text-foreground/75";

export const softTone: Record<Tone, string> = {
  violet: neutral,
  sky: neutral,
  emerald: neutral,
  amber: neutral,
  rose: neutral,
  fuchsia: neutral,
  indigo: neutral,
  cyan: neutral,
};
