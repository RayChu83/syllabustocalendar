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
      className={cn(
        "font-medium tracking-wide text-lg text-neutral-300",
        labelClass
      )}
    >
      {title}
    </label>
  );
}
