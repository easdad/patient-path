import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-orange-500 p-4 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <div className="bg-white rounded-full p-2">
          <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-white text-xs">+</span>
          </div>
        </div>
        <div className="text-white">
          <h1 className="font-bold text-xl">PATIENT PATH</h1>
          <p className="text-xs">Patient Transport Hub</p>
        </div>
      </Link>
      <button className="text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>
  )
} 