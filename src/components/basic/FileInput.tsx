import React, { useRef, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";

interface FileInputProps {
  name: string;
  label?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  accept?: string[]; // e.g. ['image/png', 'application/pdf']
  disabled?: boolean;
}

function mimeTypesToExtensions(mimeTypes: string[]): string {
  return mimeTypes
    .map((type) => type.split("/")[1]) // Extract the part after the slash
    .join(", ");
}

function mimeToExtension(mime: string): string {
  return mime.split("/")[1];
}

export default function FileInput({
  name,
  label,
  maxSizeMB = 999,
  maxFiles,
  accept,
  disabled = false,
}: FileInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileKey = (file: File) => `${file.name}-${file.size}`;

  const filterFiles = (files: File[], existingFiles: File[]) => {
    const existingKeys = new Set(existingFiles.map(fileKey));
    const allowedSlots = maxFiles ? maxFiles - existingFiles.length : Infinity;
    const accepted: File[] = [];
    let error = "";

    for (const file of files) {
      if (accepted.length >= allowedSlots) {
        error = `You can only upload up to ${maxFiles} file(s).`;
        break;
      }
      if (existingKeys.has(fileKey(file))) {
        error = `Duplicate file "${file.name}" was skipped.`;
        continue;
      }
      if (accept && !accept.includes(file.type)) {
        error = `File type "${mimeToExtension(file.type)}" not accepted.`;
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        error = `File "${file.name}" exceeds the ${maxSizeMB}MB size limit.`;
        continue;
      }
      accepted.push(file);
    }

    setRejectionError(error || null);
    return accepted;
  };

  const addFiles = (
    incoming: File[],
    current: File[],
    onChange: (files: File[]) => void,
  ) => {
    const toAdd = filterFiles(incoming, current);
    if (toAdd.length > 0) {
      onChange([...current, ...toAdd]);
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={[]}
      render={({ field: { onChange, value } }) => (
        <div
          className={`flex flex-col gap-0.5 ${disabled ? "opacity-50" : ""}`}
        >
          {label ? <label htmlFor={name}>{label}</label> : null}
          <div
            className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded border border-dashed p-4 transition ${
              errors[name]
                ? "!border-red-500 !bg-red-50 hover:!bg-red-100"
                : "hover:border-zinc-900 hover:bg-zinc-50"
            } ${
              maxFiles &&
              value?.length >= maxFiles &&
              "!cursor-not-allowed !opacity-50 hover:!border-transparent hover:!bg-transparent"
            } ${
              dragActive
                ? "!border-zinc-900 !bg-zinc-50"
                : "hover:border-zinc-900 hover:bg-zinc-100"
            } ${
              disabled &&
              "!cursor-not-allowed hover:!border-transparent hover:!bg-transparent"
            }`}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (
                (e.key === "Enter" || e.key === " ") &&
                (!maxFiles || value.length < maxFiles)
              ) {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onClick={() => {
              if (!maxFiles || value.length < maxFiles) {
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (!maxFiles || value.length < maxFiles) {
                const droppedFiles = Array.from(e.dataTransfer.files);
                addFiles(droppedFiles, value, onChange);
              }
            }}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const selected = Array.from(e.target.files || []);
                addFiles(selected, value, onChange);
                e.target.value = "";
              }}
              accept={accept?.join(",")}
              disabled={disabled}
            />
            <p className="text-zinc-500">
              Drag & drop files here, or click to browse
            </p>
            <p className="text-sm text-zinc-400">
              {accept ? `accepts: ${mimeTypesToExtensions(accept)}` : ""}
              <span className="text-sm text-zinc-400">
                {maxFiles ? ` (max ${maxFiles} files)` : ""}
              </span>
            </p>
            {rejectionError && (
              <p className="mt-1 text-sm text-orange-500">{rejectionError}</p>
            )}
            {errors[name] && (
              <p className="mt-1 text-sm text-red-500">
                {(errors[name] as any).message}
              </p>
            )}
          </div>
          {/* File List */}
          <ul className="space-y-0.5 text-sm">
            {(value || []).map((file: File, idx: number) => (
              <li
                key={idx}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-zinc-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB &middot;{" "}
                    {file.type || "unknown"}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={
                    disabled
                      ? () => {}
                      : () => {
                          const newFiles = [...value];
                          newFiles.splice(idx, 1);
                          onChange(newFiles);
                          setRejectionError(null);
                        }
                  }
                  tabIndex={disabled ? -1 : 0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#09090b"
                  >
                    <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    />
  );
}
