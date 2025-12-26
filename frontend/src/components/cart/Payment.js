import { useElements, useStripe } from "@stripe/react-stripe-js"
import { CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { useEffect, useState } from "react";
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom'
import { toast } from "react-toastify";
import { orderCompleted } from "../../slices/cartSlice";
import {validateShipping} from '../cart/Shipping';
import {createOrder} from '../../actions/orderActions'
import { clearError as clearOrderError } from "../../slices/orderSlice";

export default function Payment() {
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const orderInfo = JSON.parse(sessionStorage.getItem('orderInfo'))
    const { user } = useSelector(state => state.authState)
    const {items:cartItems, shippingInfo } = useSelector(state => state.cartState)
    const { error:orderError } = useSelector(state => state.orderState)
    const [useDummyPayment, setUseDummyPayment] = useState(false)

    const paymentData = {
        amount : Math.round( orderInfo.totalPrice * 100),
        shipping :{
            name: user.name,
            address:{
                city: shippingInfo.city,
                postal_code : shippingInfo.postalCode,
                country: shippingInfo.country,
                state: shippingInfo.state,
                line1 : shippingInfo.address
            },
            phone: shippingInfo.phoneNo
        }
    }

    const order = {
        orderItems: cartItems,
        shippingInfo
    }

    if(orderInfo) {
        order.itemsPrice = orderInfo.itemsPrice
        order.shippingPrice = orderInfo.shippingPrice
        order.taxPrice = orderInfo.taxPrice
        order.totalPrice = orderInfo.totalPrice
        
    }

    useEffect(() => {
        validateShipping(shippingInfo, navigate)
        if(orderError) {
            toast(orderError, {
                position: toast.POSITION.BOTTOM_CENTER,
                type: 'error',
                onOpen: ()=> { dispatch(clearOrderError()) }
            })
            return
        }

    },[])

    const submitHandler = async (e) => {
        e.preventDefault();
        document.querySelector('#pay_btn').disabled = true;
        try {
            if(useDummyPayment){
                // call dummy endpoint which returns a fake payment id and status
                const { data } = await axios.post('/api/v1/payment/dummy', paymentData)
                if(data && data.success){
                    toast('Payment Success (dummy)!', {
                        type: 'success',
                        position: toast.POSITION.BOTTOM_CENTER
                    })
                    order.paymentInfo = {
                        id: data.paymentId,
                        status: data.status
                    }
                    dispatch(orderCompleted())
                    dispatch(createOrder(order))
                    navigate('/order/success')
                }else{
                    toast('Dummy payment failed', { type: 'error', position: toast.POSITION.BOTTOM_CENTER })
                    document.querySelector('#pay_btn').disabled = false;
                }
            }else{
                const {data} = await axios.post('/api/v1/payment/process', paymentData)
                const clientSecret = data.client_secret
                const result = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: elements.getElement(CardNumberElement),
                        billing_details: {
                            name: user.name,
                            email: user.email
                        }
                    }
                })

                if(result.error){
                    toast(result.error.message, {
                        type: 'error',
                        position: toast.POSITION.BOTTOM_CENTER
                    })
                    document.querySelector('#pay_btn').disabled = false;
                }else{
                    if((await result).paymentIntent.status === 'succeeded') {
                        toast('Payment Success!', {
                            type: 'success',
                            position: toast.POSITION.BOTTOM_CENTER
                        })
                        order.paymentInfo = {
                            id: result.paymentIntent.id,
                            status: result.paymentIntent.status
                        }
                        dispatch(orderCompleted())
                        dispatch(createOrder(order))

                        navigate('/order/success')
                    }else{
                        toast('Please Try again!', {
                            type: 'warning',
                            position: toast.POSITION.BOTTOM_CENTER
                        })
                    }
                }
            }


        } catch (error) {
            
        }
    }


     return (
        <div className="row wrapper">
            <div className="col-10 col-lg-5">
                <form onSubmit={submitHandler} className="shadow-lg">
                    <h1 className="mb-4">Card Info</h1>
                    <div className="form-group">
                    <label htmlFor="card_num_field">Card Number</label>
                    <CardNumberElement
                        type="text"
                        id="card_num_field"
                        className="form-control"
                       
                    />
                    </div>
                    
                    <div className="form-group">
                    <label htmlFor="card_exp_field">Card Expiry</label>
                    <CardExpiryElement
                        type="text"
                        id="card_exp_field"
                        className="form-control"
                       
                    />
                    </div>
                    
                    <div className="form-group">
                    <label htmlFor="card_cvc_field">Card CVC</label>
                    <CardCvcElement
                        type="text"
                        id="card_cvc_field"
                        className="form-control"
                        value=""
                    />
                    </div>
        
                
                    <div className="form-group form-check mb-3">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="dummyPaymentCheck"
                            checked={useDummyPayment}
                            onChange={(e) => setUseDummyPayment(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="dummyPaymentCheck">Use dummy payment (no Stripe)</label>
                    </div>

                    <button
                    id="pay_btn"
                    type="submit"
                    className="btn btn-block py-3"
                    >
                    Pay - { ` $${orderInfo && orderInfo.totalPrice}` }
                    </button>
        
                </form>
            </div>
        </div>
    )
}