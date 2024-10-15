import dynamic from 'next/dynamic'

// Dynamically import ParentComponent with server-side rendering (SSR) disabled
// This is useful for components that rely on browser-specific APIs or should only render on the client side
const ParentComponent = dynamic(() => import('../components/ParentComponent'), { ssr: false })

// Home page component that renders the dynamically imported ParentComponent
export default function Home() {
  return <ParentComponent />
}
