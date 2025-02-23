import { ReactNode } from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  children: ReactNode;
  className?: string;
};

export default function Button({
  variant = "primary",
  children,
  className,
  ...rest
}: ButtonProps) {
  const getButtonStyle = (variant: string) => {
    switch (variant) {
      case "primary":
        return "bg-zinc-950 text-white hover:bg-zinc-800";
      case "secondary":
        return "bg-zinc-200 hover:bg-zinc-300 ";
      default:
        return "bg-zinc-950 text-white hover:bg-zinc-800";
    }
  };

  return (
    <button
      className={`px-3 py-1.5 rounded  ${getButtonStyle(
        variant
      )} ${className || ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}
