'use client';

import { useState } from 'react';
import { signUp } from '@/services/auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    const { error } = await signUp(email, password);
    if (error) alert(error.message);
    else alert('Check your email for verification');
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-semibold">Sign Up</h1>
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
      <button onClick={handleSignup} className="bg-black text-white px-4 py-2 rounded">
        Sign Up
      </button>
    </main>
  );
}
