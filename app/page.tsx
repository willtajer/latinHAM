import dynamic from 'next/dynamic'

const ParentComponent = dynamic(() => import('../components/ParentComponent'), { ssr: false })

export default function Home() {
  return <ParentComponent />
}