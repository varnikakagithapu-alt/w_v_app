const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const practice = fs.readFileSync(path.join(root, 'assets/scripts/practice.js'), 'utf8');

test('the page and practice mode resolve app.js to one module URL', () => {
  const pageEntry = html.match(/<script\s+type="module"\s+src="([^"]*assets\/scripts\/app\.js[^"]*)"/i)?.[1];
  const practiceImport = practice.match(/from\s+['"]([^'"]*app\.js(?:\?[^'"]*)?)['"]/i)?.[1];

  assert.ok(pageEntry, 'index.html should load the app module');
  assert.ok(practiceImport, 'practice.js should import app.js');

  const pageUrl = new URL(pageEntry, 'https://example.test/w_v_app/');
  const practiceUrl = new URL(practiceImport, 'https://example.test/w_v_app/assets/scripts/practice.js');
  assert.equal(practiceUrl.href, pageUrl.href);
});
