import { addDays, addMonths, addYears, nextDay, setDate, getDay, Day } from 'date-fns';

export function calculateNextDueDate(baseDate: string | Date, frequency: string, logicData: any = {}): string {
  const start = new Date(baseDate);
  let nextDate = new Date(start);

  switch (frequency) {
    case 'Daily':
      nextDate = addDays(start, 1);
      break;
    case 'Weekly':
      const dayOfWeekMap: Record<string, number> = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
        'Thursday': 4, 'Friday': 5, 'Saturday': 6
      };
      if (logicData.dayOfWeek && dayOfWeekMap[logicData.dayOfWeek] !== undefined) {
        let targetDay = dayOfWeekMap[logicData.dayOfWeek];
        let currentDay = start.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        nextDate = addDays(start, daysToAdd);
      } else {
        nextDate = addDays(start, 7);
      }
      break;
    case 'Monthly':
      nextDate = addMonths(start, 1);
      if (logicData.dateOfMonth) {
        nextDate = setDate(nextDate, parseInt(logicData.dateOfMonth, 10));
      }
      break;
    case 'Quarterly':
      nextDate = addMonths(start, 3);
      break;
    case 'Half-yearly':
    case 'Half yearly':
      nextDate = addMonths(start, 6);
      break;
    case 'Yearly':
      nextDate = addYears(start, 1);
      break;
    case 'Specific Day\'s':
    case 'Specific Days':
      // Example logic for "Specific Day's": '1st Sunday' of the month
      // logicData could be { occurrence: '1st', day: 'Sunday', period: 'of the month' }
      if (logicData.occurrence && logicData.day) {
        const occMap: Record<string, number> = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4 };
        const weekNum = occMap[logicData.occurrence] || 1;
        const targetDOWMap: Record<string, number> = {
          'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
          'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        const targetDOW = targetDOWMap[logicData.day] ?? 0;

        nextDate = addMonths(start, 1);
        nextDate = setDate(nextDate, 1);
        const firstDayOfMonth = getDay(nextDate);
        let dayOffset = targetDOW - firstDayOfMonth;
        if (dayOffset < 0) dayOffset += 7;
        
        nextDate = addDays(nextDate, dayOffset + (weekNum - 1) * 7);
      } else {
        nextDate = addDays(start, 1);
      }
      break;
    default:
      break; // One Time or Unknown - logic doesn't apply automatically
  }
  return nextDate.toISOString();
}
