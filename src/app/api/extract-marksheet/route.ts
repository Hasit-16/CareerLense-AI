import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logStep } from '@/lib/logger';
import Tesseract from 'tesseract.js';
import { generateJSONWithCohere } from '@/lib/cohere';

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
    const rawImageBuffer = Buffer.from(buffer);

    logStep("STARTING TESSERACT OCR", "Evaluating buffer structure...");
    const { data: { text: rawText } } = await Tesseract.recognize(rawImageBuffer, 'eng');
    logStep("OCR RAW TEXT", rawText);

    const prompt = `
Extract marksheet data precisely into this JSON format based on the following chaotic OCR text:

{
  "board": "GSEB, CBSE, or ICSE",
  "class_level": "10 or 12",
  "stream": "Science, Commerce, Arts (if 12th only)",
  "subjects": [
    { "name": "Subject Name", "marks": 0 }
  ],
  "percentage": 0.0
}

Raw Unstructured OCR Text:
${rawText}

Rules:
- Strictly return valid JSON. No explanations.
- Try to detect percentage accurately.
- Stream can be empty if class 10.
`;

    const text = await generateJSONWithCohere(prompt);
    
    const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    logStep("NORMALIZED TEXT", cleanText);

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (e) {
      logStep("ERROR", "Failed to parse Gemini output: " + text);
      return NextResponse.json({ error: 'Invalid AI response from Gemini' }, { status: 500 });
    }

    logStep("PARSED DATA", parsed);
    logStep("RAW SUBJECT LINES", parsed.subjects);
    logStep("SUBJECTS EXTRACTED", parsed.subjects);

    const board = String(parsed.board || '').toUpperCase();
    logStep("BOARD DETECTED", board);
    
    const classLevel = String(parsed.class_level || '').toUpperCase();
    logStep("CLASS DETECTED", classLevel);
    
    logStep("STREAM DETECTED", parsed.stream);

    const isValid =
      (board.includes('GSEB') || board.includes('CBSE') || board.includes('ICSE')) &&
      (classLevel.includes('10') || classLevel.includes('12') || classLevel === 'X' || classLevel === 'XII');

    logStep("VALIDATION RESULT", {
      board: parsed.board,
      class_level: parsed.class_level,
      stream: parsed.stream,
      isValid
    });

    logStep("PERCENTAGE CALCULATED", parsed.percentage);
    logStep("DB UPDATE PAYLOAD", {
      filePath,
      parsed
    });

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
    logStep("ERROR", err);
    return NextResponse.json({ error: err?.message || 'OCR failed' }, { status: 500 });
  }
}
