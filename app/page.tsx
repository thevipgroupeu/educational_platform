import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to SmartLearn AI</h1>
      <p className="mt-4 text-xl">Your personalized Moodle experience</p>
      <Link 
        href="/lessons" 
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        View Lessons
      </Link>
    </main>
  )
}