"use client";

import { useState, useTransition } from "react";
import { AlertCircle, FileText, RotateCcw, Trash2, WandSparkles } from "lucide-react";
import { parseMenuText, type ParsedCategory } from "@/lib/menu-import/parser";
import { importMenu } from "@/app/superadmin/actions/restaurants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function MenuImportReview({ restaurantId }: { restaurantId: string }) {
  const [text, setText] = useState("");
  const [categories, setCategories] = useState<ParsedCategory[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleParse() {
    setCategories(parseMenuText(text));
  }

  function updateCategoryName(index: number, name: string) {
    setCategories((prev) => prev!.map((category, i) => (i === index ? { ...category, name } : category)));
  }

  function removeCategory(index: number) {
    setCategories((prev) => prev!.filter((_, i) => i !== index));
  }

  function updateItem(
    categoryIndex: number,
    itemIndex: number,
    field: "name" | "description" | "price",
    value: string,
  ) {
    setCategories((prev) =>
      prev!.map((category, ci) =>
        ci !== categoryIndex
          ? category
          : {
              ...category,
              items: category.items.map((item, ii) =>
                ii !== itemIndex ? item : { ...item, [field]: field === "price" ? Number(value) || 0 : value },
              ),
            },
      ),
    );
  }

  function removeItem(categoryIndex: number, itemIndex: number) {
    setCategories((prev) =>
      prev!.map((category, ci) => (ci !== categoryIndex ? category : { ...category, items: category.items.filter((_, ii) => ii !== itemIndex) })),
    );
  }

  function handleSave() {
    if (!categories) return;
    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          categories: categories.map((category) => ({
            name: category.name,
            items: category.items.map((item) => ({
              name: item.name,
              price: item.price,
              description: item.description ?? undefined,
            })),
          })),
        };
        await importMenu(restaurantId, payload);
      } catch {
        setError("Une erreur est survenue lors de l’enregistrement.");
      }
    });
  }

  if (!categories) {
    return (
      <Card className="space-y-5 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><FileText className="h-5 w-5" /></span>
          <div><h2 className="text-sm font-semibold text-slate-900">Texte de la carte</h2><p className="mt-0.5 text-xs text-slate-700">Copié depuis un PDF ou saisi à la main.</p></div>
        </div>
        <Textarea
          id="menu-import-text"
          label="Contenu à analyser"
          rows={14}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ENTRÉES\nSoupe du jour — 8 €\n\nPLATS\nPoisson grillé — 19 €"
          hint="L’analyse repère les catégories, noms de plats et prix. Tu pourras tout corriger ensuite."
        />
        <Button type="button" onClick={handleParse} disabled={!text.trim()} variant="accent" size="lg" className="w-full" icon={<WandSparkles className="h-4 w-4" />}>Analyser la carte</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Relis les résultats et corrige-les avant l’import. L’analyse automatique peut confondre certains prix ou intitulés.</p>
      </div>

      {categories.length === 0 && <Card className="py-8 text-center text-sm text-slate-700">Aucune catégorie détectée. Recommence avec une autre mise en forme.</Card>}

      {categories.map((category, ci) => (
        <Card key={ci} className="space-y-4 p-4 sm:p-5">
          <div className="flex items-end gap-2">
            <Input id={`import-category-${ci}`} label={`Catégorie ${ci + 1}`} value={category.name} onChange={(e) => updateCategoryName(ci, e.target.value)} />
            <IconButton type="button" tone="danger" onClick={() => removeCategory(ci)} aria-label={`Supprimer la catégorie ${category.name}`} className="mb-0.5 h-10 w-10"><Trash2 className="h-4 w-4" /></IconButton>
          </div>

          {category.items.length === 0 ? <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">Aucun plat détecté dans cette catégorie.</p> : (
            <ul className="divide-y divide-slate-200">
              {category.items.map((item, ii) => (
                <li key={ii} className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
                  <Input id={`import-item-${ci}-${ii}`} label="Nom du plat" value={item.name} onChange={(e) => updateItem(ci, ii, "name", e.target.value)} />
                  <Input id={`import-price-${ci}-${ii}`} label="Prix (€)" type="number" step="0.1" value={item.price} onChange={(e) => updateItem(ci, ii, "price", e.target.value)} />
                  <IconButton type="button" tone="danger" onClick={() => removeItem(ci, ii)} aria-label={`Supprimer ${item.name}`} className="hidden h-10 w-10 sm:flex"><Trash2 className="h-4 w-4" /></IconButton>
                  <Input id={`import-description-${ci}-${ii}`} label="Description (optionnelle)" value={item.description ?? ""} onChange={(e) => updateItem(ci, ii, "description", e.target.value)} className="sm:col-span-2" />
                  <button type="button" onClick={() => removeItem(ci, ii)} className="inline-flex items-center gap-1.5 self-start rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 sm:hidden"><Trash2 className="h-3.5 w-3.5" /> Retirer ce plat</button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button type="button" onClick={handleSave} loading={isPending} disabled={isPending || categories.length === 0} variant="accent" size="lg" className="sm:flex-1">Enregistrer la carte</Button>
        <Button type="button" onClick={() => setCategories(null)} variant="secondary" icon={<RotateCcw className="h-4 w-4" />}>Recommencer</Button>
      </div>
    </div>
  );
}
