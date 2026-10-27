const fallback = document.querySelector('#boot-fallback');
const loadingSection = fallback.closest('section');
const caption = document.querySelector('#boot-caption');
document.querySelector('#reload-story').onclick = () => location.reload();
function showFallback(message) {
  if (!loadingSection.isConnected) document.querySelector('#app').replaceChildren(loadingSection);
  fallback.hidden = false;
  caption.textContent = message;
}
const timeout = setTimeout(() => {
  showFallback('網路較慢，故事仍在準備中。');
}, 8000);
try {
  await import('./app.js?v=16.0.0');
  document.documentElement.dataset.storyReady = 'true';
} catch (error) {
  console.error('Story could not start', error);
  showFallback('故事暫時沒有載入完整。');
} finally {
  clearTimeout(timeout);
}
