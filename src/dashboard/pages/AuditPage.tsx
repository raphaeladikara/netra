import { useMemo, useState } from 'react'
import { Search, Download, UserPlus, Lock } from 'lucide-react'
import { TopBar, Page } from '../Shell'
import { Panel, PanelHead, Badge, Button, Segmented, Field } from '../../components/ui'
import { auditLog, users, retention } from '../../lib/data'

const ROLE_TONE: Record<string, 'azure' | 'ok' | 'warn' | 'neutral'> = {
  Operator: 'azure',
  Supervisor: 'ok',
  Admin: 'warn',
  Petugas: 'neutral',
  Otomatis: 'neutral',
  Pembaca: 'neutral',
  'Petugas lapangan': 'neutral',
}

export default function AuditPage() {
  const [q, setQ] = useState('')
  const [who, setWho] = useState<'all' | 'orang' | 'sistem'>('all')

  const rows = useMemo(
    () =>
      auditLog
        .filter((a) => (who === 'all' ? true : who === 'sistem' ? a.role === 'Otomatis' : a.role !== 'Otomatis'))
        .filter((a) =>
          q.trim() ? `${a.actor} ${a.action} ${a.role}`.toLowerCase().includes(q.trim().toLowerCase()) : true,
        ),
    [q, who],
  )

  return (
    <>
      <TopBar title="Audit & pengguna">
        <label className="relative flex min-w-[220px] items-center">
          <Search className="pointer-events-none absolute left-3 size-4 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari tindakan atau nama"
            className="h-10 w-full rounded-lg border border-line bg-ink-2 pl-9 pr-3 text-[13px] text-paper transition-colors focus:border-azure/60 focus:outline-none"
          />
        </label>
        <Segmented
          value={who}
          onChange={setWho}
          options={[
            { value: 'all', label: 'Semua' },
            { value: 'orang', label: 'Pengguna' },
            { value: 'sistem', label: 'Sistem' },
          ]}
        />
      </TopBar>

      <Page className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel className="min-w-0 overflow-hidden p-0">
          <PanelHead title="Jejak audit" meta={`${rows.length} tindakan · hari ini`}>
            <Button size="sm" className="ml-auto">
              <Download className="size-3.5" />
              Ekspor CSV
            </Button>
          </PanelHead>

          {rows.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-[15px] text-paper">Tidak ada tindakan yang cocok.</p>
              <p className="mx-auto mt-2 max-w-[44ch] text-[13px] text-dim">
                Jejak audit disimpan permanen. Coba kata kunci lain, atau ganti saringan pengguna/sistem.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line/70">
              {rows.map((a, i) => (
                <li key={i} className="flex gap-4 px-5 py-3.5 transition-colors hover:bg-raised/30">
                  <span className="w-11 shrink-0 pt-[2px] font-mono text-[13px] tabular-nums text-faint">{a.time}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-medium text-paper">{a.actor}</span>
                      <Badge tone={ROLE_TONE[a.role] ?? 'neutral'}>{a.role}</Badge>
                    </div>
                    <div className="mt-1 text-[13px] leading-relaxed text-dim">{a.action}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="border-t border-line px-5 py-3.5 text-[12px] leading-relaxed text-faint">
            Pencarian plat, ekspor bukti, dan perubahan konfigurasi selalu tercatat beserta pelakunya. Baris audit
            tidak bisa dihapus dari dalam aplikasi.
          </p>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel className="overflow-hidden p-0">
            <PanelHead title="Pengguna & peran" meta={`${users.filter((u) => u.state === 'aktif').length} aktif`}>
              <Button size="sm" variant="primary" className="ml-auto">
                <UserPlus className="size-3.5" />
                Tambah
              </Button>
            </PanelHead>
            <ul className="divide-y divide-line/70">
              {users.map((u) => (
                <li key={u.name} className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-paper">{u.name}</span>
                    <Badge tone={ROLE_TONE[u.role] ?? 'neutral'}>{u.role}</Badge>
                    {u.state === 'nonaktif' && <Badge tone="neutral">Nonaktif</Badge>}
                    <span className="ml-auto font-mono text-[11px] text-faint">{u.lastSeen}</span>
                  </div>
                  <div className="mt-1 text-[12px] text-dim">{u.access}</div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="overflow-hidden p-0">
            <PanelHead title="Kebijakan retensi" meta="berjalan otomatis 03:00" />
            <div className="px-5 py-2">
              {retention.map((r) => (
                <Field key={r.label} label={r.label}>
                  {r.hari} hari
                </Field>
              ))}
              <Field label="Metadata perjalanan">90 hari</Field>
              <Field label="Jejak audit">permanen</Field>
            </div>
            <div className="flex items-start gap-3 border-t border-line px-5 py-4">
              <Lock className="mt-[2px] size-4 shrink-0 text-ice" strokeWidth={1.7} />
              <p className="text-[12px] leading-relaxed text-dim">
                Perubahan retensi hanya bisa dilakukan peran Admin dan berlaku pada siklus penghapusan berikutnya.
                Rekaman yang sudah terhapus tidak dapat dipulihkan.
              </p>
            </div>
          </Panel>
        </div>
      </Page>
    </>
  )
}
