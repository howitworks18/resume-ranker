"use client";

const ConvertPdf = () => {
    const handleFileChange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          console.error('Error in file upload:', response.statusText);
          return;
        }
  
        const result = await response.json();
        // Process the extracted text as needed
      }
    };
  
    return <input type="file" onChange={handleFileChange} accept="application/pdf" />;
  };
  
  export default ConvertPdf;
  