export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'student' | 'teacher'
          learning_style: string
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          role: 'student' | 'teacher'
          learning_style?: string
          created_at?: string
        }
        Update: {
          full_name?: string
          role?: 'student' | 'teacher'
          learning_style?: string
        }
      }
      lessons: {
        Row: {
          id: string
          title: string
          content_text: string | null
          video_url: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content_text?: string | null
          video_url?: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          profile_id: string
          lesson_id: string
          seconds_on_page: number
          materials_opened_count: number
          last_access: string
        }
        Insert: {
          id?: string
          profile_id: string
          lesson_id: string
          seconds_on_page?: number
          materials_opened_count?: number
          last_access?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          profile_id: string
          lesson_id: string
          score_percentage: number
          raw_answers: any // JSONB polje
          error_description: string | null
          ai_feedback: string | null
          status: 'pending' | 'processed'
        }
        Insert: {
          id?: string
          profile_id: string
          lesson_id: string
          score_percentage: number
          raw_answers: any
          error_description?: string | null
          ai_feedback?: string | null
          status?: 'pending' | 'processed'
        }
      }
    }
  }
}