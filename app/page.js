import Image from 'next/image'
import ConvertPdf from './components/ConvertPdf'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ConvertPdf/>
    </main>
  )
}
