# 深研 · 真实模型测试报告

- 模型：`claude-opus-5-5`，研究和核查都用应用里完全相同的提示词（`src/lib/prompts.ts`）和核对代码（`src/lib/engine.ts`）
- 注意：应用使用 Claude API 的服务端 web_search / web_fetch 工具；这里通过 Claude Code CLI 的 WebSearch / WebFetch 工具运行同一提示词。检索记录取自 CLI 的工具调用；引文是否出现在原页面，由一个独立的“重新抓取并对比”步骤检查
- 时间：2026-11-05T00:12:11.207Z · 花费约 $1.14

**总计：21/21 项通过**

| 检查项 | 结果 | 详情 |
|---|---|---|
| A 核查员：没有把不支持/相反/部分支持的结论判成“支持” | ✅ | 0/11 |
| A 核查员：真正有依据的结论被判为“支持”（≥ 4/5） | ✅ | 5/5 |
| A 核查员：四分类完全一致（≥ 12/16） | ✅ | 15/16 |
| 单元测试：URL 规范化忽略 www、末尾斜杠、#锚点和 utm 参数 | ✅ |  |
| 单元测试：URL 规范化保留真正的查询参数 | ✅ |  |
| 单元测试：引文匹配：大小写、换行、引号样式不敏感 | ✅ |  |
| 单元测试：引文匹配：支持省略号拼接 | ✅ |  |
| 单元测试：引文匹配：改过的数字不算匹配 | ✅ |  |
| 单元测试：核对：检索过且引文存在 | ✅ |  |
| 单元测试：核对：编造的链接被标为未检索 | ✅ |  |
| 单元测试：核对：改过的引文被标为找不到 | ✅ |  |
| 单元测试：核对：只有搜索摘要时标为无法核对 | ✅ |  |
| 单元测试：状态：编造链接即使核查员说支持也算有问题 | ✅ |  |
| 单元测试：状态：引文对不上即使核查员说支持也算有问题 | ✅ |  |
| 单元测试：状态：全部通过才算已核实 | ✅ |  |
| C [de-renewables] 真的联网检索了 | ✅ | 7 次搜索（共 99 个结果）、8 次尝试读取网页 |
| C [de-renewables] 没有编造：每条结论都引用本次检索到的页面 | ✅ | 12/12 个引用在检索记录里 |
| C [de-renewables] 生成了有引文的结论（≥ 5 条） | ✅ | 11 条：✓ 1 · ◐ 10 · ✗ 0 |
| C [if-weightloss] 真的联网检索了 | ✅ | 7 次搜索（共 70 个结果）、6 次尝试读取网页 |
| C [if-weightloss] 没有编造：每条结论都引用本次检索到的页面 | ✅ | 25/25 个引用在检索记录里 |
| C [if-weightloss] 生成了有引文的结论（≥ 5 条） | ✅ | 23 条：✓ 12 · ◐ 11 · ✗ 0 |

**因环境限制跳过（不计入总计）：**

- C [de-renewables] 引文是否出现在原页面：本环境的网络代理拒绝打开网页（尝试了 8 次），无法逐字核对
- C [if-weightloss] 引文是否出现在原页面：本环境的网络代理拒绝打开网页（尝试了 6 次），无法逐字核对

## A. 核查员在标注集上的判断

| 结论 | 引文 | 标注 | 核查员 |
|---|---|---|---|
| Munich had about 1.61 million residents at the end of 2025. | At the end of 2025, 1,612,429 people had their main residence in Munich. | supported | ✅ supported |
| Renewables covered more than half of Germany's gross electricity consumption in 2024. | In 2024, renewable energies covered 54.4 percent of gross electricity consumption in Germany. | supported | ✅ supported |
| 316L 是一种奥氏体不锈钢。 | 316L is an austenitic stainless steel with low carbon content. | supported | ✅ supported |
| Die Studie umfasste 139 Teilnehmende mit Adipositas. | A total of 139 patients with obesity were randomly assigned to time-restricted eating or daily calorie restriction. | supported | ✅ supported |
| The trial lasted 12 months. | Participants were followed for 12 months after randomisation. | supported | ✅ supported |
| Renewables covered 54.4 % of electricity consumption in 2024, mostly thanks to solar power. | In 2024, renewable energies covered 54.4 percent of gross electricity consumption in Germany. | partial | ✅ partial |
| Both diets led to similar weight loss, and the fasting group reported better sleep. | Weight loss did not differ significantly between the time-restricted eating group and the calorie-restriction group. | partial | ✅ partial |
| 慕尼黑工业大学有超过 5 万名学生，其中约 40% 来自国外。 | TUM currently has more than 50,000 students. | partial | ✅ partial |
| The melt pool depth increases with laser power and decreases with scan speed. | Melt pool depth increased with increasing laser power. | partial | ✅ partial |
| Renewables covered 62 % of gross electricity consumption in 2024. | In 2024, renewable energies covered 54.4 percent of gross electricity consumption in Germany. | unsupported | ❌ contradicted |
| Intermittent fasting causes faster weight loss because it lowers insulin levels. | Participants in the fasting group lost on average 8 kg over 12 months. | unsupported | ✅ unsupported |
| Die Wartezeit für Termine beim Bürgerbüro beträgt im Schnitt drei Wochen. | Termine im Bürgerbüro können online gebucht werden. | unsupported | ✅ unsupported |
| 这种合金的抗拉强度达到 1200 MPa。 | The alloy showed good ductility and a fine-grained microstructure. | unsupported | ✅ unsupported |
| Time-restricted eating led to significantly more weight loss than calorie restriction. | Weight loss did not differ significantly between the time-restricted eating group and the calorie-restriction group. | contradicted | ✅ contradicted |
| Munich's population shrank in 2025. | Munich's population grew by around 9,000 people in 2025. | contradicted | ✅ contradicted |
| 该研究发现，提高扫描速度会降低表面粗糙度。 | Higher scan speeds resulted in increased surface roughness (Ra). | contradicted | ✅ contradicted |

## C. 2024 年德国总用电量中可再生能源的占比是多少？风电和光伏各贡献多少？

**2024 年德国用电中可再生能源的占比，以及风电和光伏的贡献** — 数据来源不同，口径也不同。按德国官方统计（联邦环境署 UBA 下属的 AGEE-Stat，2025 年 3 月终核），2024 年可再生能源占德国毛用电量（Bruttostromverbrauch）的 54.4%。德国能源与水经济联合会（BDEW）和巴符州太阳能与氢能研究中心（ZSW）的说法是“略高于 55%”。弗劳恩霍夫 ISE 只统计公共电网净发电量，得出 62.7%。按电量算，风电约 139–141 TWh，是最大的可再生电源，其中陆上风电约 113–115 TWh，海上风电约 26–27 TWh。光伏约 72–76 TWh。弗劳恩霍夫 ISE 的数据显示，风电约占公共净发电量的 33%，光伏约占 14%。需要说明：本次会话中所有网页的全文抓取都被代理拒绝，下面的引文全部来自搜索结果摘要和页面标题，没能逐字对照原文核实。

- ◐ 按 UBA/AGEE-Stat 的终核数据，2024 年可再生能源占德国毛用电量的 54.4%。 — [www.klimaschutz-niedersachsen.de](https://www.klimaschutz-niedersachsen.de/Anteil-der-Erneuerbaren-am-Bruttostromverbrauch-stieg-2024-auf-544-Prozent-4273) [www.solarserver.de](https://www.solarserver.de/2025/03/10/erneuerbare-erreichen-544-prozent-am-bruttostromverbrauch-2024/) _(partial: 引文支持2024年可再生能源占毛用电量54.4%，但未提及UBA/AGEE-Stat或“终核数据”。)_
- ◐ UBA 在 2024 年 12 月发布的初步估算中，给出的占比约为 54%。 — [www.umweltbundesamt.de](https://www.umweltbundesamt.de/presse/pressemitteilungen/mehr-strom-aus-erneuerbaren-energien) _(partial: 引文仅有“约54%”，没有说明是UBA发布、2024年12月、初步估算，也未说明指什么占比。)_
- ◐ BDEW 和 ZSW 在 2024 年 12 月的估算是：可再生能源满足了略高于 55% 的用电量，创下新高。 — [www.bdew.de](https://www.bdew.de/presse/presseinformationen/erneuerbare-energien-erreichen-neuen-hoechstwert-gut-55-prozent-des-stromverbrauchs-in-2024-gedeckt/) _(partial: 引文支持2024年可再生能源满足略高于55%的用电量，但未提及BDEW/ZSW、2024年12月或“创新高”。)_
- ◐ 弗劳恩霍夫 ISE 的口径是公共电网净发电量。按此口径，2024 年可再生能源占比为 62.7%，其中光伏约占 14%。这个口径不含工业自备电厂，所以数值比毛用电量口径高。 — [www.pv-magazine-india.com](https://www.pv-magazine-india.com/?p=9352) _(partial: 引文支持62.7%和光伏14%，但未说明是公共电网净发电量口径、不含工业自备电厂，也未说明数值因此更高。)_
- ◐ 弗劳恩霍夫 ISE 的数据显示，2024 年风电发电 136.4 TWh，约占公共净发电量的 33%。 — [www.ise.fraunhofer.de](https://www.ise.fraunhofer.de/en/press-media/press-releases/2025/public-electricity-generation-2024-renewable-energies-cover-more-than-60-percent-of-german-electricity-consumption-for-the-first-time.html) _(partial: 引文只有136.4 TWh这个数字，未说明是风电、2024年，也没有约33%的占比。)_
- ◐ BDEW 在 2024 年 12 月的估算：陆上风电约 1150 亿 kWh（即 115 TWh），海上风电增长超过 11%，接近 270 亿 kWh（即 27 TWh）。 — [www.bdew.de](https://www.bdew.de/media/documents/241216_BDEW_ZSW_EE-Anteil_Gesamtjahr.pdf) _(partial: 引文只支持“接近270亿kWh”，未提及陆上风电1150亿kWh、海上风电增长超11%或BDEW。)_
- ✓ UBA 在 2024 年 12 月的估算中，陆上风电约为 114.2 TWh，比上一年（116.7 TWh）下降约 2%。 — [www.umweltbundesamt.de](https://www.umweltbundesamt.de/presse/pressemitteilungen/mehr-strom-aus-erneuerbaren-energien)
- ◐ UBA 的估算显示，2024 年光伏发电约 74 TWh，比 2023 年增长 16%。 — [www.pv-magazine.de](https://www.pv-magazine.de/2024/12/12/photovoltaik-stromerzeugung-stieg-2024-um-16-prozent/) _(partial: 引文支持2024年光伏发电增长16%，但没有约74 TWh这个数字。)_
- ◐ BDEW 在 2024 年 12 月估算，光伏发电约 720 亿 kWh（即 72 TWh）。 — [www.bdew.de](https://www.bdew.de/media/documents/241216_BDEW_ZSW_EE-Anteil_Gesamtjahr.pdf) _(partial: 引文只有“720亿kWh”这个数字，未说明是光伏发电、BDEW或2024年12月估算。)_
- ◐ UBA 的初步估算显示，2024 年可再生能源发电量比上一年多出 4% 以上。 — [www.umweltbundesamt.de](https://www.umweltbundesamt.de/presse/pressemitteilungen/mehr-strom-aus-erneuerbaren-energien) _(partial: 引文支持比上一年多出4%以上，但未说明主语是可再生能源发电量，也未说明出自UBA初步估算。)_
- ◐ 德国联邦经济部的《Erneuerbare Energien in Zahlen 2024》给出的 2024 年可再生能源发电总量为 285.9 TWh。 — [www.bundeswirtschaftsministerium.de](https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Publikationen/Energie/erneuerbare-energien-in-zahlen-2024.pdf?__blob=publicationFile&v=6) _(partial: 引文只有285.9 TWh这个数字，未说明出自联邦经济部《Erneuerbare Energien in Zahlen 2024》，也未说明是2024年可再生能源发电总量。)_

检索：“Fraunhofer ISE public net electricity generation 2024 renewable share wind solar”、“BDEW ZSW 2024 Anteil erneuerbare Energien Bruttostromverbrauch Windenergie Photovoltaik”、“Umweltbundesamt erneuerbare Energien 2024 Bruttostromverbrauch Anteil 54 Prozent”、“AGEE-Stat 2024 Windenergie an Land auf See Photovoltaik Terawattstunden Stromerzeugung 284 TWh 54,4 Prozent”、“BDEW 2024 Gesamtjahr Wind onshore offshore Photovoltaik Milliarden Kilowattstunden 55 Prozent Bruttostromverbrauch”、“Umweltbundesamt März 2025 Erneuerbare 2024 54,4 Prozent Windenergie Photovoltaik Anteil Bruttostromverbrauch”、“Fraunhofer ISE 2024 "solar" TWh net public generation "59.8" OR "72.2" self-consumption photovoltaic”

**未解决的问题：**

- 风电和光伏各自占毛用电量的百分比，官方来源没有直接给出。我粗略算了一下：风电约 139–141 TWh，除以约 512–519 TWh 的毛用电量，约为 27%；光伏约 72–76 TWh，约为 14%。这是我自己的推算，没有引文支持。
- UBA 于 2025 年 3 月发布的终核背景报告（hgp_erneuerbareenergien_2024.pdf）应该有风电和光伏的最终数据，但页面抓取被代理拒绝，没能读到原文。
- 各来源的数值有出入：可再生能源发电总量有 284 TWh（UBA 终核，来自搜索摘要）和 285.9 TWh（经济部）两种说法；光伏有 72、74、75.4、76.6 TWh 几种数字；BDEW 后来把 2024 年的占比修订为 55.1%–55.8% 不等。造成差异的原因包括口径不同和数据修订，具体原因没有逐一核实。
- 本报告的所有引文都来自搜索结果摘要或页面标题，没能用全文逐字核对，建议直接查阅原文确认。

## C. What do randomized controlled trials show about intermittent fasting or time-restricted eating versus daily calorie restriction for weight loss in adults?

**Intermittent fasting and time-restricted eating vs. daily calorie restriction for weight loss in adults: what the randomized trials show** — Across randomized trials, intermittent fasting (IF) and time-restricted eating (TRE) lead to about the same weight loss as ordinary daily calorie restriction. Where an advantage shows up, it is small. The largest synthesis is a 2025 BMJ network meta-analysis of 99 RCTs with 6,582 adults. It found that every fasting approach and continuous calorie restriction beat an unrestricted diet. Only alternate-day fasting beat continuous restriction, by about 1.3 kg, which is below the authors' 2 kg threshold for a meaningful difference. Head-to-head 12-month trials point the same way. TRE added to calorie restriction (NEJM 2022) was not significantly better than calorie restriction alone. TRE without calorie counting (Annals 2023) matched 25% calorie restriction. Alternate-day fasting (JAMA IM 2017) was not better and had more dropouts. The exception is a 2025 Annals trial: 4:3 fasting with intensive behavioral support produced modestly more weight loss than daily restriction (7.6% vs 5%; about 2.9 kg, with a CI close to zero). Overall, IF and TRE look like reasonable alternatives to daily calorie restriction rather than better ones. Long-term data are limited. Method note: the page-fetching tool failed in this session (the proxy refused every connection), so I couldn't read any page in full. All quotes come from search-result text. Because search snippets can't be checked word for word against the pages, verify key numbers against the original papers.

- ◐ The 2025 BMJ network meta-analysis (Semnani-Azad et al.) pooled 99 randomized trials with 6,582 adults, most of whom had existing health conditions. — [bmjgroup.com](https://bmjgroup.com/?p=11551) _(partial: Quote backs 99 RCTs, 6,582 adults, mostly with existing conditions, but not the 2025 date, BMJ, or Semnani-Azad authorship.)_
- ◐ Compared with an unrestricted diet, every intermittent fasting strategy and continuous calorie restriction reduced body weight, but the effects were small. — [bmjgroup.com](https://bmjgroup.com/?p=11551) _(partial: Quote backs that all strategies reduced weight with small effects, but does not state the comparator was an unrestricted diet.)_
- ◐ Alternate-day fasting was the only fasting approach with a weight-loss advantage over continuous calorie restriction: about 1.29 kg, rated moderate-certainty evidence. — [www.mcmasteroptimalaging.org](https://www.mcmasteroptimalaging.org/full-article/PLUS/intermittent-fasting-strategies-effects-body-weight-cardiometabolic-risk-factors-116947) _(partial: Quote gives −1.29 kg with moderate certainty but does not say it was alternate-day fasting vs continuous restriction or that it was the only approach with an advantage.)_
- ✓ The 1.29 kg advantage for alternate-day fasting falls short of the 2 kg threshold the authors set for a clinically important difference. — [www.news-medical.net](https://www.news-medical.net/news/20250619/Intermittent-fasting-shows-similar-weight-loss-benefits-to-traditional-diets.aspx)
- ✓ Compared with time-restricted eating and whole-day fasting, alternate-day fasting gave only trivially more weight loss. — [bmjgroup.com](https://bmjgroup.com/?p=11551)
- ✓ In trials lasting 24 weeks or more, the only weight-loss benefit seen was for diet strategies compared with an unrestricted diet. — [bmjgroup.com](https://bmjgroup.com/?p=11551)
- ◐ The authors concluded that intermittent fasting works about as well as continuous calorie restriction and that longer trials are needed. — [www.news-medical.net](https://www.news-medical.net/news/20250619/Intermittent-fasting-shows-similar-weight-loss-benefits-to-traditional-diets.aspx) _(partial: Quote backs similar benefits to continuous restriction but says nothing about needing longer trials.)_
- ✓ A linked BMJ editorial pointed out that many comparisons, especially those involving alternate-day fasting, were made against unrestricted (ad libitum) diets rather than against calorie restriction. — [www.bmj.com](https://www.bmj.com/node/1111119)
- ◐ In Liu et al. (NEJM 2022), 139 adults with obesity were randomized to calorie restriction with 8 a.m.–4 p.m. time-restricted eating or to calorie restriction alone, for 12 months. — [ce.massmed.nejm.org](https://ce.massmed.nejm.org/nejm-weekly-cme/content/calorie-restriction-or-without-time-restricted-eating-weight-loss) _(partial: Quote backs 139 patients with obesity, the 8 a.m.–4 p.m. TRE plus calorie restriction vs calorie restriction alone, but not the 12-month duration or NEJM 2022.)_
- ✓ After 12 months, the time-restricted group had lost 8.0 kg and the calorie-restriction-only group 6.3 kg. — [ce.massmed.nejm.org](https://ce.massmed.nejm.org/nejm-weekly-cme/content/calorie-restriction-or-without-time-restricted-eating-weight-loss)
- ✓ The NEJM authors concluded that the two approaches worked about equally well. — [ce.massmed.nejm.org](https://ce.massmed.nejm.org/nejm-weekly-cme/content/calorie-restriction-or-without-time-restricted-eating-weight-loss)
- ◐ A 2024 commentary argued that the NEJM confidence interval is also consistent with a real benefit of up to about 4 kg, so 'no benefit' is too strong a reading. — [www.frontiersin.org](https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2024.1428998/full) _(partial: Quote backs a plausible range of about 0–4 kg, but not the 2024 date or the argument that 'no benefit' is too strong.)_
- ◐ In Lin, Varady et al. (Annals 2023), time-restricted eating (noon–8 p.m., no calorie counting) and 25% calorie restriction each produced more weight loss than the control group at 12 months. — [www.thepharmacist.co.uk](https://www.thepharmacist.co.uk/clinical/time-restricted-eating-no-better-than-calorie-counting-for-weight-loss-in-obese-adults/) _(partial: Quote backs both groups losing significantly more than control, but not the noon–8 p.m. window, the lack of calorie counting, or the 12-month timepoint.)_
- ✓ In that trial, weight loss with time-restricted eating did not differ significantly from weight loss with calorie restriction. — [www.thepharmacist.co.uk](https://www.thepharmacist.co.uk/clinical/time-restricted-eating-no-better-than-calorie-counting-for-weight-loss-in-obese-adults/)
- ◐ All participants in that trial got dietary counseling. Critics noted that most people who try time-restricted eating on their own get no such support. — [www.opb.org](https://www.opb.org/article/2023/06/27/intermittent-fasting-is-as-effective-as-counting-calories-new-study-finds) _(partial: Quote backs the critics' point about lack of support, but not that all trial participants got dietary counseling.)_
- ◐ In the 12-week TREAT trial (Lowe et al., JAMA Internal Medicine 2020), 16:8 time-restricted eating without other intervention did not produce significantly more weight loss than eating throughout the day. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/32986097/) _(partial: Quote backs a non-significant difference (1.17% vs 0.75%), but not the 12-week duration, the 16:8 schedule, or the source details.)_
- ✓ Trepanowski et al. (JAMA IM 2017) randomized 100 adults with obesity to alternate-day fasting, daily calorie restriction (75% of energy needs), or a control group for one year. — [www.gwern.net](https://Www.Gwern.net/doc/longevity/fasting/2017-trepanowski.pdf)
- ✓ Alternate-day fasting was not better than daily calorie restriction for adherence, weight loss, weight maintenance, or heart-health markers. — [www.gwern.net](https://Www.Gwern.net/doc/longevity/fasting/2017-trepanowski.pdf)
- ◐ The university press release gave approximate weight-loss figures of 6% for alternate-day fasting and 5.3% for daily calorie restriction. — [today.uic.edu](https://today.uic.edu/can-you-feast-while-dieting/) _(partial: Quote gives the 6% and 5.3% figures but does not show they came from a university press release.)_
- ✓ Dropout was highest in the alternate-day fasting group. — [www.gwern.net](https://Www.Gwern.net/doc/longevity/fasting/2017-trepanowski.pdf)
- ✓ By month 12, LDL cholesterol was significantly higher with alternate-day fasting than with daily calorie restriction. — [www.gwern.net](https://Www.Gwern.net/doc/longevity/fasting/2017-trepanowski.pdf)
- ◐ Catenacci et al. randomized 165 adults with overweight or obesity to 4:3 intermittent fasting or daily calorie restriction for 12 months. Both groups also received an intensive behavioral weight-loss program. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/40163873/) [www.healthday.com](https://www.healthday.com/healthpro-news/weight-loss/weight-loss-greater-with-intermittent-fasting-than-calorie-restriction) _(partial: Quotes back 165 randomized participants, 4:3 IMF vs DCR, and the behavioral program, but not 'overweight or obesity' or the 12-month duration.)_
- ✓ At 12 months, the 4:3 fasting group had lost more weight than the daily calorie restriction group: 7.6% vs. 5%, a difference of about 2.89 kg. The confidence interval nearly reached zero. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/40163873/) [www.healthday.com](https://www.healthday.com/healthpro-news/weight-loss/weight-loss-greater-with-intermittent-fasting-than-calorie-restriction)

检索：“NEJM 2022 time-restricted eating calorie restriction weight loss randomized trial Liu”、“BMJ 2025 network meta-analysis intermittent fasting versus continuous energy restriction weight loss randomized trials”、“Annals of Internal Medicine 2025 4:3 intermittent fasting versus daily caloric restriction randomized trial”、“Semnani-Azad BMJ 2025 intermittent fasting abstract "continuous energy restriction" "alternate day fasting" mean difference”、“Trepanowski 2017 JAMA Internal Medicine alternate-day fasting vs daily calorie restriction randomized trial weight loss results”、“Lowe TREAT randomized trial 16:8 time-restricted eating JAMA Internal Medicine 2020 weight loss results”、“Lin Varady 2023 Annals of Internal Medicine time-restricted eating without calorie counting vs calorie restriction 12 months obesity results”

**未解决的问题：**

- No page could be read in full because the fetch tool's proxy refused every connection. All quotes come from search-result text and should be checked against the original abstracts, especially the BMJ numbers, since a correction was published (BMJ 2025;390, doi 10.1136/bmj.r1737).
- Sources disagree on how many people were in the Lin/Varady 2023 Annals trial. NPR coverage describes 90 recruited; another write-up says 77 were randomized. I could not check this against the paper.
- The NEJM 2022 p-value (reported as P = 0.11) and the exact CI for the between-group difference came from secondary summaries. I could not confirm them against the paper.
- Long-term evidence beyond 12 months, on weight maintenance and on safety (for example, the LDL rise seen with alternate-day fasting), is limited.
- It is unclear whether the modest 4:3 fasting advantage in Catenacci et al. would hold without intensive behavioral support, or would be replicated in other trials.
