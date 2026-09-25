const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const sseHook = `
  useEffect(() => {
    const sseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/events' : '/api/events';
    const eventSource = new EventSource(sseUrl);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE Update received:', data);
        
        // When we get an update, trigger a re-sync
        apiClient('/sync').then((res: any) => {
          if (res.users) {
            const syncedUsers = res.users.map((u: any) => ({ ...u, id: String(u.id) }));
            mockUsers.splice(0, mockUsers.length, ...syncedUsers);
          }
          if (res.students) {
            const syncedStudents = res.students.map((s: any) => ({ ...s, id: String(s.id) }));
            mockStudents.splice(0, mockStudents.length, ...syncedStudents);
          }
          if (res.classes) {
            const syncedClasses = res.classes.map((c: any) => ({ ...c, id: String(c.id) }));
            mockClasses.splice(0, mockClasses.length, ...syncedClasses);
          }
          
          // Force a small state update to re-render if needed, but modifying mockData 
          // might not trigger a re-render automatically. We can dispatch a custom event.
          window.dispatchEvent(new Event('data-updated'));
        });
      } catch (e) {
        console.error('Error parsing SSE data', e);
      }
    };
    
    return () => {
      eventSource.close();
    };
  }, []);
`;

content = content.replace(
  "  useEffect(() => {\n    apiClient('/sync')",
  sseHook + "\n  useEffect(() => {\n    apiClient('/sync')"
);

fs.writeFileSync('src/App.tsx', content);
