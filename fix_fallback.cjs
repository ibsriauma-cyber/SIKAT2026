const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf-8');

const target = `    } catch (error) {
      console.error('Database query error:', error);
      // Fallback to mock data on connection failure
      return res.json({
        users: dbFallback['users'] || [],
        students: dbFallback['students'] || [],
        classes: dbFallback['classes'] || [],
        subjects: dbFallback['subjects'] || []
      });
    }`;

const replace = `    } catch (error: any) {
      console.error('Database query error:', error);
      res.status(500).json({ error: error.message });
    }`;

if(code.includes(target)) {
    code = code.replace(target, replace);
    fs.writeFileSync('server.ts', code);
    console.log('Fixed sync.php error handling.');
} else {
    console.log('Target block not found in sync.php');
}

