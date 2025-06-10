import React from "react";

interface ActionItemToggleProps {
  includeActionItems: boolean;
  setIncludeActionItems: (value: boolean) => void;
}

const ActionItemsToggle: React.FC<ActionItemToggleProps> = ({
  includeActionItems,
  setIncludeActionItems,
}) => {
  return (
    <div className="mb-4 flex items-center space-x-3">
      <label htmlFor="include-action-items" className="text-sm text-gray-300">
        Generate action items
      </label>
      <button
        id="include-action-items"
        onClick={() => setIncludeActionItems(!includeActionItems)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          includeActionItems ? "bg-blue-600" : "bg-gray-400"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            includeActionItems ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <div className="relative group">
        <span className="text-blue-400 cursor-pointer text-sm font-bold border border-blue-400 rounded-full w-5 h-5 flex items-center justify-center">
          i
        </span>
        <div className="absolute left-6 top-1/2 transform -translate-y-1/2 w-64 bg-gray-800 text-white text-xs rounded-md shadow-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          If enabled, the system will extract clear, actionable next steps from your note content in addition to the summary.
        </div>
      </div>
    </div>
  );
};

export default ActionItemsToggle;