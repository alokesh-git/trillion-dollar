import { Icon, type IconName } from "@/components/icon";
import { cn, initials } from "@/lib/utils";
import type { Tone } from "@/lib/data";

const appTones: Record<Tone, string> = {
  violet:
    "from-foreground/[0.09] to-foreground/[0.02] text-foreground/80 ring-foreground/10",
  sky: "from-foreground/[0.09] to-foreground/[0.02] text-foreground/80 ring-foreground/10",
  emerald:
    "from-foreground/[0.09] to-foreground/[0.02] text-foreground/80 ring-foreground/10",
  amber:
    "from-foreground/[0.09] to-foreground/[0.02] text-foreground/80 ring-foreground/10",
  rose: "from-foreground/[0.09] to-foreground/[0.02] text-foreground/80 ring-foreground/10",
  fuchsia:
    "from-foreground/[0.09] to-foreground/[0.02] text-foreground/80 ring-foreground/10",
  indigo:
    "from-foreground/[0.09] to-foreground/[0.02] text-foreground/80 ring-foreground/10",
  cyan: "from-foreground/[0.09] to-foreground/[0.02] text-foreground/80 ring-foreground/10",
};

const avatarTones: Record<Tone, string> = {
  violet: "bg-foreground/10 text-foreground/85",
  sky: "bg-foreground/10 text-foreground/85",
  emerald: "bg-foreground/10 text-foreground/85",
  amber: "bg-foreground/10 text-foreground/85",
  rose: "bg-foreground/10 text-foreground/85",
  fuchsia: "bg-foreground/10 text-foreground/85",
  indigo: "bg-foreground/10 text-foreground/85",
  cyan: "bg-foreground/10 text-foreground/85",
};

export function AppIcon({
  name,
  tone = "violet",
  imageUrl,
  className,
  iconClassName,
}: {
  name: IconName;
  tone?: Tone;
  imageUrl?: string;
  className?: string;
  iconClassName?: string;
}) {
  const trimmedUrl = imageUrl?.trim();

  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ring-1 ring-inset",
        appTones[tone],
        className,
      )}
    >
      {trimmedUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={trimmedUrl}
          alt=""
          className={cn("size-full object-cover", iconClassName)}
        />
      ) : (
        <Icon name={name} className={cn("size-5", iconClassName)} />
      )}
    </div>
  );
}

export function Avatar({
  name,
  tone = "violet",
  className,
}: {
  name: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ring-inset ring-white/10",
        avatarTones[tone],
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}
