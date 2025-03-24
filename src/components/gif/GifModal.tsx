"use client";

import React from "react";
import GifGallery from "./GifGallery";

interface GifModalProps {
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
}

/**
 * A modal containing the GifGallery for GIPHY search.
 * When user selects a GIF, onSelectGif(gifUrl) is called,
 * and we close the modal.
 */
export default function GifModal({ onClose, onSelectGif }: GifModalProps) {
  const handleSelectGif = (gifUrl: string) => {
    onSelectGif(gifUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 font-work-sans">
      <div className="bg-white p-4 rounded w-full max-w-md max-h-[90vh] overflow-auto font-work-sans">
        <h3 className="text-lg font-bold mb-2 font-sora">Search GIPHY</h3>
        <GifGallery onSelect={handleSelectGif} />
        <div className="mt-4 flex justify-end font-work-sans">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded font-work-sans">

            Cancel
          </button>
        </div>
      </div>
    </div>);

}