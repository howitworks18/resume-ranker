// pages/api/extract-text.js
import { NextRequest, NextResponse } from 'next/server';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { helpers, PredictionServiceClient } from '@google-cloud/aiplatform';

// Configuration Variables
const projectId = 'ai-testbed-407219';
const location = 'us';
const processorId = '65471637ce06beb9';
const publisher = 'google';
const model = 'text-unicorn@001';

// Helper Functions
const buildEndpoint = (type, id) => `projects/${projectId}/locations/${location}/${type}/${id}`;
const formatErrorResponse = (message) => JSON.stringify({ error: message });

export async function POST(req: NextRequest) {
    try {
      console.log('Converting PDFs to text...');
      const docAIclient = new DocumentProcessorServiceClient();
      const documentAIEndpoint = buildEndpoint('processors', processorId);
      const formatter = (text) => text.replace(/(\r\n|\n|\r)/gm, "");
  
      const formData = await req.formData();
      const files = formData.getAll('file'); // Retrieve all files
      const jobRequisitionText = formData.get('jobRequisition');
      
      if (files.length === 0) throw new Error('No files found in the request');
  
      const predictionServiceClient = new PredictionServiceClient({ apiEndpoint: 'us-central1-aiplatform.googleapis.com' });
      const predictionEndpoint = buildEndpoint('publishers', `${publisher}/models/${model}`);
  
      let allResponses = [];
  
      for (const file of files) {
        if (typeof file === 'string') continue; // Skip if not a file
  
        const fileBuffer = await file.arrayBuffer();
        const encodedFile = Buffer.from(fileBuffer).toString('base64');
        const documentAIRequest = {
          name: documentAIEndpoint,
          rawDocument: { content: encodedFile, mimeType: 'application/pdf' },
        };
        const [documentAIResult] = await docAIclient.processDocument(documentAIRequest);
        const promptText = `
        You are an advanced hiring assistant programmed with state-of-the-art capabilities in resume analysis and job matching. 
        Your primary task is to evaluate resumes against specific job requisitions with a keen focus on essential skills required. 
        Here's the job requisition: ${formatter(jobRequisitionText)}. Please review the following resume: ${formatter(documentAIResult.document.text)}. 
        When analyzing the resume, first determine if the key skill required (e.g., JavaScript for a programming job) is present. 
        If the key skill is missing, assign a score significantly lower, reflecting the lack of this essential qualification. 
        Provide a confidence score on a scale from 0 to 100 (Confidence Score: 95/100), with the score heavily dependent on the presence of this key skill. 
        Along with the score, include a detailed justification for your evaluation, specifically addressing whether the resume includes the key skill 
        and how well it aligns with the job requisition. Consider other factors such as relevant experience, skills, education, and additional 
        qualifications only if they complement the primary skill requirements. This is the format you should give the response ex: 

        Confidence Score: [confidence score here]
        [new line here]
        Justification: [why they are or are not qualified in sentence formant]
        
        respond with a max of 256 tokens please answer in spanish` //please answer in spanish
        const prompt = { prompt: promptText.replace(/(\r\n|\n|\r)/gm, "") };
        const instances = [helpers.toValue(prompt)];
        const parameters = helpers.toValue({
            temperature: 0.0, maxOutputTokens: 256, topP: 0.95, topK: 40, maxResults: 1
          });
          //add an if else statement
        console.log('Asking PaLM...');
        const [predictionResponse] = await predictionServiceClient.predict({
          endpoint: predictionEndpoint, instances, parameters,
        });
        const predictions = predictionResponse.predictions;
        
        allResponses.push({
            fileName: file.name,
            response: predictions[0].structValue.fields.content.stringValue
          });
        }
  
        return new NextResponse(JSON.stringify({ response: allResponses }), {
            status: 200, headers: { 'Content-Type': 'application/json' },
        });
  
    } catch (error) {
      console.warn('Error: ', error.message);
      return new NextResponse(formatErrorResponse(error.message), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }
  }