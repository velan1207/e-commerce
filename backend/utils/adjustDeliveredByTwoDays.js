const mongoose = require('mongoose');
const Order = require('../models/orderModel');
require('dotenv').config({ path: 'backend/config/config.env' });

async function main() {
  try {
    const uri = process.env.DB_LOCAL_URI || process.env.DATABASE || process.env.DATABASE_URI;
    if (!uri) {
      console.error('No database URI found in env (DB_LOCAL_URI / DATABASE / DATABASE_URI).');
      process.exit(1);
    }

    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    const orderId = process.argv[2];
    let orders = [];

    if (orderId) {
      const o = await Order.findById(orderId);
      if (!o) {
        console.error('Order not found:', orderId);
        process.exit(1);
      }
      orders = [o];
    } else {
      // find orders where deliveredAt exists and shippedAt exists and deliveredAt < shippedAt
      orders = await Order.find({ shippedAt: { $exists: true }, deliveredAt: { $exists: true } });
    }

    let changed = 0;

    for (const order of orders) {
      if (!order.shippedAt) {
        console.log(`Order ${order._id} has no shippedAt; skipping.`);
        continue;
      }

      const sa = new Date(order.shippedAt);
      const newDelivered = new Date(sa.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days

      // If deliveredAt is missing or earlier than newDelivered, update
      if (!order.deliveredAt || new Date(order.deliveredAt).getTime() < newDelivered.getTime()) {
        const before = order.deliveredAt ? new Date(order.deliveredAt).toISOString() : 'NONE';
        order.deliveredAt = newDelivered;
        await order.save();
        console.log(`Updated order ${order._id}: deliveredAt ${before} -> ${order.deliveredAt.toISOString()}`);
        changed++;
      } else {
        console.log(`Order ${order._id} deliveredAt is already >= shippedAt+2d; skipping.`);
      }
    }

    console.log(`Done. Updated ${changed} orders.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
