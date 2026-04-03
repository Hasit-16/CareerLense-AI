'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from '@/services/auth';
import type { User } from '@supabase/supabase-js';
import AppShell from '@/components/layout/AppShell';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        window.location.href = '/login';
      } else {
        setUser(currentUser);
      }
    }
    loadUser();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <AppShell>
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p>{user.email}</p>
      <button onClick={async () => { await signOut(); window.location.href = '/login'; }} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </AppShell>
  );
}
