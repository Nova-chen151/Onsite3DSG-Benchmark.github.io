// Demonstration fixtures only. These are model-name and metric-shape references from AstraDrive,
// not official challenge results. Replace with organizer-approved, versioned scores before launch.
export const entries = [
    { id: 'DEMO-001', team: 'AstraDrive baseline', model: 'MagicDrive-V2', version: 'renderer', score: 78.42, qtes: 78.42, fvd: 71.20, clipIqa: 84.30, dinoT: 91.60, epi3: 79.40, tvc: 76.80, trs: 81.20, rpdms: 73.90, routeCompletion: 88.60, submittedAt: '2026-09-06 18:42', valid: true, date: '2026-09-06', rank: 1 },
    { id: 'DEMO-002', team: 'AstraDrive baseline', model: 'OpenDWM', version: 'renderer', score: 76.84, qtes: 76.84, fvd: 74.10, clipIqa: 82.90, dinoT: 90.70, epi3: 77.80, tvc: 75.40, trs: 79.60, rpdms: 72.80, routeCompletion: 87.40, submittedAt: '2026-09-06 15:16', valid: true, date: '2026-09-06', rank: 2 },
    { id: 'DEMO-003', team: 'AstraDrive baseline', model: 'Panacea', version: 'renderer', score: 74.63, qtes: 74.63, fvd: 76.80, clipIqa: 81.70, dinoT: 89.90, epi3: 76.10, tvc: 73.90, trs: 77.80, rpdms: 70.90, routeCompletion: 85.90, submittedAt: '2026-09-05 21:08', valid: true, date: '2026-09-05', rank: 3 },
    { id: 'DEMO-004', team: 'AstraDrive baseline', model: 'DreamForge', version: 'renderer', score: 72.95, qtes: 72.95, fvd: 79.40, clipIqa: 80.90, dinoT: 88.60, epi3: 74.80, tvc: 72.60, trs: 76.50, rpdms: 69.80, routeCompletion: 84.70, submittedAt: '2026-09-05 16:34', valid: true, date: '2026-09-05', rank: 4 },
    { id: 'DEMO-005', team: 'AstraDrive baseline', model: 'WorldDreamer', version: 'renderer', score: 70.77, qtes: 70.77, fvd: 82.70, clipIqa: 78.60, dinoT: 86.80, epi3: 72.30, tvc: 70.90, trs: 74.10, rpdms: 67.60, routeCompletion: 82.80, submittedAt: '2026-09-04 19:27', valid: true, date: '2026-09-04', rank: 5 },
    { id: 'DEMO-006', team: 'AstraDrive baseline', model: 'MagicDrive', version: 'renderer', score: 68.54, qtes: 68.54, fvd: 85.10, clipIqa: 77.40, dinoT: 85.50, epi3: 70.80, tvc: 69.50, trs: 72.90, rpdms: 65.40, routeCompletion: 81.60, submittedAt: '2026-09-04 13:52', valid: true, date: '2026-09-04', rank: 6 },
];
export function sortEntries(items, key, direction) {
    const sign = direction === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => sign * (key === 'team'
        ? `${a.team} ${a.model}`.localeCompare(`${b.team} ${b.model}`, 'zh-CN')
        : key === 'submittedAt'
            ? a.submittedAt.localeCompare(b.submittedAt)
            : a[key] - b[key]) || a.rank - b.rank);
}
export function certificateSvgForLocale(e, locale = 'zh') {
    let svg = certificateSvg(e);
    if (locale !== 'en') return svg;
    const replacements = [
        ['第四届 OnSite 自动驾驶算法挑战赛', 'OnSite Challenge 2027 · Autonomous Driving Algorithm Challenge'],
        ['电子成绩证明', 'Certificate of Achievement'],
        ['第五赛道 · 三维场景生成', 'AstraDrive · 3D Scenario Generation Benchmark'],
        ['测试有效性得分', 'Composite evaluation score'],
        ['演示榜单排名', 'Demo leaderboard rank'],
        ['成绩日期', 'Result date'],
        ['记录编号', 'Record ID'],
        ['演示证书 · 示例数据 · 不作为官方成绩或获奖凭证', 'Demo certificate · Example data · Not an official result or award credential'],
        ['排名与成绩以所列日期的榜单快照为准', 'Rank and score follow the leaderboard snapshot on the stated date'],
    ];
    for (const [from, to] of replacements) svg = svg.replaceAll(from, to);
    return svg;
}
export function csvFor(entry, locale = 'zh') {
    const english = locale === 'en';
    const csvLabels = english
        ? {
            nature: 'Demo score, not official',
            header: 'Type,Record ID,Team,Model,Version,Rank,QTES,FVD,CLIP-IQA+,DINO-T,Epi@3,TVC,TRS,RPDMS,Route Completion',
            unranked: 'Unranked',
        }
        : {
            nature: '演示成绩，非官方证明',
            header: '性质,记录编号,队伍,模型,版本,排名,QTES,FVD,CLIP-IQA+,DINO-T,Epi@3,TVC,TRS,RPDMS,路线完成度',
            unranked: '未入榜',
        };
    const values = [
        csvLabels.nature,
        entry.id,
        entry.team,
        entry.model,
        entry.version,
        entry.rank ?? csvLabels.unranked,
        entry.qtes,
        entry.fvd,
        entry.clipIqa,
        entry.dinoT,
        entry.epi3,
        entry.tvc,
        entry.trs,
        entry.rpdms,
        entry.routeCompletion,
    ];
    const cell = (v) => '"' +
        String(v)
            .replace(/^[=+@-]/, "'$&")
            .replaceAll('"', '""') +
        '"';
    return ('\uFEFF' +
        [
            csvLabels.header,
            values.map(cell).join(','),
        ].join('\r\n'));
}
export function certificateSvg(e, locale = 'zh') {
    if (!e.valid || e.rank === null)
        throw new Error(locale === 'en' ? 'This record cannot generate a certificate.' : '未通过门槛的成绩无法生成证书');
    const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
    })[c]);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1130" viewBox="0 0 1600 1130"><rect width="1600" height="1130" fill="#fff"/><rect x="30" y="30" width="1540" height="1070" fill="none" stroke="#2055dc" stroke-width="3"/><rect x="46" y="46" width="1508" height="1038" fill="none" stroke="#d9e3fa"/><rect x="30" y="30" width="1540" height="13" fill="#2055dc"/><g font-family="Arial,Microsoft YaHei,sans-serif" text-anchor="middle" fill="#172647"><svg x="693" y="66" width="214" height="103" viewBox="0 0 186.58 90" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="hidden"><defs></defs><g id="Layer_2"><g id="Layer_1-2"><path d="M99.78 36.33 92.07 40.42C91.81 40.55 91.65 40.61 91.53 40.54L91.53 40.54 95.65 47.3C95.5 47.02 95.32 46.74 95.17 46.46 95.02 46.18 94.97 46.06 95.71 45.67 98.96 43.93 102.23 42.23 105.48 40.48L105.48 33.19C103.58 34.28 101.69 35.31 99.78 36.33Z" fill="#C8CCE4"/><path d="M80.91 45.68C81.1 46.02 81.1 46.04 80.44 46.38 77.44 47.94 74.35 49.52 71.35 51.16L71.35 58.41C73.55 57.15 75.8 55.95 78.05 54.77L83.87 51.69C84.03 51.59 84.17 51.46 84.32 51.35L84.4 51.44C84.4471 51.4722 84.4878 51.5129 84.52 51.56L85.06 52.4 80.28 44.55C80.48 44.93 80.71 45.29 80.91 45.68Z" fill="#C8CCE4"/><path d="M186.58 30.9 186.58 22.91 156.62 22.91 156.62 64.86 186.58 64.86 186.58 56.56 166.61 56.56 166.61 47.4 185.57 47.4 185.57 39.51 166.61 39.51 166.61 30.9 186.58 30.9Z" fill="#14579E"/><path d="M18.09 24.7C12.29 24.7 7.82667 26.75 4.7 30.85 1.57333 34.95 0.00666667 40.06 0 46.18-0.158722 51.6799 1.46927 57.0832 4.64 61.58 7.73333 65.82 12.1033 67.94 17.75 67.94 23.6433 67.94 28.1267 65.85 31.2 61.67 34.2733 57.49 35.8067 52.3567 35.8 46.27 35.8832 40.9314 34.3265 35.6959 31.34 31.27 28.36 26.8967 23.9433 24.7067 18.09 24.7ZM18 59.92C12.8467 59.92 10.2733 55.38 10.28 46.3 10.2867 37.22 12.86 32.6933 18 32.72 22.9933 32.72 25.49 37.2567 25.49 46.33 25.49 55.4033 22.9933 59.9333 18 59.92Z" fill="#14579E"/><path d="M129.92 24.11C128.498 26.0489 126.902 27.8532 125.15 29.5 124.55 30.06 123.91 30.64 123.24 31.21L133.47 31.21 133.47 64.86 143.47 64.86 143.47 31.21 153.86 31.21 153.86 22.91 130.74 22.91C130.46 23.33 130.19 23.72 129.92 24.11Z" fill="#14579E"/><path d="M128.27 22.91C128.941 21.982 129.549 21.0098 130.09 20 130.937 18.4843 131.56 16.8541 131.94 15.16 132.126 14.3091 132.224 13.4411 132.23 12.57 132.23-2 116.32-0.12 112.78 0.32 104.46 1.32 87.71 7.46 78.55 23.01 76.9583 25.5914 76.0593 28.5397 75.94 31.57 75.8569 34.628 76.5447 37.6577 77.94 40.38 78.62 41.75 79.38 43.06 80.14 44.38L80.23 44.53 85.01 52.38 85.01 52.38C86.4197 54.4845 87.5492 56.7637 88.37 59.16 89.1022 61.3721 89.1683 63.7506 88.56 66 87.5004 69.3581 85.4551 72.3197 82.69 74.5 78.7288 77.8898 73.927 80.1491 68.79 81.04 62.99 82.1 58.79 81.39 56.6 78.68 55.2695 77.0208 54.9655 74.7619 55.81 72.81 56.4055 71.3037 57.2174 69.8922 58.22 68.62 58.58 68.16 58.95 67.71 59.35 67.28 60.0779 66.4751 60.8526 65.7138 61.67 65 63.3118 63.5809 65.0529 62.2809 66.88 61.11L67.61 60.63 67.71 60.57C68.9 59.81 70.12 59.08 71.35 58.37L71.35 25.35 61.52 25.35 61.52 45.87 49.68 25.35 39.08 25.35 39.08 67.3 46.57 67.3C47.2975 66.3272 48.0787 65.3958 48.91 64.51 48.91 60.23 48.91 52.01 48.91 47.07L48.91 43 58.24 59.1C57.37 59.72 56.52 60.36 55.7 61.02L55.36 61.29C51.4914 64.225 48.2565 67.9123 45.85 72.13 45.74 72.32 45.53 72.75 45.44 72.94L45.44 72.94C41.52 81.05 44.7 87.79 53.61 89.47 60.61 90.77 68.61 89.61 77.67 85.66 83.3633 83.2437 88.4995 79.6834 92.76 75.2 98.37 69.2 100.48 63.63 100.06 58.43 99.6917 55.45 98.7075 52.5792 97.17 50 96.7 49.14 96.17 48.29 95.7 47.44L95.61 47.29 91.49 40.5 91.49 40.5 90.76 39.32C90.29 38.57 89.85 37.8 89.42 37.02 83 25.33 106 10.85 115.84 11.46 116.542 11.4916 117.227 11.6868 117.84 12.03L118 12.12 118.18 12.25C118.54 12.5151 118.875 12.813 119.18 13.14 119.731 13.7268 120.141 14.4313 120.38 15.2 120.543 15.728 120.628 16.2773 120.63 16.83 120.563 18.5881 119.998 20.2909 119 21.74 118.73 22.14 118.46 22.54 118.17 22.91 117.272 24.0956 116.268 25.1969 115.17 26.2 114.76 26.6 114.33 26.98 113.9 27.35 112.9 28.22 111.8 29.03 110.67 29.83 110.32 30.07 109.98 30.31 109.67 30.54 108.29 31.46 106.877 32.3433 105.43 33.19L105.43 64.87 115.22 64.87 115.22 34.69C116.91 33.58 118.53 32.4 120.08 31.19L120.62 30.75 120.69 30.7C121.77 29.82 122.79 28.93 123.75 28.03 125.417 26.4721 126.931 24.7576 128.27 22.91Z" fill="#14579E"/></g></g></svg><text x="800" y="202" font-size="21" letter-spacing="3">第四届 OnSite 自动驾驶算法挑战赛</text><text x="800" y="338" font-size="60" font-weight="600" letter-spacing="12">电子成绩证明</text><text x="800" y="386" font-size="20" fill="#65738e" letter-spacing="5">CERTIFICATE OF ACHIEVEMENT · DEMO</text><text x="800" y="480" font-size="23" fill="#65738e">第五赛道 · 三维场景生成</text><text x="800" y="555" font-size="44" font-weight="600">${esc(e.team)}</text><text x="800" y="605" font-size="24">${esc(e.model)} ${esc(e.version)}</text><line x1="340" y1="654" x2="1260" y2="654" stroke="#dae2f1"/><text x="565" y="745" font-size="63" fill="#2055dc" font-weight="700">${e.score.toFixed(2)}</text><text x="1035" y="745" font-size="63" fill="#2055dc" font-weight="700">#${e.rank}</text><text x="565" y="795" font-size="22">测试有效性得分</text><text x="1035" y="795" font-size="22">演示榜单排名</text><text x="800" y="897" font-size="20" fill="#65738e">成绩日期 ${esc(e.date)}　 ·　 记录编号 ${esc(e.id)}</text><text x="800" y="951" font-size="22" fill="#996e18">演示证书 · 示例数据 · 不作为官方成绩或获奖凭证</text><text x="800" y="1014" font-size="16" fill="#65738e">排名与成绩以所列日期的榜单快照为准</text></g></svg>`;
}
