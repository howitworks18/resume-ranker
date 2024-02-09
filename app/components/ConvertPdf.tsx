"use client";

import { useState, useRef } from 'react';

const ConvertPdf = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [responseTexts, setResponseTexts] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false); // New state for processing status
    const [jobRequisition, setJobRequisition] = useState(""); // New state for job requisition

    const fileInputRef = useRef(null);

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleFileSelect = (event) => {
      setSelectedFiles([...selectedFiles, ...Array.from(event.target.files)]);
    };

    const handleDrop = (event) => {
      event.preventDefault();
        setSelectedFiles([...selectedFiles, ...Array.from(event.dataTransfer.files)]);
    };

    const handleFileChange = async () => {
      if (selectedFiles.length > 0) {
        setIsProcessing(true);
        let responses = [];
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('jobRequisition', jobRequisition);
          try {
            const response = await fetch('/api/extract-text', {
              method: 'POST',
              body: formData,
            });
    
            if (!response.ok) {
              throw new Error('Error in file upload:', response.statusText);
            }
    
            const result = await response.json();
            console.log('result: ', result);
            // Push each response object
            responses = responses.concat(result.response); 
          } catch (error) {
            console.error(error);
            responses.push({ fileName: file.name, response: error.toString() });
          }
        }
        setResponseTexts(responses);
        setIsProcessing(false);
      }
    };
    
      
      const removeFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
      };

    return (
      <div className="flex flex-col items-center min-w-full justify-center p-4">
      <textarea 
          value={jobRequisition}
          onChange={(e) => setJobRequisition(e.target.value)}
          placeholder="Enter the job description"//Ingrese la solicitud de trabajo
          className="mb-4 p-2 border-2 border-customBlue h-[250px] rounded w-full"
      ></textarea>
      <div 
          className="p-4 border-2 border-dashed border-customBlue rounded-lg cursor-pointer w-full"
          onDragOver={handleDragOver} 
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
      >
          <span>Arrastre y suelte archivos PDF aquí, o haga clic para seleccionar archivos </span>
          {/* <span>Drag and drop PDF files here, or click to select files</span> */}
      </div>
      <ul className="my-4 w-full p-2">
          {selectedFiles.map((file, index) => (
              <li key={index} className="flex justify-between items-center p-2 border-b">
                  <span>{file.name}</span>
                  <span 
                      className="text-red-500 cursor-pointer"
                      onClick={() => removeFile(index)}
                  >
                      &#10005;
                  </span>
              </li>
          ))}
      </ul>
      <input 
          ref={fileInputRef}
          type="file" 
          onChange={handleFileSelect} 
          accept="application/pdf"
          multiple
          className="hidden"
      />
      <button 
          onClick={handleFileChange} 
          disabled={isProcessing}
          className={`bg-customBlue text-white p-2 rounded mt-2 hover:bg-customBlue ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
          {isProcessing ? "Analyzing resumes..." : 'Upload'}
      </button>
      {isProcessing && (
          <img src="/loading.gif" alt="Loading" className="mt-4 h-20" />
      )}
      {responseTexts.map(({ response, fileName }, index) => (
        <div key={index} className="mt-4 p-4 min-w-full border rounded">
          <p className="whitespace-pre-wrap text-sm">
            <b>{fileName} </b>
            {response}
          </p>
        </div>
      ))}
  </div>
    );
};

export default ConvertPdf;
