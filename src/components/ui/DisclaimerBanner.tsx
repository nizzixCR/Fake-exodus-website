import React, { useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const DisclaimerBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-exodus-accent bg-opacity-10 text-exodus-accent p-3 rounded-lg mb-4 flex items-center justify-between">
      <div className="flex items-center">
        <FiAlertTriangle className="mr-2 flex-shrink-0" />
        <p className="text-sm">
          <strong>Disclaimer:</strong> This is a demonstration interface only. This is not a real cryptocurrency wallet and does not connect to any blockchain. All data is simulated and modifiable in the settings.
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="p-1 hover:bg-exodus-accent hover:bg-opacity-20 rounded-full"
      >
        <FiX />
      </button>
    </div>
  );
};

export default DisclaimerBanner;
