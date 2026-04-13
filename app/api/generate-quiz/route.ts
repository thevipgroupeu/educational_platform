import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// 1. DEFINICIJA SHEME - Ovo osigurava da Gemini vrati JSON koji tvoj kod razumije
const schema = {
  type: SchemaType.OBJECT,
  properties: {
    quizTitle: { type: SchemaType.STRING },
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING },
          options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          correct: { type: SchemaType.STRING },
        },
        required: ["question", "options", "correct"],
      },
    },
  },
  required: ["quizTitle", "questions"],
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Niste priložili datoteku." }, { status: 400 });
    }

    // 2. INICIJALIZACIJA GEMINI-JA
    // Provjeri imaš li GEMINI_API_KEY u .env fileu
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      generationConfig: { 
        responseMimeType: "application/json", 
        responseSchema: schema 
      }
    });

    // 3. PRIPREMA PDF-a ZA SLANJE
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const prompt = "Izanaliziraj ovaj dokument i napravi kviz od 10 pitanja s višestrukim izborom na engleskom jeziku. Fokusiraj se na ključne koncepte.";

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: buffer.toString("base64"), mimeType: "application/pdf" } }
    ]);

    const responseText = result.response.text();
    const quizData = JSON.parse(responseText);

    // 4. INICIJALIZACIJA SUPABASE-A
    // Koristimo SERVICE_ROLE_KEY jer on ima dozvolu za pisanje (bypass RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 5. SPREMANJE U TABLICU 'lessons'
    const { data: newQuiz, error: dbError } = await supabase
      .from('lessons')
      .insert([{
        title: quizData.quizTitle || "AI Generirani Kviz",
        content_text: `Kviz generiran iz datoteke: ${file.name}`,
        quiz_data: quizData.questions // Ovo sprema cijeli niz pitanja u JSONB stupac
      }])
      .select()
      .single();

    if (dbError) {
      console.error("Supabase Error:", dbError);
      return NextResponse.json({ error: "Greška pri spremanju u bazu." }, { status: 500 });
    }

    // Vraćamo ID novog kviza tako da ga frontend može odmah otvoriti
    return NextResponse.json({ 
      success: true, 
      quizId: newQuiz.id, 
      title: quizData.quizTitle 
    });

  } catch (error: any) {
    console.error("General Error:", error);
    return NextResponse.json({ error: "Došlo je do pogreške na serveru." }, { status: 500 });
  }
}