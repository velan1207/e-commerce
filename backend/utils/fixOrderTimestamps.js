const mongoose = require('mongoose');
const Order = require('../models/orderModel');
require('dotenv').config({ path: 'backend/config/config.env' });

async function fixTimestamps() {
  try {
    await mongoose.connect(process.env.DB_LOCAL_URI || process.env.DATABASE || process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to DB');

    const orders = await Order.find();
    console.log(`Found ${orders.length} orders`);

    let changed = 0;

    for (const order of orders) {
      const created = order.createdAt ? new Date(order.createdAt) : new Date();
      const shippedAt = order.shippedAt ? new Date(order.shippedAt) : null;
      const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : null;

      const expectedShipped = new Date(created.getTime() +   24 * 60 * 60 * 1000); // +1 day
      const expectedDelivered = new Date(created.getTime() + 48 * 60 * 60 * 1000); // +2 days

      let updated = false;

      // If shippedAt missing but deliveredAt exists -> infer shippedAt
      if (!shippedAt && deliveredAt) {
        // prefer expectedShipped, but ensure it's <= deliveredAt; otherwise set shippedAt = deliveredAt - 1 hour
        let inferredShipped = expectedShipped;
        if (inferredShipped > deliveredAt) {
          inferredShipped = new Date(deliveredAt.getTime() - 1 * 60 * 60 * 1000);
        }
        order.shippedAt = inferredShipped;
        updated = true;
      }

      // If deliveredAt exists and shippedAt exists but deliveredAt < shippedAt -> move deliveredAt after shippedAt
      if (order.shippedAt && order.deliveredAt) {
        const sa = new Date(order.shippedAt);
        const da = new Date(order.deliveredAt);
        if (da.getTime() < sa.getTime()) {
          // set deliveredAt = shippedAt + 1 hour
          order.deliveredAt = new Date(sa.getTime() + 1 * 60 * 60 * 1000);
          updated = true;
        }
      }

      // If status is Delivered but deliveredAt missing -> set to shippedAt + 1h or expectedDelivered
      if (order.orderStatus === 'Delivered' && !order.deliveredAt) {
        if (order.shippedAt) {
          order.deliveredAt = new Date(new Date(order.shippedAt).getTime() + 1 * 60 * 60 * 1000);
        } else {
          order.deliveredAt = expectedDelivered;
        }
        updated = true;
      }

      // If status is Shipped but shippedAt missing -> set shippedAt = expectedShipped
      if (order.orderStatus === 'Shipped' && !order.shippedAt) {
        order.shippedAt = expectedShipped;
        updated = true;
      }

      if (updated) {
        await order.save();
        changed++;
        console.log(`Fixed order ${order._id}`);
      }
    }

    console.log(`Done. Updated ${changed} orders.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixTimestamps();
