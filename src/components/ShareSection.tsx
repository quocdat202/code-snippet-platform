"use client";

interface ShareSectionProps {
  shareUrl: string;
}

export default function ShareSection({ shareUrl }: ShareSectionProps) {
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold mb-3">Share this snippet</h3>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
        />
        <button
          onClick={handleCopyToClipboard}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Copy Link
        </button>
      </div>
    </div>
  );
}
