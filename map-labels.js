const layouts = new WeakMap();
const bound = (value, min, max) => Math.min(max, Math.max(min, value));
const intersects = (a, b) => a.left < b.right + 3 && a.right > b.left - 3 && a.top < b.bottom + 3 && a.bottom > b.top - 3;
const distance = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

export function wireMapLabels(dialog, layer, pins) {
  const panel = document.createElement('section');
  panel.className = 'lt-map-neighbors';
  panel.id = 'lt-map-neighbors';
  panel.hidden = true;
  const heading = document.createElement('strong');
  heading.id = 'lt-map-neighbors-title';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'lt-neighbors-close';
  close.textContent = '×';
  close.setAttribute('aria-label', '關閉鄰近區名');
  const list = document.createElement('div');
  list.className = 'lt-neighbors-list';
  panel.setAttribute('aria-labelledby', heading.id);
  panel.append(heading, close, list);
  layer.append(panel);

  const state = {panel, pins, anchor: null, overlays: [...dialog.querySelectorAll('.lt-map-tools,.lt-play-tools,.lt-invite,.lt-map-caption')]};
  layouts.set(layer, state);
  function dismiss(restore = false) {
    const anchor = state.anchor;
    state.anchor = null;
    panel.hidden = true;
    if (anchor) anchor.more.setAttribute('aria-expanded', 'false');
    if (restore && anchor && !anchor.more.hidden) anchor.more.focus({preventScroll: true});
  }
  state.dismiss = dismiss;
  for (const [id, pin] of pins) {
    pin.name = pin.button.textContent.trim();
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'lt-pin-more';
    more.dataset.mapNeighbors = id;
    more.setAttribute('aria-controls', panel.id);
    more.setAttribute('aria-expanded', 'false');
    more.hidden = true;
    pin.button.after(more);
    pin.more = more;
    more.addEventListener('click', () => {
      if (state.anchor === pin) { dismiss(true); return; }
      dismiss();
      state.anchor = pin;
      heading.textContent = pin.name + '周邊';
      list.replaceChildren(...pin.neighbors.map(neighbor => {
        const option = document.createElement('button');
        option.type = 'button';
        option.textContent = pins.get(neighbor).name;
        option.dataset.mapChoice = neighbor;
        return option;
      }));
      more.after(panel);
      more.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      alignPanel(layer, state);
      list.firstElementChild?.focus({preventScroll: true});
    });
  }
  close.addEventListener('click', () => dismiss(true));
  list.addEventListener('click', event => {
    const id = event.target.closest('[data-map-choice]')?.dataset.mapChoice;
    if (!pins.has(id)) return;
    dismiss();
    pins.get(id).button.click();
  });
  dialog.addEventListener('keydown', event => {
    if (state.anchor && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      dismiss(true);
    }
  }, true);
  dialog.addEventListener('pointerdown', event => {
    if (state.anchor && !panel.contains(event.target) && event.target !== state.anchor.more) dismiss();
  }, true);
  dialog.addEventListener('focusin', event => {
    if (state.anchor && !panel.contains(event.target) && event.target !== state.anchor.more) dismiss();
  });
}

function alignPanel(layer, {panel, anchor}) {
  const width = layer.clientWidth, height = layer.clientHeight;
  const w = panel.offsetWidth, h = panel.offsetHeight;
  const rect = anchor.box;
  const x = bound(rect.right - w, 4, width - w - 4);
  const below = rect.bottom + 5;
  const y = below + h <= height - 4 ? below : bound(rect.top - h - 5, 4, height - h - 4);
  panel.style.transform = `translate(${x}px,${y}px)`;
}

// In a dense area, use the most widely separated names as map anchors. Keep
// the remaining districts with their nearest anchor as the camera moves.
function districtGroups(rows, touch, individual) {
  if (individual || !rows.length) return rows.map(head => ({head, members: []}));
  const rx = touch ? 67 : 41, ry = touch ? 48 : 28;
  const gap = (a, b) => ((a.x - b.x) / rx) ** 2 + ((a.y - b.y) / ry) ** 2;
  const heads = [];
  let next = rows.find(row => row.featured) || rows[0];
  const nearestGap = new Map(rows.map(row => [row, Infinity]));
  while (next) {
    const head = next;
    heads.push({head, members: []});
    next = null;
    let best = 0;
    for (const row of rows) {
      const score = Math.min(nearestGap.get(row), gap(row, head));
      nearestGap.set(row, score);
      const priority = score * (row.featured ? 1.15 : 1);
      if (score >= 1 && priority > best) { next = row; best = priority; }
    }
  }
  const headIds = new Set(heads.map(group => group.head.id));
  for (const row of rows) {
    if (headIds.has(row.id)) continue;
    const nearest = heads.reduce((a, b) => gap(row, a.head) <= gap(row, b.head) ? a : b);
    nearest.members.push(row.id);
  }
  return heads;
}

function placeBox(row, w, h, width, height, obstacles, icons) {
  const margin = 4;
  if (width < w + margin * 2 || height < h + margin * 2) return null;
  function box(cx, cy) {
    const left = Math.round(bound(cx - w / 2, margin, width - w - margin));
    const top = Math.round(bound(cy - h / 2, margin, height - h - margin));
    const rect = {left, top, right: left + w, bottom: top + h};
    return obstacles.some(other => intersects(rect, other)) ? null : rect;
  }
  // Start just above the model. Try both sides before reaching out into the
  // surrounding water, reserving complete touch targets and each walker's path.
  if (icons) { const exact = box(row.x, row.y); if (exact) return exact; }
  for (const radius of [h / 2 + 5, h + 9, h * 1.7, h * 2.5, h * 3.6]) {
    for (const [dx, dy] of [[0,-1],[-.82,-.58],[.82,-.58],[-1,0],[1,0],[0,1],[-.82,.58],[.82,.58]]) {
      const rect = box(row.x + dx * radius, row.y + dy * radius);
      if (rect) return rect;
    }
  }
  let best = null, score = Infinity;
  for (let y = margin + h / 2; y < height; y += h / 2) {
    for (let x = margin + w / 2; x < width; x += w / 2) {
      const d = distance(row, {x, y});
      if (d >= score) continue;
      const rect = box(x, y);
      if (rect) { best = rect; score = d; }
    }
  }
  return best;
}

function arrange(groups, width, height, obstacles, sizes, icons) {
  const placed = [];
  for (const group of groups) {
    const w = sizes.name + (group.members.length ? sizes.more : 0);
    const rect = placeBox(group.head, w, sizes.height, width, height, obstacles, icons);
    if (rect) {
      obstacles.push(rect);
      placed.push({...group, rect});
    } else {
      return {placed, failed: group};
    }
  }
  return {placed};
}

// A phone has room to either side of the island but little vertical separation
// between districts. Keep each name in the same geographic band as its pin.
function arrangeNarrow(groups, width, height, obstacles, sizes) {
  const choices = groups.map(group => {
    const n = sizes.name, h = sizes.height, extra = group.members.length ? sizes.more : 0;
    const w = n + extra;
    const candidates = new Map();
    for (const flip of extra ? [false, true] : [false]) {
      const nameOffset = n / 2 + (flip ? extra : 0);
      for (const dy of [0,-9,9,-18,18,-27,27]) {
        for (let dx = -84; dx <= 84; dx += 12) {
          const left = Math.round(bound(group.head.x + dx - nameOffset, 4, width - w - 4));
          const top = Math.round(bound(group.head.y + dy - h / 2, 4, height - h - 4));
          const x = left + nameOffset - group.head.x, y = top + h / 2 - group.head.y;
          if (Math.abs(y) > 28 || Math.abs(x) > 85) continue;
          const rect = {left, top, right: left + w, bottom: top + h, flip};
          if (obstacles.some(other => intersects(rect, other))) continue;
          // Prefer a short horizontal leader to moving a name north or south.
          // Also leave the miniature visible whenever a nearby position allows.
          const coversModel = Math.abs(x) < n / 2 + 2 && Math.abs(y) < 17;
          const score = x*x + 4*(y+3)**2 + (coversModel ? 1500 : 0) + Number(flip);
          const key = left + ',' + top;
          if (!candidates.has(key) || score < candidates.get(key).score) candidates.set(key, {rect, score});
        }
      }
    }
    return {group, options: [...candidates.values()].sort((a,b) => a.score - b.score)};
  });
  let attempts = 0;
  let blocked = null;
  function fit(remaining, placed) {
    if (!remaining.length) return placed;
    // Start with the district that has the fewest free positions beside it.
    const available = remaining.map(item => ({
      group: item.group,
      options: item.options.filter(({rect}) => placed.every(other => !intersects(rect, other.rect)))
    })).sort((a,b) => a.options.length - b.options.length);
    const [first, ...rest] = available;
    if (!first.options.length || attempts++ > 220) { blocked = first.group; return null; }
    for (const {rect} of first.options) {
      const found = fit(rest, [...placed, {...first.group, rect}]);
      if (found) return found;
      if (attempts > 220) break;
    }
    return null;
  }
  const placed = fit(choices, []);
  return placed ? {placed} : {placed: [], failed: blocked};
}

export function projectLabels(layer, pins, rows, choice, keepClear = []) {
  const width = layer.clientWidth, height = layer.clientHeight;
  const state = layouts.get(layer);
  if (!width || !height || !state) return;
  const icons = choice === 'landmarks';
  const touch = width < 600 || matchMedia('(pointer: coarse)').matches;
  const sizes = icons ? {name: 24, more: 31, height: 24} : {
    name: touch ? 48 : 51, more: touch ? 44 : 31, height: touch ? 44 : 32
  };
  const visible = rows.filter(({id, x, y, visible}) => {
    const pin = pins.get(id);
    return pin && visible && Number.isFinite(x) && Number.isFinite(y) &&
      (!choice || icons || pin.button.dataset.region === choice);
  }).map(row => ({...row, featured: pins.get(row.id).button.dataset.featured === 'true'}));
  const stage = layer.getBoundingClientRect();
  const obstacles = [...keepClear];
  for (const item of state.overlays) {
    const r = item.getBoundingClientRect();
    if (r.width && r.height) obstacles.push({left: r.left - stage.left, top: r.top - stage.top, right: r.right - stage.left, bottom: r.bottom - stage.top});
  }
  const groups = districtGroups(visible, touch, Boolean(choice));
  const layout = () => touch && !choice
    ? arrangeNarrow(groups, width, height, obstacles, sizes)
    : arrange(groups, width, height, [...obstacles], sizes, icons);
  let result = layout();
  // On very short embedded maps a second group may physically not fit. Fold
  // its choices into the nearest existing one, then lay out the larger badge.
  while (result.failed && groups.length > 1) {
    const missing = result.failed;
    groups.splice(groups.indexOf(missing), 1);
    const near = groups.reduce((a, b) => distance(missing.head, a.head) <= distance(missing.head, b.head) ? a : b);
    near.members.push(missing.head.id, ...missing.members);
    result = layout();
  }
  if (result.failed) result = arrange(groups, width, height, [...obstacles], sizes, icons);
  const shown = new Set();
  for (const {head, members, rect} of result.placed) {
    shown.add(head.id);
    const pin = pins.get(head.id), button = pin.button, more = pin.more;
    const grouped = members.length > 0;
    const nameLeft = rect.left + (rect.flip ? sizes.more : 0);
    const neighbors = members.join(' ');
    if (pin.neighbors?.join(' ') !== neighbors && state.anchor === pin) state.dismiss(true);
    pin.neighbors = members;
    pin.box = rect;
    button.hidden = false;
    button.dataset.compact = String(icons);
    button.dataset.grouped = String(grouped);
    button.dataset.moreSide = rect.flip ? 'left' : 'right';
    button.style.width = sizes.name + 'px';
    button.style.height = sizes.height + 'px';
    button.style.transform = `translate(${nameLeft}px,${rect.top}px)`;
    more.hidden = !grouped;
    if (grouped) {
      more.textContent = '+' + members.length;
      more.setAttribute('aria-label', pin.name + '附近另有' + members.length + '區，展開區名');
      more.style.width = sizes.more + 'px';
      more.style.height = sizes.height + 'px';
      more.dataset.side = button.dataset.moreSide;
      more.style.transform = `translate(${rect.flip ? rect.left : rect.left + sizes.name}px,${rect.top}px)`;
    }
    const cx = nameLeft + sizes.name / 2, cy = rect.top + sizes.height / 2;
    const length = Math.hypot(cx - head.x, cy - head.y);
    pin.line.hidden = icons && length < 12;
    if (!pin.line.hidden) {
      pin.line.style.width = length + 'px';
      pin.line.style.transform = `translate(${head.x}px,${head.y}px) rotate(${Math.atan2(cy - head.y, cx - head.x)}rad)`;
    }
  }
  for (const [id, pin] of pins) {
    if (!shown.has(id)) pin.button.hidden = pin.line.hidden = pin.more.hidden = true;
  }
  if (state.anchor) {
    if (state.anchor.more.hidden) state.dismiss();
    else alignPanel(layer, state);
  }
}
