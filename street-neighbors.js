import {lifeStops} from './district-tour-data.js?v=27.0.0';

// A closed sightseeing circuit through all 37 districts, plus connections between
// adjacent stops. These represent choices on the game map, not hiking directions.
// Every pair shares a boundary in the north-up geometry used by the atlas.
const circuit = [
  'qigu','jiangjun','beimen','xuejia','yanshui','houbi','baihe','dongshan',
  'xinying','liuying','xiaying','liujia','guantian','danei','nanxi','nanhua',
  'yujing','zuozhen','longqi','guanmiao','guiren','rende','south','anping',
  'west-central','east','north','yongkang','xinhua','shanshang','shanhua',
  'xinshi','anding','annan','xigang','madou','jiali'
];
const shortcuts = [
  ['jiangjun','jiali'],['qigu','annan'],['xuejia','madou'],['yanshui','xinying'],
  ['houbi','dongshan'],['liuying','liujia'],['xiaying','guantian'],['danei','shanshang'],
  ['nanxi','yujing'],['nanhua','zuozhen'],['longqi','xinhua'],['guiren','yongkang'],
  ['rende','east'],['south','west-central'],['shanhua','anding']
];
const byDistrict=new Map(lifeStops.map(stop=>[stop.districtId,stop]));
const links=new Map(lifeStops.map(stop=>[stop.id,[]]));
function connect(a,b) {
  const left=byDistrict.get(a),right=byDistrict.get(b);
  links.get(left.id).push(right);
  links.get(right.id).push(left);
}
circuit.forEach((id,i)=>connect(id,circuit[(i+1)%circuit.length]));
shortcuts.forEach(([a,b])=>connect(a,b));
export function neighborsFor(stopId){return links.get(stopId)||[];}
