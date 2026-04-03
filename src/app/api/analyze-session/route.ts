import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { analyzeSession } from '@/lib/sessionAnalyzer';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId bounds' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: answers, error } = await supabaseAdmin
      .from('answers')
      .select('*')
      .eq('session_id', sessionId);

    if (error || !answers) {
      return NextResponse.json({ error: 'Failed to fetch answers mapped natively' }, { status: 500 });
    }

    const analysis = analyzeSession(answers);

    return NextResponse.json({ success: true, analysis });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to calculate analysis intelligently.' }, { status: 500 });
  }
}
