export function generateRecommendation({ features, sessionAnalysis, dataset, classLevel, stream }: any) {
  let rawCourses: any[] = [];
  
  if (classLevel === '10' && dataset && dataset.after_10th_options) {
      // Stub check explicitly
  } else if (classLevel === '12' && dataset && dataset.after_12th_options) {
    const st = (stream || '').toLowerCase();
    let streamNode = dataset.after_12th_options.find((o: any) => o.stream === st);
    
    if (!streamNode) {
       streamNode = dataset.after_12th_options.find((o: any) => o.stream === 'all_streams_common');
    }
    
    if (streamNode && streamNode.courses) {
       rawCourses = streamNode.courses;
    }
    const commonNode = dataset.after_12th_options.find((o: any) => o.stream === 'all_streams_common');
    if (commonNode && commonNode.courses && st !== 'all_streams_common') {
       rawCourses = [...rawCourses, ...commonNode.courses];
    }
  }

  // Fallback safely generating robust core branches if JSON blocks run empty dynamically avoiding null tier crash sequences explicitly natively!
  if (rawCourses.length === 0) {
     if (classLevel === '10') {
       rawCourses = [
         { category: 'Science Stream (11-12)', courses: ['Science PCM', 'Science PCB'], tags: ['engineering', 'science', 'medical'], difficulty: 'High' },
         { category: 'Commerce Stream (11-12)', courses: ['Commerce with Math', 'Commerce without Math'], tags: ['business', 'commerce', 'finance'], difficulty: 'Medium' },
         { category: 'Arts/Humanities Stream (11-12)', courses: ['Arts'], tags: ['creative', 'writing', 'psychology'], difficulty: 'Medium' },
         { category: 'Diploma Engineering', courses: ['Polytechnic Diploma'], tags: ['engineering', 'practical'], difficulty: 'High' }
       ];
     } else {
       rawCourses = [
         { category: 'General Computing & Tech', courses: ['BCA', 'BSc IT'], tags: ['software'], difficulty: 'Medium' },
         { category: 'Management Pathways', courses: ['BBA', 'BMS'], tags: ['management'], difficulty: 'Medium' },
         { category: 'Creative Boundaries', courses: ['BA', 'Design'], tags: ['creative'], difficulty: 'Low' }
       ];
     }
  }

  const scoredOptions = rawCourses.map((c: any) => {
     let feature_alignment = 0;
     let interest_alignment = 0;
     let feasibility = 0;
     
     const str = JSON.stringify(c).toLowerCase();

     // Mathematical Feature Alignments internally weighted accurately
     if (str.includes('engineering') || str.includes('b.tech') || str.includes('science') || str.includes('pcm')) {
       feature_alignment += ((features.math_strength || 0) * 0.6) + ((features.science_strength || 0) * 0.4);
       if (sessionAnalysis.decision_direction === 'technical') interest_alignment += 50;
       if (sessionAnalysis.rejected_paths.includes('engineering')) interest_alignment -= 50;
       if (sessionAnalysis.dominant_interests.includes('engineering') || sessionAnalysis.dominant_interests.includes('software')) interest_alignment += 40;
     } 
     else if (str.includes('medical') || str.includes('mbbs') || str.includes('nursing') || str.includes('pcb')) {
       feature_alignment += (features.science_strength || 0) * 0.9 + (features.overall_score || 0) * 0.1;
       if (sessionAnalysis.decision_direction === 'technical') interest_alignment += 30;
       if (sessionAnalysis.rejected_paths.includes('research')) interest_alignment -= 50;
     }
     else if (str.includes('com') || str.includes('finance') || str.includes('business') || str.includes('ca')) {
       feature_alignment += (features.commerce_strength || 0) * 0.8 + (features.math_strength || 0) * 0.2;
       if (sessionAnalysis.decision_direction === 'business') interest_alignment += 50;
       if (sessionAnalysis.rejected_paths.includes('commerce')) interest_alignment -= 50;
       if (sessionAnalysis.dominant_interests.includes('commerce')) interest_alignment += 40;
     }
     else if (str.includes('art') || str.includes('design') || str.includes('media')) {
       feature_alignment += (features.language_strength || 0) * 0.6 + (features.humanities_strength || 0) * 0.4;
       if (sessionAnalysis.decision_direction === 'creative') interest_alignment += 50;
       if (sessionAnalysis.dominant_interests.includes('creative')) interest_alignment += 40;
     } else {
       feature_alignment += features.overall_score || 50;
       if (sessionAnalysis.decision_direction === 'hybrid') interest_alignment += 40;
     }

     // Structural Feasibility penalty logic mapping bounds directly
     feasibility = features.overall_score || 50;
     if (c.difficulty === 'Very High' && (features.overall_score || 0) < 70) {
        feasibility -= 30; 
     }
     if (c.difficulty === 'High' && (features.overall_score || 0) < 60) {
        feasibility -= 20;
     }

     // Normalizing baselines cleanly preventing math logic inversions iteratively
     feature_alignment = Math.max(0, Math.min(100, feature_alignment));
     interest_alignment = Math.max(0, Math.min(100, 50 + interest_alignment)); 

     const score = (feature_alignment * 0.4) + (interest_alignment * 0.4) + (feasibility * 0.2);

     return {
        name: c.category || c.courses?.[0] || 'Targeted Career Pathway',
        details: c,
        score: Math.round(score)
     };
  });

  scoredOptions.sort((a, b) => b.score - a.score);

  const top3 = scoredOptions.slice(0, 3);
  let best = top3[0];
  if (!best) {
     best = { name: "General Education Exploration", details: {}, score: 50 };
  }

  return {
    best_match: { name: best.name, score: best.score, details: best.details },
    alternatives: top3.length > 1 ? top3.slice(1).map(x => ({ name: x.name, score: x.score })) : [],
    confidence_score: Math.round((best.score + (sessionAnalysis.confidence_score || 50)) / 2)
  };
}
