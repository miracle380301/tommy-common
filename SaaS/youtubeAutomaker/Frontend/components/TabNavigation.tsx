import React from "react";

interface Props {
  tabs: string[];
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({ tabs, currentTab, onTabChange }: Props) {
  return (
    <div className="flex space-x-4 border-b mb-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`pb-2 border-b-2 transition font-medium ${
            currentTab === tab ? "border-blue-500 text-blue-600" : "border-transparent text-gray-600 hover:text-blue-600"
          }`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}