// Old shared story links now open this chapter in the city's map. Its saved progress uses the same origin.
if (window.top === window.self) {
  const url = new URL('../../', location.href);
  url.searchParams.set('start','life');
  url.searchParams.set('scene','shuixian-morning');
  url.searchParams.set('chapter','lantern');
  location.replace(url.href);
}
