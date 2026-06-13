import React from "react";

interface DoubtClarityPopupProps {
  isOpen: boolean;
  onResponse: (isClear: boolean) => void;
}

export const DoubtClarityPopup: React.FC<DoubtClarityPopupProps> = ({ isOpen, onResponse }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Are you understanding?
          </h3>
          
          <p className="text-gray-600 mb-6">
            Did my explanation help you understand the concept better?
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={() => onResponse(true)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Yes, I'm understanding
            </button>
            
            <button
              onClick={() => onResponse(false)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Explain Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
