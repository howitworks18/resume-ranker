// app/api/extract-text.ts
import { NextRequest, NextResponse } from 'next/server';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { TextServiceClient } from "@google-ai/generativelanguage";
import { GoogleAuth } from "google-auth-library";

export async function POST(req: NextRequest) {
  try {
    // Initialize the Document AI client
    const docAIclient = new DocumentProcessorServiceClient();
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

    const documentAIRequest = {
      name,
      rawDocument: {
        content: encodedFile,
        mimeType: 'application/pdf',
      },
    };
    const [documentAIResult] = await docAIclient.processDocument(documentAIRequest);
    console.log('Starting resume assessment...');
    // PaLM API integration
    const MODEL_NAME = "models/text-bison-001";
    const API_KEY = process.env.PALM_API_KEY; // Ensure this is set in your environment variables
    
    const palmClient = new TextServiceClient({
        authClient: new GoogleAuth().fromAPIKey(API_KEY),
    });
    
    
    const jobRequisition = "applicant must know JavaScript";
    const messageContent = `You are an advanced hiring assistant programmed with state-of-the-art capabilities in resume analysis and job matching. Your task is to evaluate resumes against specific job requisitions meticulously. Here's the job requisition: ${jobRequisition}. Please review the following resume: ${documentAIResult.document.text}. After a thorough analysis, provide a confidence score on a scale from 0 to 100, indicating how well this resume matches the job requisition. Along with the score, include a detailed justification for your evaluation, highlighting key aspects of the resume that align with or deviate from the job requirements. Consider factors such as relevant experience, skills, education, and any additional qualifications specified in the job requisition. If the applicant posses one or less of the required skills give them a score of 50 or below, the more required skills the posses, give them a higher score.`

    const palmRequest = {
        model: MODEL_NAME,
        temperature: 0.0,
        candidateCount: 1,
        prompt: {
            context: `Evaluate this resume against the job requisition: ${jobRequisition}`,
            text: messageContent
        }
    }

    const palmResult = await palmClient.generateText(palmRequest);
    const palmResponse = palmResult[0].candidates[0].output;

    console.log('PaLM says: ', palmResponse);

    return new NextResponse(JSON.stringify({ result: documentAIResult.document, palmResponse }), {
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
