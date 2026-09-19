const SAST_TIME_ZONE = 'Africa/Johannesburg'

/**
 * "Today" as YYYY-MM-DD in the Africa/Johannesburg (SAST, UTC+2, no DST)
 * time zone - never UTC.
 *
 * ai_hint_usage.usage_date and the free-tier daily hint/camera-scan
 * limit reset on this boundary. The previous implementation
 * (`new Date().toISOString().split('T')[0]`) used the UTC calendar day,
 * which rolls over at 02:00 SAST - so a student using the app between
 * 22:00 and 23:59 SAST got a second full day's quota two hours early,
 * and everyone's "daily" reset landed at 2am local time instead of
 * midnight.
 */
export function getTodaySAST(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SAST_TIME_ZONE }).format(date)
}
