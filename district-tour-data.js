import { tainanDistricts, tainanRegions } from './tainan-data.js';
import { districtWalks } from './district-stories.js?v=27.0.0';
import { lifeStops as featuredStops } from './life-places.js';
import { encounters as featuredEncounters } from './life-encounters.js?v=26.0.0';

export { featuredStops, districtWalks };
export const lifeStops = [...featuredStops, ...districtWalks];
export const districtName = stop => stop.name.length > 2 ? stop.name.replace(/區$/, '') : stop.name;
const ids = new Map(lifeStops.map(stop => [stop.districtId, stop]));
const regionOf = new Map(tainanDistricts.map(district => [district.id, district.region]));
export const tourRegions = tainanRegions.map(region => ({
  ...region,
  stops: tainanDistricts.filter(district => district.region === region.id).map(district => ids.get(district.id)).filter(Boolean)
}));

// The new stamps use Taiwanese place names as their central seal script.
const sealDesigns = {
  coast: { ink: '#235c63', paper: '#d6ebe0', line: 'M7 26q4-4 8 0t8 0t8 0t6 0' },
  city: { ink: '#8a4535', paper: '#f6dcc5', line: 'M7 26v-3l5-3 4 3 5-4 5 4 4-3 6 3v3' },
  plains: { ink: '#755329', paper: '#f6e5bb', line: 'M7 26q14-8 29 0m-19-3-5 4m12-4-6 5m12-4-5 4' },
  hills: { ink: '#3e6142', paper: '#dce9cd', line: 'm7 26 8-7 5 4 6-7 11 10' }
};
export const encounters = { ...featuredEncounters };
for (const stop of districtWalks) {
  const { ink, paper, line } = sealDesigns[regionOf.get(stop.districtId)];
  const name = districtName(stop);
  encounters[stop.id] = {
    title: stop.title, teaser: stop.hello, invite: '和' + stop.resident + '聊聊',
    stamp: stop.stamp, question: stop.question, choices: stop.choices, ink, paper,
    art: `<path d="M8 8q14-7 28 0m-26 24q12 6 24 0" stroke-width="1.3"/><path d="${line}" transform="translate(4 11) scale(.82 .65)" stroke-width="1.4"/><text x="22" y="21" text-anchor="middle" fill="${ink}" stroke="none" font-family="PMingLiU,serif" font-weight="bold" font-size="13">${name}</text>`
  };
}

// A north-up district map is also available when 3D rendering is unavailable.
export function drawWalkMap(canvas, shapes, stop) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const card = encounters[stop.id];
  canvas.width = 950;
  canvas.height = 580;
  canvas.dataset.illustrated = 'true';
  ctx.fillStyle = '#f8f2dc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(18, 7);
  ctx.scale(.94, .94);
  for (const shape of shapes) {
    const path = new Path2D(shape.path);
    ctx.fillStyle = shape.name === stop.name ? card.ink : '#d7dfc5';
    ctx.strokeStyle = '#fff9e8';
    ctx.lineWidth = 1.2;
    ctx.fill(path); ctx.stroke(path);
  }
  ctx.restore();
  ctx.fillStyle = card.ink;
  ctx.font = '600 24px "Microsoft JhengHei",sans-serif';
  ctx.fillText('臺南散步地圖', 577, 205);
  ctx.font = 'bold 65px "PMingLiU",serif';
  ctx.fillText(stop.name, 573, 290);
  ctx.fillRect(578, 317, 50, 3);
  ctx.font = '500 23px "Microsoft JhengHei",sans-serif';
  const chars = Array.from(stop.title);
  for (let i = 0; i < chars.length; i += 11) {
    ctx.fillText(chars.slice(i, i + 11).join(''), 577, 367 + 36 * (i / 11));
  }
  return true;
}
