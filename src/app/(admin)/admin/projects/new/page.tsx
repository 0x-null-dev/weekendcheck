"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProject() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const fd = new FormData(e.currentTarget);

    const position = fd.get("position") ? parseInt(fd.get("position") as string) : null;

    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        url: fd.get("url"),
        xHandle: fd.get("xHandle"),
        logoUrl: fd.get("logoUrl") || "",
        queuePosition: position,
      }),
    });

    if (res.ok) {
      router.push("/admin");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-foreground mb-1">add project</h1>
      <p className="text-xs font-mono text-muted mb-6">
        adds to the queue. set position or leave empty for last. logo auto-generates if empty.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field name="name" label="project name" required placeholder="My Cool Project" />
        <Field name="url" label="project url" type="url" required placeholder="https://..." />
        <Field name="xHandle" label="x handle" required placeholder="handle (no @)" />
        <Field name="logoUrl" label="logo url (optional)" placeholder="auto-generated from project url" />
        <Field name="position" label="queue position (optional)" type="number" placeholder="leave empty for last" />

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
        >
          {saving ? "adding..." : "add to queue"}
        </button>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-mono text-muted mb-1">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
      />
    </div>
  );
}
