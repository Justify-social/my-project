import { useEffect } from 'react'
import { useRouter } from 'next/router'

// This file is needed for Nextra to work with the docs folder
export default function DocsPage() {
  const router = useRouter()
  
  useEffect(() => {
    const { slug } = router.query
    if (slug === undefined) {
      // Redirect to docs home if accessed directly
      router.push('/docs')
    }
  }, [router])
  
  return null
} 