const axios = require('axios');
axios.post('http://localhost:3000/api/query.php', {
  query: "DESCRIBE teaching_assignments"
}).then(res => console.log(res.data)).catch(console.error);
