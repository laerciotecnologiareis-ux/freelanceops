"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (!error) setSent(true);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-gray-800 p-8 rounded-xl">
          <h1 className="text-2xl font-bold text-white mb-4">Verifique seu e-mail</h1>
          <p className="text-gray-300">Enviamos um link mágico para <strong>{email}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Entrar</h1>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-gray-900 font-semibold px-4 py-3 rounded-lg mb-4 hover:bg-gray-100 transition-colors"
        >
          Entrar com Google
        </button>

        <div className="text-center text-gray-400 mb-4">ou</div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar link mágico"}
          </button>
        </form>
      </div>
    </div>
  );
}
