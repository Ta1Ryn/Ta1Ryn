import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const p = JSON.parse(await readFile(path.join(root, 'profile.json'), 'utf8'));
const { accent, text, background } = p.palette;
const assets = path.join(root, 'assets');
await mkdir(assets, { recursive: true });
await mkdir(path.join(root, '.preview'), { recursive: true });

const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const font = 'Arial, Helvetica, sans-serif';
const svg = (width, height, label, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}"><title>${esc(label)}</title>${content}</svg>\n`;
const save = (name, value) => writeFile(path.join(assets, name), value, 'utf8');

function monogram(x, y, size, outline = false) {
  const scale = size / 200;
  const mark = 'M24 170V26H62V46C76 32 92 24 111 24C151 24 176 47 176 88V170H138V92C138 71 126 59 107 59C80 59 62 78 62 102V170Z';
  return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="${mark}" ${outline ? `fill="none" stroke="${accent}" stroke-width="1.5"` : `fill="${accent}"`}/></g>`;
}

const banner = svg(1200, 380, `${p.name} — ${p.role}`, `
  <defs><pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="${text}" stroke-opacity=".035"/></pattern></defs>
  <rect width="1200" height="380" rx="22" fill="${background}"/>
  <path d="M790 0H1178Q1200 0 1200 22V358Q1200 380 1178 380H790Z" fill="url(#grid)"/>
  <rect x="58" y="49" width="13" height="13" rx="2" fill="${accent}"/>
  <text x="84" y="61" fill="${text}" font-family="${font}" font-size="14" font-weight="700" letter-spacing="2.8">CODE / BUILD / EXPERIMENT</text>
  <text x="52" y="199" fill="${text}" font-family="${font}" font-size="116" font-weight="800" letter-spacing="-7">${esc(p.name)}</text>
  <text x="60" y="248" fill="${accent}" font-family="${font}" font-size="29" font-weight="600" letter-spacing=".4">${esc(p.role)}</text>
  <text x="60" y="287" fill="${text}" fill-opacity=".68" font-family="${font}" font-size="21">Свои идеи. Свои проекты.</text>
  <path d="M60 334H1138" stroke="${text}" stroke-opacity=".13"/>
  <text x="60" y="359" fill="${text}" fill-opacity=".54" font-family="${font}" font-size="12" letter-spacing="1.8">@${esc(p.login)}</text>
  <text x="1138" y="359" text-anchor="end" fill="${accent}" font-family="${font}" font-size="12" letter-spacing="1.8">DEVELOPMENT + AI</text>
  <path d="M919 63L1110 63L1110 268L919 268Z" stroke="${accent}" stroke-opacity=".14" fill="none"/>
  <path d="M871 112H1062V316H871Z" stroke="${accent}" stroke-opacity=".08" fill="none"/>
  ${monogram(880, 67, 244)}
  <path d="M1132 56H1142M1137 51V61M854 285H864M859 280V290" stroke="${accent}" stroke-width="1.5"/>
`);
await save('banner.svg', banner);

await save('avatar.svg', svg(640, 640, `${p.name} — монограмма`, `
  <rect width="640" height="640" rx="140" fill="${background}"/>
  <rect x="26" y="26" width="588" height="588" rx="117" fill="none" stroke="${accent}" stroke-opacity=".18" stroke-width="2"/>
  ${monogram(98, 97, 470)}
  <rect x="493" y="503" width="22" height="22" rx="3" fill="${text}"/>
`));

function chip(label, width, { filled = false, arrow = false, small = false } = {}) {
  const height = small ? 34 : 48;
  const fg = filled ? background : text;
  return svg(width, height, label, `
    <rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${small ? 7 : 10}" fill="${filled ? accent : background}" stroke="${filled ? accent : '#343A32'}"/>
    ${small ? `<circle cx="14" cy="17" r="2.5" fill="${accent}"/>` : ''}
    <text x="${small ? 24 : 18}" y="${small ? 22 : 30}" fill="${fg}" font-family="${font}" font-size="${small ? 12 : 15}" font-weight="${filled ? 700 : 500}">${esc(label)}</text>
    ${arrow ? `<path d="M${width - 29} 29L${width - 19} 19M${width - 28} 19H${width - 19}V28" fill="none" stroke="${fg}" stroke-width="1.6"/>` : ''}
  `);
}

await save('telegram.svg', chip('Telegram', 160, { filled: true, arrow: true }));
await save('github.svg', chip('Проекты на GitHub', 216, { arrow: true }));
await save('discord.svg', chip(`Discord · ${p.discord}`, 224, { arrow: Boolean(p.discordId) }));
for (const [i, tool] of p.tools.entries()) {
  const width = 36 + Math.max(32, tool.length * 7.5);
  await save(`tool-${i}.svg`, chip(tool, width, { small: true }));
}

await save('footer.svg', svg(1200, 60, 'nonevly — собственные проекты и разработка с ИИ', `
  <rect width="1200" height="60" rx="10" fill="${background}"/>
  <path d="M16 8H1184" stroke="${accent}" stroke-opacity=".25"/>
  <rect x="16" y="7" width="104" height="2" fill="${accent}"/>
  <text x="16" y="39" fill="${text}" fill-opacity=".56" font-family="${font}" font-size="16" letter-spacing="1.8">${esc(p.name.toUpperCase())} / ALWAYS BUILDING</text>
  <text x="1184" y="39" text-anchor="end" fill="${accent}" font-family="${font}" font-size="16">→</text>
`));

const telegram = `https://t.me/${p.telegram}`;
const github = `https://github.com/${p.login}?tab=repositories`;
const discord = p.discordId ? `https://discord.com/users/${p.discordId}` : '';
const contactHtml = `
<p>
  <a href="${telegram}"><img src="./assets/telegram.svg" alt="Telegram: @${esc(p.telegram)}" width="160" height="48" /></a>
  ${discord ? `<a href="${discord}">` : ''}<img src="./assets/discord.svg" alt="Discord: ${esc(p.discord)}" width="224" height="48" />${discord ? '</a>' : ''}
  <a href="${github}"><img src="./assets/github.svg" alt="Проекты на GitHub" width="216" height="48" /></a>
</p>`;
const toolsHtml = `<p>\n${p.tools.map((tool, i) => `  <img src="./assets/tool-${i}.svg" alt="${esc(tool)}" height="34" />`).join('\n')}\n</p>`;
const projectsMarkdown = p.projects.map(project => `### ${project.name} · ${project.category}\n\n${project.description}\n\n${project.tools.map(tool => `\`${tool}\``).join(' · ')}`).join('\n\n');
const readme = `<img src="./assets/banner.svg" alt="${p.name} — ${p.role}" width="100%" />\n\n${contactHtml}\n\n## Привет, я ${p.name}.\n\n${p.bio}\n\n${p.intro}\n\n${p.projects.length ? '## Сейчас делаю\n\n' + projectsMarkdown + '\n\n' : ''}## Инструменты\n\n${toolsHtml}\n\n## Связаться\n\n[Telegram — @${p.telegram}](${telegram}) · ${discord ? `[Discord — ${p.discord}](${discord})` : `Discord — **${p.discord}**`}\n\n<img src="./assets/footer.svg" alt="${p.name} — свои проекты" width="100%" />\n`;
await writeFile(path.join(root, 'README.md'), readme, 'utf8');

const projectsPreview = p.projects.map((project, i) => `<section class="project"><div class="project-top"><span class="project-number">0${i + 1}</span><h3>${esc(project.name)}</h3><span class="project-kind">${esc(project.category)}</span></div><p>${esc(project.description)}</p><p class="tool-tags">${project.tools.map(tool => `<code>${esc(tool)}</code>`).join('<span>·</span>')}</p></section>`).join('');

const html = `<!doctype html>
<html lang="ru">
<head><meta charset="utf-8"><link rel="icon" href="assets/avatar.svg" type="image/svg+xml"><meta name="viewport" content="width=device-width,initial-scale=1"><title>nonevly — профиль GitHub</title>
<style>
*{box-sizing:border-box}html{color-scheme:dark}body{margin:0;background:#0d1117;color:#e6edf3;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--surface:#0d1117;--line:#30363d;--muted:#8b949e;--fg:#e6edf3;--soft:#161b22}a{color:inherit}button,select{font:inherit}button{cursor:pointer}body.light{color-scheme:light;background:#fff;color:#1f2328;--surface:#fff;--line:#d1d9e0;--muted:#59636e;--fg:#1f2328;--soft:#f6f8fa}.reviewbar{padding:17px 30px;display:flex;align-items:center;justify-content:space-between;gap:16px;background:${background};color:${text};border-bottom:1px solid #282f26}.reviewbrand{font-size:13px;letter-spacing:1.3px}.reviewbrand strong{color:${accent};font-size:17px;letter-spacing:-.5px;margin-right:15px}.review-controls{display:flex;align-items:center;gap:15px;font-size:12px}.review-controls label{color:#a5aea1}.review-controls select{color:${text};background:#161b15;border:1px solid #384032;border-radius:7px;padding:6px 10px}.theme-switch{display:flex;gap:4px}.theme-switch button{color:#b8c1b3;border:0;border-radius:5px;background:transparent;padding:5px 10px;font-size:12px}.theme-switch button[aria-pressed="true"]{background:${accent};color:${background};font-weight:600}.shell{max-width:1232px;padding:0 24px;margin:auto}.tabs{display:flex;gap:28px;padding-top:24px;border-bottom:1px solid var(--line);font-size:14px}.tabs span,.tabs a{padding:9px 2px 14px;text-decoration:none}.tabs .active{border-bottom:2px solid ${accent};font-weight:600}.layout{display:grid;grid-template-columns:250px minmax(0,1fr);gap:32px;padding:29px 0 50px}.sidebar{padding-top:4px}.avatar{width:100%;border-radius:50%;border:1px solid var(--line);display:block;background:${background}}.avatar-controls{display:flex;justify-content:center;gap:8px;margin:13px 0 20px}.avatar-controls button{border:1px solid var(--line);border-radius:6px;color:var(--muted);background:transparent;font-size:11px;padding:4px 9px}.avatar-controls button.active{color:var(--fg);background:var(--soft)}.sidebar h1{font-size:25px;line-height:1.25;margin:14px 0 0;font-weight:600;letter-spacing:-.6px}.username{font-size:19px;color:var(--muted);font-weight:300;margin:0 0 18px}.sidebar-role{display:inline-block;font-size:12px;font-weight:600;margin-bottom:9px;color:var(--fg)}.sidebar-bio{font-size:14px;line-height:1.65;margin:0 0 18px}.side-links{padding:15px 0;border-top:1px solid var(--line);display:grid;gap:7px;font-size:13px}.side-links a{text-decoration:none}.side-links a:hover{text-decoration:underline}.side-icon{color:var(--muted);display:inline-block;width:21px}.readme{border:1px solid var(--line);border-radius:7px;min-width:0;padding:24px 28px}.readme-title{font-size:12px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;margin:0 0 23px;color:var(--muted)}.readme-title strong{color:var(--fg);font-weight:500}.hero{width:100%;height:auto;display:block}.contacts{display:flex;flex-wrap:wrap;gap:7px;margin:15px 0 28px}.contacts img{display:block}.contacts a{transition:transform .16s}.contacts a:hover{transform:translateY(-2px)}.readme h2{font-size:23px;font-weight:600;letter-spacing:-.3px;margin:27px 0 15px;padding-bottom:9px;border-bottom:1px solid var(--line)}.readme p{font-size:14px;line-height:1.75;margin:10px 0}.project{padding:0 0 6px}.project-top{display:flex;gap:9px;align-items:center;margin-top:18px;flex-wrap:wrap}.project-number{font:11px ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--muted)}.project h3{font-size:16px;letter-spacing:-.2px;margin:0;font-weight:600}.project-kind{font-size:9px;letter-spacing:1.2px;border:1px solid var(--line);border-radius:5px;padding:1px 5px;color:var(--muted);margin-left:auto}.tool-tags{display:flex;align-items:center;gap:7px}.tool-tags code{font:11px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;background:var(--soft);border:1px solid var(--line);border-radius:5px;padding:1px 7px}.tool-tags span{color:var(--muted)}.tools{display:flex;flex-wrap:wrap;gap:5px;margin:12px 0}.footer{display:block;width:100%;margin-top:24px}.note{color:var(--muted);font-size:12px;margin:15px 0 0}.readme-link{color:var(--fg);text-decoration:none}.readme-link:hover{text-decoration:underline}.discord-copy{border:0;padding:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}.copied{color:${accent}}@media(max-width:900px){.layout{grid-template-columns:190px minmax(0,1fr);gap:22px}.readme{padding:20px}.review-controls label{display:none}.reviewbar{padding:14px 20px}.reviewbrand span{display:none}}@media(max-width:650px){.reviewbar{align-items:flex-start;gap:10px;flex-direction:column}.review-controls{width:100%;justify-content:space-between;gap:8px}.review-controls select{font-size:11px;max-width:180px}.shell{padding:0 16px}.tabs{padding-top:12px;gap:25px}.layout{display:block;padding-top:21px}.sidebar{display:grid;grid-template-columns:80px 1fr;gap:0 15px;margin-bottom:22px}.avatar{width:80px;grid-row:1/4}.avatar-controls{display:none}.sidebar h1{margin:4px 0 0;font-size:23px}.username{margin:0;font-size:16px}.sidebar-role{margin:5px 0 0;font-size:11px}.sidebar-bio{grid-column:1/3;margin:14px 0 0}.side-links{grid-column:1/3;padding:11px 0 0;margin-top:13px;display:flex;flex-wrap:wrap;gap:8px 18px}.readme{padding:15px}.readme-title{margin-bottom:15px;font-size:10px}.contacts{gap:5px;margin:12px 0 18px}.contacts img{height:35px;width:auto}.readme h2{font-size:21px;margin-top:23px}.readme p{font-size:13px}.project-kind{font-size:8px}.project h3{font-size:15px}.project-number{font-size:10px}.footer{margin-top:18px}}
</style></head>
<body>
<header class="reviewbar"><div class="reviewbrand"><strong>nonevly</strong><span>ПРОФИЛЬ / ПЕРВЫЙ ВАРИАНТ</span></div><div class="review-controls"><label for="role">Подпись</label><select id="role"><option>${esc(p.role)}</option><option>Developer · AI</option><option>Founder · Developer · AI</option></select><div class="theme-switch"><button aria-pressed="true" data-theme="dark">Тёмная</button><button aria-pressed="false" data-theme="light">Светлая</button></div></div></header>
<div class="shell"><nav class="tabs"><span class="active">Overview</span><a href="${github}">Repositories ↗</a></nav><div class="layout"><aside class="sidebar"><img class="avatar" id="avatar" src="${p.avatar === 'current' ? p.avatarUrl : 'assets/avatar.svg'}" alt="Аватарка nonevly"><div class="avatar-controls"><button class="${p.avatar === 'current' ? '' : 'active'}" data-avatar="new">Монограмма</button><button class="${p.avatar === 'current' ? 'active' : ''}" data-avatar="current">Текущая</button></div><h1>${esc(p.name)}</h1><p class="username">${esc(p.login)}</p><div class="sidebar-role" id="sidebar-role">${esc(p.role)}</div><p class="sidebar-bio">${esc(p.bio)}</p><div class="side-links"><a href="${telegram}"><span class="side-icon">↗</span>@${esc(p.telegram)}</a>${discord ? `<a href="${discord}"><span class="side-icon">◉</span>${esc(p.discord)}</a>` : `<button class="discord-copy" data-copy="${esc(p.discord)}"><span class="side-icon">◉</span>${esc(p.discord)}</button>`}</div></aside><main><article class="readme"><p class="readme-title"><strong>${esc(p.login)}</strong> / README.md</p><img class="hero" id="hero" src="assets/banner.svg" alt="${esc(p.name)} — ${esc(p.role)}"><div class="contacts"><a href="${telegram}"><img src="assets/telegram.svg" alt="Telegram @${esc(p.telegram)}" width="160" height="48"></a>${discord ? `<a href="${discord}">` : ''}<img src="assets/discord.svg" alt="Discord ${esc(p.discord)}" width="224" height="48">${discord ? '</a>' : ''}<a href="${github}"><img src="assets/github.svg" alt="Проекты на GitHub" width="216" height="48"></a></div><h2>Привет, я ${esc(p.name)}.</h2><p>${esc(p.bio)}</p><p>${esc(p.intro)}</p>${p.projects.length ? '<h2>Сейчас делаю</h2>' + projectsPreview : ''}<h2>Инструменты</h2><div class="tools">${p.tools.map((tool, i) => `<img src="assets/tool-${i}.svg" alt="${esc(tool)}" height="34">`).join('')}</div><h2>Связаться</h2><p><a class="readme-link" href="${telegram}">Telegram — @${esc(p.telegram)}</a> · ${discord ? `<a class="readme-link" href="${discord}">Discord — ${esc(p.discord)}</a>` : `Discord — <strong>${esc(p.discord)}</strong>`}</p><img class="footer" src="assets/footer.svg" alt="nonevly — свои проекты"><p class="note">Баннер, кнопки и аватарка используют твою палитру. Переключатель сверху показывает оформление в двух темах GitHub.</p></article></main></div></div>
<script>
const originalRole=${JSON.stringify(p.role)};let bannerSource='';fetch('assets/banner.svg').then(r=>r.text()).then(value=>bannerSource=value);
document.querySelector('#role').addEventListener('change',event=>{const role=event.target.value;document.querySelector('#sidebar-role').textContent=role;if(bannerSource){document.querySelector('#hero').src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(bannerSource.replaceAll(originalRole,role));}});
document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>{document.body.classList.toggle('light',button.dataset.theme==='light');document.querySelectorAll('[data-theme]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));}));
document.querySelectorAll('[data-avatar]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#avatar').src=button.dataset.avatar==='new'?'assets/avatar.svg':${JSON.stringify(p.avatarUrl)};document.querySelectorAll('[data-avatar]').forEach(item=>item.classList.toggle('active',item===button));}));
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{await navigator.clipboard.writeText(button.dataset.copy);button.classList.add('copied');button.innerHTML='<span class="side-icon">✓</span>Ник скопирован';setTimeout(()=>{button.classList.remove('copied');button.innerHTML='<span class="side-icon">◉</span>'+button.dataset.copy;},1600);}));
</script></body></html>`;
await writeFile(path.join(root, 'preview.html'), html, 'utf8');
console.log('Generated README, SVG assets and profile preview.');
