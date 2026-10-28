"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { compressPhoto } from "@/lib/image-compression";

interface PhotoUploadFieldProps {
  restaurantId: string;
  folder: string; // ex: "menu-items", "restaurant"
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function PhotoUploadField({
  restaurantId,
  folder,
  value,
  onChange,
  label = "Photo",
}: PhotoUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const compressed = await compressPhoto(file);
      const supabase = createClient();
      const extension = compressed.type === "image/png" ? "png" : "jpg";
      const path = `${restaurantId}/${folder}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("restaurant-media")
        .upload(path, compressed, { contentType: compressed.type, upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("restaurant-media").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch {
      setError("Échec de l'envoi de la photo. Réessaie.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700">{label}</label>
      <div className="mt-2 flex items-center gap-4">
        {value ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-neutral-100">
            <Image src={value} alt="" fill className="object-cover" sizes="80px" />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-neutral-100 text-2xl">
            📷
          </div>
        )}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {uploading ? "Envoi..." : value ? "Changer" : "Ajouter une photo"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="text-xs text-neutral-500 underline">
              Retirer
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
