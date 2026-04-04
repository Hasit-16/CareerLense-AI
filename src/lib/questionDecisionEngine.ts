import fs from 'fs';
import path from 'path';

export function getNextStep(classLevel: string, stream: string | null, previousAnswers: any[]) {
  const is12 = classLevel.includes('12') || classLevel === 'XII';

  let currentPath = is12 ? "Stream Specialization Bounding" : "General Path Behavioral Sorting";

  const dimensions = [
    "thinking_style",
    "work_preference",
    "learning_style",
    "environment_preference",
    "risk_preference"
  ];

  const optionsMappings: Record<string, string[]> = {
    "thinking_style": ["analytical", "practical", "observational", "people-oriented"],
    "work_preference": ["desk and focus", "field and active", "creative and design", "team and collaboration"],
    "learning_style": ["reading logic", "hands-on doing", "listening details", "visualizing concepts"],
    "environment_preference": ["quiet and individual", "fast-paced and dynamic", "outdoor and physical", "structured and routine"],
    "risk_preference": ["stable and safe", "startup and adaptive", "freelance and independent", "research and exploratory"]
  };

  const askedDimensions = previousAnswers.map(ans => ans.dimension);
  
  let dimension = dimensions.find(d => !askedDimensions.includes(d)) || "thinking_style";
  let mappedOptions = optionsMappings[dimension];

  return { currentPath, dimension, mappedOptions };
}
