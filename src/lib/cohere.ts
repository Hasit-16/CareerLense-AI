import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

export async function generateQuestionWithCohere(prompt: string) {
  const response = await cohere.chat({
    model: "command-a-03-2025",
    message: prompt,
    temperature: 0.4,
    responseFormat: { type: "json_object" },
  });
  return response.text;
}

export async function generateJSONWithCohere(prompt: string) {
  const response = await cohere.chat({
    model: "command-a-03-2025",
    message: prompt,
    temperature: 0.1, // Lower temperature natively guarantees strict JSON behavior structurally
    responseFormat: { type: "json_object" },
  });
  return response.text;
}
