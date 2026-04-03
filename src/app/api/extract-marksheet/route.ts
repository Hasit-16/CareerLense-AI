import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/gemini';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { filePath } = await req.json();

    if (!filePath) {
      return NextResponse.json({ error: 'Missing file path' }, { status: 400 });
    }

    const { data } = supabase.storage
      .from('marksheets')
      .getPublicUrl(filePath);

    const fileUrl = data.publicUrl;

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
      { fileData: { mimeType: "image/jpeg", fileUri: fileUrl } }
    ]);

    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 });
    }

    const validBoards = ['GSEB', 'CBSE', 'ICSE'];
    const validClasses = ['10', '12'];

    const isValid =
      validBoards.includes(parsed.board) &&
      validClasses.includes(parsed.class_level);

    await supabase
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

  } catch (err) {
    return NextResponse.json({ error: 'OCR failed' }, { status: 500 });
  }
}
