"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  fetchHabits,
  fetchSavings,
  fetchTransactions,
  createHabit,
  updateHabit,
  deleteHabit,
  createSaving,
  createTransaction,
  logout,
  isTierPermissionError,
  type User,
  type Habit,
  type Saving,
  type TransactionData,
} from "@/lib/api";
import {
  LogOut,
  Target,
  PiggyBank,
  TrendingUp,
  Zap,
  Bell,
  CheckCircle2,
  Clock,
  Flame,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Dog,
  Shield,
  Lock,
  Plus,
  X,
  Rocket,
  Star,
  CreditCard,
  Trash2,
} from "lucide-react";

// ─── Color Palette (matches globals.css) ──────────────────────────
const COLORS = {
  primary: "#FFCF95",
  secondary: "#982598",
  green: "#59E184",
  pink: "#E159A2",
  gold: "#FFCF95",
} as const;

// ─── Mock data for beta demo ─────────────────────────────────────
const MOCK_HABITS: Habit[] = [
  { id: 1, name: "Morning Run", goal: "Run 2km every morning", is_completed: true, created_at: "2026-07-01", updated_at: "2026-07-10" },
  { id: 2, name: "Deep Work", goal: "3 hours focused coding", is_completed: true, created_at: "2026-07-01", updated_at: "2026-07-10" },
  { id: 3, name: "Evening Journal", goal: "Write 500 words", is_completed: false, created_at: "2026-07-01", updated_at: "2026-07-10" },
  { id: 4, name: "Read 20 Pages", goal: "Read 20 pages daily", is_completed: false, created_at: "2026-07-01", updated_at: "2026-07-10" },
  { id: 5, name: "Meditate", goal: "10 min meditation", is_completed: true, created_at: "2026-07-01", updated_at: "2026-07-10" },
  { id: 6, name: "Hydrate", goal: "Drink 2L of water", is_completed: false, created_at: "2026-07-01", updated_at: "2026-07-10" },
];

const MOCK_SAVINGS: Saving[] = [
  { id: 1, goal_name: "New Laptop", target_amount: "500000.00", current_amount: "150000.00", interest_rate: "0.00", created_at: "2026-06-01" },
  { id: 2, goal_name: "Emergency Fund", target_amount: "300000.00", current_amount: "75000.00", interest_rate: "0.00", created_at: "2026-06-15" },
  { id: 3, goal_name: "Vacation Trip", target_amount: "200000.00", current_amount: "45000.00", interest_rate: "5.00", created_at: "2026-07-01" },
];

const MOCK_TRANSACTIONS: TransactionData[] = [
  { id: 1, amount: "50000.00", transaction_type: "deposit", description: "Freelance payment", created_at: "2026-07-09T10:30:00Z" },
  { id: 2, amount: "15000.00", transaction_type: "withdrawal", description: "Data subscription", created_at: "2026-07-08T14:20:00Z" },
  { id: 3, amount: "100000.00", transaction_type: "deposit", description: "Monthly allowance", created_at: "2026-07-07T09:00:00Z" },
  { id: 4, amount: "5000.00", transaction_type: "withdrawal", description: "Transport fare", created_at: "2026-07-06T16:45:00Z" },
  { id: 5, amount: "25000.00", transaction_type: "deposit", description: "Side hustle", created_at: "2026-07-05T11:00:00Z" },
  { id: 6, amount: "8000.00", transaction_type: "withdrawal", description: "Lunch", created_at: "2026-07-04T13:30:00Z" },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, title: "Streak at risk!", message: "Complete your evening journal to keep your 14-day streak alive.", is_read: false, created_at: "2026-07-10T08:00:00Z" },
  { id: 2, title: "Savings milestone", message: "You're 30% toward your New Laptop goal! Keep saving.", is_read: false, created_at: "2026-07-09T12:00:00Z" },
  { id: 3, title: "Tier 2 available", message: "Submit your NIN and facial recognition to unlock Tier 2.", is_read: true, created_at: "2026-07-08T10:00:00Z" },
  { id: 4, title: "New habit suggestion", message: "Try adding a 'No Social Media Before Noon' habit to boost focus.", is_read: false, created_at: "2026-07-10T06:00:00Z" },
];

const TIER_INFO: Record<number, { name: string; color: string; label: string; perks: string[] }> = {
  1: { name: "Tier 1", color: COLORS.secondary, label: "Starter", perks: ["5 habits", "Basic savings", "Common pets"] },
  2: { name: "Tier 2", color: COLORS.pink, label: "Verified", perks: ["Unlimited habits", "Transactions", "Notifications", "More pets"] },
  3: { name: "Tier 3", color: COLORS.gold, label: "Premium", perks: ["Interest savings", "Rare pets", "Unlimited transactions", "AI insights"] },
};

const QUICK_DEPOSIT_AMOUNTS = [1000, 2500, 5000, 10000];

// ─── Page Component ─────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "habits" | "savings" | "transactions">("overview");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [showBetaBanner, setShowBetaBanner] = useState(true);
  const [usingMockData, setUsingMockData] = useState({ habits: false, savings: false, transactions: false });

  // Modal/form states
  const [depositModal, setDepositModal] = useState<number | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [showNewHabit, setShowNewHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", goal: "" });
  const [showNewSaving, setShowNewSaving] = useState(false);
  const [newSaving, setNewSaving] = useState({ goal_name: "", target_amount: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = useCallback(() => {
    logout();
    router.push("/login");
  }, [router]);

  // ── Fetch data from API with fallback to mock ──────────────────
  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);

    async function loadData() {
      let mockFlags = { habits: false, savings: false, transactions: false };

      // Habits
      try {
        const h = await fetchHabits();
        setHabits(h.length > 0 ? h : MOCK_HABITS);
        if (h.length === 0) mockFlags = { ...mockFlags, habits: true };
      } catch {
        setHabits(MOCK_HABITS);
        mockFlags = { ...mockFlags, habits: true };
      }

      // Savings
      try {
        const s = await fetchSavings();
        setSavings(s.length > 0 ? s : MOCK_SAVINGS);
        if (s.length === 0) mockFlags = { ...mockFlags, savings: true };
      } catch {
        setSavings(MOCK_SAVINGS);
        mockFlags = { ...mockFlags, savings: true };
      }

      // Transactions
      try {
        const t = await fetchTransactions();
        setTransactions(t.length > 0 ? t : MOCK_TRANSACTIONS);
        if (t.length === 0) mockFlags = { ...mockFlags, transactions: true };
      } catch {
        setTransactions(MOCK_TRANSACTIONS);
        mockFlags = { ...mockFlags, transactions: true };
      }

      setUsingMockData(mockFlags);
      setLoading(false);
    }
    loadData();
  }, [router]);

  // ── Habit handlers (with API sync) ────────────────────────────
  const toggleHabit = useCallback(async (habitId: number) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    // Optimistic update
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, is_completed: !h.is_completed } : h))
    );

    try {
      await updateHabit(habitId, { is_completed: !habit.is_completed });
    } catch {
      // Revert on failure
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? { ...h, is_completed: habit.is_completed } : h))
      );
    }
  }, [habits]);

  const handleCreateHabit = useCallback(async () => {
    if (!newHabit.name.trim() || !newHabit.goal.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const created = await createHabit(newHabit);
      setHabits((prev) => [created, ...prev]);
      setNewHabit({ name: "", goal: "" });
      setShowNewHabit(false);
    } catch (err) {
      if (isTierPermissionError(err)) {
        setError("You need at least Tier 1 to create habits.");
      } else {
        // Beta fallback: create locally with temp ID
        const localHabit: Habit = {
          id: Date.now(),
          name: newHabit.name,
          goal: newHabit.goal,
          is_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setHabits((prev) => [localHabit, ...prev]);
        setUsingMockData((prev) => ({ ...prev, habits: true }));
        setNewHabit({ name: "", goal: "" });
        setShowNewHabit(false);
      }
    } finally {
      setSubmitting(false);
    }
  }, [newHabit]);

  const handleDeleteHabit = useCallback(async (habitId: number) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    // Optimistic remove
    setHabits((prev) => prev.filter((h) => h.id !== habitId));

    try {
      await deleteHabit(habitId);
    } catch {
      // Revert on failure (local-only item can't be deleted on backend)
      if (habit.id < 1000000) {
        setHabits((prev) => [...prev, habit]);
      }
    }
  }, [habits]);

  // ── Savings handlers ──────────────────────────────────────────
  const handleDeposit = useCallback(async (savingsId: number) => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) return;

    const saving = savings.find((s) => s.id === savingsId);
    if (!saving) return;

    // Optimistic update
    const newCurrent = (parseFloat(saving.current_amount) + amount).toFixed(2);
    setSavings((prev) =>
      prev.map((s) => (s.id === savingsId ? { ...s, current_amount: newCurrent } : s))
    );

    // Also add a transaction record optimistically
    const optimisticTx: TransactionData = {
      id: Date.now(),
      amount: amount.toFixed(2),
      transaction_type: "deposit",
      description: `Savings deposit — ${saving.goal_name}`,
      created_at: new Date().toISOString(),
    };
    setTransactions((prev) => [optimisticTx, ...prev]);

    try {
      await createTransaction({
        amount: amount.toFixed(2),
        transaction_type: "deposit",
        description: `Savings deposit — ${saving.goal_name}`,
      });
    } catch {
      // Remove optimistic transaction if backend rejects it (e.g. Tier 1)
      setTransactions((prev) => prev.filter((t) => t.id !== optimisticTx.id));
    }

    setDepositAmount("");
    setDepositModal(null);
  }, [depositAmount, savings]);

  const handleCreateSaving = useCallback(async () => {
    if (!newSaving.goal_name.trim() || !newSaving.target_amount.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const created = await createSaving(newSaving);
      setSavings((prev) => [created, ...prev]);
      setNewSaving({ goal_name: "", target_amount: "" });
      setShowNewSaving(false);
    } catch (err) {
      if (isTierPermissionError(err)) {
        setError("You need at least Tier 1 to create savings goals.");
      } else {
        // Beta fallback: create locally
        const localSaving: Saving = {
          id: Date.now(),
          goal_name: newSaving.goal_name,
          target_amount: newSaving.target_amount,
          current_amount: "0.00",
          interest_rate: "0.00",
          created_at: new Date().toISOString(),
        };
        setSavings((prev) => [localSaving, ...prev]);
        setUsingMockData((prev) => ({ ...prev, savings: true }));
        setNewSaving({ goal_name: "", target_amount: "" });
        setShowNewSaving(false);
      }
    } finally {
      setSubmitting(false);
    }
  }, [newSaving]);

  // ── Notification handler ──────────────────────────────────────
  const markNotificationRead = useCallback((notifId: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  }, []);

  if (!user) return null;

  const tier = TIER_INFO[user.tier] || TIER_INFO[1];
  const completedHabits = habits.filter((h) => h.is_completed).length;
  const totalSavings = savings.reduce((sum, s) => sum + parseFloat(s.current_amount), 0);
  const streak = 14;

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(num);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  function getFirstName(name: string) {
    return name.split(" ")[0];
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0" style={{
        background: `radial-gradient(ellipse 70% 40% at 30% 0%, ${COLORS.green}10 0%, transparent 70%), radial-gradient(ellipse 50% 30% at 70% 100%, ${COLORS.secondary}10 0%, transparent 70%)`,
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* ── Beta Demo Banner ──────────────────────────────────── */}
        {showBetaBanner && (
          <div className="mb-6 animate-fade-in-up rounded-2xl border border-secondary/20 p-4 flex items-center justify-between gap-4" style={{
            background: `linear-gradient(135deg, ${COLORS.secondary}12 0%, ${COLORS.secondary}05 100%)`,
          }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/15">
                <Rocket size={18} className="text-secondary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  Beta Demo Mode
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">
                    Interactive
                  </span>
                </p>
                <p className="text-xs text-foreground/50 mt-0.5">
                  Everything is interactive! Toggle habits, deposit savings, and explore all features.
                  {Object.values(usingMockData).some(Boolean) && (
                    <span className="ml-1" style={{ color: COLORS.gold }}>
                      Running with local demo data.
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBetaBanner(false)}
              className="p-1.5 rounded-lg text-foreground/30 hover:text-foreground/60 hover:bg-foreground/5 transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Error Toast ───────────────────────────────────────── */}
        {error && (
          <div className="mb-4 animate-fade-in rounded-xl border px-4 py-3 flex items-center justify-between text-sm" style={{
            borderColor: `${COLORS.pink}30`,
            background: `${COLORS.pink}10`,
            color: COLORS.pink,
          }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="p-1 hover:opacity-70">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Header Row ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-black" style={{ background: COLORS.primary }}>
              {(user.first_name || user.username)[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                Welcome back, {getFirstName(user.first_name || user.username)}
              </h1>
              <p className="text-sm text-foreground/50">
                @{user.username} · {user.university}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={20} className="text-foreground/50 hover:text-foreground transition-colors cursor-pointer" onClick={() => setActiveTab("overview")} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: COLORS.secondary }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-destructive transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: COLORS.primary, borderTopColor: "transparent" }} />
            <p className="text-sm text-foreground/40">Loading your dashboard...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Sidebar ── */}
            <div className="lg:w-56 shrink-0 animate-fade-in-up">
              <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {[
                  { id: "overview" as const, label: "Overview", icon: TrendingUp },
                  { id: "habits" as const, label: "Habits", icon: Target },
                  { id: "savings" as const, label: "Savings", icon: PiggyBank },
                  { id: "transactions" as const, label: "Transactions", icon: Zap },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap active:scale-[0.97] ${
                      activeTab === id
                        ? "text-white shadow-sm"
                        : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                    }`}
                    style={activeTab === id ? { background: COLORS.secondary } : undefined}
                  >
                    <Icon size={16} className="transition-transform duration-200" style={{
                      transform: activeTab === id ? "scale(1.2)" : "scale(1)",
                    }} />
                    {label}
                  </button>
                ))}
              </nav>

              {/* Tier card */}
              <div className="hidden lg:block mt-6 card-hover p-4 rounded-2xl border" style={{
                borderColor: `${tier.color}30`,
                background: `linear-gradient(135deg, ${tier.color}10 0%, ${tier.color}05 100%)`,
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tier.color }}>
                    {tier.name}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                    background: `${tier.color}20`,
                    color: tier.color,
                  }}>
                    {tier.label}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="text-xs text-foreground/60 flex items-center gap-1.5">
                      <CheckCircle2 size={10} className="shrink-0" style={{ color: tier.color }} />
                      {perk}
                    </li>
                  ))}
                </ul>
                {user.tier < 3 && (
                  <button
                    onClick={() => router.push("/upgrade")}
                    className="mt-3 w-full text-xs font-semibold py-2 rounded-xl border border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-all duration-200 active:scale-[0.97]"
                  >
                    Upgrade Tier
                  </button>
                )}
              </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* ═══ OVERVIEW TAB ═══ */}
              {activeTab === "overview" && (
                <>
                  {/* Stats row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    {[
                      { icon: CheckCircle2, label: "Habits Done", value: `${completedHabits}/${habits.length}`, color: COLORS.green },
                      { icon: PiggyBank, label: "Total Saved", value: formatCurrency(totalSavings), color: COLORS.gold },
                      { icon: Flame, label: "Day Streak", value: `${streak} days`, color: COLORS.pink },
                      { icon: Shield, label: "Current Tier", value: tier.name, color: tier.color },
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} className={`rounded-2xl border border-foreground/10 p-4 backdrop-blur-sm card-hover animate-fade-in-up delay-${idx + 1}`} style={{
                          background: "rgba(255,255,255,0.03)",
                        }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon size={16} style={{ color: stat.color }} />
                            <span className="text-xs text-foreground/40 uppercase tracking-wider font-semibold">
                              {stat.label}
                            </span>
                          </div>
                          <p className="text-lg font-bold text-foreground">{stat.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Two-column layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Habits preview */}
                    <div className="rounded-2xl border border-foreground/10 p-5 backdrop-blur-sm card-hover animate-fade-in-up delay-5" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-foreground">Today&apos;s Habits</h3>
                        <button onClick={() => setActiveTab("habits")} className="text-xs hover:text-secondary transition-colors flex items-center gap-0.5 group" style={{ color: COLORS.primary }}>
                          View all <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {habits.slice(0, 4).map((h) => (
                          <button
                            key={h.id}
                            onClick={() => toggleHabit(h.id)}
                            className="w-full text-left transition-all duration-200 hover:translate-x-0.5 group"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-sm ${h.is_completed ? "text-foreground/60 line-through" : "text-foreground/80"}`}>
                                {h.name}
                              </span>
                              {h.is_completed ? (
                                <CheckCircle2 size={14} className="animate-scale-in" style={{ color: COLORS.green }} />
                              ) : (
                                <Clock size={14} className="text-foreground/30 group-hover:text-secondary transition-colors" />
                              )}
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-foreground/10">
                              <div className="h-full rounded-full transition-all duration-500" style={{
                                width: h.is_completed ? "100%" : "0%",
                                background: h.is_completed ? COLORS.green : "transparent",
                              }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Savings preview */}
                    <div className="rounded-2xl border border-foreground/10 p-5 backdrop-blur-sm card-hover animate-fade-in-up delay-6" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-foreground">Savings Goals</h3>
                        <button onClick={() => setActiveTab("savings")} className="text-xs hover:text-secondary transition-colors flex items-center gap-0.5 group" style={{ color: COLORS.primary }}>
                          View all <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        {savings.map((s) => {
                          const pct = Math.min(100, (parseFloat(s.current_amount) / parseFloat(s.target_amount)) * 100);
                          return (
                            <div key={s.id} className="transition-all duration-200 hover:translate-x-0.5">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-foreground/80">{s.goal_name}</span>
                                <span className="text-xs text-foreground/50">{formatCurrency(s.current_amount)} / {formatCurrency(s.target_amount)}</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-foreground/10">
                                <div className="h-full rounded-full transition-all duration-700" style={{
                                  width: `${pct}%`,
                                  background: `linear-gradient(to right, ${COLORS.gold}, ${COLORS.green})`,
                                }} />
                              </div>
                              <p className="text-[11px] text-foreground/40 mt-1">{Math.round(pct)}% complete</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Notifications + Tier upgrade */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Notifications */}
                    <div className="rounded-2xl border border-foreground/10 p-5 backdrop-blur-sm card-hover animate-fade-in-up delay-7" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Bell size={14} className="text-foreground/50" />
                          Notifications
                          {unreadCount > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: COLORS.secondary }}>{unreadCount}</span>
                          )}
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {notifications.slice(0, 3).map((n) => (
                          <button
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`w-full text-left p-3 rounded-xl border text-sm transition-all duration-200 card-hover ${n.is_read ? "border-transparent opacity-60" : ""}`}
                            style={!n.is_read ? { borderColor: `${COLORS.secondary}30`, background: `${COLORS.secondary}08` } : undefined}
                          >
                            <div className="flex items-start gap-2">
                              {!n.is_read && <span className="w-2 h-2 rounded-full shrink-0 mt-1 animate-pulse" style={{ background: COLORS.secondary }} />}
                              <div className={!n.is_read ? "ml-4" : ""}>
                                <p className="font-medium text-foreground/80">{n.title}</p>
                                <p className="text-xs text-foreground/50 mt-0.5">{n.message}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tier upgrade banner */}
                    {user.tier < 3 && (
                      <div className="rounded-2xl border p-6 backdrop-blur-sm flex flex-col justify-center animate-fade-in-up delay-8 card-hover" style={{
                        borderColor: `${COLORS.secondary}30`,
                        background: `linear-gradient(135deg, ${COLORS.secondary}12 0%, ${COLORS.secondary}05 100%)`,
                      }}>
                        <div className="flex items-center gap-3 mb-3">
                          <Sparkles size={20} className="animate-float" style={{ color: COLORS.secondary }} />
                          <h3 className="text-sm font-bold text-foreground">Unlock More Features</h3>
                        </div>
                        <p className="text-sm text-foreground/60 mb-4">
                          {user.tier === 1
                            ? "Verify your identity with NIN and facial recognition to reach Tier 2."
                            : "Submit your BVN and address to reach Tier 3 and earn interest on savings."}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3].map((t) => (
                              <div key={t} className="w-8 h-1.5 rounded-full transition-all duration-300" style={{
                                background: t <= user.tier ? COLORS.secondary : t === user.tier + 1 ? `${COLORS.secondary}60` : `${COLORS.secondary}20`,
                                animation: t === user.tier + 1 ? "pulse-glow 2s ease-in-out infinite" : undefined,
                              }} />
                            ))}
                          </div>
                          <span className="text-xs text-foreground/40">{tier.name} → {TIER_INFO[user.tier + 1]?.name}</span>
                        </div>
                        <button
                          onClick={() => router.push("/upgrade")}
                          className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] text-white"
                          style={{ background: COLORS.secondary }}
                        >
                          Upgrade Now
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Transactions preview */}
                  <div className="rounded-2xl border border-foreground/10 p-5 backdrop-blur-sm card-hover animate-fade-in-up delay-8" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-foreground">Recent Transactions</h3>
                      <button onClick={() => setActiveTab("transactions")} className="text-xs hover:text-secondary transition-colors flex items-center gap-0.5 group" style={{ color: COLORS.primary }}>
                        View all <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {transactions.slice(0, 4).map((t, idx) => (
                        <div key={t.id} className={`flex items-center justify-between py-2.5 border-b border-foreground/5 last:border-0 animate-fade-in`} style={{ animationDelay: `${1 + idx * 0.1}s` }}>
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg" style={{
                              background: t.transaction_type === "deposit" ? `${COLORS.green}15` : `${COLORS.pink}15`,
                            }}>
                              {t.transaction_type === "deposit" ? (
                                <ArrowUpRight size={14} style={{ color: COLORS.green }} />
                              ) : (
                                <ArrowDownRight size={14} style={{ color: COLORS.pink }} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground/80">{t.description || (t.transaction_type === "deposit" ? "Deposit" : "Withdrawal")}</p>
                              <p className="text-xs text-foreground/40">{formatDate(t.created_at)}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold" style={{
                            color: t.transaction_type === "deposit" ? COLORS.green : COLORS.pink,
                          }}>
                            {t.transaction_type === "deposit" ? "+" : "-"}{formatCurrency(t.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ═══ HABITS TAB ═══ */}
              {activeTab === "habits" && (
                <div className="rounded-2xl border border-foreground/10 p-5 lg:p-6 backdrop-blur-sm animate-fade-in-up" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Your Habits</h2>
                      <p className="text-xs text-foreground/40 mt-0.5">Click any habit to toggle completion</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{
                        background: `${COLORS.green}15`,
                        color: COLORS.green,
                      }}>
                        {completedHabits}/{habits.length} done
                      </span>
                      <button
                        onClick={() => setShowNewHabit(!showNewHabit)}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-white"
                        style={{ background: COLORS.secondary }}
                      >
                        <Plus size={14} />
                        New Habit
                      </button>
                    </div>
                  </div>

                  {/* New Habit Form */}
                  {showNewHabit && (
                    <div className="mb-5 p-4 rounded-xl border animate-fade-in" style={{ borderColor: `${COLORS.secondary}30`, background: `${COLORS.secondary}08` }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          value={newHabit.name}
                          onChange={(e) => setNewHabit((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Habit name"
                          className="px-3 py-2 text-sm rounded-lg border border-foreground/10 bg-foreground/5 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-secondary/50 transition-colors"
                        />
                        <input
                          type="text"
                          value={newHabit.goal}
                          onChange={(e) => setNewHabit((p) => ({ ...p, goal: e.target.value }))}
                          placeholder="Goal description"
                          className="px-3 py-2 text-sm rounded-lg border border-foreground/10 bg-foreground/5 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-secondary/50 transition-colors"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setShowNewHabit(false); setNewHabit({ name: "", goal: "" }); }}
                          className="px-4 py-2 text-xs font-medium rounded-lg border border-foreground/10 text-foreground/60 hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateHabit}
                          disabled={submitting || !newHabit.name.trim() || !newHabit.goal.trim()}
                          className="px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40"
                          style={{ background: COLORS.green }}
                        >
                          {submitting ? "Creating..." : "Create Habit"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {habits.map((h, idx) => (
                      <div
                        key={h.id}
                        className="rounded-xl border p-4 transition-all duration-300 card-hover animate-fade-in-up group"
                        style={{
                          borderColor: h.is_completed ? `${COLORS.green}30` : undefined,
                          background: h.is_completed ? `${COLORS.green}08` : "rgba(255,255,255,0.02)",
                          animationDelay: `${0.1 + idx * 0.05}s`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <button
                            onClick={() => toggleHabit(h.id)}
                            className="text-left flex-1"
                          >
                            <h3 className={`text-sm font-bold ${h.is_completed ? "text-foreground/60" : "text-foreground"}`} style={h.is_completed ? { textDecoration: "line-through" } : undefined}>
                              {h.name}
                            </h3>
                            <p className="text-xs text-foreground/50 mt-0.5">{h.goal}</p>
                          </button>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleHabit(h.id)}
                              className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300"
                              style={{
                                borderColor: h.is_completed ? COLORS.green : "rgba(255,255,255,0.15)",
                                background: h.is_completed ? COLORS.green : "transparent",
                              }}
                            >
                              {h.is_completed && <CheckCircle2 size={14} className="text-black animate-scale-in" />}
                            </button>
                            <button
                              onClick={() => handleDeleteHabit(h.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-foreground/30 hover:text-destructive transition-all duration-200"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-foreground/10">
                          <div className="h-full rounded-full transition-all duration-700" style={{
                            width: h.is_completed ? "100%" : "0%",
                            background: h.is_completed ? COLORS.green : COLORS.secondary,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ SAVINGS TAB ═══ */}
              {activeTab === "savings" && (
                <div className="rounded-2xl border border-foreground/10 p-5 lg:p-6 backdrop-blur-sm animate-fade-in-up" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Savings Goals</h2>
                      <p className="text-xs text-foreground/40 mt-0.5">Total saved: {formatCurrency(totalSavings)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: `${COLORS.gold}15`, color: COLORS.gold }}>
                        <PiggyBank size={12} />
                        {savings.length} goals
                      </div>
                      <button
                        onClick={() => setShowNewSaving(!showNewSaving)}
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-white"
                        style={{ background: COLORS.secondary }}
                      >
                        <Plus size={14} />
                        New Goal
                      </button>
                    </div>
                  </div>

                  {/* New Saving Form */}
                  {showNewSaving && (
                    <div className="mb-5 p-4 rounded-xl border animate-fade-in" style={{ borderColor: `${COLORS.secondary}30`, background: `${COLORS.secondary}08` }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          value={newSaving.goal_name}
                          onChange={(e) => setNewSaving((p) => ({ ...p, goal_name: e.target.value }))}
                          placeholder="Goal name (e.g. New Laptop)"
                          className="px-3 py-2 text-sm rounded-lg border border-foreground/10 bg-foreground/5 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-secondary/50 transition-colors"
                        />
                        <input
                          type="number"
                          value={newSaving.target_amount}
                          onChange={(e) => setNewSaving((p) => ({ ...p, target_amount: e.target.value }))}
                          placeholder="Target amount (₦)"
                          className="px-3 py-2 text-sm rounded-lg border border-foreground/10 bg-foreground/5 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-secondary/50 transition-colors"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setShowNewSaving(false); setNewSaving({ goal_name: "", target_amount: "" }); }}
                          className="px-4 py-2 text-xs font-medium rounded-lg border border-foreground/10 text-foreground/60 hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateSaving}
                          disabled={submitting || !newSaving.goal_name.trim() || !newSaving.target_amount.trim()}
                          className="px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40"
                          style={{ background: COLORS.green }}
                        >
                          {submitting ? "Creating..." : "Create Goal"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-5">
                    {savings.map((s, idx) => {
                      const pct = Math.min(100, (parseFloat(s.current_amount) / parseFloat(s.target_amount)) * 100);
                      return (
                        <div key={s.id} className="rounded-xl border border-foreground/10 p-4 bg-foreground/5 card-hover animate-fade-in-up" style={{ animationDelay: `${0.1 + idx * 0.1}s` }}>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-sm font-bold text-foreground">{s.goal_name}</h3>
                              <p className="text-xs text-foreground/50 mt-0.5">Created {formatDate(s.created_at)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground">{formatCurrency(s.current_amount)}</p>
                              <p className="text-xs text-foreground/40">of {formatCurrency(s.target_amount)}</p>
                            </div>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-foreground/10">
                            <div className="h-full rounded-full transition-all duration-700" style={{
                              width: `${pct}%`,
                              background: `linear-gradient(to right, ${COLORS.gold}, ${pct > 50 ? COLORS.green : COLORS.secondary})`,
                            }} />
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-xs font-medium" style={{ color: pct > 50 ? COLORS.green : COLORS.gold }}>
                              {Math.round(pct)}% complete
                            </span>
                            {parseFloat(s.interest_rate) > 0 && (
                              <span className="text-xs flex items-center gap-1" style={{ color: COLORS.green }}>
                                <Sparkles size={10} />
                                {s.interest_rate}% APY
                              </span>
                            )}
                          </div>

                          {/* Deposit button */}
                          <button
                            onClick={() => setDepositModal(depositModal === s.id ? null : s.id)}
                            className="mt-3 w-full text-xs font-semibold py-2 rounded-xl border transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-1.5"
                            style={{
                              borderColor: `${COLORS.secondary}30`,
                              color: COLORS.secondary,
                              background: depositModal === s.id ? `${COLORS.secondary}10` : "transparent",
                            }}
                          >
                            <CreditCard size={12} />
                            Deposit Funds
                          </button>

                          {/* Deposit form */}
                          {depositModal === s.id && (
                            <div className="mt-3 p-3 rounded-xl border animate-fade-in" style={{ borderColor: `${COLORS.secondary}20`, background: `${COLORS.secondary}08` }}>
                              <div className="flex gap-2 mb-2">
                                {QUICK_DEPOSIT_AMOUNTS.map((amt) => (
                                  <button
                                    key={amt}
                                    onClick={() => setDepositAmount(amt.toString())}
                                    className="text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all duration-200 hover:scale-105"
                                    style={{
                                      borderColor: depositAmount === amt.toString() ? COLORS.secondary : "rgba(255,255,255,0.1)",
                                      background: depositAmount === amt.toString() ? `${COLORS.secondary}20` : "transparent",
                                      color: depositAmount === amt.toString() ? COLORS.secondary : "rgba(255,255,255,0.5)",
                                    }}
                                  >
                                    ₦{amt.toLocaleString()}
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={depositAmount}
                                  onChange={(e) => setDepositAmount(e.target.value)}
                                  placeholder="Enter amount"
                                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-foreground/10 bg-foreground/5 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-secondary/50 transition-colors"
                                />
                                <button
                                  onClick={() => handleDeposit(s.id)}
                                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                  style={{ background: COLORS.green }}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ═══ TRANSACTIONS TAB ═══ */}
              {activeTab === "transactions" && (
                <div className="rounded-2xl border border-foreground/10 p-5 lg:p-6 backdrop-blur-sm animate-fade-in-up" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Transactions</h2>
                      <p className="text-xs text-foreground/40 mt-0.5">
                        {user.tier >= 2 ? "All your deposits and withdrawals" : "Viewing demo transactions"}
                      </p>
                    </div>
                    {user.tier < 2 && (
                      <span className="text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1" style={{ background: `${COLORS.gold}15`, color: COLORS.gold }}>
                        <Star size={10} />
                        Unlocked in Beta
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {transactions.map((t, idx) => (
                      <div key={t.id} className="flex items-center justify-between py-3 border-b border-foreground/5 last:border-0 animate-fade-in card-hover rounded-lg px-3 transition-all duration-200" style={{ animationDelay: `${0.1 + idx * 0.05}s` }}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl" style={{
                            background: t.transaction_type === "deposit" ? `${COLORS.green}15` : `${COLORS.pink}15`,
                          }}>
                            {t.transaction_type === "deposit" ? (
                              <ArrowUpRight size={16} style={{ color: COLORS.green }} />
                            ) : (
                              <ArrowDownRight size={16} style={{ color: COLORS.pink }} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground/80 capitalize">{t.description || t.transaction_type}</p>
                            <p className="text-xs text-foreground/40">{new Date(t.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold" style={{
                          color: t.transaction_type === "deposit" ? COLORS.green : COLORS.pink,
                        }}>
                          {t.transaction_type === "deposit" ? "+" : "-"}{formatCurrency(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ═══ PETS SECTION ═══ */}
              <div className="rounded-2xl border border-foreground/10 p-5 backdrop-blur-sm card-hover animate-fade-in-up delay-8" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Dog size={16} className="text-foreground/50" />
                  <h3 className="text-sm font-bold text-foreground">Your Pet Companions</h3>
                  {user.tier >= 3 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${COLORS.gold}20`, color: COLORS.gold }}>Rare access</span>
                  )}
                </div>
                <p className="text-xs text-foreground/50 mb-4">
                  {user.tier >= 3
                    ? "You have access to all pets including rare ones!"
                    : "Common pets are available now. Upgrade to Tier 3 for rare pets."}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {["🐶", "🐱", "🐰", "🐸", "🐢"].map((emoji, i) => (
                    <div key={i} className="w-12 h-12 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center text-2xl hover:scale-125 hover:bg-foreground/10 transition-all duration-200 cursor-default">
                      {emoji}
                    </div>
                  ))}
                  {user.tier >= 3 && ["🦄", "🐉", "🦋", "🦅"].map((emoji, i) => (
                    <div key={`rare-${i}`} className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl hover:scale-125 transition-all duration-200 cursor-default" style={{
                      background: `${COLORS.gold}10`,
                      border: `1px solid ${COLORS.gold}30`,
                    }}>
                      {emoji}
                    </div>
                  ))}
                  {user.tier < 3 && (
                    <div className="w-12 h-12 rounded-xl border border-dashed border-foreground/10 flex items-center justify-center text-foreground/20 hover:border-foreground/30 transition-all duration-200 cursor-default">
                      <Lock size={14} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
