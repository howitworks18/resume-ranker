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
    
    const jobRequisition = "applicant must know JavaScript"
    const payload = {
        prompt: {
          text: `you are a skilled hiring bot, you are the best at comparing resumes and making sure they fit the job requisition. This is my job requisition: ${jobRequisition}. Provide me a confidence score and a reason why you gave it for this resume:
                ${result.document.text}
                `,
        },
        candidate_count: 1,
      }
  
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta3/models/text-bison-001:generateText?key=AIzaSyAJD-9gBx1CoWjdKUMjz9ALhHzg6Y1xx4s", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
  
      const responseJson = await response.json()

      console.log('PaLM says: ', responseJson)

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
