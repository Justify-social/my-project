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
  if (!data) return <p className="text-gray-500">No audience targeting data available</p>;

  return (
    <div className="space-y-4">
      {/* Locations */}
      <div>
        <span className="font-medium">Locations: </span>
        {data.locations?.length > 0 ? (
          <span className="text-gray-700">{data.locations.join(', ')}</span>
        ) : (
          <span className="text-gray-500">No locations selected</span>
        )}
      </div>

      {/* Age Groups */}
      <div>
        <span className="font-medium">Age Groups: </span>
        {data.ageRanges?.length > 0 ? (
          <span className="text-gray-700">{data.ageRanges.join(', ')}</span>
        ) : (
          <span className="text-gray-500">No age groups selected</span>
        )}
      </div>

      {/* Genders */}
      <div>
        <span className="font-medium">Genders: </span>
        {data.genders?.length > 0 ? (
          <span className="text-gray-700">{data.genders.join(', ')}</span>
        ) : (
          <span className="text-gray-500">No genders selected</span>
        )}
      </div>

      {/* Languages */}
      <div>
        <span className="font-medium">Languages: </span>
        {data.languages?.length > 0 ? (
          <span className="text-gray-700">{data.languages.join(', ')}</span>
        ) : (
          <span className="text-gray-500">No languages selected</span>
        )}
      </div>
    </div>
  );
};

export default AudienceContent;
