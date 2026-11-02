const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

/** 使用真实浏览器 DOM 解析语义与净化函数，验证富文本边界。 */
function sanitizer() {
  const window = new JSDOM('').window;
  const purifier = createDOMPurify(window);
  const exports = {};
  const source = fs.readFileSync(path.resolve(__dirname, '../src/utils/sanitizeNotice.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  vm.runInNewContext(compiled, { exports, require: name => {
    assert.equal(name, 'dompurify');
    return purifier;
  } });
  return { clean: exports.sanitizeNotice, window };
}

test('公告保留排版与正常图片，删除脚本、事件和危险链接', () => {
  const { clean, window } = sanitizer();
  const root = window.document.createElement('div');
  root.innerHTML = clean('<p><strong>通知</strong><img src="https://example.com/a.png" onerror="alert(1)"></p><a href="javascript:alert(1)">链接</a><script>alert(1)</script>');
  assert.equal(root.querySelector('strong').textContent, '通知');
  assert.equal(root.querySelector('img').getAttribute('src'), 'https://example.com/a.png');
  assert.equal(root.querySelector('img').hasAttribute('onerror'), false);
  assert.equal(root.querySelector('a').hasAttribute('href'), false);
  assert.equal(root.querySelector('script'), null);
  window.close();
});

test('公告拒绝 SVG、嵌入页面及 srcdoc 内容', () => {
  const { clean, window } = sanitizer();
  const root = window.document.createElement('div');
  root.innerHTML = clean('<svg onload="alert(1)"><a href="javascript:alert(1)">x</a></svg><iframe srcdoc="<script>alert(1)</script>"></iframe><p>正文</p>');
  assert.equal(root.querySelector('svg,iframe,script,object,embed'), null);
  assert.equal(root.textContent, '正文');
  window.close();
});
