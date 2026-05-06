import { cn } from "@/lib/utils";

export default function Input({
  placeholder,
  id,
  error,
  setError,
  showErrorMsg,
  value,
  setValue,
  type,
  inputClass,
  max,
}: {
  placeholder: string;
  id: string;
  error?: string;
  setError: (value: string) => void;
  showErrorMsg: boolean;
  value: string;
  setValue: (value: string) => void;
  type: "input" | "textarea";
  inputClass?: string;
  max: number;
}) {
  return (
    <div className="w-full space-y-1.5">
      {type === "input" ? (
        <input
          type="text"
          className={cn(
            "bg-zinc-100 text-neutral-400 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border outline-2",
            error
              ? "outline-red-400/60"
              : "outline-transparent focus:outline-zinc-400/60",
            inputClass,
          )}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(
              e.target.value.length > max
                ? "Maximum character limit reached"
                : "",
            );
          }}
          placeholder={placeholder}
          id={id}
        />
      ) : (
        <textarea
          className={cn(
            "bg-zinc-100 text-neutral-400 px-4 py-2 w-full rounded-sm outline-offset-2 transition-all border outline-2 mb-0",
            error
              ? "outline-red-400/60"
              : "outline-transparent focus:outline-zinc-500/60",
            inputClass,
          )}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(
              e.target.value.length > max
                ? "Maximum character limit reached"
                : "",
            );
          }}
          placeholder={placeholder}
          id={id}
        />
      )}
      {showErrorMsg && error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}
