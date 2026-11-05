import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const rules = JSON.parse(readFileSync(new URL("rules.json", root)));
const manifest = JSON.parse(readFileSync(new URL("manifest.json", root)));
const pattern = rules[0].condition.regexFilter;
const ruHost = new RegExp(pattern, "i");

const blocked = [
  "https://example.ru",
  "https://example.ru/",
  "https://example.ru:8080/a?b=1",
  "https://a.b.ru/path",
  "https://sub.example.ru/path",
  "http://example.ru",
  "https://EXAMPLE.RU/path",
  "https://example.ru./",
  "https://example.ru#frag",
  "https://example.ru?x=1",
  "https://notexample.ru",
  "https://user:pass@foo.ru/",
  "https://user:pass@foo.ru:8443/path",
  "wss://cdn.example.ru/socket",
  "ws://example.ru/socket",
  "https://a.ru.b.ru/x",
  "https://example.su",
  "https://example.su/",
  "https://example.su./",
  "https://a.b.su/path",
  "https://EXAMPLE.SU:8080/x",
  "https://user:pass@foo.su/",
  "wss://cdn.example.su/socket",
  "ws://foo.su/socket",
  "https://example.xn--p1ai",
  "https://example.xn--p1ai/path",
  "https://sub.example.XN--P1AI/",
  "https://example.xn--p1ai:443/x",
];

const idnBlocked = [
  "https://пример.рф/path",
  "https://example.рф",
  "wss://cdn.пример.рф/socket",
];

const allowed = [
  "https://example.com",
  "https://example.com/",
  "https://example.ru.evil.com",
  "https://example.ru.evil.com/path",
  "https://not.ru.example.com/",
  "https://evil.com/?q=site.ru",
  "https://evil.com/site.ru/page",
  "https://ru/",
  "https://ru",
  "http://ru:8080/",
  "https://foo.ru.com",
  "https://example.rug",
  "https://example.com.ru.not",
  "ftp://example.ru/file",
  "https://user:pass@evil.com/",
  "https://su/",
  "https://рф/",
  "https://xn--p1ai/",
  "https://example.su.evil.com",
  "https://example.super.com",
  "https://example.sux",
  "https://example.xn--p1ai.evil.com",
  "https://example.xn--p1ai.com",
  "https://evil.com/?q=site.su",
  "https://evil.com/?q=site.рф",
  "https://not.su.example.com/",
];

assert.match(pattern, /^[\u0000-\u007F]*$/, "regexFilter must be ASCII");

for (const url of blocked) {
  assert.match(url, ruHost, `expected to block ${url}`);
}

for (const url of idnBlocked) {
  const requestUrl = new URL(url).href;
  assert.notEqual(requestUrl, url);
  assert.match(requestUrl, ruHost, `expected to block ${url} as ${requestUrl}`);
}

for (const url of allowed) {
  assert.doesNotMatch(url, ruHost, `expected to allow ${url}`);
}

const types = new Set(rules[0].condition.resourceTypes);
for (const required of ["main_frame", "xmlhttprequest", "websocket", "script"]) {
  assert.ok(types.has(required), `missing resource type ${required}`);
}

for (const pattern of ["*://*.su/*", "*://*.xn--p1ai/*", "wss://*.su/*", "wss://*.xn--p1ai/*"]) {
  assert.ok(manifest.host_permissions.includes(pattern), `missing host permission ${pattern}`);
}

console.log(`ok ${blocked.length + idnBlocked.length} blocked, ${allowed.length} allowed`);
