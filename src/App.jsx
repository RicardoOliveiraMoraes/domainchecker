import { useState, useRef } from 'react'
import { generateDomainsFromForm } from './utils/domainGenerator'
import { checkDomains } from './utils/rdapClient'

/* ── Brand tokens ───────────────────────────────────────────── */
// Zoho red: #E42527  |  navy: #0F1928  |  mid-navy: #1A2C45

const SECTORS = [
  { value: 'tech',         label: 'Tecnologia',     icon: '💻' },
  { value: 'retail',       label: 'Varejo',          icon: '🛍️' },
  { value: 'health',       label: 'Saúde',           icon: '🏥' },
  { value: 'education',    label: 'Educação',        icon: '🎓' },
  { value: 'finance',      label: 'Financeiro',      icon: '💰' },
  { value: 'services',     label: 'Serviços',        icon: '🤝' },
  { value: 'food',         label: 'Alimentação',     icon: '🍽️' },
  { value: 'construction', label: 'Construção',      icon: '🏗️' },
  { value: 'other',        label: 'Outro',           icon: '📦' },
]

const AUDIENCES = [
  { value: 'b2c',  label: 'B2C',   desc: 'Vendo para pessoas físicas' },
  { value: 'b2b',  label: 'B2B',   desc: 'Vendo para empresas' },
  { value: 'both', label: 'Ambos', desc: 'Pessoas e empresas' },
]

const STYLES = [
  { value: 'descriptive', label: 'Descritivo',    desc: 'Nome completo com variações', icon: '📝' },
  { value: 'short',       label: 'Curto',          desc: 'Siglas e versões compactas',  icon: '⚡' },
  { value: 'creative',    label: 'Criativo',       desc: 'Prefixos modernos (go, my…)', icon: '✨' },
  { value: 'location',    label: 'Com localização',desc: 'Adiciona SP, RJ, BR…',        icon: '📍' },
]

/* ── Sub-components ─────────────────────────────────────────── */

function ProgressBar({ step, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1 last:flex-none last:flex-grow-0">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300"
            style={{
              background: i <= step ? '#E42527' : '#E5E7EB',
              color: i <= step ? '#fff' : '#6B7280',
            }}
          >
            {i < step ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className="flex-1 h-0.5 transition-all duration-500"
              style={{ background: i < step ? '#E42527' : '#E5E7EB' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function SectionTitle({ step, title, subtitle }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#E42527' }}>
        Etapa {step + 1} de 3
      </p>
      <h2 className="text-2xl font-bold text-[#0F1928]">{title}</h2>
      {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
    </div>
  )
}

/* Step 1 ── Identidade */
function StepIdentity({ form, onChange, onNext }) {
  const sectorOk = !!form.sector
  const nameOk = form.companyName.trim().length >= 2

  return (
    <div>
      <SectionTitle step={0} title="Identidade da empresa" subtitle="Como se chama sua empresa ou marca?" />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Nome da empresa ou marca
      </label>
      <input
        type="text"
        value={form.companyName}
        onChange={(e) => onChange({ companyName: e.target.value })}
        placeholder="Ex: Empresa ABC, Studio Digital…"
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 text-base focus:outline-none focus:ring-2 mb-6"
        style={{ '--tw-ring-color': '#E42527' }}
        onKeyDown={(e) => e.key === 'Enter' && nameOk && sectorOk && onNext()}
        autoFocus
      />

      <label className="block text-sm font-medium text-gray-700 mb-3">
        Setor de atuação
      </label>
      <div className="grid grid-cols-3 gap-2 mb-8">
        {SECTORS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange({ sector: s.value })}
            className="flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all duration-150"
            style={{
              borderColor: form.sector === s.value ? '#E42527' : '#E5E7EB',
              background: form.sector === s.value ? '#FFF0F0' : '#fff',
              color: form.sector === s.value ? '#E42527' : '#374151',
            }}
          >
            <span className="text-xl">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!nameOk || !sectorOk}
        className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: nameOk && sectorOk ? '#E42527' : '#9CA3AF' }}
      >
        Próximo →
      </button>
    </div>
  )
}

/* Step 2 ── Negócio */
function StepBusiness({ form, onChange, kwInput, setKwInput, onNext, onBack }) {
  function addKeyword() {
    const kw = kwInput.trim()
    if (kw && !form.keywords.includes(kw) && form.keywords.length < 5) {
      onChange({ keywords: [...form.keywords, kw] })
      setKwInput('')
    }
  }
  function removeKeyword(kw) {
    onChange({ keywords: form.keywords.filter((k) => k !== kw) })
  }

  return (
    <div>
      <SectionTitle step={1} title="Sobre o negócio" subtitle="Essas informações tornam as sugestões mais relevantes." />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Palavras-chave do seu negócio
        <span className="ml-1 text-gray-400 font-normal">(até 5)</span>
      </label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={kwInput}
          onChange={(e) => setKwInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addKeyword() }
          }}
          placeholder="Ex: inovação, automação…"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
          style={{ '--tw-ring-color': '#E42527' }}
        />
        <button
          type="button"
          onClick={addKeyword}
          disabled={!kwInput.trim() || form.keywords.length >= 5}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: '#E42527' }}
        >
          + Adicionar
        </button>
      </div>

      {form.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {form.keywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: '#FFF0F0', color: '#E42527' }}
            >
              {kw}
              <button
                type="button"
                onClick={() => removeKeyword(kw)}
                className="ml-1 opacity-60 hover:opacity-100 text-xs font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <label className="block text-sm font-medium text-gray-700 mb-3">
        Público-alvo
      </label>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {AUDIENCES.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => onChange({ audience: a.value })}
            className="flex flex-col items-start rounded-xl border-2 px-4 py-3 text-left transition-all"
            style={{
              borderColor: form.audience === a.value ? '#E42527' : '#E5E7EB',
              background: form.audience === a.value ? '#FFF0F0' : '#fff',
            }}
          >
            <span className="font-bold text-sm" style={{ color: form.audience === a.value ? '#E42527' : '#111827' }}>
              {a.label}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">{a.desc}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
        >
          ← Voltar
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-3 rounded-xl font-semibold text-white transition-all"
          style={{ background: '#E42527' }}
        >
          Próximo →
        </button>
      </div>
    </div>
  )
}

/* Step 3 ── Preferências */
function StepStyle({ form, onChange, onSearch, onBack, loading }) {
  return (
    <div>
      <SectionTitle step={2} title="Estilo do domínio" subtitle="Qual formato combina melhor com a sua marca?" />

      <div className="grid grid-cols-2 gap-3 mb-8">
        {STYLES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange({ style: s.value })}
            className="flex flex-col items-start rounded-xl border-2 px-4 py-4 text-left transition-all"
            style={{
              borderColor: form.style === s.value ? '#E42527' : '#E5E7EB',
              background: form.style === s.value ? '#FFF0F0' : '#fff',
            }}
          >
            <span className="text-2xl mb-2">{s.icon}</span>
            <span className="font-semibold text-sm" style={{ color: form.style === s.value ? '#E42527' : '#111827' }}>
              {s.label}
            </span>
            <span className="text-xs text-gray-500 mt-1">{s.desc}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl p-4 mb-6 text-sm" style={{ background: '#F0F4FF', border: '1px solid #DBEAFE' }}>
        <p className="font-semibold text-[#1E40AF] mb-1">Resumo da busca</p>
        <p className="text-[#3B82F6]">
          <span className="font-medium">{form.companyName}</span>
          {' · '}
          {SECTORS.find((s) => s.value === form.sector)?.label}
          {form.keywords.length > 0 && ` · ${form.keywords.join(', ')}`}
          {' · '}
          {AUDIENCES.find((a) => a.value === form.audience)?.label}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
        >
          ← Voltar
        </button>
        <button
          onClick={onSearch}
          disabled={loading}
          className="flex-[2] py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: '#E42527' }}
        >
          {loading ? 'Buscando…' : '🔍 Buscar domínios'}
        </button>
      </div>
    </div>
  )
}

/* Results ── Domain cards */
function DomainCard({ domain, available }) {
  if (available === undefined) {
    return (
      <li className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm animate-pulse">
        <span className="font-mono text-sm text-gray-400">{domain}</span>
        <span className="h-5 w-20 rounded-full bg-gray-100" />
      </li>
    )
  }

  return (
    <li
      className="flex items-center justify-between rounded-xl border px-4 py-3 shadow-sm transition-all"
      style={{
        borderColor: available === true ? '#BBF7D0' : '#FEE2E2',
        background: available === true ? '#F0FDF4' : '#FFF5F5',
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
          style={{ background: available === true ? '#22C55E' : '#EF4444' }}
        />
        <span className="font-mono text-sm font-medium text-gray-800">{domain}</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: available === true ? '#DCFCE7' : '#FEE2E2',
            color: available === true ? '#15803D' : '#B91C1C',
          }}
        >
          {available === true ? 'Disponível' : available === false ? 'Registrado' : 'Erro'}
        </span>
        {available === true && (
          <a
            href={`https://registro.br/busca-dominio/?fqdn=${domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
            style={{ background: '#E42527' }}
          >
            Registrar
          </a>
        )}
      </div>
    </li>
  )
}

/* ── Main App ───────────────────────────────────────────────── */

export default function App() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    companyName: '',
    sector: '',
    keywords: [],
    audience: 'b2c',
    style: 'descriptive',
  })
  const [kwInput, setKwInput] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const [filter, setFilter] = useState('all')
  const abortRef = useRef(false)

  function updateForm(patch) {
    setForm((f) => ({ ...f, ...patch }))
  }

  async function handleSearch() {
    abortRef.current = true
    await new Promise((r) => setTimeout(r, 20))
    abortRef.current = false

    const domains = generateDomainsFromForm(form)
    setResults(domains.map((d) => ({ domain: d, available: undefined })))
    setStatus('loading')
    setStep(3)

    await checkDomains(domains, (result) => {
      if (abortRef.current) return
      setResults((prev) =>
        prev.map((r) => (r.domain === result.domain ? { ...r, ...result } : r))
      )
    })

    setStatus('done')
  }

  const checked   = results.filter((r) => r.available !== undefined)
  const available = results.filter((r) => r.available === true)
  const progress  = results.length > 0 ? checked.length / results.length : 0

  const displayed =
    filter === 'available'   ? results.filter((r) => r.available === true) :
    filter === 'registered'  ? results.filter((r) => r.available === false) :
    results

  return (
    <div className="min-h-screen" style={{ background: '#F5F6FA' }}>
      {/* Header */}
      <header style={{ background: '#0F1928' }} className="px-6 py-4 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-lg"
          style={{ background: '#E42527' }}
        >
          D
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">Domain Finder</span>
        <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#1A2C45', color: '#93C5FD' }}>
          .com.br
        </span>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10">
        {/* Form card */}
        {step < 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
            <ProgressBar step={step} total={3} />
            {step === 0 && (
              <StepIdentity
                form={form}
                onChange={updateForm}
                onNext={() => setStep(1)}
              />
            )}
            {step === 1 && (
              <StepBusiness
                form={form}
                onChange={updateForm}
                kwInput={kwInput}
                setKwInput={setKwInput}
                onNext={() => setStep(2)}
                onBack={() => setStep(0)}
              />
            )}
            {step === 2 && (
              <StepStyle
                form={form}
                onChange={updateForm}
                onSearch={handleSearch}
                onBack={() => setStep(1)}
                loading={status === 'loading'}
              />
            )}
          </div>
        )}

        {/* Results */}
        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-[#0F1928]">Sugestões de domínio</h2>
                <p className="text-sm text-gray-500">
                  {status === 'loading'
                    ? `Verificando ${checked.length} de ${results.length}…`
                    : `${results.length} sugestões · ${available.length} disponíve${available.length === 1 ? 'l' : 'is'}`}
                </p>
              </div>
              <button
                onClick={() => { setStep(0); setStatus('idle'); setResults([]) }}
                className="text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                ← Nova busca
              </button>
            </div>

            {/* Progress bar */}
            {status === 'loading' && (
              <div className="h-1.5 rounded-full bg-gray-200 mb-5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress * 100}%`, background: '#E42527' }}
                />
              </div>
            )}

            {/* Filter tabs */}
            {status === 'done' && (
              <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: '#F0F0F0' }}>
                {[
                  { key: 'all',        label: `Todos (${results.length})` },
                  { key: 'available',  label: `Disponíveis (${available.length})` },
                  { key: 'registered', label: `Registrados (${results.length - available.length})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
                    style={{
                      background: filter === tab.key ? '#fff' : 'transparent',
                      color: filter === tab.key ? '#0F1928' : '#6B7280',
                      boxShadow: filter === tab.key ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <ul className="space-y-2">
              {displayed.map(({ domain, available }) => (
                <DomainCard key={domain} domain={domain} available={available} />
              ))}
            </ul>

            <p className="mt-5 text-center text-xs text-gray-400">
              Consulta via RDAP · Registro.br
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
