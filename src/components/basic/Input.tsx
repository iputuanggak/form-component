import { useFormContext } from "react-hook-form";

type InputFieldProps = {
  name: string;
  label: string;
  description?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function InputField({
  name,
  label,
  description,
  className,
  ...inputProps
}: InputFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors[name]?.message as string | undefined;

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    if (inputProps.type === "number") {
      e.currentTarget.blur(); // Remove focus to prevent value change
    }
  };

  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        {...register(name)}
        {...inputProps}
        onWheel={handleWheel}
        className={`rounded border px-3 py-1.5 hover:bg-zinc-50 ${
          errorMessage ? "border-red-500 bg-red-50 hover:!bg-red-100" : "hover:border-zinc-900"
        } ${className || ""}`}
      />
      {description && <p className="text-sm text-zinc-400">{description}</p>}
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  );
}
