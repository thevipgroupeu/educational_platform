'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';

export default function SingleLessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createSupabaseClient();

  // Stateovi za lekciju i pitanja
  const [lesson, setLesson] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stateovi za kviz
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [allAnswers, setAllAnswers] = useState<any[]>([]);
  const [seconds, setSeconds] = useState(0);

  // 1. Timer koji prati vrijeme rješavanja
  useEffect(() => {
    const timer = setInterval(() => setSeconds(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Dohvaćanje podataka o lekciji/kvizu iz Supabase-a
  useEffect(() => {
    async function getLessonData() {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id as string)
        .maybeSingle();

      if (error) {
        console.error('Error fetching lesson:', error);
      } else if (data) {
        setLesson(data);
        // Provjeravamo imamo li generirana pitanja iz PDF-a (quiz_data stupac)
        if (data.quiz_data && Array.isArray(data.quiz_data)) {
          setQuizQuestions(data.quiz_data);
        } else {
          // Fallback ako nema pitanja u bazi (za testiranje)
          setQuizQuestions([
            {
              question: "Sample Question: What is 2+2?",
              options: ["3", "4", "5"],
              correct: "4"
            }
          ]);
        }
      }
      setLoading(false);
    }
    getLessonData();
  }, [id, supabase]);

  const isLastQuestion = currentIdx === quizQuestions.length - 1;

  // 3. Logika za prelazak na iduće pitanje ili završetak
  const handleNext = async () => {
    if (!selectedOption) return;

    const currentQ = quizQuestions[currentIdx];
    const answerData = {
      question: currentQ.question,
      user_answer: selectedOption,
      correct_answer: currentQ.correct,
      is_correct: selectedOption === currentQ.correct
    };

    const updatedAnswers = [...allAnswers, answerData];
    setAllAnswers(updatedAnswers);

    if (!isLastQuestion) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      await submitFinalResults(updatedAnswers);
    }
  };

  // 4. Slanje rezultata i pokretanje AI analize
  const submitFinalResults = async (finalAnswers: any[]) => {
    // Koristimo tvoj UUID za testiranje
    const TEST_PROFILE_ID = "daeea2c1-48a4-4066-967e-b6d43cbd2b1e"; 

    const correctCount = finalAnswers.filter(a => a.is_correct).length;
    const score = Math.round((correctCount / quizQuestions.length) * 100);

    // Spremamo u 'quiz_results' tablicu
    const { data, error } = await supabase.from('quiz_results').insert([{
      lesson_id: id as string,
      profile_id: TEST_PROFILE_ID,
      score_percentage: score,
      raw_answers: { 
        responses: finalAnswers, 
        total_time: seconds,
        topic: lesson?.title 
      },
      status: 'pending' // AI će ovo promijeniti u 'analyzed'
    }]).select().single();

    if (error) {
      console.error("Database Save Error:", error);
      return;
    }

    // POKRETANJE ANALIZE: Šaljemo signal našoj API ruti
    if (data) {
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId: data.id })
      }).catch(err => console.error("AI Analysis Trigger Error:", err));
    }

    // Odmah šaljemo učenika na Dashboard
    router.push('/dashboard');
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-500">Loading your AI quiz...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-10 overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-500" 
          style={{ width: `${((currentIdx + 1) / quizQuestions.length) * 100}%` }}
        ></div>
      </div>

      {/* Quiz Card */}
      <div className="flex-grow flex flex-col justify-center bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm mb-10">
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {lesson?.title || 'Quiz'} • Question {currentIdx + 1} of {quizQuestions.length}
            </span>
            <h2 className="text-3xl font-extrabold mt-4 text-slate-800 leading-tight">
              {quizQuestions[currentIdx]?.question}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
            {quizQuestions[currentIdx]?.options.map((opt: string) => (
              <button
                key={opt}
                onClick={() => setSelectedOption(opt)}
                className={`p-5 rounded-2xl border-2 text-left transition-all font-bold text-lg ${
                  selectedOption === opt 
                  ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-[1.02]' 
                  : 'border-white bg-white hover:border-blue-200 shadow-sm text-slate-600 hover:text-slate-800'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center w-full pb-10">
        <button
          onClick={handleNext}
          disabled={!selectedOption}
          className={`px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-2xl ${
            selectedOption 
            ? 'bg-slate-900 text-white hover:bg-blue-600 transform hover:-translate-y-1' 
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isLastQuestion ? 'SUBMIT & SEE ANALYSIS' : 'NEXT QUESTION →'}
        </button>
      </div>
    </div>
  );
}