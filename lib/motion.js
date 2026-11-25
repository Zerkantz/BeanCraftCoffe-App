let nativeReducedMotion = false;
const activeMotion = new Set();
let screenMotion;

function motionAllowed() {
  return !nativeReducedMotion && !matchMedia('(prefers-reduced-motion: reduce)').matches && !document.hidden;
}

function playMotion(target, options) {
  if (!target || !window.anime || !motionAllowed()) return;
  const animation = window.anime.animate(target, {
    ...options,
    onComplete: instance => { activeMotion.delete(instance); instance.revert(); }
  });
  activeMotion.add(animation);
  return animation;
}

export function setMotionPreference(reduced) {
  nativeReducedMotion = reduced;
  document.documentElement.dataset.reducedMotion = String(reduced);
  if (reduced) {
    activeMotion.forEach(animation => animation.revert());
    activeMotion.clear();
  }
}

export function animateScreen(view) {
  if (screenMotion) { screenMotion.revert(); activeMotion.delete(screenMotion); }
  screenMotion = playMotion(view, { opacity:[.6,1], duration:220, ease:'outQuad' });
}

export function animateHeroLabel() {
  playMotion(document.querySelector('#heroTitle'), { opacity:[.35,1], duration:220, ease:'outQuad' });
}

export function initMotion() {
  const targets = new Set();
  const visibility = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-in-view', entry.isIntersecting));
  }, { threshold:.1 });
  const scan = () => {
    targets.forEach(node => { if (!node.isConnected) { visibility.unobserve(node); targets.delete(node); } });
    document.querySelectorAll('.mascota-wrap, .pixel-cluster').forEach(node => {
      if (!targets.has(node)) { targets.add(node); visibility.observe(node); }
    });
  };
  let queued = false;
  const mutations = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'attributes' && record.target.matches('dialog[open]')) {
        playMotion(record.target.querySelector('.dialog-sheet'), { opacity:[.65,1], duration:220, ease:'outQuad' });
        playMotion(record.target.querySelector('.cust-product-art > img'), { translateY:[10,0], scale:[.96,1], duration:420, ease:'outCubic' });
      }
    });
    if (!queued) { queued = true; requestAnimationFrame(() => { queued=false; scan(); }); }
  });
  mutations.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:['open'] });
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change', () => {
    if (preference.matches) { activeMotion.forEach(animation => animation.revert()); activeMotion.clear(); }
  });
  document.addEventListener('visibilitychange', () => {
    document.body.dataset.motionPaused = String(document.hidden);
    if (document.hidden) { activeMotion.forEach(animation => animation.revert()); activeMotion.clear(); }
  });
  scan();
}
