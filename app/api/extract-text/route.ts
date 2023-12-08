// app/api/extract-text.ts
import { NextRequest, NextResponse } from 'next/server';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

export async function POST(req: NextRequest) {
  try {
    // Initialize the Document AI client
    const client = new DocumentProcessorServiceClient();
    const projectId = 'ai-testbed-407219';
    const location = 'us';
    const processorId = '65471637ce06beb9';
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // Parse the multipart/form-data request
    const formData = await req.formData();
    const file = formData.get('file'); // Adjust the key 'file' based on your input's name attribute

    if (!file || typeof file === 'string') {
      throw new Error('File not found in the request');
    }

    // Convert file to a buffer, then to a base64 string
    const fileBuffer = await file.arrayBuffer();
    const encodedFile = Buffer.from(fileBuffer).toString('base64');

    const request = {
      name,
      rawDocument: {
        content: encodedFile,
        mimeType: 'application/pdf',
      },
    };

    const [result] = await client.processDocument(request);

    return new NextResponse(JSON.stringify({ result: result.document }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.warn('extractor error: ', error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
