import { useState, useRef, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";

type SelectFieldProps = {
  name: string;
  label: string;
  description?: string;
  className?: string;
  options: { value: string; label: string }[];
};

export default function SelectField({
  name,
  label,
  description,
  options,
  className,
}: SelectFieldProps) {
  const {
    control,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useFormContext();

  const [isOpen, setIsOpen] = useState(false);
  const defaultValue = getValues(name) || null;
  const [selected, setSelected] = useState<string | null>(defaultValue);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLLIElement | null)[]>([]);

  const errorMessage = errors[name]?.message as string | undefined;

  const toggleDropdown = () => {
    {
      setIsOpen((prev) => !prev);
      setHighlightedIndex(-1);
    }
  };
  const closeDropdown = () => setIsOpen(false);

  const handleSelect = (value: string) => {
    setSelected(value);
    setValue(name, value);
    trigger(name);
    closeDropdown();
  };

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
          (prev) => (prev - 1 + options.length) % options.length
        );
        e.preventDefault();
        break;
      case "Enter":
        handleSelect(options[highlightedIndex].value);
        setHighlightedIndex(0);
        e.preventDefault();
        break;
      case "Escape":
        closeDropdown();
        e.preventDefault();
        break;
    }
  };

  useEffect(() => {
    setSelected(getValues(name) || null);
  }, [getValues(name)]);

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

  useEffect(() => {
    if (isOpen && optionsRef.current[highlightedIndex]) {
      optionsRef.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className={`relative flex flex-col gap-0.5 ${className || ""}`}>
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={() => (
          <div
            ref={dropdownRef}
            className="relative"
            tabIndex={0}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-labelledby={name}
            onKeyDown={handleKeyDown}
          >
            <div
              className={`border px-3 py-2 rounded flex justify-between items-center cursor-pointer ${
                errorMessage ? "border-red-500" : "border-gray-300"
              }`}
              onClick={toggleDropdown}
            >
              <span className={selected ? "" : "text-gray-400"}>
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
                className="absolute top-full left-0 w-full bg-white shadow-lg rounded mt-1 z-20 border max-h-60 overflow-y-auto"
                role="listbox"
              >
                {options.map((option, index) => (
                  <li
                    key={option.value}
                    ref={(el) => {
                      if (el) {
                        optionsRef.current[index] = el;
                      }
                    }}
                    role="option"
                    aria-selected={option.value === selected}
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation;
                      handleSelect(option.value);
                    }}
                    className={`px-3 py-2 cursor-pointer flex justify-between items-center hover:bg-gray-100 ${
                      option.value === selected ? "bg-gray-200" : ""
                    } ${
                      highlightedIndex === index ? "border border-black" : ""
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
        )}
      />
      {description && (
        <p className="text-sm text-zinc-400 mt-1">{description}</p>
      )}
      {errorMessage && (
        <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
