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

    const { data, error } = await supabaseAdmin
      .from('answers')
      .insert([
        {
          question_id: questionId,
          session_id: sessionId,
          selected_option: selectedOption
        }
      ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 });
  }
}
