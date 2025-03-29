import React from 'react';
import { Icon } from "@/components/ui/atoms/icons";

// This CSS hides the native calendar controls across all major browsers
const dateInputStyle = `
  /* Hide native calendar icon in Chrome, Edge, Safari */
  input[type="date"]::-webkit-calendar-picker-indicator {
    display: none !important;
    -webkit-appearance: none;
    opacity: 0;
  }
  
  /* Override browser styles for date inputs */
  input[type="date"] {
    position: relative;
    appearance: textfield; /* Firefox */
    -webkit-appearance: textfield; /* Chrome, Safari */
    -moz-appearance: textfield; /* Firefox */
  }
  
  /* Special handling for IE/Edge older versions */
  input[type="date"]::-ms-clear,
  input[type="date"]::-ms-reveal {
    display: none;
  }
  
  /* Make sure date input has proper padding for our custom icon */
  .date-input-container {
    position: relative;
  }
  
  .date-input-container input {
    padding-right: 30px; /* Make room for our custom icon */
  }
  
  .date-input-container .calendar-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none; /* Let clicks pass through to the input */
  }
`;

const SaveIconTest: React.FC = () => {
  return (
    <div className="p-6 font-work-sans">
      <h1 className="text-xl font-bold mb-4 font-sora">Date Input Test</h1>
      
      {/* Add the CSS to the page */}
      <style>{dateInputStyle}</style>
      
      <div className="space-y-6 font-work-sans">
        <div className="font-work-sans">
          <h2 className="text-lg font-semibold mb-2 font-sora">Problem: Native Calendar Icon Shows</h2>
          <input
            type="date"
            defaultValue="2023-10-15"
            className="border border-gray-300 rounded-md p-2 font-work-sans" />

        </div>
        
        <div className="font-work-sans">
          <h2 className="text-lg font-semibold mb-2 font-sora">Solution: Custom Calendar Icon</h2>
          <div className="date-input-container font-work-sans">
            <input
              type="date"
              defaultValue="2023-10-15"
              className="border border-gray-300 rounded-md p-2 w-full font-work-sans" />

            <div className="calendar-icon font-work-sans">
              <Icon name="faCalendar" className="h-4 w-4 text-gray-500 font-work-sans" solid={false} />
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-md font-work-sans">
          <h2 className="text-lg font-semibold mb-2 font-sora">Implementation Guide</h2>
          <ol className="list-decimal pl-5 space-y-2 font-work-sans">
            <li className="font-work-sans">Add the CSS style block to your global CSS</li>
            <li className="font-work-sans">Wrap your date inputs in a <code>.date-input-container</code> div</li>
            <li className="font-work-sans">Add the custom icon inside the container</li>
          </ol>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md font-work-sans">
          <h3 className="font-medium mb-2 font-sora">Test Save Icon:</h3>
          <div className="flex space-x-4 font-work-sans">
            <div className="font-work-sans">
              <p className="font-work-sans">Light Save Icon:</p>
              <Icon name="faSaveLight" className="h-6 w-6" />
            </div>
            <div className="font-work-sans">
              <p className="font-work-sans">Solid Save Icon:</p>
              <Icon name="faSave" className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default SaveIconTest;