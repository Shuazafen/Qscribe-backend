"use client";

import { useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { register, login, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface FormState {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  university: string;
}

const INITIAL_FORM: FormState = {
  username: "",
  password: "",
  confirmPassword: "",
  email: "",
  first_name: "",
  last_name: "",
  phone_number: "",
  university: "",
};

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [idCard, setIdCard] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState | "id_card_image" | "general", string | string[]>>
  >({});
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setIdCard(file);
    setErrors((prev) => ({ ...prev, id_card_image: undefined }));
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!form.first_name.trim()) newErrors.first_name = "First name is required.";
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required.";
    if (!form.username.trim()) newErrors.username = "Username is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email.";
    if (!form.phone_number.trim())
      newErrors.phone_number = "Phone number is required.";
    if (!form.university.trim()) newErrors.university = "University is required.";
    if (!form.password) newErrors.password = "Password is required.";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!idCard) newErrors.id_card_image = "ID card image is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(
        {
          username: form.username,
          password: form.password,
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          phone_number: form.phone_number,
          university: form.university,
        },
        idCard!
      );

      // Auto-login after registration
      await login({ username: form.username, password: form.password });
      setSuccess(true);

      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      const apiErr = err as ApiError & { detail?: string };
      if (apiErr.detail) {
        setErrors({ general: apiErr.detail });
      } else {
        // Map API field errors (could be arrays) to strings
        const mapped: typeof errors = {};
        Object.entries(apiErr).forEach(([k, v]) => {
          mapped[k as keyof typeof errors] = Array.isArray(v) ? v[0] : v;
        });
        setErrors(mapped);
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 size={56} style={{ color: "#59e184" }} />
          <h2 className="text-2xl font-bold text-white">Account created!</h2>
          <p className="text-white/50 text-sm">Redirecting you to your dashboard…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(89,225,132,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        <div
          className="rounded-3xl border border-white/10 p-8 sm:p-10 backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.03)",
            boxShadow:
              "0 0 80px rgba(89,225,132,0.08), inset 0 0 40px rgba(89,225,132,0.02)",
          }}
        >
          {/* Heading */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block mb-4">
              <span className="text-3xl font-black tracking-tight">
                <span className="text-white">Q</span>
                <span style={{ color: "#59e184" }}>SCRIBE</span>
              </span>
            </Link>
            <h1 className="text-xl font-bold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-white/50">
              Start building better habits today.
            </p>
          </div>

          {/* General error */}
          {errors.general && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={16} className="shrink-0" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <Field
                id="signup-first-name"
                label="First Name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Ada"
                error={errors.first_name}
              />
              <Field
                id="signup-last-name"
                label="Last Name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Lovelace"
                error={errors.last_name}
              />
            </div>

            {/* Username */}
            <Field
              id="signup-username"
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="ada_lovelace"
              autoComplete="username"
              error={errors.username}
            />

            {/* Email */}
            <Field
              id="signup-email"
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ada@example.com"
              autoComplete="email"
              error={errors.email}
            />

            {/* Phone */}
            <Field
              id="signup-phone"
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="+2348012345678"
              autoComplete="tel"
              error={errors.phone_number}
            />

            {/* University */}
            <Field
              id="signup-university"
              label="University"
              name="university"
              value={form.university}
              onChange={handleChange}
              placeholder="University of Lagos"
              error={errors.university}
            />

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="signup-password"
                className="text-xs font-semibold uppercase tracking-widest text-white/50"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className={inputCls(!!errors.password)}
                />
                <TogglePasswordBtn
                  show={showPassword}
                  onToggle={() => setShowPassword((s) => !s)}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="signup-confirm-password"
                className="text-xs font-semibold uppercase tracking-widest text-white/50"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={inputCls(!!errors.confirmPassword)}
                />
                <TogglePasswordBtn
                  show={showConfirm}
                  onToggle={() => setShowConfirm((s) => !s)}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* ID Card Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-white/50">
                Student ID Card
              </label>
              <button
                type="button"
                id="signup-id-card"
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all hover:border-[#59e184]/40 ${
                  errors.id_card_image
                    ? "border-red-500/60 bg-red-500/5 text-red-400"
                    : idCard
                    ? "border-[#59e184]/40 bg-[#59e184]/5 text-[#59e184]"
                    : "border-white/10 bg-white/5 text-white/40"
                }`}
              >
                <Upload size={16} className="shrink-0" />
                <span className="truncate">
                  {idCard ? idCard.name : "Upload ID card image (JPG/PNG)"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {errors.id_card_image && (
                <p className="text-xs text-red-400">{errors.id_card_image}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 font-semibold uppercase tracking-wide text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              style={{ background: "#59e184" }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#59e184] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[#59e184]/40 ${
    hasError
      ? "border-red-500/60 bg-red-500/5"
      : "border-white/10 bg-white/5 focus:border-[#59e184]/40"
  }`;
}

function TogglePasswordBtn({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={show ? "Hide password" : "Show password"}
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

function Field({
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  error,
}: {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  error?: string | string[];
}) {
  const errMsg = Array.isArray(error) ? error[0] : error;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-widest text-white/50"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputCls(!!errMsg)}
      />
      {errMsg && <p className="text-xs text-red-400">{errMsg}</p>}
    </div>
  );
}
