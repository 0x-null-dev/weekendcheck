"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      setError("wrong password");
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm px-6">
      <h1 className="text-xl font-bold text-white mb-1">
        weekend<span className="text-accent">check</span>
      </h1>
      <p className="text-xs font-mono text-white/30 mb-8">admin login</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          autoFocus
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-accent"
        />
        {error && (
          <p className="text-xs text-red-400 font-mono">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/80 disabled:opacity-50"
        >
          {loading ? "..." : "login"}
        </button>
      </form>
    </div>
  );
}
