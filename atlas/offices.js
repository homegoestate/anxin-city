// 臺南市政府組織圖及各區公所首頁。查核日期 2026-11-19。
// https://www.tainan.gov.tw/cp.aspx?n=13297
const districtOffices = new Map([
  ["七股區", "https://cigu.tainan.gov.tw/"],
  ["下營區", "https://web.tainan.gov.tw/Xiaying/"],
  ["大內區", "https://daneidanei.tainan.gov.tw/"],
  ["山上區", "https://shanshang.tainan.gov.tw/"],
  ["中西區", "https://web.tainan.gov.tw/tnwcdo/"],
  ["仁德區", "https://web.tainan.gov.tw/tnrende/"],
  ["六甲區", "https://lioujia.tainan.gov.tw/"],
  ["北門區", "https://beimen.tainan.gov.tw/"],
  ["北區", "https://www.tnnorth.gov.tw/"],
  ["左鎮區", "https://web.tainan.gov.tw/ZuojhenDistrict/"],
  ["永康區", "https://www.yongkangcity.gov.tw/"],
  ["玉井區", "https://www.yujing.gov.tw/"],
  ["白河區", "https://baihe.tainan.gov.tw/"],
  ["安平區", "https://web.tainan.gov.tw/tnanping/"],
  ["安定區", "https://web.tainan.gov.tw/anding/"],
  ["安南區", "https://www.annan.gov.tw/"],
  ["西港區", "https://sigang.tainan.gov.tw/"],
  ["佳里區", "https://jiali722.tainan.gov.tw/"],
  ["官田區", "https://guantian132.tainan.gov.tw/"],
  ["東山區", "https://dongshan.tainan.gov.tw/"],
  ["東區", "https://www.tneast.gov.tw/"],
  ["南化區", "https://nanhuadistrict.tainan.gov.tw/"],
  ["南區", "https://tnsouth.tainan.gov.tw/"],
  ["後壁區", "https://web.tainan.gov.tw/houbi/"],
  ["柳營區", "https://liouying.tainan.gov.tw/"],
  ["將軍區", "https://jiangjun.tainan.gov.tw/"],
  ["麻豆區", "https://madou.tainan.gov.tw/"],
  ["善化區", "https://www.shanhua.gov.tw/"],
  ["新化區", "https://web.tainan.gov.tw/sinhua/"],
  ["新市區", "https://www.sinshih.gov.tw/"],
  ["新營區", "https://xinying.tainan.gov.tw/"],
  ["楠西區", "https://nansi.tainan.gov.tw/"],
  ["學甲區", "https://syuejia.tainan.gov.tw/"],
  ["龍崎區", "https://longci.tainan.gov.tw/"],
  ["歸仁區", "https://gueiren.tainan.gov.tw/"],
  ["關廟區", "https://guanmiao.tainan.gov.tw/"],
  ["鹽水區", "https://web.tainan.gov.tw/ysdo/"]
]);

export function districtOfficeFor(name) {
  return districtOffices.get(name) ?? null;
}
