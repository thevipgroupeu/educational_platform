'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';

export default function SingleLessonPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createSupabaseClient();

  // Osnovni stateovi
  const [lesson, setLesson] = useState<any>(null);
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);

  // Kviz stateovi
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [allAnswers, setAllAnswers] = useState<any[]>([]);

  // Definicija kviza za Pitagoru (Možeš ovo kasnije vući iz baze)
  const quizQuestions = [
    {
      question: "1. If legs are a=6 and b=8, what is the hypotenuse c?",
      options: ["10", "14", "48", "100"],
      correct: "10"
    },
    {
      question: "2. Which side is ALWAYS the longest in a right triangle?",
      options: ["Side a", "Side b", "Hypotenuse (c)", "They are all equal"],
      correct: "Hypotenuse (c)"
    },
    {
      question: "3. Can we use a² + b² = c² on a triangle with angles 60°, 60°, 60°?",
      options: ["Yes", "No", "Only if it is a large triangle"],
      correct: "No"
    }
  ];

  const isLastSlide = slides.length > 0 && currentSlide === slides.length - 1;
  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;

  // 1. Tajmer u pozadini
  useEffect(() => {
    const timer = setInterval(() => setSeconds(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Dohvaćanje lekcije
  useEffect(() => {
    async function getLesson() {
      if (!id) return;
      const { data } = await supabase.from('lessons').select('*').eq('id', id as string).single();
      if (data) {
        setLesson(data);
        const splitSlides = data.content_text ? data.content_text.split('---') : ["No content."];
        setSlides(splitSlides.map((s: string) => s.trim()));
      }
      setLoading(false);
    }
    getLesson();
  }, [id, supabase]);

  // 3. Logika za prelazak na iduće pitanje ili slanje
  const handleNextAction = async () => {
    if (!selectedOption) return;

    // Spremi trenutni odgovor u niz
    const currentQ = quizQuestions[currentQuestionIndex];
    const answerData = {
      question: currentQ.question,
      user_answer: selectedOption,
      correct_answer: currentQ.correct,
      is_correct: selectedOption === currentQ.correct
    };

    const updatedAnswers = [...allAnswers, answerData];
    setAllAnswers(updatedAnswers);

    if (!isLastQuestion) {
      // Idi na iduće pitanje
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // ZADNJE PITANJE - Šalji sve u bazu
      await submitFinalResults(updatedAnswers);
    }
  };

  const submitFinalResults = async (finalAnswers: any[]) => {
    // !!! ZALIJEPI SVOJ UUID OVDJE !!!
    const TEST_PROFILE_ID = "daeea2c1-48a4-4066-967e-b6d43cbd2b1e"; 

    const correctCount = finalAnswers.filter(a => a.is_correct).length;
    const score = Math.round((correctCount / quizQuestions.length) * 100);

    // Slanje aktivnosti
    await supabase.from('activity_logs').insert([{ 
      lesson_id: id as string,
      profile_id: TEST_PROFILE_ID,
      seconds_on_page: seconds
    }]);

    // Slanje rezultata kviza za AI analizu
    const { error } = await supabase.from('quiz_results').insert([{
      lesson_id: id as string,
      profile_id: TEST_PROFILE_ID,
      score_percentage: score,
      raw_answers: { 
        responses: finalAnswers, 
        total_time: seconds,
        topic: lesson?.title 
      },
      status: 'pending'
    }]);

    if (!error) {
      alert(`Quiz Finished! Score: ${score}%`);
      router.push('/lessons');
    } else {
      console.error(error);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading Lesson...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-10 overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-500" 
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        ></div>
      </div>

      {/* Main Container */}
      <div className="flex-grow flex flex-col justify-center bg-slate-50 border border-slate-200 rounded-[2rem] p-8 md:p-12 shadow-sm mb-10">
        {!isLastSlide ? (
          /* SLIDE CONTENT */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-2xl md:text-3xl text-center leading-relaxed text-slate-800 font-medium italic">
              {slides[currentSlide]}
            </p>
          </div>
        ) : (
          /* QUIZ CONTENT */
          <div className="animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </span>
              <h2 className="text-2xl font-bold mt-4">{quizQuestions[currentQuestionIndex].question}</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              {quizQuestions[currentQuestionIndex].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedOption(opt)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all font-semibold ${
                    selectedOption === opt 
                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-[1.02]' 
                    : 'border-white bg-white hover:border-blue-200 shadow-sm'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center w-full max-w-lg mx-auto pb-10">
        <button
          onClick={() => setCurrentSlide(prev => prev - 1)}
          disabled={currentSlide === 0 || (isLastSlide && currentQuestionIndex > 0)}
          className={`font-bold px-4 py-2 ${currentSlide === 0 ? 'opacity-0' : 'text-slate-400 hover:text-slate-900'}`}
        >
          ← PREVIOUS
        </button>

        {!isLastSlide ? (
          <button
            onClick={() => setCurrentSlide(prev => prev + 1)}
            className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl"
          >
            NEXT SLIDE
          </button>
        ) : (
          <button
            onClick={handleNextAction}
            disabled={!selectedOption}
            className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-xl ${
              selectedOption ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLastQuestion ? 'FINISH & SUBMIT' : 'NEXT QUESTION →'}
          </button>
        )}
      </div>
    </div>
  );
}