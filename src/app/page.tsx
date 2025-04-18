"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { logError, resizeImageToDataURL } from "@/lib/errorHandling";
import { toast } from "sonner";

export default function GenerateImage() {
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        setImage(file);
        // Create a preview with resizing for performance
        const resizedImage = await resizeImageToDataURL(file, 800, 800);
        setImagePreview(resizedImage);
      } catch (err) {
        logError(err, "ImageUpload");
        setError("Failed to process image. Please try a different file.");

        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleImageUpload = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      if (!image) {
        toast.error("Please upload an image first.");
        return;
      }
      formData.append("image", image);

      const response = await fetch("/api/gemini", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.result);
      toast.success("Watermark removed successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to process image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Watermark Remover
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powered by Gemini 2.0 Flash - Clean up your images by removing watermarks instantly
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Upload Section */}
            <div className="p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <h2 className="text-2xl font-bold mb-6">Upload Your Image</h2>
              <p className="mb-8 opacity-90">
                Select an image with watermarks that you&apos;d like to remove. Our advanced AI will process it for you.
              </p>

              <div className="mb-6">
                <label 
                  htmlFor="image-upload" 
                  className="group relative flex justify-center items-center h-60 w-full border-2 border-dashed border-white/50 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imagePreview}
                        alt="Selected Image"
                        fill
                        style={{ objectFit: "contain" }}
                        className="rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-white font-medium">
                        Drag & drop your image here or click to browse
                      </p>
                      <p className="text-white/70 text-sm mt-1">
                        Supports JPEG, PNG and other image formats
                      </p>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </label>
              </div>
              
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={!image || loading}
                className={`w-full py-3 px-4 rounded-xl font-medium text-base flex items-center justify-center
                  ${!image || loading 
                    ? 'bg-white/30 cursor-not-allowed' 
                    : 'bg-white text-indigo-600 hover:bg-gray-100'} 
                  transition-colors shadow-sm`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Image...
                  </>
                ) : "Remove Watermark"}
              </button>
            </div>

            {/* Result Section */}
            <div className="p-8 bg-white">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {result ? "Watermark Removed" : "Result"}
              </h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  <div className="flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {result ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 h-80">
                  <Image
                    src={`data:${image?.type};base64,${result}`}
                    alt="Generated Image"
                    fill
                    style={{ objectFit: "contain" }}
                    className="rounded-xl"
                  />
                  <a 
                    href={`data:${image?.type};base64,${result}`} 
                    download="watermark-removed.png"
                    className="absolute bottom-3 right-3 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                  >
                    Download
                  </a>
                </div>
              ) : (
                <div className="h-80 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50">
                  <div className="text-center p-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 font-medium">
                      Processed image will appear here
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Upload an image to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            For personal and non-commercial use only. Maximum image size: 10MB.
          </p>
        </div>
      </div>
    </div>
  );
}
