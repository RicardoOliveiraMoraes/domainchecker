const RDAP_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://rdap.registro.br'
    : '/rdap'

const DELAY_MS = 300

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function checkDomain(domain) {
  try {
    const res = await fetch(`${RDAP_BASE}/domain/${domain}`, {
      headers: { Accept: 'application/rdap+json' },
    })
    if (res.status === 404) return { domain, available: true }
    if (res.ok) return { domain, available: false }
    return { domain, available: null }
  } catch {
    return { domain, available: null }
  }
}

export async function checkDomains(domains, onResult) {
  for (const domain of domains) {
    const result = await checkDomain(domain)
    onResult(result)
    await sleep(DELAY_MS)
  }
}
