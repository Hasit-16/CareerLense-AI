'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { supabase } from '@/lib/supabaseClient';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('file', file);

    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch('/api/upload-marksheet', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`
      },
      body: formData,
    });

    const uploadData = await res.json();

    if (uploadData.error) {
      alert(uploadData.error);
    } else {
      const ocrRes = await fetch('/api/extract-marksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: uploadData.filePath })
      });

      const ocrData = await ocrRes.json();

      if (!ocrData.isValid) {
        alert('Invalid marksheet uploaded');
        return;
      }

      alert('Upload & OCR successful');
      window.location.href = '/questions';
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <h1 className="text-2xl font-semibold">Upload Marksheet</h1>

        <input
          type="file"
          className="border p-2 rounded text-sm w-full max-w-sm"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleUpload}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Upload
        </button>
      </div>
    </AppShell>
  );
}
