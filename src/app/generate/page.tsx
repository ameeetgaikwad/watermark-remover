'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { handleApiResponse, logError, resizeImageToDataURL } from '@/lib/errorHandling';

export default function GenerateImage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        
        // Create a preview with resizing for performance
        const resizedImage = await resizeImageToDataURL(file, 800, 800);
        setImagePreview(resizedImage);
      } catch (err) {
        logError(err, 'ImageUpload');
        setError('Failed to process image. Please try a different file.');
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Prepare request data
      const requestData: { prompt: string; imageBase64?: string } = {
        prompt,
      };
      
      // Add image if available
      if (imagePreview) {
        requestData.imageBase64 = imagePreview;
      }
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await handleApiResponse(response);
      setResult(data.result);
    } catch (err) {
      logError(err, 'GeminiRequest');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Gemini 2.0 Flash</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="prompt" className="block mb-2 font-medium">
            Enter your prompt:
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Describe what you want Gemini to generate..."
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Upload an image (optional):
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        
        {imagePreview && (
          <div className="mb-4">
            <div className="relative w-40 h-40 mt-2">
              <Image
                src={imagePreview}
                alt="Selected Image"
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-md"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Content'}
        </button>
      </form>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Generated Content:</h2>
          <div className="border border-gray-200 rounded-md overflow-hidden p-4 bg-gray-50 whitespace-pre-wrap">
            {result}
          </div>
        </div>
      )}
    </div>
  );
} 