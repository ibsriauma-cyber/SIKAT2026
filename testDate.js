function getMonday(dStr) {
  const d = new Date(dStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
}
console.log(getMonday('2026-08-31'));
console.log(getMonday('2026-09-01'));
