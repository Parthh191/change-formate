'use client';
import Background from './components/Background';
import Footer from './components/Footer';
import ConversionForm from './components/ConversionForm';

export default function Home() {
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
              <ConversionForm />
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
