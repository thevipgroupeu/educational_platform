import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { resultId } = await req.json();
    console.log("Analyzing result ID:", resultId);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // 1. Dohvati rezultat (kao u tvojoj skripti)
    const { data: res, error: fetchError } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("id", resultId)
      .single();

    if (fetchError || !res) {
      console.error("Fetch Error:", fetchError);
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const raw = res.raw_answers || {};
    const responses_list = raw.responses || [];
    
    // 2. Formatiranje (Identisano tvojoj skripti)
    let formatted_responses = "";
    responses_list.forEach((r: any, i: number) => {
      const status = r.is_correct ? "CORRECT" : "WRONG";
      formatted_responses += `\nQ${i+1}: ${r.question}\nStudent: ${r.user_answer} | Correct: ${r.correct_answer} (${status})\n`;
    });

    const prompt = `You are a Socratic AI Tutor... [TVOJ CIJELI PROMPT OVDJE] ... 
    DATA: ${formatted_responses}`;

    // 3. Generiraj i Update (Točno kao update u Pythonu)
    const ai_res = await model.generateContent(prompt);
    const explanation = ai_res.response.text();

    const { error: updateError } = await supabase
      .from("quiz_results")
      .update({
        error_description: explanation, // U tvojoj skripti piše error_description!
        status: "analyzed"
      })
      .eq("id", resultId);

    if (updateError) {
      console.error("Update Error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log("✅ Analysis complete for ID:", resultId);
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Crash:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}