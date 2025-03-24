"use client";

import React, { useState, useEffect } from "react";

interface Gif {
  id: string;
  url: string;
}

interface GifGalleryProps {
  onSelect: (gifUrl: string) => void;
}

/**
 * A grid-based GIPHY search.
 * - Expects NEXT_PUBLIC_GIPHY_API_KEY in .env.local
 * - onSelect(gifUrl) is called when the user clicks a GIF.
 */
export default function GifGallery({ onSelect }: GifGalleryProps) {
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [searchTerm, setSearchTerm] = useState("trending");

  useEffect(() => {
    const fetchGifs = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
        if (!apiKey) {
          console.error("No GIPHY API key found (NEXT_PUBLIC_GIPHY_API_KEY).");
          return;
        }
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(
            searchTerm
          )}&limit=20`
        );
        const json = await response.json();
        const gifsData: Gif[] = json.data.map((item: any) => ({
          id: item.id,
          url: item.images.fixed_height.url
        }));
        setGifs(gifsData);
      } catch (error) {
        console.error("Error fetching GIFs:", error);
      }
    };

    fetchGifs();
  }, [searchTerm]);

  return (
    <div className="font-work-sans">
      <input
        type="text"
        placeholder="Search GIFs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded mb-2 w-full font-work-sans" />

      <div className="grid grid-cols-3 gap-2 font-work-sans">
        {gifs.map((gif) =>
        <img
          key={gif.id}
          src={gif.url}
          alt="gif"
          className="cursor-pointer rounded"
          onClick={() => onSelect(gif.url)} />

        )}
      </div>
    </div>);

}