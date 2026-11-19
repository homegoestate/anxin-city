// Decide before the first paint so a shared district or mission opens directly.
(() => {
  const params = new URLSearchParams(location.search);
  const routes = ['view', 'scene', 'chapter', 'guideMonth', 'guideArea', 'district', 'mission', 'place', 'resident', 'month', 'arrive'];
  const start = params.get('start');
  const play = (start && start !== 'welcome') || location.hash || routes.some(key => params.has(key));
  document.documentElement.dataset.cityEntry = play ? 'play' : 'cover';
  if (play) {
    document.head.append(document.getElementById('arrival-play-styles').content.cloneNode(true));
  }
})();
