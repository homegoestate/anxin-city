import { districtOfficeFor } from './offices.js';

// Jurisdictions: 臺南市政府地政局「轄區範圍」. Transit examples: 臺南市市民手冊「大臺南公車」.
const checked = '2026-11-19';
const officeDistricts = {
  臺南: ['北區', '中西區', '安平區'], 東南: ['東區', '南區'], 安南: ['安南區'],
  鹽水: ['鹽水區', '新營區', '柳營區'], 白河: ['後壁區', '白河區', '東山區'],
  麻豆: ['下營區', '麻豆區', '六甲區', '官田區', '大內區'],
  佳里: ['北門區', '學甲區', '將軍區', '佳里區', '西港區', '七股區'],
  新化: ['新化區', '新市區', '山上區', '安定區', '左鎮區', '善化區'],
  歸仁: ['仁德區', '歸仁區', '關廟區', '龍崎區'], 玉井: ['玉井區', '楠西區', '南化區'], 永康: ['永康區'],
};

// Named districts in the handbook's line descriptions. These are not stop sequences.
const corridors = [
  ['綠幹線', ['永康區', '新化區', '玉井區']],
  ['棕幹線', ['新營區', '鹽水區', '學甲區', '佳里區']],
  ['橘幹線', ['佳里區', '麻豆區', '善化區', '玉井區']],
  ['黃幹線', ['白河區', '新營區', '麻豆區']],
  ['紅幹線', ['仁德區', '關廟區']],
];

export function nextStopsFor(name) {
  return corridors.filter(([, places]) => places.includes(name)).flatMap(([line, places]) =>
    places.filter(place => place !== name).map(place => ({ name: place, line })));
}

export function servicesFor(name) {
  const office = Object.entries(officeDistricts).find(([, districts]) => districts.includes(name))?.[0];
  if (!office) return [];
  const lines = corridors.filter(([, places]) => places.includes(name)).map(([line]) => line);
  const services = [{
    title: `逛逛${name}公所公告`,
    body: '找里鄰消息、地方活動或洽公資訊，可以先看區公所的公告。',
    url: districtOfficeFor(name), source: `臺南市${name}公所`, checked,
  }, {
    title: `找${office}地政事務所`,
    body: `手上有${name}的土地或房屋資料？${office}地政事務所轄管這一區。可從市府轄區表進入該所，看服務項目與聯絡方式。`,
    url: 'https://land.tainan.gov.tw/cp.aspx?n=29661', source: '臺南市政府地政局', checked,
  }, {
    title: '查都市計畫與使用分區',
    body: '先備妥地段和地號，到都發局選查詢圖台或分區證明服務。都市計畫範圍內的個案，請核對現行公告書圖與分區證明。',
    url: 'https://udweb.tainan.gov.tw/News2.aspx?n=17767&sms=18259', source: '臺南市政府都市發展局', checked,
  }, {
    title: '查公車班次與轉乘',
    body: `打算到${name}走走，可以用站名查路線、回程班次和預估到站時間。`,
    url: 'https://2384.tainan.gov.tw/newtnbusweb/', source: '臺南市政府交通局', checked,
  }];
  if (lines.length) services.push({
    title: `${lines.join('、')}沿線地區`, body: '市民手冊列出幹線行經的主要地區，可以拿來安排下一段探索。',
    url: 'https://tnda.tainan.gov.tw/civilbook/page.asp?page=139', source: '臺南市市民手冊', checked,
  });
  return services;
}
