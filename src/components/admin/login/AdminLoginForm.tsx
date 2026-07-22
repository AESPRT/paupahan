"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/src/components/ui/Input";

const DEMO_EMAIL = "admin@paupahan.ph";
const DEMO_PASSWORD = "password123";

export function AdminLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handler para mabilisang mai-fill ang demo credentials
  const fillDemoCredentials = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setErrorMessage("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    startTransition(async () => {
      try {
        let token = "";

        // 1. Subukang ikonekta sa totoong REST API backend
        if (process.env.NEXT_PUBLIC_API_URL) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/admin/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            setErrorMessage(data.message || "Maling email o password. Pakisubukan ulit.");
            return;
          }

          token = data.accessToken || data.token;
        }

        // 2. Fallback / Mock Login para sa Demo Account (kung walang backend API)
        if (!token && email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          // Dummy JWT token structure na may role na 'admin'
          token = "demo-admin-jwt-token-access-granted";
        }

        if (!token) {
          setErrorMessage("Maling email o password. Pakisubukan ang demo credentials sa itaas.");
          return;
        }

        // 3. Save token in a cookie para sa middleware.ts
        const expiresAttr = remember
          ? "max-age=315360000;" // Persistent cookie (10 years)
          : ""; // Session cookie (mawawala pag sarado ng browser)

        const isSecure = window.location.protocol === "https:" ? "Secure;" : "";

        document.cookie = `accessToken=${token}; path=/; ${expiresAttr} SameSite=Lax; ${isSecure}`;

        // 4. Redirect sa admin dashboard
        router.push("/admin/dashboard");
        router.refresh();
      } catch (err) {
        console.error("Login request failed:", err);

        // Demo Fallback kapag offline o walang running backend API
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          const expiresAttr = remember ? "max-age=315360000;" : "";
          const isSecure = window.location.protocol === "https:" ? "Secure;" : "";
          document.cookie = `accessToken=demo-admin-jwt-token-access-granted; path=/; ${expiresAttr} SameSite=Lax; ${isSecure}`;

          router.push("/admin/dashboard");
          router.refresh();
          return;
        }

        setErrorMessage("Hindi makakonekta sa server. Pakisuri ang iyong internet connection o gamitin ang demo credentials.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {/* Demo Credentials Box */}
      <div className="rounded-xl border border-forest/20 bg-forest/[0.04] p-3.5 text-xs text-forest-deep">
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider text-forest">
            🔑 Demo Access
          </span>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="rounded-lg bg-forest/10 px-2.5 py-1 text-[11px] font-bold text-forest hover:bg-forest/20"
          >
            Gamitin
          </button>
        </div>
        <div className="mt-2 space-y-0.5 font-mono text-[11.5px] text-muted">
          <p>
            Email: <span className="font-semibold text-forest-deep">{DEMO_EMAIL}</span>
          </p>
          <p>
            Password: <span className="font-semibold text-forest-deep">{DEMO_PASSWORD}</span>
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-xs font-semibold text-coral-deep">
          {errorMessage}
        </div>
      )}

      <Input
        id="email"
        type="email"
        label="Email Address"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="juan@example.com"
        autoComplete="email"
      />

      <Input
        id="password"
        type="password"
        label="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
        rightElement={
          <Link href="/admin/forgot-password" className="text-xs font-semibold text-coral-deep hover:underline">
            Nakalimutan ang password?
          </Link>
        }
      />

      <div className="flex items-center justify-between pt-1">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-line text-forest focus:ring-forest"
          />
          <span className="text-xs font-semibold text-muted">Tandaan ako sa device na ito</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 flex w-full items-center justify-center rounded-full bg-coral px-6 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(225,91,78,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(225,91,78,0.42)] active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Pumapasok...
          </span>
        ) : (
          "Mag-login"
        )}
      </button>
    </form>
  );
}