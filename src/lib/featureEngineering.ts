type SubjectCategory = 'math' | 'science' | 'commerce' | 'language' | 'humanities' | 'other';

export function getSubjectCategory(subjectName: string): SubjectCategory {
  const name = subjectName.toLowerCase();

  // Math
  if (name.includes('math') || name.includes('calculus') || name.includes('algebra') || name.includes('statistics')) return 'math';
  
  // Science
  if (
    name.includes('science') ||
    name.includes('physics') ||
    name.includes('chemistry') ||
    name.includes('biology') ||
    name.includes('botany') ||
    name.includes('zoology')
  ) return 'science';
  
  // Commerce
  if (
    name.includes('account') ||
    name.includes('economics') ||
    name.includes('business') ||
    name.includes('commerce') ||
    name.includes('finance')
  ) return 'commerce';
  
  // Language
  if (
    name.includes('english') ||
    name.includes('gujarati') ||
    name.includes('hindi') ||
    name.includes('sanskrit') ||
    name.includes('language') ||
    name.includes('french') ||
    name.includes('marathi')
  ) return 'language';
  
  // Humanities
  if (
    name.includes('history') ||
    name.includes('geography') ||
    name.includes('sociology') ||
    name.includes('political') ||
    name.includes('psychology') ||
    name.includes('philosophy') ||
    name.includes('arts') ||
    name.includes('civics')
  ) return 'humanities';

  return 'other';
}

export function generateAcademicFeatures(
  subjects: { name: string; marks: number }[],
  classLevel: string,
  stream?: string | null
) {
  const categories: Record<SubjectCategory, number[]> = {
    math: [],
    science: [],
    commerce: [],
    language: [],
    humanities: [],
    other: [],
  };

  const weak_subjects: string[] = [];
  let totalMarks = 0;

  for (const subject of subjects) {
    const marks = Number(subject.marks) || 0;
    
    // Categorize
    const category = getSubjectCategory(subject.name);
    categories[category].push(marks);

    // Track total
    totalMarks += marks;

    // Detect weak
    if (marks < 50) {
      weak_subjects.push(subject.name);
    }
  }

  // Calculate Averages
  const average = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const math_strength = average(categories.math);
  const science_strength = average(categories.science);
  const commerce_strength = average(categories.commerce);
  const language_strength = average(categories.language);
  const humanities_strength = average(categories.humanities);
  
  const overall_score = subjects.length > 0 ? totalMarks / subjects.length : 0;

  // Readiness Scores
  const readiness_scores_json: Record<string, number> = {};
  const normalizedClass = classLevel.toString().replace(/\D/g, ''); // Extract numeric strictly

  if (normalizedClass === '10') {
    readiness_scores_json.science = (math_strength * 0.6) + (science_strength * 0.4);
    readiness_scores_json.commerce = (commerce_strength > 0 ? commerce_strength * 0.7 + language_strength * 0.3 : (math_strength * 0.5 + language_strength * 0.5));
    readiness_scores_json.arts = (language_strength * 0.4) + (humanities_strength > 0 ? humanities_strength * 0.6 : (overall_score * 0.6));
    readiness_scores_json.diploma = (math_strength * 0.5) + (science_strength * 0.5);
  } else if (normalizedClass === '12') {
    const streamType = (stream || '').toLowerCase();
    if (streamType.includes('sci')) {
      readiness_scores_json.engineering = (math_strength * 0.7) + (science_strength * 0.3);
      readiness_scores_json.bsc = (science_strength * 0.7) + (math_strength * 0.3);
      readiness_scores_json.bca = (math_strength * 0.6) + (overall_score * 0.4);
      readiness_scores_json.diploma_fallback = (math_strength * 0.4) + (science_strength * 0.4) + (overall_score * 0.2);
    } else if (streamType.includes('com')) {
      readiness_scores_json.bcom = (commerce_strength * 0.8) + (math_strength * 0.2);
      readiness_scores_json.ca_cs = (commerce_strength * 0.9) + (overall_score * 0.1);
      readiness_scores_json.management = (commerce_strength * 0.5) + (language_strength * 0.5);
      readiness_scores_json.finance_related = (math_strength * 0.6) + (commerce_strength * 0.4);
    } else {
      // Default to Arts
      readiness_scores_json.ba = (humanities_strength * 0.7) + (language_strength * 0.3);
      readiness_scores_json.humanities_careers = (humanities_strength * 0.8) + (overall_score * 0.2);
      readiness_scores_json.design_related = (language_strength * 0.5) + (overall_score * 0.5);
      readiness_scores_json.public_service_related = (humanities_strength * 0.6) + (language_strength * 0.4);
    }
  }

  return {
    math_strength: Math.round(math_strength * 100) / 100,
    science_strength: Math.round(science_strength * 100) / 100,
    commerce_strength: Math.round(commerce_strength * 100) / 100,
    language_strength: Math.round(language_strength * 100) / 100,
    humanities_strength: Math.round(humanities_strength * 100) / 100,
    overall_score: Math.round(overall_score * 100) / 100,
    weak_subjects,
    readiness_scores_json
  };
}
