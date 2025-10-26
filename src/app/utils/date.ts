export function getWeekRange(weekString: string) {
  const [yearStr, weekStr] = weekString.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);

  // La settimana ISO inizia con il lunedì
  const firstThursday = new Date(year, 0, 4); // 4 gennaio è sempre nella prima settimana ISO
  const firstMonday = new Date(firstThursday);
  firstMonday.setDate(firstThursday.getDate() - (firstThursday.getDay() || 7) + 1);

  // Calcola il lunedì della settimana richiesta
  const monday = new Date(firstMonday);
  monday.setDate(firstMonday.getDate() + (week - 1) * 7);

  // Calcola la domenica (fine settimana)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // Formatta come stringhe ISO (YYYY-MM-DD)
  const startDate = monday.toISOString().split('T')[0];
  const endDate = sunday.toISOString().split('T')[0];

  return { startDate, endDate };
}

export function getYearRange(year: number) {
  const startDate = new Date(year, 0, 1).toISOString().split('T')[0]; // 1 gennaio
  const endDate = new Date(year, 11, 31).toISOString().split('T')[0]; // 31 dicembre
  return { startDate, endDate };
}
