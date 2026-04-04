import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logStep } from '@/lib/logger';
import Tesseract from 'tesseract.js';
import { parseMarksheet } from '@/lib/parseMarksheet';
import path from 'path';

// Tesseract is used only for raw text extraction.
// No AI provider is used in OCR or parsing.

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

    logStep("[OCR] Tesseract extraction started", "Evaluating buffer structure locally...");
    
    // Natively construct absolute paths using process.cwd() bypassing Next.js /ROOT abstraction bounds natively!
    const workerPath = path.join(process.cwd(), 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js');
    
    // Explicitly configure Tesseract worker avoiding Next.js edge-compilation failures intrinsically
    const worker = await Tesseract.createWorker('eng', 1, {
      workerPath
    });
    
    const { data: { text: rawText } } = await worker.recognize(rawImageBuffer);
    await worker.terminate();
    
    logStep("OCR RAW TEXT", rawText);

    let parsed;
    try {
      parsed = parseMarksheet(rawText);
    } catch (e: any) {
      logStep("ERROR", "Failed to parse OCR limits bounds: " + e.message);
      return NextResponse.json({ error: 'Validation Fault: Imperfect Marksheet Match' }, { status: 500 });
    }

    logStep("PARSED DATA", parsed);
    logStep("SUBJECTS EXTRACTED", parsed.subjects);

    const board = parsed.board;
    logStep("BOARD DETECTED", board);
    
    const classLevel = parsed.class_level;
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
