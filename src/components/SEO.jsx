import { useEffect } from 'react'

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  noindex = false 
}) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title
    }

    // Update meta tags
    const updateMetaTag = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = name
        document.head.appendChild(meta)
      }
      meta.content = content
    }

    const updatePropertyTag = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }
      meta.content = content
    }

    // Update primary meta tags
    if (description) {
      updateMetaTag('description', description)
      updatePropertyTag('og:description', description)
      updatePropertyTag('twitter:description', description)
    }

    if (keywords) {
      updateMetaTag('keywords', keywords)
    }

    // Update Open Graph tags
    if (title) {
      updatePropertyTag('og:title', title)
      updatePropertyTag('twitter:title', title)
    }

    if (url) {
      updatePropertyTag('og:url', url)
      updatePropertyTag('twitter:url', url)
    }

    if (image) {
      updatePropertyTag('og:image', image)
      updatePropertyTag('twitter:image', image)
    }

    updatePropertyTag('og:type', type)

    // Handle robots meta tag
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow')
    } else {
      updateMetaTag('robots', 'index, follow')
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url || window.location.href

  }, [title, description, keywords, image, url, type, noindex])

  return null
}

export default SEO 