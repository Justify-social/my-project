import { useRouter } from 'next/router'
import { useConfig } from 'nextra-theme-docs'

export default {
  logo: <span style={{ fontWeight: 'bold' }}>My Project Documentation</span>,
  project: {
    link: 'https://github.com/Justify-social/my-project',
  },
  docsRepositoryBase: 'https://github.com/Justify-social/my-project/blob/main',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – My Project Docs'
    }
  },
  head: () => {
    const { asPath } = useRouter()
    const { frontMatter } = useConfig()
    return (
      <>
        <meta property="og:title" content={frontMatter.title || 'My Project Documentation'} />
        <meta property="og:description" content={frontMatter.description || 'Documentation for My Project'} />
      </>
    )
  },
  footer: {
    text: `© ${new Date().getFullYear()} My Project Documentation`
  },
  navigation: {
    prev: true,
    next: true
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback'
  },
  editLink: {
    text: 'Edit this page on GitHub'
  },
  sidebar: {
    toggleButton: true
  }
} 