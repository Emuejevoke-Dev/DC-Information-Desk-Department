/**
 * Date utilities for Dominion City Asaba Information Desk Management System
 */

export interface BirthdayCountdown {
  daysUntil: number;
  isToday: boolean;
  isThisWeek: boolean;
  isThisMonth: boolean;
  isTwoMonths: boolean;
  isThreeMonths: boolean;
  nextBirthdayDate: Date;
  age?: number;
}

/**
 * Calculates birthday countdown for a member, handling leap year Feb 29 and year boundaries
 */
export function calculateBirthdayInfo(
  birthDay: number,
  birthMonth: number, // 1 - 12
  birthYear?: number,
  currentDate: Date = new Date()
): BirthdayCountdown {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1 - 12
  const currentDay = currentDate.getDate();

  // Check if today is the birthday
  const isToday = currentMonth === birthMonth && currentDay === birthDay;

  // Determine target year (this year or next year)
  let targetYear = currentYear;
  if (
    currentMonth > birthMonth ||
    (currentMonth === birthMonth && currentDay > birthDay)
  ) {
    targetYear = currentYear + 1;
  }

  // Handle Feb 29 on non-leap years (celebrate on Feb 28 or March 1)
  let targetDay = birthDay;
  if (birthMonth === 2 && birthDay === 29) {
    const isLeapYear = (targetYear % 4 === 0 && targetYear % 100 !== 0) || targetYear % 400 === 0;
    if (!isLeapYear) {
      targetDay = 28; // Standard celebration day
    }
  }

  const nextBirthday = new Date(targetYear, birthMonth - 1, targetDay, 0, 0, 0, 0);
  const todayMidnight = new Date(currentYear, currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);

  const diffTime = nextBirthday.getTime() - todayMidnight.getTime();
  const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const isThisWeek = daysUntil >= 0 && daysUntil <= 7;
  const isThisMonth = daysUntil >= 0 && daysUntil <= 30;
  const isTwoMonths = daysUntil > 30 && daysUntil <= 60;
  const isThreeMonths = daysUntil > 60 && daysUntil <= 90;

  const age = birthYear ? targetYear - birthYear : undefined;

  return {
    daysUntil,
    isToday,
    isThisWeek,
    isThisMonth,
    isTwoMonths,
    isThreeMonths,
    nextBirthdayDate: nextBirthday,
    age,
  };
}

/**
 * Gets the next upcoming Sunday from today (or today if today is Sunday)
 */
export function getNextSunday(fromDate: Date = new Date()): Date {
  const date = new Date(fromDate);
  const day = date.getDay(); // 0 is Sunday
  const diff = day === 0 ? 0 : 7 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Gets the 1st and 3rd Sundays of a given month
 */
export function getFirstAndThirdSundays(year: number, monthIndex: number): Date[] {
  const sundays: Date[] = [];
  const date = new Date(year, monthIndex, 1);

  while (date.getMonth() === monthIndex) {
    if (date.getDay() === 0) {
      sundays.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }

  const result: Date[] = [];
  if (sundays[0]) result.push(sundays[0]); // 1st Sunday
  if (sundays[2]) result.push(sundays[2]); // 3rd Sunday
  return result;
}

/**
 * Gets the next Thursday 9:00 PM prayer meeting date
 */
export function getNextThursdayPrayer(fromDate: Date = new Date()): Date {
  const date = new Date(fromDate);
  const day = date.getDay(); // 4 is Thursday
  let diff = (4 - day + 7) % 7;

  // If today is Thursday but already past 9:00 PM, next is 7 days away
  if (day === 4 && (date.getHours() > 21 || (date.getHours() === 21 && date.getMinutes() > 0))) {
    diff = 7;
  }

  date.setDate(date.getDate() + diff);
  date.setHours(21, 0, 0, 0);
  return date;
}

export function formatDate(dateStringOrDate: string | Date): string {
  if (!dateStringOrDate) return 'N/A';
  const d = typeof dateStringOrDate === 'string' ? new Date(dateStringOrDate) : dateStringOrDate;
  if (isNaN(d.getTime())) return String(dateStringOrDate);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStringOrDate: string | Date): string {
  if (!dateStringOrDate) return 'N/A';
  const d = typeof dateStringOrDate === 'string' ? new Date(dateStringOrDate) : dateStringOrDate;
  if (isNaN(d.getTime())) return String(dateStringOrDate);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
