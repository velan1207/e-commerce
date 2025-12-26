const catchAsyncError = require('../middlewares/catchAsyncError');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
//Create New Order - api/v1/order/new
exports.newOrder =  catchAsyncError( async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo
    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user.id
    })

    res.status(200).json({
        success: true,
        order
    })
})

//Get Single Order - api/v1/order/:id
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if(!order) {
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})

//Get Loggedin User Orders - /api/v1/myorders
exports.myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({user: req.user.id});

    res.status(200).json({
        success: true,
        orders
    })
})

//Admin: Get All Orders - api/v1/orders
exports.orders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

//Admin: Update Order / Order Status - api/v1/order/:id
exports.updateOrder =  catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(order.orderStatus == 'Delivered') {
        return next(new ErrorHandler('Order has been already delivered!', 400))
    }

    const newStatus = req.body.orderStatus;

    //Updating the product stock of each order item when moving to shipped or delivered
    order.orderItems.forEach(async orderItem => {
        await updateStock(orderItem.product, orderItem.quantity)
    })

    // set timestamps appropriately
    if(newStatus === 'Shipped' && !order.shippedAt) {
        const now = Date.now();
        order.shippedAt = now;
        // set expected delivery to shipped + 2 days if not already set
        if(!order.deliveredAt) {
            order.deliveredAt = new Date(now + 2 * 24 * 60 * 60 * 1000);
        }
    }

    if(newStatus === 'Delivered' && !order.deliveredAt) {
        order.deliveredAt = Date.now();
    }

    order.orderStatus = newStatus;

    // Ensure chronology: deliveredAt should not be before shippedAt
    if(order.deliveredAt && order.shippedAt) {
        const sa = new Date(order.shippedAt).getTime();
        const da = new Date(order.deliveredAt).getTime();
        if(da < sa) {
            // move deliveredAt to be 1 hour after shippedAt
            order.deliveredAt = new Date(sa + 1 * 60 * 60 * 1000);
        }
    }

    await order.save();

    res.status(200).json({
        success: true
    })
    
});

async function updateStock (productId, quantity){
    const product = await Product.findById(productId);
    product.stock = product.stock - quantity;
    product.save({validateBeforeSave: false})
}

//Admin: Delete Order - api/v1/order/:id
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if(!order) {
        return next(new ErrorHandler(`Order not found with this id: ${req.params.id}`, 404))
    }

    await order.remove();
    res.status(200).json({
        success: true
    })
})

