import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Use environment variable for API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

// Initialize the Gemini API
export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Generate content based on text prompt and optional image
export async function generateImage(prompt: string, imageBase64?: string) {
  try {
    // Use Gemini 2.0 Flash model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    // Prepare content parts
    const parts = [];

    // Add text prompt
    parts.push({ text: prompt });

    // Add image if provided
    if (imageBase64) {
      // Extract the base64 data from the data URL if needed
      const base64Data = imageBase64.split(",")[1] || imageBase64;

      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg", // Adjust based on your image type
        },
      });
    }

    // Generate content
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw new Error("Failed to generate content");
  }
}

// Check if the API key is valid
export async function validateApiKey() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Hello" }] }],
    });
    return true;
  } catch (error) {
    console.error("Invalid API key or API error:", error);
    return false;
  }
}
