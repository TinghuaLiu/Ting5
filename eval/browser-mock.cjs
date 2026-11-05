// Browser test with a mocked Claude API: web_search -> pause_turn -> web_fetch + report -> verifier.
// Checks the pause_turn continuation and that code checks overrule the verifier.
// Usage: npm run build && npx vite preview & node eval/browser-mock.cjs   (needs Playwright)
const { chromium } = require('playwright');
const ev = (e, d) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`;
const msgStart = { type: 'message_start', message: { id: 'm', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } } };
const PAGE_A = 'In 2024, renewable energies covered 54.4 percent of gross electricity consumption in Germany. Wind power was the largest renewable source.';
function sse(blocks, stop) {
  let s = ev('message_start', msgStart);
  blocks.forEach((b, i) => {
    if (b.type === 'server_tool_use') {
      s += ev('content_block_start', { type: 'content_block_start', index: i, content_block: { ...b, input: {} } });
      s += ev('content_block_delta', { type: 'content_block_delta', index: i, delta: { type: 'input_json_delta', partial_json: JSON.stringify(b.input) } });
    } else if (b.type === 'text') {
      s += ev('content_block_start', { type: 'content_block_start', index: i, content_block: { type: 'text', text: '' } });
      s += ev('content_block_delta', { type: 'content_block_delta', index: i, delta: { type: 'text_delta', text: b.text } });
    } else s += ev('content_block_start', { type: 'content_block_start', index: i, content_block: b });
    s += ev('content_block_stop', { type: 'content_block_stop', index: i });
  });
  s += ev('message_delta', { type: 'message_delta', delta: { stop_reason: stop, stop_sequence: null }, usage: { output_tokens: 5 } });
  return s + ev('message_stop', { type: 'message_stop' });
}
const report = { title: 'Mock report', summary: 'Summary.', open_questions: [], sections: [{ heading: 'Share', claims: [
  { text: 'Renewables covered 54.4 % of gross electricity consumption in 2024.', sources: [{ url: 'https://www.uba.example/page-a/', title: 'A', quote: 'renewable energies covered 54.4 percent of gross electricity consumption' }] },
  { text: 'Solar contributed about 14 %.', sources: [{ url: 'https://b.example/b', title: 'B', quote: 'solar contributed about 14 percent' }] },
  { text: 'Hydro grew strongly.', sources: [{ url: 'https://invented.example/x', title: 'X', quote: 'hydro grew strongly' }] },
  { text: 'Solar was the largest source.', sources: [{ url: 'https://uba.example/page-a', title: 'A', quote: 'Solar power was the largest renewable source' }] },
] }] };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  let n = 0; const seen = [];
  await p.route('https://api.anthropic.com/**', async (route) => {
    const r = route.request();
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*' };
    if (r.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const body = JSON.parse(r.postData()); n++;
    seen.push({ n, stream: !!body.stream, tools: (body.tools || []).map(t => t.type), msgs: body.messages.length, lastRole: body.messages.at(-1).role, assistantBlocks: body.messages.filter(m => m.role === 'assistant').flatMap(m => (m.content || []).map(c => c.type)) });
    if (body.stream && n === 1) return route.fulfill({ status: 200, headers: { ...cors, 'content-type': 'text/event-stream' }, body: sse([
      { type: 'server_tool_use', id: 'srvtoolu_1', name: 'web_search', input: { query: 'Anteil erneuerbare Energien 2024' } },
      { type: 'web_search_tool_result', tool_use_id: 'srvtoolu_1', content: [{ type: 'web_search_result', url: 'https://uba.example/page-a', title: 'A', encrypted_content: 'x', page_age: null }, { type: 'web_search_result', url: 'https://b.example/b', title: 'B', encrypted_content: 'y', page_age: null }] },
    ], 'pause_turn') });
    if (body.stream) return route.fulfill({ status: 200, headers: { ...cors, 'content-type': 'text/event-stream' }, body: sse([
      { type: 'server_tool_use', id: 'srvtoolu_2', name: 'web_fetch', input: { url: 'https://uba.example/page-a' } },
      { type: 'web_fetch_tool_result', tool_use_id: 'srvtoolu_2', content: { type: 'web_fetch_result', url: 'https://uba.example/page-a', retrieved_at: null, content: { type: 'document', title: 'A', citations: null, source: { type: 'text', media_type: 'text/plain', data: PAGE_A } } } },
      { type: 'text', text: '```json\n' + JSON.stringify(report) + '\n```' },
    ], 'end_turn') });
    // verifier: claims "supported" for everything — code checks must still flag the bad ones
    const verdicts = { verdicts: [1, 2, 3, 4].map(id => ({ id, verdict: 'supported', note: 'mock' })) };
    return route.fulfill({ status: 200, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify({ id: 'v', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: JSON.stringify(verdicts) }], stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } }) });
  });
  await p.goto('process.env.APP_URL || "http://localhost:4173/"');
  await p.getByRole('button', { name: /设置/ }).click(); await p.fill('input[type=password]', 'sk-ant-test'); await p.getByRole('button', { name: '保存' }).click();
  await p.fill('.form textarea', 'Wie hoch war der Anteil erneuerbarer Energien 2024?');
  await p.getByText('开始研究 →').click();
  await p.waitForSelector('.claim', { timeout: 15000 });
  console.log('requests:', JSON.stringify(seen));
  for (let i = 0; i < 4; i++) await p.locator('.claim-head').nth(i).click();
  const rows = await p.locator('.claim').allInnerTexts();
  rows.forEach((r, i) => console.log(`claim ${i + 1}:`, r.replace(/\n+/g, ' | ').slice(0, 230)));
  console.log('steps:', (await p.locator('details.card summary').innerText()));
  console.log('errors', errs); await b.close();
})();
