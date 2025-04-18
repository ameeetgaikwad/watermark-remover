import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const image = data.get("image") as File;

    const imageBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt =
      "Remove the watermark from this image while preserving the original image quality and details.";
    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/png",
          data: base64Image,
        },
      },
    ];
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: contents,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });
    if (!response.candidates || !response.candidates[0].content?.parts) {
      return NextResponse.json(
        { error: "No response from Gemini" },
        { status: 500 }
      );
    }
    // for (const part of response.candidates[0].content.parts) {
    //   // Based on the part type, either show the text or save the image
    //   if (part.text) {
    //     console.log(part.text);
    //   } else if (part.inlineData) {
    //     const imageData = part.inlineData.data;
    //     if (imageData) {
    //       const buffer = Buffer.from(imageData, "base64");
    //     }
    //   }
    // }

    return NextResponse.json(
      {
        result: response.candidates[0].content?.parts[0].inlineData?.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
