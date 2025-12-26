import { Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import  Loader from '../layouts/Loader';
import {orderDetail as orderDetailAction } from '../../actions/orderActions';
export default function OrderDetail () {
    const { orderDetail, loading } = useSelector(state => state.orderState)
    const { shippingInfo={}, user={}, orderStatus="Processing", orderItems=[], totalPrice=0, paymentInfo={} } = orderDetail;
    const isPaid = paymentInfo && paymentInfo.status === "succeeded" ? true: false;
    const dispatch = useDispatch();
    const {id } = useParams();

    useEffect(() => {
        dispatch(orderDetailAction(id))
    },[id])

    return (
        <Fragment>
            {   loading ? <Loader/> :
                <Fragment>
                    <div className="row d-flex justify-content-between">
                        <div className="col-12 col-lg-8 mt-5 order-details">
    
                            <h1 className="my-5">Order #<h3>{orderDetail._id}</h3> </h1>
    
                            <h4 className="mb-4">Shipping Info</h4>
                            <p><b>Name:</b> {user.name}</p>
                            <p><b>Phone:</b> {shippingInfo.phoneNo}</p>
                            <p className="mb-4"><b>Address:</b>{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.postalCode}, {shippingInfo.state}, {shippingInfo.country}</p>
                            <p><b>Amount:</b> ${totalPrice}</p>
    
                            <hr />
    
                            <h4 className="my-4">Payment</h4>
                            <p className={isPaid ? 'greenColor' : 'redColor' } ><b>{isPaid ? 'PAID' : 'NOT PAID' }</b></p>
    
    
                            <h4 className="my-4">Order Status:</h4>
                            {/* Timeline: Processing -> Shipped -> Delivered with expected/actual dates */}
                            <div className="order-timeline mb-3">
                                {
                                    (() => {
                                        const processingDate = orderDetail.createdAt ? new Date(orderDetail.createdAt) : null;
                                        const paidAt = orderDetail.paidAt ? new Date(orderDetail.paidAt) : null;
                                        const shippedAt = orderDetail.shippedAt ? new Date(orderDetail.shippedAt) : null;
                                        const deliveredAt = orderDetail.deliveredAt ? new Date(orderDetail.deliveredAt) : null;
                                        const status = orderStatus || '';

                                        const shippedExpected = processingDate ? new Date(processingDate.getTime() + 1 * 24 * 60 * 60 * 1000) : null;
                                        const deliveredExpected = shippedExpected ? new Date(shippedExpected.getTime() + 1 * 24 * 60 * 60 * 1000) : null;

                                        const pad = n => n.toString().padStart(2, '0');
                                        const format = d => {
                                            if(!d) return '—';
                                            const day = pad(d.getDate());
                                            const month = pad(d.getMonth() + 1);
                                            const year = d.getFullYear();
                                            const hours = d.getHours() % 12 || 12;
                                            const minutes = pad(d.getMinutes());
                                            const seconds = pad(d.getSeconds());
                                            const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
                                            return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
                                        }

                                        const step = (label, dateLabel, isActive) => (
                                            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom: '8px'}}>
                                                <div style={{width:18,height:18,borderRadius:9,background:isActive? '#0d6efd':'#ddd',display:'inline-block'}}></div>
                                                <div>
                                                    <div style={{fontWeight: isActive?700:500}}>{label}</div>
                                                    <div style={{fontSize:12,color:'#555'}}>{dateLabel}</div>
                                                </div>
                                            </div>
                                        )

                                        return (
                                            <div>
                                                {step('Processing', processingDate ? format(processingDate) : '—', status === 'Processing' || status === 'Shipped' || status === 'Delivered')}
                                                    {step('Shipped', shippedAt ? format(shippedAt) : (shippedExpected ? format(shippedExpected) : '—'), status === 'Shipped' || status === 'Delivered')}
                                                    {step('Delivered', deliveredAt ? format(deliveredAt) : (deliveredExpected ? format(deliveredExpected) : '—'), status === 'Delivered')}
                                            </div>
                                        )
                                    })()
                                }
                            </div>
    
    
                            <h4 className="my-4">Order Items:</h4>
    
                            <hr />
                            <div className="cart-item my-1">
                                {orderItems && orderItems.map(item => (
                                    <div className="row my-5">
                                        <div className="col-4 col-lg-2">
                                            <img src={item.image} alt={item.name} height="45" width="65" />
                                        </div>

                                        <div className="col-5 col-lg-5">
                                            <Link to={`/product/${item.product}`}>{item.name}</Link>
                                        </div>


                                        <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                                            <p>${item.price}</p>
                                        </div>

                                        <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                                            <p>{item.quantity} Piece(s)</p>
                                        </div>
                                    </div>
                                ))}
                                    
                            </div>
                            <hr />
                        </div>
                    </div>
                </Fragment>
            }
        </Fragment>
    )
}