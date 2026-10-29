"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { compressPhoto } from "@/lib/image-compression";
import { Button } from "@/components/ui/Button";
import { Camera } from "lucide-react";

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
    <div className="min-w-0">
      <p className="block text-sm font-semibold text-slate-700">{label}</p>
      <div className="mt-2 flex items-center gap-4 rounded-xl border border-slate-300 bg-slate-100/60 p-3">
        {value ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-200">
            <Image src={value} alt="" fill className="object-cover" sizes="80px" />
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 ring-1 ring-inset ring-slate-200">
            <Camera className="h-7 w-7" />
          </div>
        )}
        <div className="flex min-w-0 flex-col items-start gap-1.5">
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            variant="secondary"
            size="sm"
            loading={uploading}
          >
            {value ? "Changer la photo" : "Ajouter une photo"}
          </Button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="rounded-md px-1 py-0.5 text-xs font-medium text-slate-700 transition-colors hover:text-rose-700">
              Retirer l’image
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
