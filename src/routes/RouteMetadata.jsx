import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { products } from '../data/products.js'

const SITE_URL = 'https://eden-androids.vercel.app'
const DEFAULT_IMAGE = '/images/backgrounds/home-hero.png'
const DEFAULT_DESCRIPTION =
  'Androides humanoides premium para residências, empresas e operações especializadas.'

const publicPages = {
  '/': {
    title: 'Eden Androids | Androides humanoides premium',
    description:
      'Conheça androides humanoides premium desenvolvidos com engenharia avançada, design humano e protocolos éticos.',
  },
  '/catalog': {
    title: 'Catálogo de androides | Eden Androids',
    description:
      'Explore 24 androides Eden para ambientes domésticos, médicos, educacionais, industriais, corporativos e de segurança.',
  },
  '/about': {
    title: 'Nossa história | Eden Androids',
    description:
      'Conheça a origem da Eden Androids em Londrina, sua trajetória e os valores que orientam o desenvolvimento de tecnologia sintética.',
    image: '/images/about/eden-headquarters-londrina.webp',
  },
}

const privateRoutePrefixes = [
  '/account',
  '/admin',
  '/cart',
  '/checkout',
  '/login',
  '/orders',
  '/register',
]

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.append(element)
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value)
  })
}

function setCanonical(url) {
  let canonical = document.head.querySelector('link[rel="canonical"]')

  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.append(canonical)
  }

  canonical.setAttribute('href', url)
}

function getRouteMetadata(pathname) {
  if (publicPages[pathname]) {
    return { ...publicPages[pathname], indexable: true, type: 'website' }
  }

  if (pathname.startsWith('/product/')) {
    const productId = pathname.slice('/product/'.length)
    const product = products.find((item) => String(item.id) === productId)

    if (product) {
      return {
        title: `${product.name} | Eden Androids`,
        description: product.shortDescription,
        image: product.image,
        indexable: true,
        type: 'product',
      }
    }
  }

  const isPrivateRoute = privateRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  return {
    title: isPrivateRoute
      ? 'Área local | Eden Androids'
      : 'Página não encontrada | Eden Androids',
    description: isPrivateRoute
      ? 'Área local da experiência Eden Androids.'
      : 'A página solicitada não foi encontrada.',
    indexable: false,
    type: 'website',
  }
}

function RouteMetadata() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    const metadata = getRouteMetadata(pathname)
    const canonicalUrl = new URL(pathname, SITE_URL).href
    const imageUrl = new URL(metadata.image ?? DEFAULT_IMAGE, SITE_URL).href
    const description = metadata.description ?? DEFAULT_DESCRIPTION

    document.title = metadata.title
    setCanonical(canonicalUrl)
    setMeta('meta[name="description"]', {
      name: 'description',
      content: description,
    })
    setMeta('meta[name="robots"]', {
      name: 'robots',
      content: metadata.indexable ? 'index, follow' : 'noindex, nofollow',
    })
    setMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: metadata.title,
    })
    setMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    setMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: metadata.type,
    })
    setMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: canonicalUrl,
    })
    setMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: imageUrl,
    })
    setMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    })
    setMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: metadata.title,
    })
    setMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    })
    setMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: imageUrl,
    })
  }, [pathname])

  return null
}

export default RouteMetadata
