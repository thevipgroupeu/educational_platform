'use client';
import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import ReactMarkdown from 'react-markdown'; // Instaliraj ovo: npm install react-markdown

export default function Dashboard() {
  const [results, setResults] = useState<any[]>([]);
  const supabase = createSupabaseClient();
  const TEST_PROFILE_ID = "daeea2c1-48a4-4066-967e-b6d43cbd2b1e"; // Isti onaj koji koristiš u page.tsx

  useEffect(() => {
    async function fetchResults() {
      const { data } = await supabase
        .from('quiz_results')
        .select(`
          id,
          score_percentage,
          error_description,
          status,
          created_at,
          lessons ( title )
        `)
        .eq('profile_id', TEST_PROFILE_ID)
        .order('created_at', { ascending: false });
      
      if (data) setResults(data);
    }
    fetchResults();
  }, [supabase]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">My Progress Dashboard</h1>
      
      <div className="grid gap-6">
        {results.map((res) => (
          <div key={res.id} className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-600">{res.lessons?.title}</h2>
              <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                {res.score_percentage}%
              </span>
            </div>

            {res.status === 'pending' ? (
              <p className="text-amber-600 italic">AI is analyzing your results... Please refresh in a moment.</p>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 prose prose-slate max-w-none">
                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-2">AI Mentor Feedback:</h3>
                {/* Ovdje prikazujemo onaj pametni tekst iz baze */}
                <ReactMarkdown>{res.error_description}</ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}