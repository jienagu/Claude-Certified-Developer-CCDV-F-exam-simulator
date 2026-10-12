// No dependencies. This checks state/logic with a minimal DOM stub, not browser layout.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const bank = fs.readFileSync(path.join(root, 'src/questions.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');

function boot(saved = null, unavailable = false) {
  const nodes = new Map();
  const node = key => {
    if (!nodes.has(key)) nodes.set(key, {
      innerHTML: '', textContent: '', value: '', classList: { toggle() {} },
      querySelector: selector => node(selector), querySelectorAll: () => [],
      focus() {}, close() {}, showModal() {}, scrollIntoView() {}, click() {}
    });
    return nodes.get(key);
  };
  let stored = saved;
  const context = vm.createContext({
    document: { querySelector: node, addEventListener() {}, hidden: false },
    localStorage: {
      getItem() { if (unavailable) throw Error('blocked'); return stored; },
      setItem(key, value) { if (unavailable) throw Error('blocked'); stored = value; }
    },
    setInterval() { return 1; }, clearInterval() {}, setTimeout() {}, console
  });
  vm.runInContext(bank + '\n' + app, context);
  return {
    run: code => vm.runInContext(code, context),
    html: () => node('#app').innerHTML,
    saved: () => stored
  };
}

let t = boot();
assert.equal(t.run('QUESTIONS.length'), 40);
assert.equal(t.run('new Set(QUESTIONS.map(q=>q.id)).size'), 40);
assert.equal(t.run('new Set(QUESTIONS.map(q=>q.domain)).size'), 8);
assert.equal(t.run(`QUESTIONS.every(q => q.options.length === 4 &&
  new Set(q.options).size === 4 && q.correct.length > 0 && q.correct.length < 4 &&
  new Set(q.correct).size === q.correct.length &&
  q.correct.every(i => Number.isInteger(i) && i >= 0 && i < 4) &&
  q.explanation.length > 20 && q.source.startsWith('https://'))`), true);
assert.equal(t.run('same([0,2],[2,0])'), true);
assert.equal(t.run('same([0],[0,2])'), false);
assert.equal(t.run('same([0,1,2],[0,2])'), false);
t.run("start({mode:'study',domain:'all',count:10,target:80})");
assert.equal(t.run('data.attempt.ids.length'), 10);
assert.equal(t.run('validAttempt(data.attempt)'), true);
t.run('data.attempt.answers[data.attempt.ids[0]] = [...getq(data.attempt.ids[0]).correct]; data.attempt.checked[data.attempt.ids[0]]=true; data.attempt.flags.push(data.attempt.ids[0]); save(); exam();');
assert.match(t.html(), /Correct — well reasoned/);
assert.match(t.html(), /disabled/);
t = boot(t.saved());
assert.equal(t.run('data.attempt.flags.length'), 1);
assert.equal(t.run('isRight(getq(data.attempt.ids[0]))'), true);
t.run("finish('Submitted')");
assert.equal(t.run('data.history[0].score'), 10);
t.run("finish('Submitted')");
assert.equal(t.run('data.history.length'), 1);
assert.match(t.html(), /1 correct \/ 10 questions/);
t.run("reviewFilter='flagged'; renderReviews()");

t.run("start({mode:'exam',domain:'Security and safety',count:40,target:80,minutes:45})");
assert.equal(t.run('data.attempt.ids.length'), 4);
assert.doesNotMatch(t.html(), /class="feedback"|id="check"/);
t.run('data.attempt.started=Date.now()-120000; data.attempt.deadline=Date.now()-1000; save()');
t = boot(t.saved());
assert.equal(t.run('data.attempt.reason'), 'Time limit reached');
assert.equal(t.run('data.history.length'), 2);
t = boot(t.saved());
assert.equal(t.run('data.history.length'), 2);

// A damaged persisted option order is rejected without breaking the home page.
const corrupt = JSON.parse(t.saved());
corrupt.attempt.order = {};
const recovered = boot(JSON.stringify(corrupt));
assert.equal(recovered.run('data.attempt'), null);
assert.equal(recovered.run('data.history.length'), 2);
assert.match(recovered.html(), /Start practice/);
assert.match(boot('{invalid-json').html(), /Start practice/);
const blocked = boot(null, true);
blocked.run("start({mode:'study',domain:'all',count:10,target:80})");
assert.equal(blocked.run('data.attempt.ids.length'), 10);
assert.match(blocked.html(), /cannot be saved/);

// A rounded score must not incorrectly satisfy a personal target.
t.run("start({mode:'study',domain:'all',count:40,target:67})");
t.run('data.attempt.ids=data.attempt.ids.slice(0,3); for(const id of data.attempt.ids.slice(0,2)) data.attempt.answers[id]=[...getq(id).correct]; finish("Submitted")');
assert.equal(t.run('data.history[0].score'), 67);
assert.match(t.html(), /Keep practicing/);

// Generated standalone file must match the current source, without external scripts.
let expected = fs.readFileSync(path.join(root, 'src/shell.html'), 'utf8');
for (const [marker, file] of [['/* STYLES */','styles.css'], ['/* QUESTIONS */','questions.js'], ['/* APP */','app.js']]) {
  expected = expected.replace(marker, fs.readFileSync(path.join(root, 'src', file), 'utf8'));
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.equal(html, expected);
assert.doesNotMatch(html, /<script[^>]+src=/i);
console.log('PASS: 40-question bank, exact scoring, session limits, feedback, save/restore, flags, expired deadlines, duplicate submit, damaged saves, blocked storage, standalone bundle.');
