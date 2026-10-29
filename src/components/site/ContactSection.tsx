import type { Restaurant } from "@/types/database";
import { Section } from "@/components/ui/Section";
import { ArrowUpRight, Camera, Mail, Phone, Share2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ContactSectionProps {
  restaurant: Restaurant;
}

export function ContactSection({ restaurant }: ContactSectionProps) {
  return (
    <Section id="contact" spacing="py-20 md:py-32">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-20">
        <div>
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            <span className="h-px w-8 bg-[var(--color-primary)]" />À très bientôt
          </p>
          <h2 className="mt-6 max-w-2xl font-[family-name:var(--font-title)] text-4xl font-normal leading-[1.05] tracking-[-0.035em] text-[var(--color-secondary)] sm:text-5xl lg:text-6xl">Le plaisir de vous recevoir</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-stone-700">Pour une demande particulière ou pour choisir votre prochain moment à table, notre équipe est à votre écoute.</p>
          <div className="mt-7"><ButtonLink href="/reservation" size="lg" icon={<ArrowUpRight className="h-4 w-4" />}>Réserver une table</ButtonLink></div>
        </div>
        <Card className="space-y-1 rounded-2xl border-stone-200/80 p-5 shadow-sm sm:p-6">
          {restaurant.phone && <a href={`tel:${restaurant.phone.replace(/\s+/g, "")}`} className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-stone-200"><span className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-[var(--color-primary)]"><Phone className="h-4 w-4" /></span><span><span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-600">Téléphone</span><span className="mt-1 block text-sm font-medium text-[var(--color-secondary)]">{restaurant.phone}</span></span></a>}
          {restaurant.email && <a href={`mailto:${restaurant.email}`} className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-stone-200"><span className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-[var(--color-primary)]"><Mail className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-600">E-mail</span><span className="mt-1 block break-all text-sm font-medium text-[var(--color-secondary)]">{restaurant.email}</span></span></a>}
          {(restaurant.instagram_url || restaurant.facebook_url) && <div className="flex flex-wrap gap-2 border-t border-black/[0.08] pt-4">
            {restaurant.instagram_url && <a href={restaurant.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"><Camera className="h-3.5 w-3.5" />Instagram</a>}
            {restaurant.facebook_url && <a href={restaurant.facebook_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"><Share2 className="h-3.5 w-3.5" />Facebook</a>}
          </div>}
        </Card>
      </div>
    </Section>
  );
}
