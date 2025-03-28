import React from 'react';

import AssetPreviewProps from '../features/assets/upload/EnhancedAssetPreview';
interface AssetPreviewProps {
  type: 'image' | 'video';
  url: string;
  title: string;
  className?: string;
}

const AssetPreview: React.FC<AssetPreviewProps> = ({ type, url, title, className = '' }) => {
  return (
    <div className={`relative ${className} font-work-sans`}>
      {type === 'video' ?
      <video
        src={url}
        className="w-full h-48 object-cover rounded"
        controls
        aria-label={title} /> :


      <img
        src={url}
        alt={title}
        className="w-full h-48 object-cover rounded" />

      }
    </div>);

};

export default AssetPreview;