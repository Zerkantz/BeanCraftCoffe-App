import { FOOTER_QUOTES } from '../data/experience.js';

export function buildPhoneNotificationContent(notice) {
  const signature = FOOTER_QUOTES.find(item => item.id === notice.mascot) || FOOTER_QUOTES[0];
  const mascotName = signature.id.charAt(0).toUpperCase() + signature.id.slice(1);
  return {
    title: `BeanCraft · ${notice.title}`,
    subtitle: `${mascotName} · ${signature.quote.replace(/^Y recuerda… /, '')}`,
    body: notice.body,
    color: '#0B5C63',
    sound: 'default',
    data: { beancraft: true, view: notice.view, mascot: signature.id },
    threadIdentifier: 'beancraft'
  };
}
