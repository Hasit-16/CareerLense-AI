import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { createClient } from '@supabase/supabase-js';
import { analyzeSession } from '@/lib/sessionAnalyzer';

function getDatasetType(classLevel: string, stream?: string | null) {
  const normLevel = classLevel.replace(/\D/g, '');
  if (normLevel === '10') return 'after_10th';
  if (normLevel === '12') {
    const s = (stream || '').toLowerCase();
    if (s.includes('sci')) return 'after_12th_science';
    if (s.includes('com')) return 'after_12th_commerce';
    if (s.includes('art') || s.includes('hum')) return 'after_12th_arts';
  }
  return 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const { marksheetId, sessionId } = await req.json();

    if (!marksheetId) {
      return NextResponse.json({ error: 'Missing marksheetId' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: featureData } = await supabaseAdmin
      .from('features')
      .select('*')
      .eq('marksheet_id', marksheetId)
      .single();

    if (!featureData) {
      return NextResponse.json({ error: 'Features not found for this marksheet' }, { status: 404 });
    }

    let session = sessionId;
    let marksheetObj: any = null;

    if (!session) {
      const { data: marksheet } = await supabaseAdmin
        .from('marksheets')
        .select('*')
        .eq('id', marksheetId)
        .single();

      if (!marksheet) {
        return NextResponse.json({ error: 'Marksheet not found' }, { status: 404 });
      }
      
      marksheetObj = marksheet;

      const datasetType = getDatasetType(marksheet.class_level, marksheet.stream);

      const { data: newSession, error: sessionError } = await supabaseAdmin
        .from('question_sessions')
        .insert([
          {
            user_id: marksheet.user_id,
            marksheet_id: marksheetId,
            dataset_type: datasetType
          }
        ])
        .select()
        .single();
        
      if (sessionError || !newSession) {
        return NextResponse.json({ error: 'Failed to create question session' }, { status: 500 });
      }

      session = newSession.id;
    } else {
      const { data: marksheet } = await supabaseAdmin
        .from('marksheets')
        .select('*')
        .eq('id', marksheetId)
        .single();
      marksheetObj = marksheet;
    }

    // Pull previously ingested DB constraints natively matching the current node
    const { data: qastate } = await supabaseAdmin
      .from('questions')
      .select('question_text, dimension, answers(selected_option)')
      .eq('session_id', session)
      .order('order_index', { ascending: true });

    let previousAnswers: { question: string; selected_option: string; dimension: string }[] = [];
    const askedDimensions: string[] = [];
    
    if (qastate) {
      previousAnswers = qastate.map(q => {
        if (q.dimension) askedDimensions.push(q.dimension);
        return {
          question: q.question_text,
          selected_option: (q.answers && q.answers.length > 0) ? q.answers[0].selected_option : 'No answer yet',
          dimension: q.dimension || 'unknown'
        };
      }).filter(qa => qa.selected_option !== 'No answer yet');
    }

    // Generate analytical boundaries dynamically mapped securely extracting logic inherently
    let sessionAnalysis = null;
    if (previousAnswers.length > 0) {
      sessionAnalysis = analyzeSession(previousAnswers);
    }

    // Strictly enforce minimum of 5 logical inquiries before executing threshold convergence logic natively
    if (previousAnswers.length >= 10) {
      return NextResponse.json({ success: true, isComplete: true, progress: previousAnswers.length });
    }

    const dataset = marksheetObj ? getDatasetType(marksheetObj.class_level, marksheetObj.stream) : 'unknown';

    const prompt = `
You are an intelligent career guide for Indian students.

Context:
- Class: ${marksheetObj?.class_level || 'Unknown'}
- Stream: ${marksheetObj?.stream || 'Unknown'}
- Features: ${JSON.stringify(featureData)}
- Previous Answers: ${JSON.stringify(previousAnswers)}
- Already Asked Dimensions: ${JSON.stringify(askedDimensions)}
- Dataset: ${dataset}
- Session Analytical Assessment: ${JSON.stringify(sessionAnalysis)}

Your task:
Generate ONE new question that helps decide the best career path natively evaluating the aggregated Session Analytical Assessment if available.

STRICT RULES:
At least 5 questions must be asked 
1. Question must be:
- short (max 12 words)
- simple (10th-grade level English)
- engaging and clear
- no academic jargon

2. Options must be:
- max 4 options
- each option max 6 words
- short, catchy, easy to understand
- NOT sentences

3. Do NOT repeat:
- same idea
- same dimension
- same wording

4. The question MUST:
- depend on previous answers and session analytics inherently resolving boundaries natively!
- explore a new decision dimension uniquely.
- reduce confusion accurately.

5. Dataset restriction:
- If class = 10 \u2192 focus on stream vs diploma
- If class = 12 \u2192 focus on career paths within stream
- NEVER suggest out-of-dataset paths

6. Style:
- feel like asking a student directly
- natural tone
- quick decision-making

7. Stopping logic:
- If you have already confidently traversed >5 boundaries logically tracking confidence actively > 80, explicitly output "is_final": true. Else strictly output false.

Output JSON ONLY:
{
  "question": "",
  "options": ["", "", "", ""],
  "dimension": "",
  "is_final": false
}
`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      console.error("Gemini invalid JSON text generated:", text);
      return NextResponse.json({ error: 'Invalid AI response syntax' }, { status: 500 });
    }
    
    if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length === 0) {
      return NextResponse.json({ error: 'Malformed AI response array format' }, { status: 500 });
    }

    if (parsed.question.length > 120) {
      parsed.question = parsed.question.substring(0, 117) + '...';
    }
    parsed.options = parsed.options.map((opt: string) => {
      if (opt.length > 40) return opt.substring(0, 37) + '...';
      return opt;
    });

    if (parsed.is_final && previousAnswers.length >= 5) {
      return NextResponse.json({ success: true, isComplete: true, progress: previousAnswers.length });
    }

    const { data: savedQuestion, error: questionError } = await supabaseAdmin
      .from('questions')
      .insert([
        {
          session_id: session,
          question_text: parsed.question,
          options_json: parsed.options,
          dimension: parsed.dimension || 'unknown',
          order_index: previousAnswers.length
        }
      ])
      .select()
      .single();

    if (questionError || !savedQuestion) {
      return NextResponse.json({ error: 'Failed to save question natively' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      sessionId: session,
      questionId: savedQuestion.id,
      question: savedQuestion.question_text,
      options: savedQuestion.options_json,
      isComplete: false,
      progress: previousAnswers.length + 1,
      analysis: sessionAnalysis
    });
  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: 'Failed to generate question engine tier' }, { status: 500 });
  }
}
