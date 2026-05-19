const BUSINESS_SUFFIXES = [
  'ltda', 'me', 'sa', 'eireli', 'ei', 'ss', 'epp', 'sas',
  'lda', 'sociedade', 'empresa', 'comercio', 'comercial',
  'industria', 'industrial', 'servicos', 'solucoes', 'group', 'grupo',
]

const PREFIXES = ['grupo', 'agencia', 'studio', 'digital', 'tech']
const SUFFIXES = ['digital', 'tech', 'web', 'online', 'br', 'brasil', 'solucoes']

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function removeSuffixes(words) {
  return words.filter((w) => !BUSINESS_SUFFIXES.includes(w))
}

export function generateDomains(companyName) {
  if (!companyName.trim()) return []

  const slug = slugify(companyName)
  const words = slug.split('-').filter(Boolean)
  const cleanWords = removeSuffixes(words)

  if (cleanWords.length === 0) return []

  const base = cleanWords.join('')
  const hyphenated = cleanWords.join('-')
  const abbrev = cleanWords.map((w) => w[0]).join('')

  const candidates = new Set()

  candidates.add(base)
  if (cleanWords.length > 1) candidates.add(hyphenated)
  if (abbrev.length >= 2 && abbrev !== base) candidates.add(abbrev)

  if (cleanWords.length > 1) {
    candidates.add(cleanWords[0])
    candidates.add(cleanWords[cleanWords.length - 1])
  }

  PREFIXES.forEach((p) => {
    if (!base.startsWith(p)) candidates.add(`${p}${base}`)
  })

  SUFFIXES.forEach((s) => {
    if (!base.endsWith(s)) candidates.add(`${base}${s}`)
  })

  if (cleanWords.length > 1) {
    SUFFIXES.forEach((s) => {
      if (!cleanWords[0].endsWith(s)) candidates.add(`${cleanWords[0]}${s}`)
    })
  }

  return [...candidates]
    .filter((d) => d.length >= 2 && d.length <= 63)
    .map((d) => `${d}.com.br`)
    .slice(0, 20)
}
