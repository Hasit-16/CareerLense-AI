'use client';

import { useState } from 'react';
import { signIn } from '@/services/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await signIn(email, password);
    if (error) alert(error.message);
    else window.location.href = '/dashboard';
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <input
        placeholder="Email"
        className="border p-2 rounded text-black"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 rounded text-black"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} className="bg-black text-white px-4 py-2 rounded">
        Login
      </button>
    </main>
  );
}
