// app/api/extract-text.ts
import { NextRequest, NextResponse } from 'next/server';
import { VisionClient } from '@google-cloud/vision';

export async function POST(req: NextRequest) {
  try {
    const client = new VisionClient();

    // Assuming the PDF file is sent in the request body or as a reference
    // You'll need to extract the file or its reference from `req`
    const [result] = await client.documentTextDetection(/* Your PDF file or reference here */);
    const fullText = result.fullTextAnnotation.text;

    return NextResponse.json({ text: fullText });
  } catch (error) {
    console.error('Error in extract-text API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
