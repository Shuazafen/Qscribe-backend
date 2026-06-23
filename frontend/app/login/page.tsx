"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { login, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ApiError & { general?: string }>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // clear field error on edit
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!form.username.trim()) {
      setErrors({ username: "Username is required." });
      return;
    }
    if (!form.password) {
      setErrors({ password: "Password is required." });
      return;
    }

    setLoading(true);
    try {
      await login({ username: form.username, password: form.password });
      router.push("/dashboard");
    } catch (err) {
      const apiErr = err as ApiError & { error?: string };
      if (apiErr.error) {
        setErrors({ general: apiErr.error });
      } else {
        setErrors(apiErr);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(89,225,132,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-3xl border border-foreground/10 p-8 sm:p-10 backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.03)",
            boxShadow:
              "0 0 80px rgba(89,225,132,0.08), inset 0 0 40px rgba(89,225,132,0.02)",
          }}
        >
          {/* Logo / heading */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block mb-4">
              <span className="text-3xl font-black tracking-tight">
                <span className="text-foreground">Q</span>
                <span className="text-primary">SCRIBE</span>
              </span>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-foreground/50">
              Log in to continue your journey.
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
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-username"
                className="text-xs font-semibold uppercase tracking-widest text-foreground/50"
              >
                Username
              </label>
              <input
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                placeholder="your_username"
                className={`w-full rounded-xl border px-4 py-3 text-sm text-foreground placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[##982598]/40 ${errors.username
                    ? "border-red-500/60 bg-red-500/5"
                    : "border-foreground/10 bg-foreground/5 focus:border-[##982598]/40"
                  }`}
              />
              {errors.username && (
                <p className="text-xs text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="login-password"
                className="text-xs font-semibold uppercase tracking-widest text-foreground/50"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-foreground placeholder-white/20 outline-none transition-all focus:ring-2 focus:ring-[##982598]/40 ${errors.password
                      ? "border-red-500/60 bg-red-500/5"
                      : "border-foreground/10 bg-foreground/5 focus:border-[##982598]/40"
                    }`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-foreground/40 hover:text-[##982598] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 font-semibold uppercase tracking-wide text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 bg-primary"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Log In"
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-foreground/40">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[##982598] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
