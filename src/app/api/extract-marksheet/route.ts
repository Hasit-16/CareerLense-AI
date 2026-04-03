import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { filePath } = await req.json();

    if (!filePath) {
      return NextResponse.json({ error: 'Missing file path' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: blob, error: downloadError } = await supabaseAdmin.storage
      .from('marksheets')
      .download(filePath);

    if (downloadError || !blob) {
      throw new Error(`Storage download failed: ${downloadError?.message || 'No blob returned'}`);
    }

    const buffer = await blob.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const mimeType = blob.type || 'image/jpeg';

    const prompt = `
Extract marksheet data in strict JSON format:

{
  "board": "",
  "class_level": "",
  "stream": "",
  "subjects": [
    { "name": "", "marks": 0 }
  ],
  "percentage": 0
}

Rules:
- Only return JSON
- No explanation
- "board" MUST be exactly GSEB, CBSE, or ICSE
- "class_level" MUST be exactly 10 or 12
- Detect stream if 12th
`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: base64Image } }
    ]);

    const text = result.response.text();
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (e) {
      console.error('Failed to parse Gemini output:', text);
      return NextResponse.json({ error: 'Invalid AI response from Gemini' }, { status: 500 });
    }

    const board = String(parsed.board || '').toUpperCase();
    const classLevel = String(parsed.class_level || '').toUpperCase();

    const isValid =
      (board.includes('GSEB') || board.includes('CBSE') || board.includes('ICSE')) &&
      (classLevel.includes('10') || classLevel.includes('12') || classLevel === 'X' || classLevel === 'XII');

    await supabaseAdmin
      .from('marksheets')
      .update({
        board: parsed.board,
        class_level: parsed.class_level,
        stream: parsed.stream,
        percentage: parsed.percentage,
        is_valid: isValid
      })
      .eq('file_path', filePath);

    // Fetch marksheetId generated during upload explicitly
    const { data: marksheetRow } = await supabaseAdmin
      .from('marksheets')
      .select('id')
      .eq('file_path', filePath)
      .single();

    const marksheetId = marksheetRow?.id;

    if (marksheetId) {
      // Clear specific legacy subjects on this UUID natively
      await supabaseAdmin.from('subjects').delete().eq('marksheet_id', marksheetId);
      
      const subjectInserts = (parsed.subjects || []).map((sub: any) => ({
        marksheet_id: marksheetId,
        subject_name: sub.name,
        marks: Number(sub.marks) || 0
      }));

      // Flush exact arrays towards subjects component
      if (subjectInserts.length > 0) {
        await supabaseAdmin.from('subjects').insert(subjectInserts);
      }
      
      // Ping feature compiler synchronously to execute analysis
      try {
        const absoluteUrl = new URL('/api/generate-features', req.url).toString();
        await fetch(absoluteUrl, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ marksheetId })
        });
      } catch (triggerError) {
        console.error("Failed to sequence feature gen externally:", triggerError);
      }
    }

    return NextResponse.json({
      success: true,
      isValid,
      data: parsed
    });

  } catch (err: any) {
    console.error("Internal OCR error:", err);
    return NextResponse.json({ error: err?.message || 'OCR failed' }, { status: 500 });
  }
}
