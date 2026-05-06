import { cn } from "@/lib/utils";

export default function Label({
  title,
  id,
  labelClass,
  required,
}: {
  title: string;
  id: string;
  labelClass?: string;
  required: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={cn("tracking-tight text-neutral-400", labelClass)}
    >
      {title}
    </label>
  );
}
