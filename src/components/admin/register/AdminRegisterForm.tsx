"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/src/components/ui/Input";
import { registerLandlord } from "@/src/actions/landlord-actions";

export function AdminRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Kunin ang data mula sa URL para sa reference, plan, at customer details
  const referenceNumber = searchParams.get("referenceNumber") || "";
  const plan = searchParams.get("plan") || "";
  const isSuccessPayment = searchParams.get("success") === "true";

  // Direktang i-initialize ang form state gamit ang URL parameters
  const [formData, setFormData] = useState({
    fullName: searchParams.get("name") || "",
    propertyName: "",
    phone: searchParams.get("phone") || "",
    email: searchParams.get("email") || "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const isPaidPlan = plan && plan !== "panimula" && plan !== "free";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
      const data = new FormData();
      data.append("fullName", formData.fullName);
      data.append("propertyName", formData.propertyName);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("password", formData.password);
      
      if (referenceNumber) data.append("referenceNumber", referenceNumber);
      if (plan) data.append("plan", plan);

      const result = await registerLandlord(data);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      router.refresh();
      router.push("/admin/dashboard/home");
    });
  };

  const [errorMessage, setErrorMessage] = useState("");

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {isSuccessPayment && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-xs font-semibold text-green-700">
          ✓ Matagumpay ang iyong pagbabayad! Mangyaring buuin ang iyong account sa ibaba para ma-activate ang iyong napiling plano.
        </div>
      )}

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
        className="mt-3 flex w-full items-center justify-center rounded-full bg-coral px-6 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(225,91,78,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(225,91,78,0.42)] active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Gumagawa ng Account...
          </span>
        ) : (
          isPaidPlan ? "Kumpletuhin at I-activate ang Plano" : "Lumikha ng Libreng Account"
        )}
      </button>
    </form>
  );
}