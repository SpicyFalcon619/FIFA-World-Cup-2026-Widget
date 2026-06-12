const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const key = env.match(/FOOTBALL_DATA_API_KEY=(.*)/)[1];
fetch('https://api.football-data.org/v4/competitions/WC/matches', {
  headers: { 'X-Auth-Token': key }
}).then(r => r.json()).then(data => {
  const last32 = data.matches.filter(m => m.stage === 'LAST_32');
  last32.sort((a,b) => a.utcDate.localeCompare(b.utcDate));
  last32.forEach((m, i) => console.log('Match ' + (73 + i) + ': ' + m.utcDate + ' - ID: ' + m.id));
});
