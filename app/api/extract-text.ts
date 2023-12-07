// app/api/extract-text.ts
import { NextRequest, NextResponse } from 'next/server';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

export async function POST(req: NextRequest) {
  try {
    // Initialize the Document AI client
    const client = new DocumentProcessorServiceClient();

    // Extract variables from environment
    const projectId = 'ai-testbed-407219';
    const location = 'us';
    const processorId = '65471637ce06beb9';

    // Define the processor name
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // Read the file from the request
    // Note: You need to handle file upload; this is just a placeholder
    const fileBuffer = await req.body; // Adjust this based on your file upload logic

    // Prepare the request for Document AI
    const request = {
      name,
      rawDocument: {
        content: fileBuffer.toString('base64'),
        mimeType: 'application/pdf',
      },
    };

    // Process the document
    const [result] = await client.processDocument(request);

    // Construct a response with the processed data
    return new NextResponse(JSON.stringify({ result: result.document }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Handle any errors
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
