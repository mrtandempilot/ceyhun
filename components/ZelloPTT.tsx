'use client';

import React, { useState } from 'react';

export default function ZelloPTT() {
  const [showEmbedded, setShowEmbedded] = useState(false);

  const zelloUrl = process.env.NEXT_PUBLIC_ZELLO_WEB_URL || 'https://skywalkersparagliding.zellowork.com/';

  if (showEmbedded) {
    return (
      <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Zello Work - Skywalkerspara Network</h3>
          <button
            onClick={() => setShowEmbedded(false)}
            className="text-gray-400 hover:text-white text-sm"
          >
            Hide
          </button>
        </div>
        <div className="bg-gray-800 rounded border border-gray-600" style={{ height: '600px' }}>
          <iframe
            src={zelloUrl}
            className="w-full h-full rounded"
            title="Zello Work - Skywalker"
            allow="microphone; autoplay; clipboard-write"
          />
        </div>
        <p className="text-gray-400 text-xs mt-2">
          Full Zello Work web interface - Login to communicate with the team
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg p-4 mb-6 border border-gray-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            📡
          </div>
          <div>
            <h3 className="text-white font-semibold">Zello Communication</h3>
            <p className="text-gray-400 text-sm">skywalkerspara.zellowork.com</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={zelloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition"
          >
            Open Zello
          </a>
          <button
            onClick={() => setShowEmbedded(true)}
            className="bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium py-2 px-4 rounded transition"
          >
            Embed Here
          </button>
        </div>
      </div>

      <div className="mt-3 p-3 bg-gray-800 rounded text-sm">
        <p className="text-gray-300 mb-2">
          <strong>Operations Channel:</strong> Login to your Zello Work account to communicate live with pilots and staff during operations.
        </p>
        <div className="text-gray-400 space-y-1">
          <p>• Real-time voice communication</p>
          <p>• Push-to-talk functionality</p>
          <p>• Weather updates, safety coordination</p>
        </div>
      </div>
    </div>
  );
}
