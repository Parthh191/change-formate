import { useState } from 'react';
import { isLibreOfficeFormat, isValidFormat, getValidConversions } from '../utils/formats';
import { canConvertInBrowser, convertImageInBrowser } from '../utils/clientConversion';

export default function ConversionForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('pdf');
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionComplete, setConversionComplete] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);
  const [isDropping, setIsDropping] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file?: File) => {
    setError(null);
    setConversionComplete(false);
    setConvertedFileUrl(null);
    
    if (file) {
      if (isValidFormat(file)) {
        setSelectedFile(file);
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        const validFormats = getValidConversions(extension);
        
        if (validFormats.length > 0) {
          setTargetFormat(validFormats[0]);
        }
        
        // If PDF is selected, show PDF conversion message
        if (extension === 'pdf') {
          setError("Note: PDF conversions may not preserve all formatting. Best results are with text-based PDFs rather than scanned documents.");
        }
      } else {
        setError('Unsupported file format. Please select a valid file.');
        setSelectedFile(null);
      }
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setError(null);
    setConversionComplete(false);
    setConvertedFileUrl(null);

    try {
      const sourceFormat = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      
      // Check if we can convert in the browser
      if (canConvertInBrowser(sourceFormat, targetFormat)) {
        console.log('Using client-side conversion');
        // For image conversions
        if (['png', 'jpg', 'jpeg', 'webp'].includes(sourceFormat) && 
            ['png', 'jpg', 'jpeg', 'webp'].includes(targetFormat)) {
          const convertedBlob = await convertImageInBrowser(selectedFile, targetFormat);
          const url = URL.createObjectURL(convertedBlob);
          setConvertedFileUrl(url);
          setConversionComplete(true);
          setIsConverting(false);
          return;
        }
      }
      
      // Continue with server-side conversion...
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('targetFormat', targetFormat);

      // Check if converting from PDF, which may take longer
      const isPdfSource = selectedFile.name.toLowerCase().endsWith('.pdf');
      const timeout = isPdfSource ? 120000 : 60000; // 2 minutes for PDF, 1 minute for others
      
      // Send request to API with appropriate timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'Conversion failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          console.error('Error parsing error response', e);
        }
        throw new Error(errorMessage);
      }

      // Check content type to verify we got actual file data, not an error response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Unexpected error during conversion');
      }

      // Get the converted file blob
      const blob = await response.blob();
      
      // Verify we got data back
      if (blob.size === 0) {
        throw new Error('The converted file is empty. Conversion may have failed.');
      }
      
      // Create object URL for the blob
      const url = URL.createObjectURL(blob);
      setConvertedFileUrl(url);
      setConversionComplete(true);
    } catch (err) {
      console.error('Conversion error:', err);
      if ((err as Error).name === 'AbortError') {
        setError('Conversion timed out. PDF conversions may take longer than expected or may not be supported for this file type.');
      } else {
        setError(`Error: ${(err as Error).message}`);
      }
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedFileUrl || !selectedFile) return;
    
    const extension = selectedFile.name.split('.').pop() || '';
    const baseFileName = selectedFile.name.replace(`.${extension}`, '');
    const fileName = `${baseFileName}.${targetFormat}`;
    
    const a = document.createElement('a');
    a.href = convertedFileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDropping(true);
  };

  const handleDragLeave = () => {
    setIsDropping(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDropping(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group relative overflow-hidden ${
          isDropping ? 'border-purple-400 bg-purple-500/10' : 'border-gray-700/50 hover:border-purple-500/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
        />
        <label htmlFor="fileInput" className="cursor-pointer block">
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                className="w-16 h-16 text-gray-400 group-hover:scale-110 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
              {selectedFile ? (
                <span className="font-medium text-purple-400">{selectedFile.name}</span>
              ) : (
                'Drop your file here or click to browse'
              )}
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div className="text-red-400 text-sm mt-2 bg-red-500/10 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <select
          value={targetFormat}
          onChange={(e) => setTargetFormat(e.target.value)}
          className="bg-gray-800/50 backdrop-blur text-gray-100 px-6 py-3 rounded-lg border border-gray-700/50 focus:outline-none focus:border-purple-500/50 transition-colors"
          disabled={!selectedFile || isConverting}
        >
          {selectedFile && (
            <optgroup label="Recommended Formats" className="bg-gray-800">
              {getValidConversions(selectedFile.name.split('.').pop()?.toLowerCase() || '').map(format => (
                <option key={format} value={format}>
                  {format.toUpperCase()} {isLibreOfficeFormat(format) ? '(LibreOffice)' : ''}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        <button
          onClick={handleConvert}
          disabled={!selectedFile || isConverting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:hover:scale-100 flex items-center justify-center"
        >
          {isConverting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Converting...
            </>
          ) : (
            'Convert Now'
          )}
        </button>
      </div>

      {conversionComplete && convertedFileUrl && (
        <div className="mt-4 p-4 border border-green-500/30 bg-green-500/10 rounded-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-green-400 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Conversion complete!
            </div>
            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
