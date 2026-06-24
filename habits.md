Habit
├── id
├── user_id (FK → users)
├── name (e.g., "Study for 2 hours")
├── category (enum: study, fitness, wellness, finance)
├── frequency (daily, weekly_days, custom_cron)
├── savings_trigger_amount (how much to save when completed)
├── streak_bonus_multiplier (save more for longer streaks)
├── is_active

HabitLog
├── id
├── habit_id (FK → Habit)
├── user_id (FK → users)
├── completed_at (datetime)
├── savings_triggered (bool)
├── savings_amount (Decimal)
├── notes

HabitSavingsRule
├── id
├── habit_id (FK → Habit)
├── rule_type (enum: per_completion, streak_bonus, milestone)
├── threshold (e.g., 7 days streak)
├── action (enum: save_amount, multiply_savings, unlock_feature)
├── amount_or_multiplier



implied model/algorithm for habits:

On completion:
- Create HabitLog
- Trigger savings based on rule_type:
  - per_completion: save fixed amount
  - streak_bonus: apply multiplier to base savings
  - milestone: trigger action based on streak count
- Update user streak count
- Send notification

On scheduled time (CRON):
- Check if habit should be marked as incomplete
- Apply penalty if streak broken


for auto save function, habit and goal will have a relationship where user picks a goal to save for and a habit to trigger the savings

proposed table restructuring:

Habit
├── id
├── user_id
├── name
├── category
├── frequency (JSON: {"type": "daily"} or {"type": "weekly_days", "days": [1, 3, 5]})
├── trigger_type (auto_save_only | manual_only | both)
├── base_savings_amount (Decimal, only if trigger_type=auto_save_only or both)
├── is_active
├── current_streak
├── longest_streak
├── last_completed_at
├── reminder_time (time for push notification)

HabitSavingsTrigger
├── id
├── habit_id (FK)
├── goal_id (FK)
├── trigger_condition (completion | milestone | streak_threshold)
├── streak_threshold (e.g., 3, 5, 7)
├── bonus_multiplier (e.g., 1.0, 1.5, 2.0)
├── status (active | paused | completed)
