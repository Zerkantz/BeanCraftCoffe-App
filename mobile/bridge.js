// Runs in the same closure as the original app, only in the Expo bundle.
// Navigation and native capabilities for the five client views.
const nativePost = (message) => {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
};
const viewHistory = [];
const originalNavigate = navigate;
let goingBack = false;

function publishNavigation() {
  nativePost({
    type: 'navigation',
    view: state.view,
    canGoBack: !!document.querySelector('dialog[open]') || viewHistory.length > 0 || state.view !== 'home'
  });
}

navigate = function (view) {
  if (!['home', 'menu', 'cart', 'orders', 'profile'].includes(view)) return;
  if (!goingBack && view !== state.view) {
    viewHistory.push({ view: state.view, scroll: window.scrollY });
    if (viewHistory.length > 50) viewHistory.shift();
  }
  originalNavigate(view);
  publishNavigation();
};

window.BeanCraftNative = {
  qrResult: receiveQr,
  back() {
    const dialogs = [...document.querySelectorAll('dialog[open]')];
    if (dialogs.length) dialogs.at(-1).close();
    else {
      const previous = viewHistory.pop();
      goingBack = true;
      navigate(previous?.view || 'home');
      goingBack = false;
      window.scrollTo(0, previous?.scroll || 0);
    }
    publishNavigation();
  },
  locationResult(result) {
    const request = locationRequests.get(result.id);
    if (!request) return;
    clearTimeout(request.timer);
    locationRequests.delete(result.id);
    if (result.error) request.error?.(result.error);
    else request.success(result.position);
  },
  reducedMotion(enabled) {
    document.getElementById('native-reduced-motion')?.remove();
    if (!enabled) return;
    const style = document.createElement('style');
    style.id = 'native-reduced-motion';
    style.textContent = '*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}';
    document.head.append(style);
  }
};

const observer = new MutationObserver(publishNavigation);
document.querySelectorAll('dialog').forEach((dialog) => {
  observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });
});

const locationRequests = new Map();
let nextLocationId = 0;
if (window.ReactNativeWebView) {
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
    getCurrentPosition(success, error) {
      const id = ++nextLocationId;
      const timer = setTimeout(() => {
        locationRequests.delete(id);
        error?.({ code: 3, message: 'Se agotó el tiempo para obtener tu ubicación.' });
      }, 20000);
      locationRequests.set(id, { success, error, timer });
      nativePost({ type: 'location', id });
    }
  } });
}

publishNavigation();
nativePost({ type: 'ready' });
