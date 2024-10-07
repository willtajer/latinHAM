import dynamic from 'next/dynamic'

const LatinHamGame = dynamic(() => import('../components/LatinHamGame'), { ssr: false })

export default function Home() {
  return <LatinHamGame />
}