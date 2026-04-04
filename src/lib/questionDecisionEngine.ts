import fs from 'fs';
import path from 'path';

export function getNextStep(classLevel: string, stream: string | null, previousAnswers: any[]) {
  const is12 = classLevel.includes('12') || classLevel === 'XII';
  const is10 = !is12;

  let currentPath = "Base Path Exploration";
  let dimension = "path_discovery";
  let allowedDomains: string[] = [];

  try {
    if (is10) {
      const p = path.join(process.cwd(), 'Docs', 'DATA', 'AFTER-10', 'PATHS.JSON');
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      const options = data.after_10th_options;
      
      if (previousAnswers.length === 0) {
        currentPath = "Stream vs Diploma Selection";
        dimension = "path_selection";
        allowedDomains = options.map((o: any) => o.path_name);
      } else {
        currentPath = "Specific Skill Exploration";
        dimension = "specialization_preference";
        const allCareers = options.flatMap((o: any) => o.careers || o.fields || []);
        // Strict boundary randomization
        const shuffled = allCareers.sort(() => 0.5 - Math.random());
        allowedDomains = shuffled.slice(0, 10); 
      }
    } else {
      const p = path.join(process.cwd(), 'Docs', 'DATA', 'AFTER-12', 'PATHS.JSON');
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      const streamNorm = (stream || '').toLowerCase();
      
      let targetStream = data.after_12th_options.find((o: any) => 
        streamNorm.includes(o.stream.substring(0, 3).toLowerCase())
      );
      
      if (!targetStream) {
        targetStream = data.after_12th_options.find((o: any) => o.stream === "all_streams_common");
      }

      const categoryNames = targetStream.courses.map((c: any) => c.category);

      if (previousAnswers.length === 0) {
        currentPath = "Industry Category Selection";
        dimension = "category_interest";
        allowedDomains = categoryNames;
      } else {
        currentPath = "Career Role Alignment";
        dimension = "role_refinement";
        
        let targetCategory = targetStream.courses.find((c: any) => 
          previousAnswers.some(ans => ans.selected_option.includes(c.category.split(' ')[0]))
        );
        
        if (!targetCategory) targetCategory = targetStream.courses[0]; // fallback logically
        
        const allCareers = targetCategory.career_roles || targetCategory.courses || targetCategory.specializations || [];
        allowedDomains = allCareers.slice(0, 8); // Securely restrict array natively
      }
    }
  } catch (e) {
    console.error("Dataset JSON execution bounds fault strictly failing natively:", e);
    allowedDomains = ["Science", "Commerce", "Arts", "Engineering", "Business"];
  }

  // Ensure unique non-empty options
  allowedDomains = [...new Set(allowedDomains)].filter(d => d && d.length > 0);

  return { currentPath, dimension, allowedDomains };
}
