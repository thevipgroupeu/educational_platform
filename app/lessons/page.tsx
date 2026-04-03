import { createSupabaseClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";

// Definiramo tip za lekciju radi lakšeg korištenja
type Lesson = Database['public']['Tables']['lessons']['Row'];

export default async function LessonsPage() {
  // Supabase klijent sada zna strukturu tablice 'lessons'
  const { data, error } = await createSupabaseClient()
    .from('lessons')
    .select('*');

  // Kastamo podatke u naš Lesson tip
  const lessons = data as Lesson[] | null;

  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Available Lessons</h1>
      
      <div className="grid gap-6">
        {lessons && lessons.length > 0 ? (
          lessons.map((lesson) => (
            <div key={lesson.id} className="p-6 border rounded-xl shadow-sm hover:shadow-md transition bg-white">
              <h2 className="text-xl font-bold text-blue-700">{lesson.title}</h2>
              <p className="text-slate-600 mt-2 line-clamp-2">{lesson.content_text}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="px-3 py-1 bg-slate-100 text-xs font-semibold rounded-full uppercase">
                  {lesson.difficulty}
                </span>
                <a 
                  href={`/lessons/${lesson.id}`} 
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Start Lesson →
                </a>
              </div>
            </div>
          ))
        ) : (
          <p>No lessons found. Add some in Supabase Dashboard!</p>
        )}
      </div>
    </div>
  );
}