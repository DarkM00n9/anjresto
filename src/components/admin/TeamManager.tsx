"use client";

import { useState, useTransition } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { changeTeamRole, inviteTeamMember, removeTeamMember } from "@/app/admin/actions/team";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface TeamMember {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "owner" | "manager" | "staff";
}

const ROLE_HELP = {
  manager: "Gérant : réservations, carte, horaires, clients, statistiques.",
  staff: "Employé : voit et gère uniquement les réservations.",
} as const;

export function TeamManager({ members }: { members: TeamMember[] }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"manager" | "staff">("staff");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function invite() {
    setMessage(null);
    startTransition(async () => {
      const res = await inviteTeamMember({ email, full_name: name, role });
      if (res.success) {
        setEmail("");
        setName("");
        setMessage("Invitation envoyée.");
      } else setMessage(res.error ?? "Erreur.");
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900"><UserPlus className="h-4 w-4 text-indigo-600" />Ajouter quelqu&apos;un</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input id="team-name" label="Prénom / nom" value={name} onChange={(e) => setName(e.target.value)} />
          <Input id="team-email" label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["staff", "manager"] as const).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={role === r}
              onClick={() => setRole(r)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold ${role === r ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"}`}
            >
              {r === "staff" ? "Employé" : "Gérant"}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-700">{ROLE_HELP[role]}</p>
        <Button type="button" variant="accent" className="mt-3" loading={pending} disabled={!email} onClick={invite}>Envoyer l&apos;invitation</Button>
        {message && <p role="status" className="mt-2 text-xs font-medium text-slate-800">{message}</p>}
      </div>

      <ul className="space-y-2">
        {members.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{m.full_name || m.email}</p>
              {m.full_name && <p className="truncate text-xs text-slate-700">{m.email}</p>}
            </div>
            {m.role === "owner" ? (
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">Propriétaire</span>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={m.role}
                  disabled={pending}
                  onChange={(e) => startTransition(() => changeTeamRole(m.id, e.target.value as "manager" | "staff"))}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
                  aria-label="Rôle"
                >
                  <option value="staff">Employé</option>
                  <option value="manager">Gérant</option>
                </select>
                <button
                  type="button"
                  aria-label="Retirer l'accès"
                  disabled={pending}
                  onClick={() => window.confirm("Retirer l'accès de cette personne ?") && startTransition(() => removeTeamMember(m.id))}
                  className="rounded-full border border-rose-300 p-2 text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
