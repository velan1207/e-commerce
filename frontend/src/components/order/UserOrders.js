import { Fragment, useEffect, useState } from 'react'
import MetaData from '../layouts/MetaData';
import {MDBDataTable} from 'mdbreact'
import { useDispatch, useSelector } from 'react-redux';
import { userOrders as userOrdersAction } from '../../actions/orderActions';
import { Link } from 'react-router-dom';

export default function UserOrders () {
    const { userOrders = []} = useSelector(state => state.orderState)
    const dispatch = useDispatch();

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        dispatch(userOrdersAction())
    },[dispatch])

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    },[])

    const setOrders = () => {
        const data = {
            columns: [
                {
                    label: "Order ID",
                    field: 'id',
                    sort: "asc"
                },
                {
                    label: "Number of Items",
                    field: 'numOfItems',
                    sort: "asc"
                },
                {
                    label: "Amount",
                    field: 'amount',
                    sort: "asc"
                },
                {
                    label: "Status",
                    field: 'status',
                    sort: "asc"
                },
                {
                    label: "Actions",
                    field: 'actions',
                    sort: "asc"
                }
            ],
            rows:[]
        }

        userOrders.forEach(userOrder => {
            data.rows.push({
                id:  userOrder._id,
                numOfItems: userOrder.orderItems.length,
                amount: `$${userOrder.totalPrice}`,
                status: userOrder.orderStatus && userOrder.orderStatus.includes('Delivered') ?
                (<p style={{color: 'green'}}> {userOrder.orderStatus} </p>):
                (<p style={{color: 'red'}}> {userOrder.orderStatus} </p>),
                actions: <Link to={`/order/${userOrder._id}`} className="btn btn-primary" >
                    <i className='fa fa-eye'></i>
                </Link>
            })
        })


        return  data;
    }


    return (
        <Fragment>
            <MetaData title="My Orders" />
            <h1 className='mt-5'>My Orders</h1>

            {/* Desktop / table view (responsive wrapper) */}
            {!isMobile && (
                <div className="table-responsive">
                    <MDBDataTable
                        className='px-3'
                        bordered
                        striped
                        hover
                        responsive
                        data={setOrders()}
                    />
                </div>
            )}

            {/* Mobile friendly cards view */}
            {isMobile && (
                <div className="mobile-orders mt-4">
                    {userOrders && userOrders.length === 0 && <p>No orders found.</p>}
                    {userOrders && userOrders.map(order => (
                        <div className="card mb-3" key={order._id}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <h6 className="card-title">Order #{order._id}</h6>
                                    <Link to={`/order/${order._id}`} className="btn btn-sm btn-primary">View</Link>
                                </div>
                                <p className="mb-1"><strong>Items:</strong> {order.orderItems.length}</p>
                                <p className="mb-1"><strong>Amount:</strong> ${Number(order.totalPrice).toFixed(2)}</p>
                                <p className="mb-0"><strong>Status:</strong> <span className={order.orderStatus && order.orderStatus.includes('Delivered') ? 'text-success' : 'text-danger'}>{order.orderStatus}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Fragment>
    )
}