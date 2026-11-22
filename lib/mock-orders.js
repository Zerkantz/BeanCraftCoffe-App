// Servicio de prueba independiente de las acciones del cliente.
// Acelera también pedidos programados para demostrar el flujo en clase.
export function startMockUpdates(users, config, onChange) {
  if (!config.autoProgress) return null;
  return setInterval(() => {
    for (const user of users) {
      const order = user.order;
      if (!order || order.statusIdx === 3) continue;
      const target = Math.min(3, Math.floor((Date.now() - order.createdAt) / config.stageMs));
      if (target > order.statusIdx) {
        order.statusIdx++;
        onChange(user, order);
      }
    }
  }, 1000);
}
