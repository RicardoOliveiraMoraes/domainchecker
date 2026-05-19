const BUSINESS_SUFFIXES = [
  'ltda','me','sa','eireli','ei','ss','epp','sas','lda',
  'sociedade','empresa','comercio','comercial','industria',
  'industrial','servicos','solucoes','group','grupo',
]

const SECTOR_TERMS = {
  tech:         ['tech','digital','sistemas','dev','software','data','cloud','ai'],
  retail:       ['loja','store','shop','vendas','compras','outlet'],
  health:       ['saude','health','med','clinica','bem','estar','vida'],
  education:    ['edu','cursos','learn','escola','academy','formacao'],
  finance:      ['financeiro','fin','capital','invest','contabil','conta'],
  services:     ['solucoes','pro','expert','hub','connect','service'],
  food:         ['food','chef','sabor','gourmet','mesa','nutri'],
  construction: ['construtora','imoveis','obras','engenharia','arq'],
  other:        ['brasil','br','online','web','plus'],
}

const STYLE_PREFIXES = {
  short:       [],
  descriptive: ['grupo','agencia','studio'],
  location:    [],
  creative:    ['get','my','use','go','be','try'],
}

const STYLE_SUFFIXES = {
  short:       [],
  descriptive: ['digital','online','brasil','web'],
  location:    ['sp','rj','br','brasil','mg','rs'],
  creative:    ['hub','lab','io','app','link','hq'],
}

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

export function generateDomainsFromForm({ companyName, sector, keywords = [], audience, style }) {
  if (!companyName.trim()) return []

  const slug = slugify(companyName)
  const words = slug.split('-').filter(Boolean)
  const cleanWords = removeSuffixes(words)
  if (cleanWords.length === 0) return []

  const base = cleanWords.join('')
  const hyphenated = cleanWords.length > 1 ? cleanWords.join('-') : null
  const abbrev = cleanWords.map((w) => w[0]).join('')

  const kwSlugs = keywords
    .map((k) => slugify(k).replace(/-/g, ''))
    .filter((k) => k.length >= 2)

  const sectorTerms = SECTOR_TERMS[sector] || SECTOR_TERMS.other
  const prefixes = STYLE_PREFIXES[style] || []
  const suffixes = STYLE_SUFFIXES[style] || []

  const candidates = new Set()

  // Base
  candidates.add(base)
  if (hyphenated) candidates.add(hyphenated)

  // Short style prioritizes abbreviation
  if (style === 'short' && abbrev.length >= 2 && abbrev !== base) {
    candidates.add(abbrev)
    if (cleanWords.length > 1) {
      candidates.add(cleanWords[0])
      candidates.add(`${cleanWords[0]}${cleanWords[1][0]}`)
    }
  }

  // Sector combinations
  sectorTerms.slice(0, 4).forEach((term) => {
    candidates.add(`${base}${term}`)
    if (style !== 'short') candidates.add(`${term}${base}`)
  })

  // Keyword combinations
  kwSlugs.forEach((kw) => {
    candidates.add(`${base}${kw}`)
    candidates.add(`${kw}${base}`)
    if (cleanWords.length > 1) candidates.add(`${cleanWords[0]}${kw}`)
  })

  // Style prefixes/suffixes
  prefixes.forEach((p) => !base.startsWith(p) && candidates.add(`${p}${base}`))
  suffixes.forEach((s) => !base.endsWith(s) && candidates.add(`${base}${s}`))

  // Audience-specific
  if (audience === 'b2b') {
    candidates.add(`${base}b2b`)
    candidates.add(`${base}empresas`)
  }
  if (audience === 'b2c') {
    candidates.add(`${base}online`)
  }

  return [...candidates]
    .filter((d) => d.length >= 2 && d.length <= 63)
    .map((d) => `${d}.com.br`)
    .slice(0, 20)
}
