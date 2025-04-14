import React from 'react';

interface AudienceContentProps {
  data?: {
    locations: string[];
    ageRanges: string[];
    genders: string[];
    languages: string[];
  };
}

const AudienceContent: React.FC<AudienceContentProps> = ({ data }) => {
  if (!data)
    return <p className="text-gray-500 font-work-sans">No audience targeting data available</p>;

  return (
    <div className="space-y-4 font-work-sans">
      {/* Locations */}
      <div className="font-work-sans">
        <span className="font-medium font-work-sans">Locations: </span>
        {data.locations?.length > 0 ? (
          <span className="text-gray-700 font-work-sans">{data.locations.join(', ')}</span>
        ) : (
          <span className="text-gray-500 font-work-sans">No locations selected</span>
        )}
      </div>

      {/* Age Groups */}
      <div className="font-work-sans">
        <span className="font-medium font-work-sans">Age Groups: </span>
        {data.ageRanges?.length > 0 ? (
          <span className="text-gray-700 font-work-sans">{data.ageRanges.join(', ')}</span>
        ) : (
          <span className="text-gray-500 font-work-sans">No age groups selected</span>
        )}
      </div>

      {/* Genders */}
      <div className="font-work-sans">
        <span className="font-medium font-work-sans">Genders: </span>
        {data.genders?.length > 0 ? (
          <span className="text-gray-700 font-work-sans">{data.genders.join(', ')}</span>
        ) : (
          <span className="text-gray-500 font-work-sans">No genders selected</span>
        )}
      </div>

      {/* Languages */}
      <div className="font-work-sans">
        <span className="font-medium font-work-sans">Languages: </span>
        {data.languages?.length > 0 ? (
          <span className="text-gray-700 font-work-sans">{data.languages.join(', ')}</span>
        ) : (
          <span className="text-gray-500 font-work-sans">No languages selected</span>
        )}
      </div>
    </div>
  );
};

export default AudienceContent;
