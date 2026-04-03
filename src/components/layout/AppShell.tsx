import { ReactNode } from 'react';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">CareerLens AI</h1>
      </div>

      <section className="p-6">
        {children}
      </section>
    </main>
  );
}
