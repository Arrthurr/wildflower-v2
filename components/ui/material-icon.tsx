import { cn } from "@/lib/utils";

type MaterialIconProps = {
  name: string;
  className?: string;
  fill?: boolean;
};

export function MaterialIcon({ name, className, fill = false }: MaterialIconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined inline-block leading-none",
        fill && "filled",
        className,
      )}
      style={
        fill
          ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
          : { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
      }
      aria-hidden
    >
      {name}
    </span>
  );
}
