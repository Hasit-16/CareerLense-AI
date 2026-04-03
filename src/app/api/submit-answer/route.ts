import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { questionId, selectedOption, sessionId } = await req.json();

    if (!questionId || !selectedOption || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields including bounds' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get question data
    const { data: question } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 400 });
    }

    // Prevent duplicate answer natively matching the bounds
    const { data: existing } = await supabaseAdmin
      .from('answers')
      .select('*')
      .eq('question_id', questionId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Already answered uniquely' }, { status: 400 });
    }

    const { error: insertError } = await supabaseAdmin
      .from('answers')
      .insert([
        {
          session_id: sessionId,
          question_id: questionId,
          selected_option: selectedOption,
          dimension: question.dimension || 'unknown',
          question_text: question.question_text
        }
      ]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to submit answer securely.' }, { status: 500 });
  }
}
