import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { prompt, imageBase64 } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate content using our utility function, passing both text and image if available
    const result = await generateImage(prompt, imageBase64);
    
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
} 