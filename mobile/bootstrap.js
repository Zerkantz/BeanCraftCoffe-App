// Install before the app so initialization failures reach the native error screen.
window.addEventListener('error', (event) => {
  window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'error', message: event.message }));
});
window.addEventListener('unhandledrejection', () => {
  window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'error', message: 'Error al ejecutar la interfaz.' }));
});
