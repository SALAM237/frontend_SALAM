'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserPlus, CheckCircle2, CreditCard, ArrowLeft,
  Upload, FileSpreadsheet, AlertTriangle, Loader2,
  CheckSquare2, Square, Users, MailCheck, MailX, SkipForward,
  UserCheck,
} from 'lucide-react';
import Papa from 'papaparse';
import { MemberCard, type MemberCardData } from '@/components/portal/MemberCard';
import { useAdminMember, useCreateMember, useImportMembersCSV, useUpdateMember, type CsvImportMember, type ImportResult } from '@/lib/api/members';
import { formatFirstName, formatFullName, formatLastName } from '@/lib/format-name';
import { AnimatedTabBar } from '@/components/ui/AnimatedTabBar';

/* ─── Types ─────────────────────────────────────────────── */
type Mode      = 'single' | 'csv';
type FormState = {
  gender: string;
  firstName: string; lastName: string; email: string; phone: string;
  city: string; country: string; role: string; antenne: string; motivation: string;
  promotionYear: string;
};
type CsvRawRow = Record<string, string>;
type MappedRow = {
  raw:          CsvRawRow;
  firstName:    string;
  lastName:     string;
  email:        string;
  phone:        string;
  bureauPoste:  string;
  gender:       string;
  promotionYear: string;
  canCreate:    boolean;
};

/* ─── Constants ─────────────────────────────────────────── */
const ROLES    = ['Membre actif', 'Étudiant', 'Alumni', 'Bureau', 'Conseil des sages'];
const ANTENNES = ['Paris', 'Lyon', 'Bordeaux', 'Yaoundé', 'Douala', 'Casablanca', 'Rabat', 'Autre'];

/* ─── Helpers ───────────────────────────────────────────── */
function generateId() {
  const year = new Date().getFullYear();
  const num  = String(Math.floor(Math.random() * 900) + 100).padStart(4, '0');
  return `SALAM-${year}-${num}`;
}

/** Normalise un header CSV : minuscules, sans accents, sans ponctuation */
function norm(s: string): string {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Cherche la valeur d'un champ parmi plusieurs variantes de headers */
function detect(row: CsvRawRow, variants: string[]): string {
  for (const [key, value] of Object.entries(row)) {
    const k = norm(key);
    if (variants.some(v => k.includes(norm(v)))) return String(value ?? '').trim();
  }
  return '';
}

function cleanGenericBureauTitle(value?: string | null) {
  return (value ?? '')
    .replace(/\s*\(e\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapRow(row: CsvRawRow): MappedRow {
  const firstName    = detect(row, ['prenom', 'firstname', 'first_name', 'prénom', 'given']);
  const lastName     = detect(row, ['nom', 'lastname', 'last_name', 'family_name', 'surname']);
  const email        = detect(row, ['email', 'mail', 'courriel', 'e-mail']);
  const phone        = detect(row, ['telephone', 'tel', 'phone', 'portable', 'mobile', 'whatsapp']);
  const bureauPoste  = cleanGenericBureauTitle(detect(row, ['poste', 'fonction', 'role', 'position', 'titre', 'bureau']));
  const promotionYear = detect(row, ['promotion', 'promotionnaire', 'annee', 'annee', 'year', 'promo', 'cohorte']);
  const genderRaw    = detect(row, ['civilite', 'civilite', 'genre', 'gender', 'sexe']);
  const g = genderRaw.toLowerCase();
  const gender = g.startsWith('f') || g === 'mme' || g === 'madame' ? 'femme'
    : g.startsWith('h') || g === 'm' || g === 'mr' || g === 'monsieur' ? 'homme'
    : '';
  return {
    raw: row, firstName, lastName, email, phone, bureauPoste, gender, promotionYear,
    canCreate: !!(firstName && lastName && email),
  };
}

/* ─── Sub-components ────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, type = 'text', required = false }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        className="h-10 w-full rounded-xl border border-neutral-200 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">{label}</label>
      <select
        value={value} onChange={onChange}
        className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────── */
export default function NouveauAdherentPage() {
  const router = useRouter();
  const [editId, setEditId] = useState('');
  const isEditMode = !!editId;

  /* ── Mode ────────────────────────────────────── */
  const [mode, setMode] = useState<Mode>('single');

  /* ── Single member states ────────────────────── */
  const [step,     setStep] = useState<'form' | 'preview' | 'done'>('form');
  const [generatedId]       = useState(generateId);
  const [form, setForm] = useState<FormState>({
    gender: '', firstName: '', lastName: '', email: '', phone: '',
    city: '', country: 'Cameroun', role: 'Membre actif', antenne: 'Paris', motivation: '',
    promotionYear: '',
  });
  const createMember = useCreateMember();
  const updateMember = useUpdateMember(editId);
  const { data: editData, isLoading: isEditLoading } = useAdminMember(editId);
  const editingMember = editData?.data;

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('edit') ?? '';
    if (!id) return;
    setEditId(id);
    setMode('single');
  }, []);

  useEffect(() => {
    if (!editingMember) return;
    setForm(prev => ({
      ...prev,
      gender: editingMember.gender ?? '',
      firstName: editingMember.firstName ?? '',
      lastName: editingMember.lastName ?? '',
      email: editingMember.email ?? '',
      phone: editingMember.phone ?? '',
      promotionYear: editingMember.promotionYear ? String(editingMember.promotionYear) : '',
    }));
  }, [editingMember]);

  /* ── CSV states ──────────────────────────────── */
  const [csvHeaders,    setCsvHeaders]    = useState<string[]>([]);
  const [csvRows,       setCsvRows]       = useState<MappedRow[]>([]);
  const [selectedSet,   setSelectedSet]   = useState<Set<number>>(new Set());
  const [csvError,      setCsvError]      = useState<string | null>(null);
  const [importResult,  setImportResult]  = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvTopScrollRef = useRef<HTMLDivElement>(null);
  const csvTableScrollRef = useRef<HTMLDivElement>(null);
  const importCSV    = useImportMembersCSV();
  const csvTableMinWidth = 280 + csvHeaders.length * 150;

  const syncCsvScroll = (source: 'top' | 'table') => {
    const top = csvTopScrollRef.current;
    const table = csvTableScrollRef.current;
    if (!top || !table) return;
    if (source === 'top') table.scrollLeft = top.scrollLeft;
    else top.scrollLeft = table.scrollLeft;
  };

  /* ── Handlers single ─────────────────────────── */
  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const cardData: MemberCardData = {
    id: editingMember?.memberId ?? generatedId,
    firstName: form.firstName || 'Prénom',
    lastName:  form.lastName  || 'Nom',
    gender:    (form.gender as 'homme' | 'femme') || undefined,
    role: form.role, antenne: form.antenne, year: new Date().getFullYear(),
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gender || !form.firstName || !form.lastName || !form.email || !form.promotionYear) return;
    setStep('preview');
  };

  const handleValidate = async () => {
    try {
      if (isEditMode) {
        await updateMember.mutateAsync({
          firstName:     form.firstName,
          lastName:      form.lastName,
          email:         form.email,
          phone:         form.phone || undefined,
          gender:        (form.gender as 'homme' | 'femme') || undefined,
          promotionYear: form.promotionYear ? Number(form.promotionYear) : undefined,
        });
        router.push(`/admin/adherents/${editId}`);
        return;
      }

      await createMember.mutateAsync({
        firstName:     form.firstName,
        lastName:      form.lastName,
        email:         form.email,
        phone:         form.phone || undefined,
        memberStatus:  'active',
        gender:        (form.gender as 'homme' | 'femme') || undefined,
        promotionYear: form.promotionYear ? Number(form.promotionYear) : undefined,
      });
      setStep('done');
    } catch {
      // Les hooks API affichent deja le toast d'erreur.
    }
  };

  /* ── Handlers CSV ────────────────────────────── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setCsvError(null);
    setSelectedSet(new Set());
    setImportResult(null);

    Papa.parse<CsvRawRow>(file, {
      header:          true,
      skipEmptyLines:  true,
      encoding:        'UTF-8',
      transformHeader: h => h.trim(),
      complete: result => {
        const headers = result.meta.fields ?? [];
        const rows    = result.data ?? [];
        if (!headers.length || !rows.length) {
          setCsvError('Le fichier CSV est vide ou ne contient pas d\'en-têtes de colonnes.');
          return;
        }
        setCsvHeaders(headers);
        setCsvRows(rows.map(mapRow));
      },
      error: () => setCsvError('Impossible de lire ce fichier. Vérifiez qu\'il s\'agit bien d\'un CSV valide.'),
    });
  };

  const toggleRow = (i: number) => {
    if (!csvRows[i].canCreate) return;
    setSelectedSet(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const toggleAll = () => {
    const creatableIndices = csvRows.map((r, i) => (r.canCreate ? i : -1)).filter(i => i >= 0);
    if (selectedSet.size === creatableIndices.length) {
      setSelectedSet(new Set());
    } else {
      setSelectedSet(new Set(creatableIndices));
    }
  };

  const handleImport = async () => {
    if (selectedSet.size === 0) { setCsvError('Sélectionnez au moins une ligne.'); return; }
    setCsvError(null);

    const members: CsvImportMember[] = [...selectedSet].map(i => ({
      firstName:    csvRows[i].firstName,
      lastName:     csvRows[i].lastName,
      email:        csvRows[i].email,
      phone:        csvRows[i].phone        || undefined,
      bureauPoste:  cleanGenericBureauTitle(csvRows[i].bureauPoste) || undefined,
      gender:       (csvRows[i].gender as 'homme' | 'femme') || undefined,
      promotionYear: csvRows[i].promotionYear ? Number(csvRows[i].promotionYear) : undefined,
    }));

    importCSV.mutate(members, {
      onSuccess: res => setImportResult((res as any).data as ImportResult),
    });
  };

  const resetCsv = () => {
    setCsvHeaders([]); setCsvRows([]); setSelectedSet(new Set());
    setCsvError(null); setImportResult(null);
  };

  if (isEditMode && isEditLoading) return (
    <div className="flex min-h-[300px] items-center justify-center">
      <Loader2 size={24} className="animate-spin text-emerald-600" />
    </div>
  );

  /* ── Écran done (saisie manuelle) ────────────── */
  if (mode === 'single' && step === 'done') return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={40} className="text-emerald-600" />
        </div>
      </div>
      <h2 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Membre créé avec succès !</h2>
      <p className="mt-2 text-sm text-neutral-500">
        La fiche de <strong>{formatFullName(form.firstName, form.lastName)}</strong> a été enregistrée.<br />
        Numéro d&apos;adhérent : <span className="font-mono font-bold text-emerald-700">{generatedId}</span>
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="mx-auto w-full max-w-[400px]"><MemberCard member={cardData} /></div>
        <div className="flex gap-3">
          <Link href="/admin/adherents" className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 hover:border-neutral-300">
            <ArrowLeft size={14} /> Retour à la liste
          </Link>
          <Link href="/admin/cartes" className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700">
            <CreditCard size={14} /> Gérer les cartes
          </Link>
        </div>
      </div>
    </div>
  );

  /* ── Écran preview (saisie manuelle) ─────────── */
  if (mode === 'single' && step === 'preview') return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Aperçu de la fiche</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          {isEditMode ? 'Vérifiez les informations avant d’enregistrer les modifications.' : 'Vérifiez les informations avant de créer le membre.'}
        </p>
      </div>
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          {[
            ['Civilité',       form.gender === 'femme' ? 'Madame' : form.gender === 'homme' ? 'Monsieur' : '—'],
            ['Prénom',         formatFirstName(form.firstName)], ['Nom', formatLastName(form.lastName)],
            ['Email',          form.email],     ['Téléphone', form.phone || '—'],
            ['Promotionnaire', form.promotionYear || '—'],
            ['Ville',          form.city || '—'], ['Pays', form.country],
            ['Rôle',           form.role], ['Antenne', form.antenne],
            ['N° membre',      generatedId],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-neutral-400">{label}</p>
              <p className="mt-0.5 font-semibold text-neutral-900">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm font-black text-neutral-900">Carte de membre générée</p>
        <div className="flex justify-center overflow-x-auto"><MemberCard member={cardData} /></div>
        <p className="mt-3 text-center text-xs text-neutral-400">
          Le QR code renvoie vers <span className="font-mono text-emerald-600">salam-cameroun.com/verify/{generatedId}</span>
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setStep('form')} className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 hover:border-neutral-300">
          <ArrowLeft size={14} /> Modifier
        </button>
        <button onClick={handleValidate} disabled={createMember.isPending || updateMember.isPending}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60">
          {createMember.isPending || updateMember.isPending
            ? <><Loader2 size={14} className="animate-spin" /> Enregistrement…</>
            : <><CheckCircle2 size={14} /> {isEditMode ? 'Enregistrer les modifications' : 'Valider et créer la fiche'}</>
          }
        </button>
      </div>
    </div>
  );

  /* ── Écran résultat import CSV ───────────────── */
  if (mode === 'csv' && importResult) return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/adherents" className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-neutral-300">
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">Import terminé</h1>
          <p className="text-sm text-neutral-500">Résultats de l&apos;importation CSV</p>
        </div>
      </div>

      {/* Stats résultat */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Users,       label: 'Créés',    value: importResult.created, cls: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { icon: MailCheck,   label: 'Invités',  value: importResult.emailed, cls: 'text-blue-700   bg-blue-50   border-blue-100'   },
          { icon: SkipForward, label: 'Ignorés',  value: importResult.skipped, cls: 'text-amber-700  bg-amber-50  border-amber-100'  },
          { icon: MailX,       label: 'Erreurs',  value: importResult.errors.length, cls: 'text-red-700 bg-red-50 border-red-100' },
        ].map(({ icon: Icon, label, value, cls }) => (
          <div key={label} className={`flex flex-col items-center gap-1 rounded-2xl border p-4 ${cls}`}>
            <Icon size={20} />
            <p className="text-2xl font-black">{value}</p>
            <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Détail erreurs / ignorés */}
      {importResult.errors.length > 0 && (
        <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="border-b border-neutral-100 px-5 py-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Lignes ignorées ou en erreur</p>
          </div>
          <div className="max-h-56 overflow-y-auto divide-y divide-neutral-50">
            {importResult.errors.map(err => (
              <div key={err.row} className="flex items-center gap-3 px-5 py-2.5">
                <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-[10px] font-black text-neutral-500">L.{err.row}</span>
                <p className="text-xs text-neutral-600">{err.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button onClick={resetCsv}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-200 px-5 text-sm font-semibold text-neutral-700 hover:border-neutral-300">
          <Upload size={14} /> Importer un autre CSV
        </button>
        <Link href="/admin/adherents"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-700">
          <Users size={14} /> Voir la liste des membres
        </Link>
      </div>
    </div>
  );

  /* ── Render principal ────────────────────────── */
  return (
    <div className="mx-auto max-w-2xl space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/adherents" className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-neutral-300">
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-[-0.03em] text-neutral-900">{isEditMode ? 'Modifier le membre' : 'Nouveau membre'}</h1>
          <p className="text-sm text-neutral-500">{isEditMode ? 'Mise à jour de la fiche adhérent' : 'Saisie manuelle ou import de données historiques'}</p>
        </div>
      </div>

      {/* Mode toggle */}
      {!isEditMode && (
      <AnimatedTabBar
        value={mode}
        onChange={(value) => {
          setMode(value);
          if (value === 'csv') resetCsv();
        }}
        items={[
          { value: 'single', label: 'Saisie manuelle', icon: UserPlus },
          { value: 'csv', label: 'Importer CSV', icon: FileSpreadsheet },
        ]}
      />
      )}

      {/* ─── Mode saisie manuelle ──────────────── */}
      {mode === 'single' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <p className="mb-4 flex items-center gap-2 text-sm font-black text-neutral-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">1</span>
              Identité
            </p>
            {/* Civilité */}
            <div className="mb-4">
              <p className="mb-1.5 text-xs font-black uppercase tracking-[0.1em] text-neutral-500">
                Civilité <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-3">
                {([{ value: 'homme', label: 'Monsieur' }, { value: 'femme', label: 'Madame' }] as const).map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setForm(prev => ({ ...prev, gender: opt.value }))}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-black transition ${
                      form.gender === opt.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-neutral-200 text-neutral-500 hover:border-emerald-300 hover:text-emerald-700'
                    }`}>
                    <UserCheck size={14} className={form.gender === opt.value ? 'text-emerald-600' : 'text-neutral-400'} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom *"         value={form.firstName}    onChange={set('firstName')}    placeholder="Jean"              required />
              <Field label="Nom *"            value={form.lastName}     onChange={set('lastName')}     placeholder="Kamga"             required />
              <Field label="Email *"          value={form.email}        onChange={set('email')}        placeholder="jean@email.com"    type="email" required />
              <Field label="Téléphone"        value={form.phone}        onChange={set('phone')}        placeholder="+33 6 00 00 00 00" />
              <Field label="Promotionnaire *" value={form.promotionYear} onChange={set('promotionYear')} placeholder={String(new Date().getFullYear())} type="number" required />
              <Field label="Ville"            value={form.city}         onChange={set('city')}         placeholder="Paris" />
              <Field label="Pays"             value={form.country}      onChange={set('country')}      placeholder="Cameroun" />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <p className="mb-4 flex items-center gap-2 text-sm font-black text-neutral-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">2</span>
              Adhésion
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Rôle"    value={form.role}    onChange={set('role')}    options={ROLES}    />
              <SelectField label="Antenne" value={form.antenne} onChange={set('antenne')} options={ANTENNES} />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-neutral-500">Motivation / Notes</label>
              <textarea value={form.motivation} onChange={set('motivation')} rows={3}
                placeholder="Notes sur le membre, motivation d'adhésion…"
                className="w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <p className="mb-4 flex items-center gap-2 text-sm font-black text-neutral-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">3</span>
              Aperçu carte membre
            </p>
            <div className="mx-auto w-full max-w-[400px]"><MemberCard member={cardData} /></div>
          </div>

          <button type="submit"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-black text-white transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20">
            <UserPlus size={15} /> {isEditMode ? 'Prévisualiser les modifications' : 'Prévisualiser et créer'}
          </button>
        </form>
      )}

      {/* ─── Mode import CSV ───────────────────── */}
      {mode === 'csv' && (
        <div className="space-y-4">

          {/* Zone upload — aucun fichier chargé */}
          {csvRows.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                <FileSpreadsheet size={28} className="text-emerald-600" />
              </div>
              <h3 className="text-sm font-black text-neutral-900">Importer les adhérents historiques</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                Chargez un fichier <strong>CSV</strong> (.csv) — toutes les colonnes seront affichées.<br />
                Les champs <strong>Prénom, Nom et Email</strong> sont requis pour créer un compte.
              </p>
              <p className="mt-2 text-[10px] text-neutral-400">
                Colonnes reconnues automatiquement : prenom, nom, email, telephone, poste…
              </p>
              <button onClick={() => fileInputRef.current?.click()}
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-black text-white transition hover:bg-emerald-700">
                <Upload size={14} /> Choisir un fichier CSV
              </button>
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {/* Erreur parsing */}
          {csvError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
              <AlertTriangle size={14} className="shrink-0" /> {csvError}
            </div>
          )}

          {/* Tableau preview */}
          {csvRows.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">

              {/* Barre d'action */}
              <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-neutral-900">Prévisualisation du fichier</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {csvRows.length} ligne{csvRows.length > 1 ? 's' : ''} détectée{csvRows.length > 1 ? 's' : ''}
                    {' · '}
                    <span className="font-bold text-emerald-700">{selectedSet.size} sélectionnée{selectedSet.size > 1 ? 's' : ''}</span>
                    {' · '}
                    {csvRows.filter(r => r.canCreate).length} importable{csvRows.filter(r => r.canCreate).length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-bold text-neutral-600 hover:border-neutral-300">
                    <Upload size={12} /> Changer de fichier
                  </button>
                  <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />

                  <button onClick={toggleAll}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-bold text-neutral-600 hover:border-emerald-300 hover:text-emerald-700">
                    {selectedSet.size === csvRows.filter(r => r.canCreate).length
                      ? <><Square size={12} /> Tout désélectionner</>
                      : <><CheckSquare2 size={12} /> Tout sélectionner</>
                    }
                  </button>

                  <button onClick={handleImport} disabled={importCSV.isPending || selectedSet.size === 0}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                    {importCSV.isPending
                      ? <><Loader2 size={12} className="animate-spin" /> Import en cours…</>
                      : <><UserPlus size={12} /> Créer {selectedSet.size > 0 ? `${selectedSet.size} membre${selectedSet.size > 1 ? 's' : ''}` : 'les membres'}</>
                    }
                  </button>
                </div>
              </div>

              {/* Erreur import */}
              {csvError && (
                <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-5 py-2.5 text-xs font-semibold text-red-700">
                  <AlertTriangle size={13} className="shrink-0" /> {csvError}
                </div>
              )}

              {/* Table */}
              <div
                ref={csvTopScrollRef}
                onScroll={() => syncCsvScroll('top')}
                className="mb-2 overflow-x-auto rounded-xl border border-neutral-100 bg-neutral-50/60"
              >
                <div className="h-3" style={{ width: csvTableMinWidth }} />
              </div>

              <div ref={csvTableScrollRef} onScroll={() => syncCsvScroll('table')} className="overflow-x-auto">
                <table className="text-xs" style={{ minWidth: csvTableMinWidth }}>
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50/70">
                      <th className="sticky left-0 z-30 w-10 bg-neutral-50/95 px-4 py-3 text-center shadow-[1px_0_0_rgba(229,231,235,1)]">
                        <input type="checkbox"
                          checked={selectedSet.size > 0 && selectedSet.size === csvRows.filter(r => r.canCreate).length}
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-neutral-300 accent-emerald-600"
                        />
                      </th>
                      <th className="sticky left-[48px] z-30 min-w-[220px] bg-neutral-50/95 px-4 py-3 text-left font-black uppercase tracking-[0.1em] text-neutral-400 shadow-[1px_0_0_rgba(229,231,235,1)]">
                        Détection automatique
                      </th>
                      {csvHeaders.map(h => (
                        <th key={h} className="min-w-[120px] px-4 py-3 text-left font-black uppercase tracking-[0.1em] text-neutral-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {csvRows.map((row, i) => {
                      const isSelected = selectedSet.has(i);
                      return (
                        <tr key={i}
                          onClick={() => toggleRow(i)}
                          className={`group cursor-pointer transition-colors ${row.canCreate ? '' : 'opacity-50 cursor-not-allowed'} ${isSelected ? 'bg-emerald-50/60' : 'hover:bg-neutral-50/60'}`}>

                          {/* Checkbox */}
                          <td className={`sticky left-0 z-20 px-4 py-3 text-center shadow-[1px_0_0_rgba(229,231,235,1)] ${isSelected ? 'bg-emerald-50' : 'bg-white group-hover:bg-neutral-50'}`}>
                            <input type="checkbox"
                              checked={isSelected}
                              disabled={!row.canCreate}
                              onChange={() => toggleRow(i)}
                              onClick={e => e.stopPropagation()}
                              className="h-4 w-4 rounded border-neutral-300 accent-emerald-600 disabled:opacity-30"
                            />
                          </td>

                          {/* Colonne détection */}
                          <td className={`sticky left-[48px] z-20 px-4 py-3 shadow-[1px_0_0_rgba(229,231,235,1)] ${isSelected ? 'bg-emerald-50' : 'bg-white group-hover:bg-neutral-50'}`}>
                            {row.gender && (
                              <p className="text-[9px] font-black uppercase tracking-wide text-blue-600 mb-0.5">
                                {row.gender === 'femme' ? 'Madame' : 'Monsieur'}
                              </p>
                            )}
                            <p className="font-black text-neutral-900">
                              {row.firstName || <span className="text-red-400 font-normal">Prénom ?</span>}{' '}
                              {row.lastName  || <span className="text-red-400 font-normal">Nom ?</span>}
                            </p>
                            <p className={`mt-0.5 ${row.email ? 'text-neutral-500' : 'text-amber-600 font-semibold'}`}>
                              {row.email || 'Email manquant — compte non créé'}
                            </p>
                            {row.promotionYear && (
                              <p className="mt-0.5 text-[10px] font-semibold text-purple-600">Promotion {row.promotionYear}</p>
                            )}
                            {row.bureauPoste && (
                              <p className="mt-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">{row.bureauPoste}</p>
                            )}
                            {!row.canCreate && (
                              <span className="mt-1 inline-block rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[9px] font-black text-red-600">
                                {!row.firstName || !row.lastName ? 'Nom/prénom requis' : 'Email requis'}
                              </span>
                            )}
                          </td>

                          {/* Toutes les colonnes CSV brutes */}
                          {csvHeaders.map(h => (
                            <td key={h} className="max-w-[200px] px-4 py-3 text-neutral-600">
                              <span className="line-clamp-2 block">{row.raw[h] || <span className="text-neutral-300">—</span>}</span>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer résumé */}
              <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/60 px-5 py-3">
                <p className="text-[10px] font-semibold text-neutral-400">
                  Seules les lignes avec prénom, nom et email seront importées.
                </p>
                <button onClick={handleImport} disabled={importCSV.isPending || selectedSet.size === 0}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:opacity-50">
                  {importCSV.isPending
                    ? <><Loader2 size={12} className="animate-spin" /> Import…</>
                    : <><UserPlus size={12} /> Valider l&apos;import ({selectedSet.size})</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
