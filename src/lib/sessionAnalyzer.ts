export function analyzeSession(answers: any[]) {
  const dominant_interests: Set<string> = new Set();
  const rejected_paths: Set<string> = new Set();
  let consistentCount = 0;

  let technical = 0;
  let business = 0;
  let creative = 0;

  for (const a of answers) {
    const val = (typeof a === 'string' ? a : (a.selected_option || a.answer || '')).toLowerCase();
    
    let isConsistent = true;

    // Behavioral -> Technical / Logic
    if (val.includes('analytical') || val.includes('logic') || val.includes('focus') || val.includes('startup') || val.includes('reading logic')) {
      technical++;
      dominant_interests.add('software');
      dominant_interests.add('engineering');
    }
    // Behavioral -> Practical / Hands-on
    else if (val.includes('practical') || val.includes('doing') || val.includes('active') || val.includes('hands-on')) {
      technical++;
      dominant_interests.add('engineering');
      rejected_paths.add('commerce'); 
    }
    // Behavioral -> Observational / Research
    else if (val.includes('observational') || val.includes('details') || val.includes('research') || val.includes('quiet')) {
      technical++;
      dominant_interests.add('research');
      dominant_interests.add('medical');
    }
    // Behavioral -> People / Business
    else if (val.includes('people') || val.includes('team') || val.includes('collaboration') || val.includes('management')) {
      business++;
      dominant_interests.add('commerce');
      dominant_interests.add('management');
      rejected_paths.add('research');
    }
    // Behavioral -> Creative / Abstract
    else if (val.includes('creative') || val.includes('visualizing') || val.includes('design') || val.includes('freelance')) {
      creative++;
      dominant_interests.add('creative');
      rejected_paths.add('engineering');
    }
    else {
      // Unmapped generic behaviour 
      isConsistent = false;
    }

    if (isConsistent) consistentCount++;
  }

  const total = answers.length;
  // Calculate raw aggregate score dynamically matching percentage rules accurately mapped
  let confidence_score = total > 0 ? (consistentCount / total) * 100 : 0;
  
  if (total < 3) confidence_score = Math.min(confidence_score, 40);

  let decision_direction = 'undecided';
  if (technical > business && technical > creative) decision_direction = 'technical';
  else if (business > technical && business > creative) decision_direction = 'business';
  else if (creative > technical && creative > business) decision_direction = 'creative';
  else if (total >= 4) decision_direction = 'hybrid'; 

  return {
    dominant_interests: Array.from(dominant_interests),
    rejected_paths: Array.from(rejected_paths),
    confidence_score: Math.round(confidence_score),
    decision_direction
  };
}
