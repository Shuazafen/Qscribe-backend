Goal {
    name: "New Laptop"
    target_amount: 500000
    current_amount: 125000
    deadline: 2026-12-31
    frequency: "daily" | "weekly" | "monthly"
    auto_debit_amount: 2000
    status: "active" | "paused" | "completed" | "broken"
    tier_requirement: 2
}

SavingsGoal
├── id
├── user_id (FK → users)
├── name
├── target_amount (Decimal)
├── current_amount (Decimal)
├── currency (default: NGN)
├── start_date
├── end_date
├── frequency (enum: daily, weekly, monthly, custom)
├── auto_debit_amount
├── auto_debit_enabled (bool)
├── status (enum)
├── created_at, updated_at

SavingsTransaction
├── id
├── goal_id (FK → SavingsGoal)
├── amount
├── type (enum: deposit, withdrawal, interest, bonus)
├── source (enum: manual, auto_debit, habit_reward, round_up)
├── reference (unique transaction ref)
├── status
├── created_at

