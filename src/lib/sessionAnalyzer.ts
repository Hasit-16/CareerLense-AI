export function analyzeSession(answers: any[]) {
  const dominant_interests: Set<string> = new Set();
  const rejected_paths: Set<string> = new Set();
  let consistentCount = 0;

  let technical = 0;
  let business = 0;
  let creative = 0;

  for (const a of answers) {
    // Determine the answer string format safely parsing strings natively
    const val = (typeof a === 'string' ? a : (a.selected_option || a.answer || '')).toLowerCase();
    
    let isConsistent = true;

    // Dominant Interests mapping
    if (val.includes('coding') || val.includes('software') || val.includes('tech') || val.includes('computer')) {
      technical++;
      dominant_interests.add('software');
    }
    else if (val.includes('business') || val.includes('commerce') || val.includes('money') || val.includes('finance')) {
      business++;
      dominant_interests.add('commerce');
    }
    else if (val.includes('design') || val.includes('art') || val.includes('creative') || val.includes('draw')) {
      creative++;
      dominant_interests.add('creative');
    }
    else if (val.includes('machine') || val.includes('physics') || val.includes('engineering') || val.includes('practical')) {
      technical++;
      dominant_interests.add('engineering');
    }
    else {
      // If none match exactly, we flag it as an inconsistent logical drift for confidence reduction
      isConsistent = false;
    }

    // Rejected Paths strictly mapping avoidance keywords
    if (val.includes('no lab') || val.includes('avoid lab') || val.includes('theory') || val.includes('hate research')) {
      rejected_paths.add('research');
    }
    if (val.includes('no math') || val.includes('hate math') || val.includes('avoid calculation')) {
      rejected_paths.add('engineering');
    }
    if (val.includes('no business') || val.includes('hate commerce') || val.includes('avoid money')) {
      rejected_paths.add('commerce');
    }

    if (isConsistent) consistentCount++;
  }

  const total = answers.length;
  // Calculate raw aggregate score dynamically matching percentage rules accurately mapped
  const confidence_score = total > 0 ? (consistentCount / total) * 100 : 0;

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
