"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/src/components/ui/Input";

export function AdminRegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    fullName: "",
    propertyName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Hindi magkatugma ang password at confirm password.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Ang password ay dapat hindi bababa sa 6 na karakter.");
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage("Kailangan mong sumang-ayon sa Mga Tuntunin at Patakaran.");
      return;
    }

    startTransition(async () => {
      // Simulating registration logic
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Redirect to admin dashboard on successful registration
      router.push("/admin/dashboard");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {errorMessage && (
        <div className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-xs font-semibold text-coral-deep">
          {errorMessage}
        </div>
      )}

      <Input
        id="fullName"
        type="text"
        label="Kumpletong Pangalan"
        required
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Juan Dela Cruz"
        autoComplete="name"
      />

      <Input
        id="propertyName"
        type="text"
        label="Pangalan ng Paupahan"
        required
        value={formData.propertyName}
        onChange={handleChange}
        placeholder="Hal. Rosales Apartments"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="email"
          type="email"
          label="Email Address"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="juan@example.com"
          autoComplete="email"
        />

        <Input
          id="phone"
          type="tel"
          label="Numero ng Telepono"
          required
          value={formData.phone}
          onChange={handleChange}
          placeholder="09123456789"
          autoComplete="tel"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="password"
          type="password"
          label="Password"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <Input
          id="confirmPassword"
          type="password"
          label="Kumpirmahin ang Password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>

      <div className="flex items-start gap-2 pt-1">
        <input
          id="agreeTerms"
          type="checkbox"
          checked={formData.agreeTerms}
          onChange={handleChange}
          className="mt-0.5 h-4 w-4 rounded border-line text-forest focus:ring-forest cursor-pointer"
        />
        <label htmlFor="agreeTerms" className="text-xs text-muted cursor-pointer">
          Sumasang-ayon ako sa{" "}
          <a href="#" className="font-semibold text-forest-deep underline hover:text-forest">
            Mga Tuntunin sa Serbisyo
          </a>{" "}
          at{" "}
          <a href="#" className="font-semibold text-forest-deep underline hover:text-forest">
            Patakaran sa Privacy
          </a>.
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-3 flex w-full items-center justify-center rounded-full bg-coral px-6 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(225,91,78,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(225,91,78,0.42)] active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Gumagawa ng Account...
          </span>
        ) : (
          "Lumikha ng Libreng Account"
        )}
      </button>
    </form>
  );
}
