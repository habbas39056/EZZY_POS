/**
 * Date utility functions for parsing, formatting, and filtering dates
 * in DD-MMM-YYYY (e.g., 17-Aug-2026) and ISO formats.
 */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Format a Date or date string to DD-MMM-YYYY (e.g., '17-Aug-2026')
 */
export function formatDateToDisplay(input?: Date | string | null): string {
  if (!input) return '';
  
  const d = typeof input === 'string' ? parseDate(input) : input;
  if (!d || isNaN(d.getTime())) return typeof input === 'string' ? input : '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Convert any date string (DD-MMM-YYYY, YYYY-MM-DD, ISO) into a standard Date object
 */
export function parseDate(dateStr?: string | null): Date | null {
  if (!dateStr || !dateStr.trim()) return null;

  const trimmed = dateStr.trim();

  // Check DD-MMM-YYYY (e.g., 17-Aug-2026 or 17-AUG-2026)
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const monthStr = ddmmyyyyMatch[2].toLowerCase();
    const year = parseInt(ddmmyyyyMatch[3], 10);

    const monthIndex = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthStr);
    if (monthIndex !== -1) {
      return new Date(year, monthIndex, day);
    }
  }

  // Check YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymdMatch) {
    return new Date(parseInt(ymdMatch[1], 10), parseInt(ymdMatch[2], 10) - 1, parseInt(ymdMatch[3], 10));
  }

  // Check DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    return new Date(parseInt(dmyMatch[3], 10), parseInt(dmyMatch[2], 10) - 1, parseInt(dmyMatch[1], 10));
  }

  // Fallback to standard JS Date parsing
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

/**
 * Format a date string to YYYY-MM-DD for native <input type="date"> value
 */
export function formatDateToISO(input?: Date | string | null): string {
  if (!input) return '';
  const d = typeof input === 'string' ? parseDate(input) : input;
  if (!d || isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a given record date falls between startDate and endDate (inclusive)
 */
export function isDateInRange(
  targetDate?: string | null,
  startDate?: string | null,
  endDate?: string | null
): boolean {
  if (!startDate && !endDate) return true;
  if (!targetDate) return false;

  const target = parseDate(targetDate);
  if (!target) return true; // If unparseable, don't filter out by default

  const targetTime = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();

  if (startDate) {
    const start = parseDate(startDate);
    if (start) {
      const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      if (targetTime < startTime) return false;
    }
  }

  if (endDate) {
    const end = parseDate(endDate);
    if (end) {
      const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      if (targetTime > endTime) return false;
    }
  }

  return true;
}

/**
 * Returns today's date formatted as DD-MMM-YYYY
 */
export function getTodayFormatted(): string {
  return formatDateToDisplay(new Date());
}
