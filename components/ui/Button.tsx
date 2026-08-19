import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  showArrow?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  showArrow = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary"
          ? "bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md"
          : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50",
        className
      )}
      {...props}
    >
      {children}
      {showArrow && variant === "primary" && (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      )}
    </button>
  );
}
