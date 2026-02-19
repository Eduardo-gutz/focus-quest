import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const monitoredApps = sqliteTable('monitored_apps', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  packageName: text('package_name'),
  iconEmoji: text('icon_emoji'),
  dailyGoalMinutes: integer('daily_goal_minutes').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const usageLogs = sqliteTable(
  'usage_logs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    appId: integer('app_id')
      .notNull()
      .references(() => monitoredApps.id, { onDelete: 'cascade' }),
    date: text('date').notNull(),
    minutesUsed: integer('minutes_used').notNull(),
    source: text('source').notNull(),
    goalMet: integer('goal_met', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    sourceCheck: check('usage_logs_source_check', sql`${table.source} in ('manual', 'auto')`),
    usageLogsDateIdx: index('usage_logs_date_idx').on(table.date),
    usageLogsAppIdIdx: index('usage_logs_app_id_idx').on(table.appId),
  }),
);

export const userStats = sqliteTable('user_stats', {
  id: integer('id').primaryKey(),
  currentXp: integer('current_xp').notNull().default(0),
  currentLevel: integer('current_level').notNull().default(1),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  totalDaysTracked: integer('total_days_tracked').notNull().default(0),
  totalGoalsMet: integer('total_goals_met').notNull().default(0),
  lastActiveDate: text('last_active_date'),
});

export const achievements = sqliteTable('achievements', {
  id: text('id').primaryKey(),
  unlocked: integer('unlocked', { mode: 'boolean' }).notNull().default(false),
  unlockedAt: text('unlocked_at'),
});

export const dailySummary = sqliteTable(
  'daily_summary',
  {
    date: text('date').primaryKey(),
    totalMinutesUsed: integer('total_minutes_used').notNull().default(0),
    totalMinutesGoal: integer('total_minutes_goal').notNull().default(0),
    allGoalsMet: integer('all_goals_met', { mode: 'boolean' }).notNull().default(false),
    xpEarned: integer('xp_earned').notNull().default(0),
    streakDay: integer('streak_day').notNull().default(0),
  },
  (table) => ({
    dailySummaryDateIdx: index('daily_summary_date_idx').on(table.date),
  }),
);
