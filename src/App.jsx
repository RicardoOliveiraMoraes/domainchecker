import { useState, useRef } from 'react'
import { generateDomainsFromForm } from './utils/domainGenerator'
import { checkDomains } from './utils/rdapClient'

const SECTORS = [
  { value: 'tech',         label: 'Tecnologia',  icon: '💻' },
  { value: 'retail',       label: 'Varejo',       icon: '🛍️' },
  { value: 'health',       label: 'Saúde',        icon: '🏥' },
  { value: 'education',    label: 'Educação',     icon: '🎓' },
  { value: 'finance',      label: 'Financeiro',   icon: '💰' },
  { value: 'services',     label: 'Serviços',     icon: '🤝' },
  { value: 'food',         label: 'Alimentação',  icon: '🍽️' },
  { value: 'construction', label: 'Construção',   icon: '🏗️' },
  { value: 'other',        label: 'Outro',        icon: '📦' },
]

const AUDIENCES = [
  { value: 'b2c',  label: 'B2C',   desc: 'Pessoas físicas' },
  { value: 'b2b',  label: 'B2B',   desc: 'Empresas' },
  { value: 'both', label: 'Ambos', desc: 'Todos os públicos' },
]

const STYLES = [
  { value: 'descriptive', label: 'Descritivo',     desc: 'Nome completo e variações', icon: '📝' },
  { value: 'short',       label: 'Curto',           desc: 'Siglas e versões compactas', icon: '⚡' },
  { value: 'creative',    label: 'Criativo',        desc: 'Prefixos modernos (go, my…)', icon: '✨' },
  { value: 'location',    label: 'Localização',     desc: 'Adiciona SP, RJ, BR…', icon: '📍' },
]

const STEP_LABELS = ['Contato', 'Empresa', 'Negócio', 'Estilo']

/* ── Design tokens ──────────────────────────────────────────── */
// bg: #07090F  card: rgba(255,255,255,.04)  accent: #E42527
// border: rgba(255,255,255,.08)  muted: rgba(255,255,255,.45)

/* ── Shared input style ─────────────────────────────────────── */
const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E42527] focus:ring-2 focus:ring-[#E42527]/20 transition-all duration-200'

/* ── Progress stepper ───────────────────────────────────────── */
function Stepper({ step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEP_LABELS.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
              style={{
                background: i < step ? '#E42527' : i === step ? 'rgba(228,37,39,.15)' : 'rgba(255,255,255,.06)',
                border: i === step ? '2px solid #E42527' : i < step ? '2px solid #E42527' : '2px solid rgba(255,255,255,.1)',
                color: i <= step ? '#E42527' : 'rgba(255,255,255,.3)',
              }}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className="text-[10px] mt-1.5 font-medium" style={{ color: i <= step ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.25)' }}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div className="w-12 h-px mx-1 mb-5 transition-all duration-500" style={{ background: i < step ? '#E42527' : 'rgba(255,255,255,.1)' }} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Step 0: Contato ────────────────────────────────────────── */
function StepContact({ form, onChange, onNext }) {
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const canNext = form.name.trim().length >= 2 && emailValid

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#E42527] mb-2">Etapa 1 de 4</p>
        <h2 className="text-2xl font-bold text-white">Quem está buscando?</h2>
        <p className="text-white/45 text-sm mt-1">Vamos personalizar as sugestões para você.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider block mb-2">Nome completo</label>
          <input type="text" value={form.name} onChange={e => onChange({ name: e.target.value })}
            placeholder="Seu nome" className={inputCls} autoFocus
            onKeyDown={e => e.key === 'Enter' && canNext && onNext()} />
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider block mb-2">E-mail</label>
          <input type="email" value={form.email} onChange={e => onChange({ email: e.target.value })}
            placeholder="voce@empresa.com.br" className={inputCls}
            onKeyDown={e => e.key === 'Enter' && canNext && onNext()} />
        </div>
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider block mb-2">
            Telefone <span className="text-white/25 normal-case tracking-normal">(opcional)</span>
          </label>
          <input type="tel" value={form.phone} onChange={e => onChange({ phone: e.target.value })}
            placeholder="(11) 99999-9999" className={inputCls}
            onKeyDown={e => e.key === 'Enter' && canNext && onNext()} />
        </div>
      </div>

      <button onClick={onNext} disabled={!canNext}
        className="mt-8 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: canNext ? '#E42527' : 'rgba(255,255,255,.1)', color: '#fff', boxShadow: canNext ? '0 0 24px rgba(228,37,39,.35)' : 'none' }}>
        Continuar →
      </button>
    </div>
  )
}

/* ── Step 1: Empresa ────────────────────────────────────────── */
function StepIdentity({ form, onChange, onNext, onBack }) {
  const canNext = form.companyName.trim().length >= 2 && !!form.sector

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#E42527] mb-2">Etapa 2 de 4</p>
        <h2 className="text-2xl font-bold text-white">Sobre a empresa</h2>
        <p className="text-white/45 text-sm mt-1">Nome e setor de atuação.</p>
      </div>

      <div className="mb-6">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider block mb-2">Nome da empresa ou marca</label>
        <input type="text" value={form.companyName} onChange={e => onChange({ companyName: e.target.value })}
          placeholder="Ex: Empresa ABC, Studio Digital…" className={inputCls} autoFocus />
      </div>

      <div>
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider block mb-3">Setor de atuação</label>
        <div className="grid grid-cols-3 gap-2">
          {SECTORS.map(s => (
            <button key={s.value} type="button" onClick={() => onChange({ sector: s.value })}
              className="flex flex-col items-center gap-1.5 rounded-2xl border py-3 px-2 text-xs font-medium transition-all duration-150"
              style={{
                borderColor: form.sector === s.value ? '#E42527' : 'rgba(255,255,255,.08)',
                background: form.sector === s.value ? 'rgba(228,37,39,.12)' : 'rgba(255,255,255,.03)',
                color: form.sector === s.value ? '#FF6B6B' : 'rgba(255,255,255,.55)',
                boxShadow: form.sector === s.value ? '0 0 12px rgba(228,37,39,.2)' : 'none',
              }}>
              <span className="text-lg">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.08)' }}>
          ← Voltar
        </button>
        <button onClick={onNext} disabled={!canNext}
          className="flex-[2] py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 disabled:opacity-30"
          style={{ background: canNext ? '#E42527' : 'rgba(255,255,255,.1)', color: '#fff', boxShadow: canNext ? '0 0 24px rgba(228,37,39,.35)' : 'none' }}>
          Continuar →
        </button>
      </div>
    </div>
  )
}

/* ── Step 2: Negócio ────────────────────────────────────────── */
function StepBusiness({ form, onChange, kwInput, setKwInput, onNext, onBack }) {
  function addKw() {
    const kw = kwInput.trim()
    if (kw && !form.keywords.includes(kw) && form.keywords.length < 5) {
      onChange({ keywords: [...form.keywords, kw] })
      setKwInput('')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#E42527] mb-2">Etapa 3 de 4</p>
        <h2 className="text-2xl font-bold text-white">Detalhes do negócio</h2>
        <p className="text-white/45 text-sm mt-1">Quanto mais contexto, melhores as sugestões.</p>
      </div>

      <div className="mb-6">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider block mb-2">
          Palavras-chave <span className="text-white/25 normal-case tracking-normal">(até 5 — pressione Enter)</span>
        </label>
        <div className="flex gap-2">
          <input type="text" value={kwInput} onChange={e => setKwInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addKw() } }}
            placeholder="inovação, automação…" className={inputCls} autoFocus />
          <button type="button" onClick={addKw} disabled={!kwInput.trim() || form.keywords.length >= 5}
            className="px-4 rounded-2xl text-sm font-bold text-white transition-all disabled:opacity-30 flex-shrink-0"
            style={{ background: '#E42527' }}>
            +
          </button>
        </div>
        {form.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {form.keywords.map(kw => (
              <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(228,37,39,.15)', color: '#FF6B6B', border: '1px solid rgba(228,37,39,.3)' }}>
                {kw}
                <button type="button" onClick={() => onChange({ keywords: form.keywords.filter(k => k !== kw) })}
                  className="opacity-60 hover:opacity-100 font-bold text-sm leading-none">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider block mb-3">Público-alvo</label>
        <div className="grid grid-cols-3 gap-3">
          {AUDIENCES.map(a => (
            <button key={a.value} type="button" onClick={() => onChange({ audience: a.value })}
              className="flex flex-col items-start rounded-2xl border p-4 text-left transition-all"
              style={{
                borderColor: form.audience === a.value ? '#E42527' : 'rgba(255,255,255,.08)',
                background: form.audience === a.value ? 'rgba(228,37,39,.12)' : 'rgba(255,255,255,.03)',
                boxShadow: form.audience === a.value ? '0 0 12px rgba(228,37,39,.2)' : 'none',
              }}>
              <span className="font-bold text-sm mb-0.5" style={{ color: form.audience === a.value ? '#FF6B6B' : 'rgba(255,255,255,.8)' }}>
                {a.label}
              </span>
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,.35)' }}>{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.08)' }}>
          ← Voltar
        </button>
        <button onClick={onNext}
          className="flex-[2] py-3.5 rounded-2xl font-semibold text-sm transition-all"
          style={{ background: '#E42527', color: '#fff', boxShadow: '0 0 24px rgba(228,37,39,.35)' }}>
          Continuar →
        </button>
      </div>
    </div>
  )
}

/* ── Step 3: Estilo ─────────────────────────────────────────── */
function StepStyle({ form, onChange, onSearch, onBack, loading }) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#E42527] mb-2">Etapa 4 de 4</p>
        <h2 className="text-2xl font-bold text-white">Estilo do domínio</h2>
        <p className="text-white/45 text-sm mt-1">Qual formato combina com a sua marca?</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {STYLES.map(s => (
          <button key={s.value} type="button" onClick={() => onChange({ style: s.value })}
            className="flex flex-col items-start rounded-2xl border p-4 text-left transition-all"
            style={{
              borderColor: form.style === s.value ? '#E42527' : 'rgba(255,255,255,.08)',
              background: form.style === s.value ? 'rgba(228,37,39,.12)' : 'rgba(255,255,255,.03)',
              boxShadow: form.style === s.value ? '0 0 16px rgba(228,37,39,.2)' : 'none',
            }}>
            <span className="text-2xl mb-2">{s.icon}</span>
            <span className="font-bold text-sm mb-1" style={{ color: form.style === s.value ? '#FF6B6B' : 'rgba(255,255,255,.85)' }}>
              {s.label}
            </span>
            <span className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,.35)' }}>{s.desc}</span>
          </button>
        ))}
      </div>

      {/* Summary card */}
      <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Resumo</p>
        <div className="flex flex-wrap gap-2">
          {[
            form.name,
            form.email,
            form.companyName,
            SECTORS.find(s => s.value === form.sector)?.label,
            ...form.keywords,
            AUDIENCES.find(a => a.value === form.audience)?.label,
          ].filter(Boolean).map((tag, i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.6)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.08)' }}>
          ← Voltar
        </button>
        <button onClick={onSearch} disabled={loading}
          className="flex-[2] py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-50"
          style={{ background: '#E42527', color: '#fff', boxShadow: '0 0 28px rgba(228,37,39,.4)' }}>
          {loading ? '⏳ Buscando…' : '🔍 Buscar domínios'}
        </button>
      </div>
    </div>
  )
}

/* ── Domain card ────────────────────────────────────────────── */
function DomainCard({ domain, available }) {
  if (available === undefined) {
    return (
      <li className="flex items-center justify-between rounded-2xl px-4 py-3.5 animate-pulse"
        style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-white/10" />
          <span className="font-mono text-sm text-white/20">{domain}</span>
        </div>
        <span className="h-5 w-20 rounded-full bg-white/10" />
      </li>
    )
  }

  return (
    <li className="flex items-center justify-between rounded-2xl px-4 py-3.5 transition-all"
      style={{
        background: available === true ? 'rgba(34,197,94,.07)' : 'rgba(255,255,255,.03)',
        border: available === true ? '1px solid rgba(34,197,94,.25)' : '1px solid rgba(255,255,255,.06)',
      }}>
      <div className="flex items-center gap-3">
        <span className="h-2 w-2 rounded-full flex-shrink-0"
          style={{ background: available === true ? '#22C55E' : 'rgba(255,255,255,.2)' }} />
        <span className="font-mono text-sm" style={{ color: available === true ? '#fff' : 'rgba(255,255,255,.45)' }}>
          {domain}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{
            background: available === true ? 'rgba(34,197,94,.15)' : 'rgba(255,255,255,.06)',
            color: available === true ? '#4ADE80' : 'rgba(255,255,255,.3)',
          }}>
          {available === true ? 'Disponível' : available === false ? 'Registrado' : 'Erro'}
        </span>
        {available === true && (
          <a href={`https://registro.br/busca-dominio/?fqdn=${domain}`} target="_blank" rel="noopener noreferrer"
            className="rounded-xl px-3 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: '#E42527', boxShadow: '0 0 12px rgba(228,37,39,.4)' }}>
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
    name: '', email: '', phone: '',
    companyName: '', sector: '',
    keywords: [], audience: 'b2c', style: 'descriptive',
  })
  const [kwInput, setKwInput] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle')
  const [filter, setFilter] = useState('all')
  const [leadSaved, setLeadSaved] = useState(false)
  const abortRef = useRef(false)

  function updateForm(patch) { setForm(f => ({ ...f, ...patch })) }

  async function saveLead() {
    try {
      await fetch('/server/leads_api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company_name: form.companyName,
          sector: form.sector,
          keywords: form.keywords,
          audience: form.audience,
          domain_style: form.style,
        }),
      })
      setLeadSaved(true)
    } catch {
      // non-blocking — domain search still proceeds
    }
  }

  async function handleSearch() {
    abortRef.current = true
    await new Promise(r => setTimeout(r, 20))
    abortRef.current = false

    const domains = generateDomainsFromForm(form)
    setResults(domains.map(d => ({ domain: d, available: undefined })))
    setStatus('loading')
    setStep(4)

    saveLead()

    await checkDomains(domains, result => {
      if (abortRef.current) return
      setResults(prev => prev.map(r => r.domain === result.domain ? { ...r, ...result } : r))
    })
    setStatus('done')
  }

  function reset() { setStep(0); setStatus('idle'); setResults([]); setLeadSaved(false); setFilter('all') }

  const checked   = results.filter(r => r.available !== undefined)
  const available = results.filter(r => r.available === true)
  const progress  = results.length > 0 ? checked.length / results.length : 0

  const displayed =
    filter === 'available'  ? results.filter(r => r.available === true) :
    filter === 'registered' ? results.filter(r => r.available === false) :
    results

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#07090F' }}>
      {/* Gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #E42527, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-lg text-white"
          style={{ background: '#E42527', boxShadow: '0 0 16px rgba(228,37,39,.5)' }}>D</div>
        <span className="text-white font-semibold text-base tracking-tight">Domain Finder</span>
        <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.4)', border: '1px solid rgba(255,255,255,.08)' }}>
          .com.br
        </span>
      </header>

      <main className="relative z-10 flex-1 flex items-start justify-center px-4 py-10">
        {/* Form card */}
        {step < 4 && (
          <div className="w-full max-w-md rounded-3xl p-8"
            style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', backdropFilter: 'blur(20px)' }}>
            <Stepper step={step} />
            {step === 0 && <StepContact form={form} onChange={updateForm} onNext={() => setStep(1)} />}
            {step === 1 && <StepIdentity form={form} onChange={updateForm} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
            {step === 2 && <StepBusiness form={form} onChange={updateForm} kwInput={kwInput} setKwInput={setKwInput} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <StepStyle form={form} onChange={updateForm} onSearch={handleSearch} onBack={() => setStep(2)} loading={status === 'loading'} />}
          </div>
        )}

        {/* Results */}
        {step === 4 && (
          <div className="w-full max-w-lg">
            {/* Results header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Sugestões de domínio</h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,.4)' }}>
                  {status === 'loading'
                    ? `Verificando ${checked.length} de ${results.length}…`
                    : `${results.length} sugestões · ${available.length} disponíve${available.length === 1 ? 'l' : 'is'}`}
                </p>
              </div>
              <button onClick={reset}
                className="text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.08)' }}>
                ← Nova busca
              </button>
            </div>

            {/* Lead saved badge */}
            {leadSaved && (
              <div className="mb-4 flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-2xl"
                style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: '#4ADE80' }}>
                <span>✓</span> Seus dados foram salvos — entraremos em contato em breve.
              </div>
            )}

            {/* Progress bar */}
            {status === 'loading' && (
              <div className="h-1 rounded-full mb-5 overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #E42527, #FF6B6B)' }} />
              </div>
            )}

            {/* Filter tabs */}
            {status === 'done' && (
              <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
                {[
                  { key: 'all',        label: `Todos (${results.length})` },
                  { key: 'available',  label: `Disponíveis (${available.length})` },
                  { key: 'registered', label: `Registrados (${results.length - available.length})` },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setFilter(tab.key)}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl transition-all"
                    style={{
                      background: filter === tab.key ? 'rgba(255,255,255,.08)' : 'transparent',
                      color: filter === tab.key ? '#fff' : 'rgba(255,255,255,.35)',
                    }}>
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

            <p className="mt-6 text-center text-xs" style={{ color: 'rgba(255,255,255,.2)' }}>
              Consulta via RDAP · Registro.br
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
