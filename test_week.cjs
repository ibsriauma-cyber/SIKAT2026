  const getWeekRange = (weekStr) => {
    if (!weekStr) return {
      start: new Date(),
      end: new Date()
    };
    const [year, week] = weekStr.split('-W');
    const simple = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    const end = new Date(ISOweekStart);
    end.setDate(end.getDate() + 6);
    return {
      start: ISOweekStart,
      end
    };
  };

  const getWeekString = (d) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`;
  };

  const currentWeek = getWeekString(new Date());
  console.log("Current week:", currentWeek);
  const range = getWeekRange(currentWeek);
  console.log("Start:", range.start);
  console.log("End:", range.end);
