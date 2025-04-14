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
    return <p className="text-gray-500 font-body">No audience targeting data available</p>;

  return (
    <div className="space-y-4 font-body">
      {/* Locations */}
      <div className="font-body">
        <span className="font-medium font-body">Locations: </span>
        {data.locations?.length > 0 ? (
          <span className="text-gray-700 font-body">{data.locations.join(', ')}</span>
        ) : (
          <span className="text-gray-500 font-body">No locations selected</span>
        )}
      </div>

      {/* Age Groups */}
      <div className="font-body">
        <span className="font-medium font-body">Age Groups: </span>
        {data.ageRanges?.length > 0 ? (
          <span className="text-gray-700 font-body">{data.ageRanges.join(', ')}</span>
        ) : (
          <span className="text-gray-500 font-body">No age groups selected</span>
        )}
      </div>

      {/* Genders */}
      <div className="font-body">
        <span className="font-medium font-body">Genders: </span>
        {data.genders?.length > 0 ? (
          <span className="text-gray-700 font-body">{data.genders.join(', ')}</span>
        ) : (
          <span className="text-gray-500 font-body">No genders selected</span>
        )}
      </div>

      {/* Languages */}
      <div className="font-body">
        <span className="font-medium font-body">Languages: </span>
        {data.languages?.length > 0 ? (
          <span className="text-gray-700 font-body">{data.languages.join(', ')}</span>
        ) : (
          <span className="text-gray-500 font-body">No languages selected</span>
        )}
      </div>
    </div>
  );
};

export default AudienceContent;
