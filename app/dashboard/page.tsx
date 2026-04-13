'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  // IMPORTANT: Ensure this matches the ID used in your Quiz page
  const TEST_PROFILE_ID = "daeea2c1-48a4-4066-967e-b6d43cbd2b1e";

  useEffect(() => {
  async function fetchResults() {
    console.log("Fetching results for:", TEST_PROFILE_ID);

    const { data, error } = await supabase
      .from('quiz_results')
      .select(`
        id,
        score_percentage,
        status,
        ai_feedback,
        created_at,
        lessons (title)
      `)
      .eq('profile_id', TEST_PROFILE_ID)
      .order('created_at', { ascending: false });

    if (error) {
      // OVO ĆE TI U KONZOLI (F12) TOČNO REĆI ŠTO NIJE U REDU
      console.error("SUPABASE ERROR DETAILS:", error.message);
      console.error("ERROR HINT:", error.hint);
      setLoading(false);
      return;
    }

    if (data) {
      setResults(data);
    }
    setLoading(false);
  }

  fetchResults();
}, [supabase]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-bold text-slate-600">Loading your progress...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-8 bg-slate-50 min-h-screen text-slate-900">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Student Dashboard 🚀</h1>
        <p className="text-slate-500 font-medium">Track your performance and AI-driven insights.</p>
      </header>

      <div className="grid gap-8">
        {results.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-lg">No quizzes completed yet. Time to start learning!</p>
          </div>
        ) : (
          results.map((res) => (
            <div key={res.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{res.lessons?.title || "Topic Analysis"}</h2>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                    {new Date(res.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                
                {/* Score Indicator */}
                <div className={`px-8 py-4 rounded-3xl font-black text-3xl shadow-sm ${
                  res.score_percentage >= 80 ? 'bg-emerald-50 text-emerald-600' : 
                  res.score_percentage >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {res.score_percentage}%
                </div>
              </div>

              {/* AI Feedback Section */}
              <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="text-xl">🧠</span> Socratic AI Mentor
                </h3>
                
                {res.status === 'pending' ? (
                  <div className="flex items-center gap-4 text-slate-500 italic font-medium">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    AI is analyzing your learning patterns...
                  </div>
                ) : (
                  <div className="text-slate-700 leading-relaxed whitespace-pre-line font-medium italic">
                    {res.ai_feedback || "No feedback available for this session."}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}