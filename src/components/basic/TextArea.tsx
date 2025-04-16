import { useFormContext } from "react-hook-form";

type TextAreaFieldProps = {
  name: string;
  label: string;
  description?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function TextAreaField({
  name,
  label,
  description,
  rows = 4,
  ...textareaProps
}: TextAreaFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const errorMessage = errors[name]?.message as string | undefined;

  const isDisabled = textareaProps.disabled;

  return (
    <div className={`flex flex-col gap-0.5 ${isDisabled ? "opacity-50" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <textarea
        id={name}
        {...register(name)}
        {...textareaProps}
        rows={rows}
        className={`rounded border px-3 py-1.5 hover:bg-zinc-50 ${
          errorMessage
            ? "border-red-500 bg-red-50 hover:!bg-red-100"
            : isDisabled ? "cursor-not-allowed" : "hover:border-zinc-900"
        }`}
      />
      {description && <p className="text-sm text-zinc-400">{description}</p>}
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
    </div>
  );
}
