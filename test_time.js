const https = require('https');
https.get('https://worldtimeapi.org/api/timezone/Etc/UTC', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data).datetime));
}).on('error', err => console.log("Error:", err.message));
