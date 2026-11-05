# 深研 · 真实模型测试报告

- 模型：`claude-opus-5-5`，研究和核查都用应用里完全相同的提示词（`src/lib/prompts.ts`）和核对代码（`src/lib/engine.ts`）
- 注意：应用使用 Claude API 的服务端 web_search / web_fetch 工具；这里通过 Claude Code CLI 的 WebSearch / WebFetch 工具运行同一提示词。检索记录取自 CLI 的工具调用；引文是否出现在原页面，由一个独立的“重新抓取并对比”步骤检查
- 时间：2026-11-05T00:15:55.482Z · 花费约 $1.20

**总计：22/22 项通过**

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
| 单元测试：状态：只有搜索摘要时最多算“未能逐字核对” | ✅ |  |
| C [de-renewables] 真的联网检索了 | ✅ | 6 次搜索（共 90 个结果）、6 次尝试读取网页 |
| C [de-renewables] 没有编造：每条结论都引用本次检索到的页面 | ✅ | 16/16 个引用在检索记录里 |
| C [de-renewables] 生成了有引文的结论（≥ 5 条） | ✅ | 15 条：✓ 0 · ○ 0 · ◐ 15 · ✗ 0 |
| C [if-weightloss] 真的联网检索了 | ✅ | 7 次搜索（共 70 个结果）、9 次尝试读取网页 |
| C [if-weightloss] 没有编造：每条结论都引用本次检索到的页面 | ✅ | 26/26 个引用在检索记录里 |
| C [if-weightloss] 生成了有引文的结论（≥ 5 条） | ✅ | 26 条：✓ 0 · ○ 9 · ◐ 17 · ✗ 0 |

**因环境限制跳过（不计入总计）：**

- C [de-renewables] 引文是否出现在原页面：本环境的网络代理拒绝打开网页（尝试了 6 次），无法逐字核对
- C [if-weightloss] 引文是否出现在原页面：本环境的网络代理拒绝打开网页（尝试了 9 次），无法逐字核对

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

**2024 年德国可再生能源在用电量中的占比，以及风电和光伏的贡献** — 按德国官方统计口径（环境署 UBA 下属的 AGEE-Stat，2025 年 3 月发布），2024 年可再生能源占德国总用电量的 54.4%（2023 年为 52.9%），全年可再生能源发电量为 284 TWh。行业协会 BDEW/ZSW 在 2024 年 12 月给出的初步估算是“略高于 55%”。风电是最大的来源：AGEE-Stat 数据中陆上和海上风电合计 138.9 TWh，风电和光伏合计占可再生电力的四分之三以上。光伏约占总用电量的 14%（BDEW/ZSW），发电量约 72 至 76 TWh，具体数字取决于数据版本。如果换成按发电量计算，占比会更高：联邦统计局为 59.4%，Fraunhofer ISE 按公共电网净发电量计为 62.7%，其中风电约占 33%，光伏约占 14%。说明：这次所有网页全文抓取都被代理拒绝，所以引文都来自搜索结果摘要，无法逐字核对原文。

- ◐ 根据 UBA 下属的 AGEE-Stat，2024 年可再生能源占德国总用电量的 54.4%，比 2023 年的 52.9% 有所上升；同时用电量比 2023 年略增约 1%。 — [www.solarserver.de](https://www.solarserver.de/2025/03/10/erneuerbare-erreichen-544-prozent-am-bruttostromverbrauch-2024/) [www.stadt-und-werk.de](https://www.stadt-und-werk.de/k21-meldungen/anteil-der-erneuerbaren-waechst/) _(partial: 引文只支持2024年可再生能源占总用电量54.4%；2023年的52.9%、用电量增长约1%以及AGEE-Stat的来源，引文都没有提到。)_
- ◐ 2024 年德国可再生能源发电量为 284 TWh，创历史新高，比 2023 年增长 3%。 — [www.umweltbundesamt.de](https://www.umweltbundesamt.de/presse/pressemitteilungen/mehr-strom-aus-erneuerbaren-energien) _(partial: 引文支持2024年284 TWh、比2023年增长3%；但没有说是“历史新高”。)_
- ◐ 54.4% 是 2024 年的数值。UBA 后来公布的 2025 年占比为 55.1%。 — [www.umweltbundesamt.de](https://www.umweltbundesamt.de/themen/klima-energie/erneuerbare-energien/erneuerbare-energien-in-zahlen) _(partial: 引文支持2025年占比为55.1%；但没有提到由UBA公布，也没有说54.4%是2024年的数值。)_
- ◐ BDEW 和 ZSW 的初步估算是：2024 年可再生能源满足了略高于 55% 的总用电量，比 2023 年高约 2 个百分点。这比 AGEE-Stat 后来的 54.4% 高约 1 个百分点。 — [www.bdew.de](https://www.bdew.de/presse/presseinformationen/erneuerbare-energien-erreichen-neuen-hoechstwert-gut-55-prozent-des-stromverbrauchs-in-2024-gedeckt/) _(partial: 引文支持2024年可再生能源满足略高于55%的用电量；比2023年高约2个百分点、BDEW/ZSW的来源，以及与54.4%的比较，引文都没有。)_
- ◐ BDEW/ZSW 估算 2024 年德国总用电量约为 512 TWh。 — [www.bdew.de](https://www.bdew.de/presse/presseinformationen/erneuerbare-energien-erreichen-neuen-hoechstwert-gut-55-prozent-des-stromverbrauchs-in-2024-gedeckt/) _(partial: 引文只有“略低于5120亿千瓦时”这个数字；没有说明它是2024年的总用电量，也没有说明出自BDEW/ZSW的估算。)_
- ◐ BDEW/ZSW 估算光伏占总用电量的比例从 2023 年的 12% 升至 2024 年的 14%。 — [www.pv-magazine.de](https://www.pv-magazine.de/2024/12/16/neuer-rekord-erneuerbare-decken-55-prozent-des-stromverbrauchs-2024-photovoltaik-erreicht-14-prozent/) _(partial: 引文支持光伏达到14%；2023年的12%在引文中没有出现。)_
- ◐ BDEW 的年度估算表中，2024 年陆上风电发电量为 115.0 TWh，光伏为 72.0 TWh，海上风电另列为 26.7 TWh。 — [www.bdew.de](https://www.bdew.de/media/documents/STRERZ_Tabelle_Jahressch%C3%A4tzung_2024.pdf) _(partial: 引文表格支持陆上风电115.0、光伏72.0（看起来是2024年那一列）；海上风电26.7 TWh在引文中没有出现。)_
- ◐ BDEW 说明，按总用电量计算绿电占比是通行的计算方法；如果按发电量计算，2024 年的占比会更高，约为“略高于 58%”。 — [www.bdew.de](https://www.bdew.de/presse/presseinformationen/erneuerbare-energien-erreichen-neuen-hoechstwert-gut-55-prozent-des-stromverbrauchs-in-2024-gedeckt/) _(partial: 引文支持BDEW认为按总用电量计算是通行方法；按发电量计算会更高、约略高于58%这一点，引文没有。)_
- ◐ 根据 AGEE-Stat，2024 年陆上和海上风电合计发电 138.9 TWh，在可再生电力中占比最大；风电和光伏合计占可再生电力的四分之三以上。 — [www.solarserver.de](https://www.solarserver.de/2025/03/10/erneuerbare-erreichen-544-prozent-am-bruttostromverbrauch-2024/) _(partial: 引文支持风电（陆上加海上）138.9 TWh、占绿电最大份额；风电和光伏合计超过四分之三这一点，引文没有。)_
- ◐ AGEE-Stat 2024 年 12 月的初步测算显示，2024 年光伏发电约 74 TWh（同比增长约 16%），约占可再生电量的 25.9%。 — [www.pv-magazine.de](https://www.pv-magazine.de/2024/12/12/photovoltaik-stromerzeugung-stieg-2024-um-16-prozent/) _(partial: 引文支持2024年光伏发电74 TWh；同比增长约16%和占比25.9%在引文中没有出现。)_
- ◐ 数据后来又被修订：UBA 在 2026 年 3 月发布的《Erneuerbare Energien in Deutschland 2025》中，2024 年的数值为陆上风电约 113.7 TWh、海上风电约 26.1 TWh、光伏约 75.9 TWh。 — [www.umweltbundesamt.de](https://www.umweltbundesamt.de/system/files/medien/479/publikationen/2026-03/UBA_Erneuerbare%20Energien%20in%20Deutschland%202025.pdf) _(partial: 引文中的三个数值与说法一致；但没有给出年份2024、发布时间2026年3月和报告名称。)_
- ◐ 联邦经济部（BMWE）的《Erneuerbare Energien in Zahlen 2024》给出的数值略有不同：2024 年可再生能源发电 285.9 TWh，其中陆上风电 112.8 TWh、海上风电 26.1 TWh、光伏 75.4 TWh。 — [www.bundeswirtschaftsministerium.de](https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Publikationen/Energie/erneuerbare-energien-in-zahlen-2024.pdf?__blob=publicationFile&v=6) _(partial: 引文中的数值（285.9、112.8、26.1、75.4 TWh）与说法完全一致；但引文缺少主语，没有说明出自BMWE的《Erneuerbare Energien in Zahlen 2024》。)_
- ◐ 联邦统计局（Destatis）的数据显示，2024 年可再生能源占德国国内发电量的 59.4%；其中风电占 31.5%（136.0 TWh），是最大电源；光伏上网电量为 59.5 TWh（约 14%）。 — [www.solarserver.de](https://www.solarserver.de/2025/03/12/stromerzeugung-deutschland-erneuerbare-stellen-594-prozent/) _(partial: 引文支持可再生能源占发电量59.4%；风电31.5%（136.0 TWh）以及光伏59.5 TWh等细节，引文没有。)_
- ◐ Fraunhofer ISE（Energy-Charts）的数据显示，2024 年可再生能源占德国公共电网净发电量的 62.7%，创历史纪录。 — [www.solarserver.de](https://www.solarserver.de/2025/01/02/oeffentliche-stromerzeugung-im-jahr-2024-627-prozent-oekostrom/) _(partial: 引文支持2024年公共电网发电中绿电占62.7%；“创历史纪录”这一点引文没有。)_
- ◐ 按 Fraunhofer ISE 的统计，2024 年风电发电 136.4 TWh，约占公共电网发电量的 33%（陆上 110.7 TWh，海上 25.7 TWh）。光伏发电 72.2 TWh，其中 59.8 TWh 送入公共电网，12.4 TWh 为自发自用，约占公共电网净发电量的 14%。 — [www.ise.fraunhofer.de](https://www.ise.fraunhofer.de/de/presse-und-medien/presseinformationen/2025/oeffentliche-stromerzeugung-2024-deutscher-strommix-so-sauber-wie-nie.html) _(partial: 引文只支持光伏上网59.8 TWh、自用12.4 TWh；风电136.4 TWh、约33%、陆上和海上的分项、光伏总量72.2 TWh以及约14%，引文都没有。)_

检索：“Umweltbundesamt erneuerbare Energien in Zahlen 2024 Anteil Bruttostromverbrauch 54”、“Anteil erneuerbare Energien Bruttostromverbrauch 2024 BDEW ZSW Wind Photovoltaik”、“Destatis Stromerzeugung 2024 erneuerbare Energien Anteil Windkraft Photovoltaik”、“AGEE-Stat 2024 Windenergie Photovoltaik Terawattstunden Anteil Bruttostromverbrauch 54,4 Prozent”、“Fraunhofer ISE öffentliche Nettostromerzeugung 2024 62,7 Prozent Windkraft Photovoltaik TWh”、“Umweltbundesamt 2024 Windenergie an Land auf See Photovoltaik TWh Stromerzeugung erneuerbare 284 Terawattstunden”

**未解决的问题：**

- 这次所有网页全文抓取（UBA、BDEW、Fraunhofer ISE、pv magazine 等）都被代理拒绝，引文都来自搜索结果摘要，没有逐字核对原文，建议直接查阅原始发布核实。
- 没有找到官方直接给出的“2024 年风电占总用电量百分比”。如果用 138.9 TWh 除以总用电量自行换算，结果取决于分母：BDEW 估算约 512 TWh，pv magazine 引用的 AGEE-Stat 数据约 528 TWh，两者口径不同，未能核实哪个是最终值。
- 不同机构、不同时间的数据版本有差异：光伏为 72.0 / 72.2 / 74 / 75.4 / 75.9 TWh，风电合计为 136.0 / 136.4 / 138.9 / 约 139.8 TWh。差异来自统计口径（总发电量、公共电网净发电量、上网电量）和后来的修订，所以引用时应注明数据源和版本日期。
- BDEW/ZSW（约 55%）和 AGEE-Stat（54.4%）之间约 1 个百分点的差距，检索到的资料没有给出明确解释，可能是初步估算和最终统计的不同。

## C. What do randomized controlled trials show about intermittent fasting or time-restricted eating versus daily calorie restriction for weight loss in adults?

**Intermittent fasting and time-restricted eating vs. daily calorie restriction for weight loss in adults: what the randomized trials show** — Most randomized trials and the largest syntheses find that intermittent fasting (IF) and time-restricted eating (TRE) lead to about the same weight loss as ordinary daily calorie restriction. A 2026 Cochrane review (22 RCTs) found little to no difference between IF and regular dietary advice, based on low-certainty evidence. A 2025 BMJ network meta-analysis (99 RCTs) found that every IF approach and continuous calorie restriction beat unrestricted eating. Only alternate-day fasting came out ahead of continuous restriction, by about 1.3 kg, which is below the authors' 2 kg threshold for a clinically important difference. Head-to-head trials mostly agree. Adding 8-hour TRE to calorie restriction gave no significant extra loss over 12 months (NEJM 2022). TRE without calorie counting matched 25% calorie restriction (Annals 2023). Alternate-day fasting was not better than daily restriction and had more dropouts (JAMA IM 2017). The main exception is a 2025 Annals trial, where 4:3 fasting with behavioral support produced about 2.9 kg more loss than daily restriction at 12 months. Commentators suggest this may reflect a larger drop in calorie intake. Limitation: every attempt to open a full page failed because the network proxy refused the connection. All quotes therefore come from text shown in search results, not from full articles, and could not be checked against the original papers.

- ◐ A Cochrane systematic review of intermittent fasting for adults with overweight or obesity was published in February 2026. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/41692034/) _(partial: The citation confirms a Cochrane review dated 16 Feb 2026, but the quote doesn't show its topic (intermittent fasting in overweight or obesity).)_
- ○ The review pooled 22 randomized trials with 1,995 adults. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/41692034/) _(supported: The quote states 22 randomized clinical trials involving 1,995 adults.)_
- ◐ Compared with regular dietary advice, intermittent fasting may make little to no difference in percentage weight loss from baseline (MD −0.33; 21 studies; low-certainty evidence). — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/41692034/) _(partial: The effect estimate, number of studies and low certainty all match, but the quote doesn't name the comparator (regular dietary advice).)_
- ◐ The review's authors recommend deciding case by case when advising patients about fasting. — [www.news-medical.net](https://www.news-medical.net/news/20260217/Does-intermittent-fasting-help-you-lose-more-weight-Evidence-review-finds-no-clear-advantage.aspx) _(partial: The fragment 'case-by-case approach' doesn't show that it is the authors' recommendation for advising patients about fasting.)_
- ◐ A 2025 BMJ network meta-analysis (Semnani-Azad et al.) pooled 99 randomized trials with 6,582 adults. — [eprints.gla.ac.uk](https://eprints.gla.ac.uk/362817) _(partial: Only the 6,582 adults is quoted; the 2025 BMJ source, the authors and the 99 trials are not.)_
- ○ Every intermittent fasting strategy and continuous energy restriction significantly reduced body weight compared with unrestricted (ad libitum) diets. — [pmc.ncbi.nlm.nih.gov](https://pmc.ncbi.nlm.nih.gov/articles/PMC12175170/) _(supported: The quote matches the claim directly.)_
- ○ Alternate-day fasting produced slightly more weight loss than continuous energy restriction, by about 1.29 kg (moderate certainty). — [eprints.gla.ac.uk](https://eprints.gla.ac.uk/362817) _(supported: The quote gives −1.29 kg with moderate certainty in favour of alternate-day fasting over continuous restriction.)_
- ○ These differences fell short of the authors' 2 kg threshold for a clinically important change. — [epocrates.com](https://epocrates.com/online/article/are-all-types-of-intermittent-fasting-created-equal) _(supported: The quote says the differences didn't reach the authors' 2 kg minimally important threshold.)_
- ○ Alternate-day fasting also beat time-restricted eating and whole-day fasting, but only by trivial amounts. — [www.healthday.com](https://www.healthday.com/healthpro-news/weight-loss/intermittent-fasting-reduces-body-weight-versus-ad-libitum-diet) _(supported: The quote gives trivial reductions of −1.69 and −1.05 kg compared with time-restricted eating and whole-day fasting.)_
- ◐ In trials lasting 24 weeks or more, weight-loss benefits appeared only when diets were compared with unrestricted eating, and the authors call for longer trials. — [pmc.ncbi.nlm.nih.gov](https://pmc.ncbi.nlm.nih.gov/articles/PMC12175170/) _(partial: The quote supports only the call for longer trials, not the finding about trials of 24 weeks or more.)_
- ◐ An accompanying BMJ commentary points out that many comparisons, especially those involving alternate-day fasting, were made against ad libitum diets rather than energy-restricted diets. — [www.bmj.com](https://www.bmj.com/node/1111119) _(partial: The quote supports what was said, but it doesn't show that the source is an accompanying BMJ commentary.)_
- ◐ Liu et al. randomized adults with obesity to 8-hour TRE plus calorie restriction or to calorie restriction alone for 12 months. Weight loss was 8.0 kg vs. 6.3 kg, and the difference was not statistically significant. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/35443107/) _(partial: The quote supports a non-significant net difference of 1.8 kg (p = 0.11), but not the 8.0 vs 6.3 kg figures, the 12-month length or the study design.)_
- ○ The authors concluded that TRE gave no added benefit over daily calorie restriction for body weight, body fat, or metabolic risk factors. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/35443107/) _(supported: The quote matches the conclusion directly.)_
- ◐ A critical commentary argues that the null conclusion mixes up statistical significance with clinical importance, noting that mean weight loss was about 27% higher with TRE. — [rebelem.com](https://rebelem.com/intermittent-fasting-and-please-dont-just-read-the-abstract/) _(partial: Only the 'about 27% higher' figure is quoted; the argument about mixing up statistical and clinical significance is not.)_
- ◐ Lin et al. ran a 12-month trial that compared noon-to-8 p.m. eating without calorie counting against 25% daily calorie restriction and a control group. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/37364268/) _(partial: The quote supports only the noon-to-8 p.m. arm without calorie counting, not the 12-month length, the 25% calorie-restriction arm or the control group.)_
- ◐ Compared with the control group, weight loss at 12 months was 4.61 kg with TRE and 5.42 kg with calorie restriction, and the difference between the two diets was not significant. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/37364268/) _(partial: The weight-loss figures are quoted, but the comparison with control and the non-significant difference between the diets are not.)_
- ○ Both groups cut energy intake by similar amounts. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/37364268/) _(supported: The reductions of −425 and −405 kcal/day are similar.)_
- ◐ The authors concluded that TRE worked better than control but no better than calorie restriction. They also noted the trial was not powered to detect relatively large differences. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/37364268/) _(partial: The quote supports the conclusion about control and calorie restriction, but not the point about the trial's statistical power.)_
- ◐ Trepanowski et al. found that, over one year, alternate-day fasting was not superior to daily calorie restriction for adherence, weight loss, weight maintenance, or cardioprotection. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/28459931/) _(partial: The quote supports non-superiority on all four outcomes but doesn't state the one-year length.)_
- ○ More people dropped out of the alternate-day fasting group than the daily restriction group. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/28459931/) _(supported: Dropout was 38% with alternate-day fasting vs 29% with daily restriction.)_
- ○ People in the alternate-day fasting group ate more than prescribed on fast days and less than prescribed on feast days. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/28459931/) _(supported: The quote matches the claim directly.)_
- ◐ By month 12, LDL cholesterol was significantly higher in the alternate-day fasting group than in the daily restriction group. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/28459931/) _(partial: The quote says LDL was significantly elevated in the alternate-day fasting group, but not that this was compared with the daily restriction group.)_
- ◐ Catenacci et al. randomized 165 adults to 4:3 fasting or daily calorie restriction, both with behavioral support. 125 participants completed the trial. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/40163873/) _(partial: 84 + 81 = 165 randomized and 125 completed are supported; the behavioral support is not in the quote.)_
- ◐ The fasting arm cut energy intake by 80% on three nonconsecutive days a week. The daily restriction arm cut daily intake by 34%. — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/40163873/) _(partial: The 80% cut on three days is supported; the daily restriction arm's 34% cut is not quoted.)_
- ◐ In the intention-to-treat analysis, 4:3 fasting produced greater weight reduction than daily restriction at 12 months, a difference of about 2.89 kg (P = 0.040). — [pubmed.ncbi.nlm.nih.gov](https://pubmed.ncbi.nlm.nih.gov/40163873/) _(partial: The quote supports greater weight loss at 12 months, but not the 2.89 kg difference, P = 0.040 or the intention-to-treat analysis.)_
- ◐ Press coverage suggests the larger loss in the fasting group may come from a greater drop in calorie intake. — [www.healthday.com](https://www.healthday.com/healthpro-news/weight-loss/weight-loss-greater-with-intermittent-fasting-than-calorie-restriction) _(partial: The quote mentions a greater reduction in calorie intake, but not that press coverage offers it as the likely cause of the larger weight loss.)_

检索：“NEJM 2022 Liu time-restricted eating calorie restriction obesity randomized trial”、“BMJ 2025 network meta-analysis intermittent fasting versus continuous energy restriction weight loss randomised trials”、“Cochrane review 2026 intermittent fasting weight loss adults overweight obesity”、“Annals of Internal Medicine 2025 4:3 intermittent fasting versus daily caloric restriction randomized trial weight loss 12 months”、“Trepanowski 2017 JAMA Internal Medicine alternate-day fasting vs daily calorie restriction randomized trial weight loss dropout”、“Lin 2023 Annals Internal Medicine time-restricted eating vs calorie restriction weight loss adults obesity type 2 diabetes randomized”、“Semnani-Azad "alternate day fasting" "continuous energy restriction" "mean difference -1.29 kg" moderate certainty time restricted eating whole day fasting”

**未解决的问题：**

- Full-text pages could not be opened (proxy refused every fetch), so all quotes come from search-result text and should be checked against the original abstracts before reuse.
- The Cochrane abstract's result for intermittent fasting vs. no intervention (MD −3.42) appears to conflict with how it is described ('little to no difference'). This could not be resolved without the full text.
- The BMJ 2025 network meta-analysis has a published correction (bmj.r1737). Its content was not checked.
- Few trials run longer than 12 months, so whether weight loss is maintained differently with IF/TRE vs. daily restriction remains uncertain.
- It is unclear whether the 4:3 trial's advantage reflects the fasting pattern itself or a larger calorie deficit, and whether it would replicate.
- Evidence on adherence and harms (for example dropout, LDL changes) is inconsistent across IF types and was not systematically compared here.
