'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b">
      <Link href="/" className="text-xl font-semibold">
        CareerLens AI
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm">
          Login
        </Link>
        <Link href="/signup" className="text-sm font-medium">
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
