import assert from 'node:assert/strict';
import test from 'node:test';

import { getOrderStatusLabel, getTrackingTimeline, getOrderHistoryData } from '../src/services/order-status.ts';

test('order status labels and tracking steps match the mobile flow', () => {
  assert.equal(getOrderStatusLabel('NEW'), 'Commande confirmée');
  assert.equal(getOrderStatusLabel('IN_PREPARATION'), 'En préparation');
  assert.equal(getOrderStatusLabel('SHIPPED'), 'Expédiée');
  assert.equal(getOrderStatusLabel('DELIVERED'), 'Livrée');
  assert.equal(getOrderStatusLabel('CANCELLED'), 'Annulée');

  const timeline = getTrackingTimeline('SHIPPED');
  assert.deepEqual(timeline.map(step => step.key), ['NEW', 'IN_PREPARATION', 'SHIPPED', 'DELIVERED']);
  assert.equal(timeline[2].state, 'current');
  assert.equal(timeline[3].state, 'upcoming');
});

test('history data exposes a realistic recent order list', () => {
  const orders = getOrderHistoryData();
  assert.ok(Array.isArray(orders));
  assert.ok(orders.length >= 2);
  assert.equal(orders[0].status, 'SHIPPED');
  assert.equal(orders[0].items.length >= 1, true);
  assert.ok(orders[0].invoiceUrl.startsWith('https://'));
});
