// Servicio de prueba independiente de las acciones del cliente.
// Acelera también pedidos programados para demostrar el flujo en clase.
export function tickMockOrders(users, config, onChange, now = Date.now()) {
    for (const user of users) {
      const order = user.order;
      if (!order) continue;
      if (order.statusIdx === 3) continue;
      const target = Math.min(3, Math.floor((now - order.createdAt) / config.stageMs));
      if (target > order.statusIdx) {
        order.statusIdx++;
        if (order.statusIdx === 3) order.deliveredAt = now;
        onChange(user, order, 'updated');
      }
    }
}
export function startMockUpdates(users, config, onChange) {
  if (!config.autoProgress) return null;
  return setInterval(() => tickMockOrders(users, config, onChange), 250);
}
