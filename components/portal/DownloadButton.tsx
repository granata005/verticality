"use client";

import { useState } from "react";

export function DownloadButton({ deliverableId }: { deliverableId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}/download`);
      if (!res.ok) {
        throw new Error("Failed to get download URL");
      }
      const { url } = await res.json();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      alert("Download failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
    >
      {loading ? "Preparing..." : "Download"}
    </button>
  );
}
