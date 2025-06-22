import React from "react";
import {
  DocumentTextIcon,
  TagIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const Dashboard: React.FC = () => {
  return (
    <>
      <main className="bg-[#f8f9fa] text-[#001f3f] py-8 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-8 lg:col-span-2">
              {/* Recently Modified Notes */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <DocumentTextIcon className="w-6 h-6 mr-2 text-[#00d8d8]" />
                  Recently Modified Notes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-lg shadow">
                      <p className="text-gray-600 font-medium">Note Title Placeholder</p>
                      <p className="text-sm text-gray-400">Modified at: --</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Upload Activity Timeline */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <CalendarIcon className="w-6 h-6 mr-2 text-[#00d8d8]" />
                  Upload Activity Timeline
                </h2>
                <div className="border-l-2 border-gray-300 pl-4 space-y-4">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-3 top-1 bg-[#00d8d8] rounded-full w-3 h-3"></div>
                      <p className="text-gray-600">Date Placeholder: Uploaded Note Title</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-8">
              {/* Most Frequent Keywords */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <TagIcon className="w-6 h-6 mr-2 text-[#00d8d8]" />
                  Most Frequent Keywords
                </h2>
                <div className="flex flex-wrap gap-2">
                  {["Keyword1", "Keyword2", "Keyword3", "Keyword4"].map((kw, idx) => (
                    <span key={idx} className="bg-white px-3 py-1 rounded-full shadow text-gray-700">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              {/* Pinned Notes */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <MapPinIcon className="w-6 h-6 mr-2 text-[#00d8d8]" />
                  Pinned Notes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-lg shadow">
                      <p className="text-gray-600 font-medium">Pinned Note Placeholder</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Unified Action Items */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <CheckCircleIcon className="w-6 h-6 mr-2 text-[#00d8d8]" />
                  Action Items (Last Week)
                </h2>
                <ul className="list-disc list-inside space-y-2">
                  {["Action item 1", "Action item 2", "Action item 3"].map((ai, idx) => (
                    <li key={idx} className="text-gray-600">{ai}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;