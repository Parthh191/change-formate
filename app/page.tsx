'use client';
import { useState } from 'react';
import { FORMAT_GROUPS, isLibreOfficeFormat, isValidFormat, getValidConversions } from './utils/formats';
import Background from './components/Background';
import Footer from './components/Footer';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState('pdf');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (file) {
      if (isValidFormat(file)) {
        setSelectedFile(file);
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        const validFormats = getValidConversions(extension);
        if (validFormats.length > 0) {
          setTargetFormat(validFormats[0]);
        }
      } else {
        setError('Unsupported file format. Please select a valid file.');
        setSelectedFile(null);
      }
    }
  };

  const handleConvert = () => {
    // Implement conversion logic here
    console.log('Converting:', selectedFile?.name, 'to', targetFormat);
  };

  return (
    <>
      <Background />
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          <div className="max-w-4xl w-full space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                File Format Converter
              </h1>
              <p className="text-gray-400 text-lg">Transform your files with ease</p>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_50px_-12px] shadow-purple-500/20 border border-gray-800/50">
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-700/50 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 transition-all duration-300 group relative overflow-hidden">
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
                  >
                    {Object.entries(FORMAT_GROUPS).map(([key, group]) => (
                      <optgroup key={key} label={group.name} className="bg-gray-800">
                        {group.formats.map(format => (
                          <option key={format} value={format}>
                            {format.toUpperCase()} {isLibreOfficeFormat(format) ? '(LibreOffice)' : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  <button
                    onClick={handleConvert}
                    disabled={!selectedFile}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
                  >
                    Convert Now
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300 hover:transform hover:scale-105">
                <h3 className="font-semibold mb-2 text-purple-300">Fast & Secure</h3>
                <p className="text-gray-400 text-sm">Convert your files instantly with complete privacy</p>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300 hover:transform hover:scale-105">
                <h3 className="font-semibold mb-2 text-purple-300">Multiple Formats</h3>
                <p className="text-gray-400 text-sm">Support for all popular file formats</p>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800/50 hover:border-purple-500/30 transition-all duration-300 hover:transform hover:scale-105">
                <h3 className="font-semibold mb-2 text-purple-300">Free to Use</h3>
                <p className="text-gray-400 text-sm">No registration required, convert files for free</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
