const db = require('./config/db');
db.query('UPDATE employees SET email = "admin@company.com" WHERE id = 1')
  .then(() => { console.log("Admin email reset"); process.exit(0); })
  .catch(console.error);
