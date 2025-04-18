import { useState, useRef, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";

type SelectFieldProps = {
  name: string;
  label: string;
  description?: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
};

export default function SelectField({
  name,
  label,
  description,
  options,
  disabled = false,
}: SelectFieldProps) {
  const {
    control,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useFormContext();

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(
    getValues(name) || null,
  );
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLLIElement | null)[]>([]);

  const errorMessage = errors[name]?.message as string | undefined;

  const handleSelect = (value: string) => {
    setSelected(value);
    setValue(name, value);
    trigger(name);
    closeDropdown();
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => {
      const opening = !prev;
      if (opening) {
        const selectedIndex = options.findIndex(
          (opt) => opt.value === selected,
        );
        setHighlightedIndex(selectedIndex !== -1 ? selectedIndex : -1);
      } else {
        setHighlightedIndex(-1);
      }
      return opening;
    });
  };

  const closeDropdown = () => setIsOpen(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        toggleDropdown();
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        setHighlightedIndex((prev) => (prev + 1) % options.length);
        e.preventDefault();
        break;
      case "ArrowUp":
        setHighlightedIndex(
          (prev) => (prev - 1 + options.length) % options.length,
        );
        e.preventDefault();
        break;
      case "Enter":
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelect(options[highlightedIndex].value);
        }
        e.preventDefault();
        break;
      case "Escape":
        closeDropdown();
        e.preventDefault();
        break;
    }
  };

  useEffect(() => {
    const selectedIndex = options.findIndex((opt) => opt.value === selected);
    if (isOpen && selectedIndex !== -1) {
      setHighlightedIndex(selectedIndex);
    }
  }, [isOpen]);

  useEffect(() => {
    if (
      isOpen &&
      highlightedIndex !== -1 &&
      optionsRef.current[highlightedIndex]
    ) {
      optionsRef.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex, isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      render={() => (
        <div
          className={`relative flex flex-col gap-0.5 ${disabled ? "opacity-50" : ""}`}
        >
          <label htmlFor={name}>{label}</label>
          <div
            ref={dropdownRef}
            className="relative"
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            aria-controls=""
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-labelledby={name}
            onKeyDown={disabled ? () => {} : handleKeyDown}
          >
            <div
              className={`flex cursor-pointer items-center justify-between rounded border px-3 py-2  ${
                errorMessage
                  ? "border-red-500 bg-red-50 hover:!bg-red-100"
                  : disabled
                    ? "cursor-not-allowed"
                    : "hover:border-zinc-900 hover:bg-zinc-50"
              }`}
              onClick={disabled ? () => {} : toggleDropdown}
            >
              <span className={selected ? "" : "text-zinc-400"}>
                {selected
                  ? options.find((o) => o.value === selected)?.label
                  : `Select a ${label}`}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#09090b"
              >
                <path d="M480-360 280-560h400L480-360Z" />
              </svg>
            </div>

            {isOpen && (
              <ul
                className="absolute left-0 top-full z-20 mt-1 max-h-60 w-full overflow-y-auto rounded border bg-white shadow-lg"
                role="listbox"
              >
                {options.map((option, index) => (
                  <li
                    key={option.value}
                    ref={(el) => {
                      optionsRef.current[index] = el;
                    }}
                    role="option"
                    aria-selected={option.value === selected}
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option.value);
                    }}
                    className={`flex cursor-pointer items-center justify-between rounded px-3 py-2 hover:bg-zinc-100 ${
                      option.value === selected ? "bg-zinc-200" : ""
                    } ${
                      highlightedIndex === index ? "border border-zinc-900" : ""
                    }`}
                  >
                    {option.label}
                    {option.value === selected && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="#09090b"
                      >
                        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
                      </svg>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {description && (
            <p className="text-sm text-zinc-400">{description}</p>
          )}
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      )}
    />
  );
}
