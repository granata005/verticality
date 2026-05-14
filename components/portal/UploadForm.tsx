"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Client, Project } from "@/lib/db";

const DELIVERABLE_KINDS = [
  "seo_audit",
  "ads_audit",
  "seo_report",
  "ads_report",
  "strategy",
  "other",
];

export function UploadForm({
  clients,
  initialClientId,
  initialProjects,
}: {
  clients: Client[];
  initialClientId?: string;
  initialProjects: Project[];
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState(initialClientId ?? "");
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("seo_audit");
  const [file, setFile] = useState<File | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProjects(selectedClientId: string) {
    if (!selectedClientId) {
      setProjects([]);
      return;
    }
    const res = await fetch(`/api/admin/clients/${selectedClientId}/projects`);
    if (res.ok) {
      const data = await res.json();
      setProjects(data.projects);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !title || !file) {
      setError("Client, title, and file are required.");
      return;
    }
    if (!projectId && !newProjectName) {
      setError("Select an existing project or enter a new project name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("clientId", clientId);
      body.append("projectId", projectId);
      body.append("newProjectName", newProjectName);
      body.append("title", title);
      body.append("kind", kind);
      body.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Upload failed");
      }

      router.push(`/admin/clients/${clientId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client
        </label>
        <select
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value);
            setProjectId("");
            loadProjects(e.target.value);
          }}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          required
        >
          <option value="">Select a client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project
        </label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          disabled={!clientId}
        >
          <option value="">— Create new project —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {!projectId && (
          <input
            type="text"
            placeholder="New project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. SEO Audit — May 2026"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kind
        </label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          {DELIVERABLE_KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File
        </label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50 text-sm"
      >
        {loading ? "Uploading..." : "Upload Deliverable"}
      </button>
    </form>
  );
}
