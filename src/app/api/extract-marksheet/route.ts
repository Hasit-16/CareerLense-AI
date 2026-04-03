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
- Detect board (GSEB, CBSE, ICSE)
- Detect class level (10th or 12th)
- Detect stream if 12th
`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: base64Image } }
    ]);

    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid AI response from Gemini' }, { status: 500 });
    }

    const validBoards = ['GSEB', 'CBSE', 'ICSE'];
    const validClasses = ['10', '12'];

    const isValid =
      validBoards.includes(parsed.board) &&
      validClasses.includes(parsed.class_level);

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
