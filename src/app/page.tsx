import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="text-4xl font-bold max-w-3xl">
          CareerLens AI
        </h1>
        <p className="mt-4 max-w-2xl text-gray-600">
          AI-powered career decision platform for Indian students.
        </p>

        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/signup" className="rounded bg-black px-5 py-3 text-white">
            Get Started
          </Link>
          <Link href="/login" className="rounded border border-black/20 px-5 py-3">
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
