'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('AI analizira PDF i generira kviz... Molim pričekaj.');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setStatus(`Uspjeh! Kviz "${data.title}" je kreiran.`);
        // Nakon 2 sekunde, pošalji učitelja da vidi taj kviz
        setTimeout(() => {
          router.push(`/lessons/${data.quizId}`);
        }, 2000);
      } else {
        setStatus('Greška: ' + data.error);
      }
    } catch (err) {
      setStatus('Došlo je do pogreške prilikom slanja.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-10 mt-10 bg-white border rounded-[2rem] shadow-xl text-slate-900">
      <h1 className="text-3xl font-bold mb-6 text-center">Novi AI Kviz 📄</h1>
      <p className="text-slate-500 text-center mb-8">
        Učitaj PDF materijale, a naš AI Mentor će automatski pripremiti pitanja za tvoje učenike.
      </p>

      <div className="space-y-6">
        <div className="border-4 border-dashed border-slate-100 rounded-2xl p-10 text-center hover:border-blue-200 transition-all">
          <input 
            type="file" 
            accept=".pdf" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
            uploading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? 'Generiranje u tijeku...' : 'GENERIRAJ KVIZ'}
        </button>

        {status && (
          <p className={`text-center font-medium ${status.includes('Greška') ? 'text-red-500' : 'text-blue-600'}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}