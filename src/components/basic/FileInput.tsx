import React, { useRef, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";

interface FileInputProps {
  name: string;
  label?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  accept?: string[]; // e.g. ['image/png', 'application/pdf']
}

export default function FileInput({
  name,
  label,
  maxSizeMB = 5,
  maxFiles,
  accept,
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
        error = `File type "${file.type}" not accepted.`;
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
    onChange: (files: File[]) => void
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
        <div className="space-y-2">
          {label ? <label htmlFor={name}>{label}</label> : null}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition 
              ${
                errors[name]
                  ? "border-red-500 bg-red-50 "
                  : "border-gray-300 hover:border-blue-500 "
              } 
              ${
                dragActive
                  ? "border-blue-500 bg-blue-50 "
                  : "border-gray-300 hover:border-blue-500 "
              }
               ${
                 maxFiles &&
                 value?.length >= maxFiles &&
                 "opacity-50 cursor-not-allowed "
               }`}
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
            />
            <p className="text-sm text-gray-500">
              Drag & drop files here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              {accept ? `(Format ${mimeTypesToExtensions(accept)})` : ""}
            </p>
            <p className="text-sm text-gray-500">
              {maxFiles ? `(Max ${maxFiles} files)` : ""}
            </p>
            {errors[name] && (
              <p className="text-sm text-red-500 mt-1">
                {(errors[name] as any).message}
              </p>
            )}
            {rejectionError && (
              <p className="text-sm text-orange-500 mt-1">{rejectionError}</p>
            )}
          </div>
          {/* File List */}
          <ul className="space-y-1 text-sm">
            {(value || []).map((file: File, idx: number) => (
              <li
                key={idx}
                className="flex items-center justify-between border p-2 rounded-md"
              >
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB &middot;{" "}
                    {file.type || "unknown"}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => {
                    const newFiles = [...value];
                    newFiles.splice(idx, 1);
                    onChange(newFiles);
                    setRejectionError(null);
                  }}
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
