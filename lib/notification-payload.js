const VIEWS = ['home','menu','cart','orders','profile'];
const MASCOTS = ['grano','taza','espuma','hielito','croissant'];
export function notificationPayload(message, id) {
  if (typeof message.title !== 'string' || typeof message.body !== 'string') return null;
  const title = message.title.trim().slice(0,80), body = message.body.trim().slice(0,240);
  if (!title || !body) return null;
  return { id, title, body, mascot:MASCOTS.includes(message.mascot)?message.mascot:'taza', view:VIEWS.includes(message.view)?message.view:'home' };
}
