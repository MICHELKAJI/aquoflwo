export function generateWaterLevelData(siteId: string, days: number) {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      level: Math.floor(Math.random() * 100)
    });
  }
  
  return data;
} 