import { logStep } from '@/lib/logger';

function cleanText(text: string) {
  return text
    .replace(/[^\x00-\x7F\n]/g, " ") // remove weird unicode
    .replace(/[|]/g, " ") // remove table separators
    .replace(/\t/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ ]{2,}/g, " ")
    .toLowerCase()
    .trim();
}

function detectBoard(text: string) {
  if (text.includes("cbse") || text.includes("central board")) return "CBSE";
  if (text.includes("gseb") || text.includes("gujarat")) return "GSEB";
  if (text.includes("icse") || text.includes("indian certificate")) return "ICSE";
  return "UNKNOWN";
}

function extractSubjects(lines: string[]) {
  const subjects: { name: string, marks: number }[] = [];
  const excludeWords = ["total", "percentile", "result", "seat", "grade", "remarks", "overall", "cgpa", "percentage", "position", "roll"];
  
  lines.forEach(line => {
    // Filter requirement: Must contain at least 1 word and at least 2 numbers (code + marks)
    const words = line.match(/[a-z]+/gi);
    const numbers = line.match(/\d+/g);
    
    if (!words || !numbers || numbers.length < 2) return;
    
    if (excludeWords.some(w => line.includes(w))) return;
    
    const nameMatch = line.match(/^[a-z\s]+/i);
    let rawName = nameMatch ? nameMatch[0].trim() : words.join(" ");
    
    // Normalize noisy short subject names
    if (rawName === "bi") rawName = "biology";
    if (rawName === "phys") rawName = "physics";
    if (rawName === "chem") rawName = "chemistry";
    
    if (rawName.length < 2) return;
    
    // Explicitly grab the LAST number in the array
    const lastNumStr = numbers[numbers.length - 1];
    const marks = parseInt(lastNumStr, 10);
    
    if (!isNaN(marks) && marks <= 100) {
      subjects.push({ name: rawName.toUpperCase(), marks });
    }
  });
  
  return subjects;
}

function detectStreamAndClass(text: string, subjects: { name: string, marks: number }[]) {
  let scienceScore = 0;
  let commerceScore = 0;
  let artsScore = 0;

  subjects.forEach(s => {
    const n = s.name.toLowerCase();
    // Fuzzy matching strings explicitly isolating subsets
    if (n.includes("physic") || n.includes("chemist") || n.includes("math") || n.includes("biolog") || n.includes("botany")) scienceScore++;
    if (n.includes("account") || n.includes("econom") || n.includes("business") || n.includes("stat")) commerceScore++;
    if (n.includes("history") || n.includes("geograph") || n.includes("sociolog") || n.includes("politic")) artsScore++;
  });
  
  let stream = "";
  if (scienceScore > commerceScore && scienceScore > artsScore) stream = "Science";
  else if (commerceScore > scienceScore && commerceScore > artsScore) stream = "Commerce";
  else if (artsScore > scienceScore && artsScore > commerceScore) stream = "Arts";
  
  let classLevel = "UNKNOWN";
  if (text.includes("hsc") || text.includes("xii") || text.includes("12") || text.includes("senior")) classLevel = "12";
  else if (text.includes("ssc") || text.includes("x") || text.includes("10") || text.includes("secondary")) classLevel = "10";
  
  if (classLevel === "UNKNOWN") {
    // Mathematical boundary fallback parsing
    if (scienceScore > 0 || commerceScore > 0 || artsScore > 0) {
      classLevel = "12"; 
    } else if (subjects.length > 0) {
      classLevel = "10";
    }
  }

  if (classLevel === "10") stream = "";

  return { stream, classLevel, scienceScore, commerceScore, artsScore };
}

export function parseMarksheet(rawText: string) {
  logStep("[PARSE] Rule-based parsing started", "Sanitizing optical strings.");
  
  const cleaned = cleanText(rawText);
  const lines = cleaned.split("\n").map(l => l.trim()).filter(l => l.length > 5);
  
  logStep("[PARSE DEBUG] Cleaned Lines Count", lines.length);

  const board = detectBoard(cleaned);
  let subjects = extractSubjects(lines);
  
  logStep("[PARSE DEBUG] Extracted Subjects", subjects);
  
  const { stream, classLevel, scienceScore, commerceScore, artsScore } = detectStreamAndClass(cleaned, subjects);
  logStep("[PARSE DEBUG] Stream Scoring", { scienceScore, commerceScore, artsScore });

  // Fallback structural percentage matching
  let percentage = 0;
  const totalMatch = cleaned.match(/total\s*[:\-]?\s*(\d{2,4})/);
  
  if (totalMatch && totalMatch[1] && subjects.length > 0) {
    const rawTotal = parseInt(totalMatch[1], 10);
    percentage = (rawTotal / (subjects.length * 100)) * 100;
  } else if (subjects.length > 0) {
    const totalMarks = subjects.reduce((sum, s) => sum + s.marks, 0);
    percentage = totalMarks / subjects.length;
  }
  
  logStep("[PARSE DEBUG] Final Computed Percentage", percentage);

  if (subjects.length < 4) throw new Error("Validation Failed: Less than 4 subjects reliably detected.");
  if (board === "UNKNOWN") throw new Error("Validation Failed: UNKNOWN Board format.");
  if (classLevel === "UNKNOWN") throw new Error("Validation Failed: UNKNOWN Class level constraints.");
  if (isNaN(percentage) || percentage === 0) throw new Error("Validation Failed: Percentage computation NaN.");

  return {
    board,
    class_level: classLevel,
    stream,
    subjects,
    percentage: parseFloat(percentage.toFixed(2))
  };
}
