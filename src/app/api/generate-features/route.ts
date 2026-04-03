import { NextRequest, NextResponse } from 'next/server';
import { generateAcademicFeatures } from '@/lib/featureEngineering';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { marksheetId } = await req.json();

    if (!marksheetId) {
      return NextResponse.json({ error: 'Missing marksheetId' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch marksheet metadata
    const { data: marksheetRow, error: marksheetError } = await supabaseAdmin
      .from('marksheets')
      .select('id, board, class_level, stream, is_valid')
      .eq('id', marksheetId)
      .single();

    if (marksheetError || !marksheetRow) {
      return NextResponse.json({ error: 'Marksheet not found' }, { status: 404 });
    }

    if (!marksheetRow.class_level) {
      return NextResponse.json({ error: 'Class level missing on marksheet metadata' }, { status: 400 });
    }

    // 2. Fetch associated subjects
    const { data: subjectsData, error: subjectsError } = await supabaseAdmin
      .from('subjects')
      .select('subject_name, marks')
      .eq('marksheet_id', marksheetId);

    if (subjectsError || !subjectsData || subjectsData.length === 0) {
      return NextResponse.json({ error: 'No subjects found for this marksheet' }, { status: 404 });
    }

    const mappedSubjects = subjectsData.map(s => ({
      name: s.subject_name,
      marks: Number(s.marks) || 0
    }));

    // 3. Generate Features
    const featureData = generateAcademicFeatures(
      mappedSubjects,
      marksheetRow.class_level,
      marksheetRow.stream
    );

    // 4. Upsert into features table natively
    await supabaseAdmin
      .from('features')
      .delete()
      .eq('marksheet_id', marksheetId);

    const { error: insertError } = await supabaseAdmin
      .from('features')
      .insert({
        marksheet_id: marksheetId,
        math_strength: featureData.math_strength,
        science_strength: featureData.science_strength,
        commerce_strength: featureData.commerce_strength,
        language_strength: featureData.language_strength,
        humanities_strength: featureData.humanities_strength,
        overall_score: featureData.overall_score,
        weak_subjects: featureData.weak_subjects,
        readiness_scores_json: featureData.readiness_scores_json
      });

    if (insertError) {
      console.error("Feature insert failed:", insertError);
      return NextResponse.json({ error: 'Failed to insert features into database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      features: featureData
    });

  } catch (err: any) {
    console.error("Internal Feature Generator error:", err);
    return NextResponse.json({ error: err?.message || 'Feature Generator failed' }, { status: 500 });
  }
}
