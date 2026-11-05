/**
 * Interface demo. The sources are clearly fictional placeholders on example.org — the demo shows how
 * verification looks, it is not research. Includes each kind of problem the checks can find.
 */
import { checkClaims, finalStatus, type Research, type Retrieved } from './engine';
import type { Report } from './prompts';

const A = 'https://example.org/placeholder-a';
const B = 'https://example.org/placeholder-b';
const C = 'https://example.org/not-retrieved';

const retrieved: Retrieved[] = [
  { url: A, title: '占位来源 A（虚构）', text: '示例页面 A：在这个虚构的例子中，城市 X 的公共自行车每天被使用约 12,000 次。工作日早高峰的使用量最高。' },
  { url: B, title: '占位来源 B（虚构）', text: null },
];

const report: Report = {
  title: '示例：城市 X 的公共自行车使用情况（界面演示）',
  summary: '这是一个演示核对功能的虚构例子：五条结论分别展示“已核实”“部分支持”“引文对不上”“链接没检索到”和“只有搜索摘要、未能逐字核对”这几种情况。',
  sections: [
    {
      heading: '使用量',
      claims: [
        { text: '城市 X 的公共自行车每天被使用约 12,000 次。', sources: [{ url: A, title: '占位来源 A（虚构）', quote: '城市 X 的公共自行车每天被使用约 12,000 次' }] },
        { text: '使用高峰出现在工作日早高峰，而且周末使用量只有工作日的一半。', sources: [{ url: A, title: '占位来源 A（虚构）', quote: '工作日早高峰的使用量最高' }] },
      ],
    },
    {
      heading: '趋势',
      claims: [
        { text: '使用量比去年增长了 30%。', sources: [{ url: A, title: '占位来源 A（虚构）', quote: '使用量比去年增长了 30%' }] },
        { text: '大多数用户是通勤者。', sources: [{ url: C, title: '一个没被检索到的链接', quote: '大多数用户是通勤者' }] },
        { text: '系统共有约 300 个站点。', sources: [{ url: B, title: '占位来源 B（虚构）', quote: '全市约有 300 个租车站点' }] },
      ],
    },
  ],
  open_questions: ['虚构例子里没有提供用户画像的数据。'],
};

const notes: Record<number, ['supported' | 'partial' | 'unsupported' | 'contradicted', string]> = {
  1: ['supported', '引文逐字包含了这个数字。'],
  2: ['partial', '引文支持“早高峰最高”，但没有提到周末只有一半。'],
  3: ['unsupported', '这段“引文”在来源页面里根本不存在，30% 没有依据。'],
  4: ['unsupported', '这个链接本次没有被检索过，无法作为依据。'],
  5: ['supported', '引文支持这个数字，但它只来自搜索摘要，没法在原页面里逐字核对。'],
};

export function demoResearch(): Research {
  const claims = checkClaims(report, retrieved).map((c) => {
    const [verdict, note] = notes[c.id];
    const x = { ...c, verdict, note };
    return { ...x, status: finalStatus(x) };
  });
  return {
    id: 'demo',
    createdAt: Date.now(),
    question: '（演示）城市 X 的公共自行车用得多吗？',
    depth: 'quick',
    report,
    retrieved,
    claims,
    steps: ['🔎 搜索：城市 X 公共自行车 使用量（演示）', '📄 阅读：' + A, '✍️ 报告完成：5 条结论，开始逐条核对出处…', '✅ 核对完成'],
    demo: true,
  };
}
