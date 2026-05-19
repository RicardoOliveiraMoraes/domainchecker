import { useState, useRef } from 'react'
import { generateDomains } from './utils/domainGenerator'
import { checkDomains } from './utils/rdapClient'

const STATUS = { idle: 'idle', loading: 'loading', done: 'done' }

function Badge({ available }) {
  if (available === true)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Disponível
      </span>
    )
  if (available === false)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Registrado
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-pulse" />
      Verificando…
    </span>
  )
}

function DomainRow({ domain, available }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <span className="font-mono text-sm text-gray-800">{domain}</span>
      <div className="flex items-center gap-3">
        <Badge available={available} />
        {available === true && (
          <a
            href={`https://registro.br/busca-dominio/?fqdn=${domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Registrar
          </a>
        )}
      </div>
    </li>
  )
}

export default function App() {
  const [company, setCompany] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState(STATUS.idle)
  const abortRef = useRef(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!company.trim()) return

    abortRef.current = true
    await new Promise((r) => setTimeout(r, 50))
    abortRef.current = false

    const domains = generateDomains(company)
    setResults(domains.map((d) => ({ domain: d, available: undefined })))
    setStatus(STATUS.loading)

    await checkDomains(domains, (result) => {
      if (abortRef.current) return
      setResults((prev) =>
        prev.map((r) => (r.domain === result.domain ? { ...r, ...result } : r))
      )
    })

    setStatus(STATUS.done)
  }

  const available = results.filter((r) => r.available === true)
  const checking = results.filter((r) => r.available === undefined)
  const checked = results.length - checking.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Verificador de Domínios .com.br
          </h1>
          <p className="mt-2 text-gray-500">
            Digite o nome da empresa e veja quais domínios estão disponíveis
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Ex: Empresa ABC Ltda"
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            type="submit"
            disabled={status === STATUS.loading || !company.trim()}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === STATUS.loading ? 'Verificando…' : 'Buscar'}
          </button>
        </form>

        {results.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
              <span>
                {status === STATUS.loading
                  ? `Verificando… (${checked}/${results.length})`
                  : `${results.length} sugestões verificadas`}
              </span>
              {status === STATUS.done && (
                <span className="font-semibold text-green-700">
                  {available.length} disponíve{available.length === 1 ? 'l' : 'is'}
                </span>
              )}
            </div>

            {status === STATUS.loading && (
              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(checked / results.length) * 100}%` }}
                />
              </div>
            )}

            <ul className="space-y-2">
              {results.map(({ domain, available }) => (
                <DomainRow key={domain} domain={domain} available={available} />
              ))}
            </ul>

            <p className="mt-4 text-center text-xs text-gray-400">
              Consulta via RDAP · Registro.br
            </p>
          </>
        )}
      </div>
    </div>
  )
}
