const fs = require('fs');

// To properly trigger re-renders in all components, we can export a simple hook.
const hookContent = `
import { useEffect, useState } from 'react';

export function useRealtimeData() {
  const [tick, setTick] = useState(0);
  
  useEffect(() => {
    const handleUpdate = () => {
      setTick(t => t + 1);
    };
    
    window.addEventListener('data-updated', handleUpdate);
    return () => window.removeEventListener('data-updated', handleUpdate);
  }, []);
  
  return tick;
}
`;
fs.writeFileSync('src/hooks/useRealtime.ts', hookContent);

