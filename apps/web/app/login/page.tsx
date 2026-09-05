"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const session = await login(email, password);
      if (session.user.role === "RETAILER") {
        router.push("/retailer/dashboard");
      } else if (session.user.role === "DISPATCHER") {
        router.push("/dispatcher");
      } else if (session.user.role === "RIDER") {
        router.push("/rider");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm bg-card border border-border rounded-lg p-10">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">
          Reflex<span className="text-amber">.</span>
        </h1>
        <p className="text-sm text-slate mb-7">Sign in</p>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-ink mb-1.5 mt-4" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-border rounded-md bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
          />
          <label className="block text-sm font-semibold text-ink mb-1.5 mt-4" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2.5 border border-border rounded-md bg-paper text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
          />
          <div className="text-danger text-sm mt-3 min-h-[18px]">{error}</div>
          <button
            type="submit"
            className="w-full mt-2 py-3 bg-ink text-paper font-display font-semibold rounded-md hover:opacity-90 transition-opacity"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
