const { execSync } = require('node:child_process');

const tokenOut = execSync('npx wrangler auth token', { encoding: 'utf8' });
const token = tokenOut.trim().split(/\r?\n/).filter(Boolean).slice(-1)[0];
const headers = {
  Authorization: 'Bearer ' + token,
  'Content-Type': 'application/json'
};
const base = 'https://api.cloudflare.com/client/v4';

async function j(url) {
  const r = await fetch(url, { headers });
  return r.json();
}

(async () => {
  const verify = await j(base + '/user/tokens/verify');
  const zMain = await j(base + '/zones?name=naturalenglishtraining.com');
  const zNotion = await j(base + '/zones?name=phoenix-rising-protocol.notion.site');

  const out = {
    tokenValid: !!(verify && verify.success),
    tokenStatus: verify && verify.result ? verify.result.status : null,
    mainZoneFound: Array.isArray(zMain && zMain.result) && zMain.result.length > 0,
    mainZoneName: zMain && zMain.result && zMain.result[0] ? zMain.result[0].name : null,
    mainZoneStatus: zMain && zMain.result && zMain.result[0] ? zMain.result[0].status : null,
    notionAsZoneFound: Array.isArray(zNotion && zNotion.result) && zNotion.result.length > 0,
    notionAsZoneName: zNotion && zNotion.result && zNotion.result[0] ? zNotion.result[0].name : null
  };

  if (out.mainZoneFound) {
    const zoneId = zMain.result[0].id;
    const apex = await j(base + '/zones/' + zoneId + '/dns_records?name=naturalenglishtraining.com');
    const www = await j(base + '/zones/' + zoneId + '/dns_records?name=www.naturalenglishtraining.com');

    out.apexRecords = (apex && apex.result ? apex.result : []).map((r) => ({
      type: r.type,
      name: r.name,
      proxied: r.proxied,
      content: r.content
    }));

    out.wwwRecords = (www && www.result ? www.result : []).map((r) => ({
      type: r.type,
      name: r.name,
      proxied: r.proxied,
      content: r.content
    }));
  }

  console.log(JSON.stringify(out, null, 2));
})().catch((e) => {
  console.error('VERIFY_FAILED', e.message);
  process.exit(1);
});