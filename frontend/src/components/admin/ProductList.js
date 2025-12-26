import { Fragment, useEffect } from "react"
import { Button } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { deleteProduct, getAdminProducts } from "../../actions/productActions"
import { adminOrders as adminOrdersAction } from '../../actions/orderActions'
import { clearError, clearProductDeleted } from "../../slices/productSlice"
import Loader from '../layouts/Loader';
import { MDBDataTable} from 'mdbreact';
import {toast } from 'react-toastify'
import Sidebar from "./Sidebar"

export default function ProductList() {
    const { products = [], loading = true, error }  = useSelector(state => state.productsState)
    const { isProductDeleted, error:productError }  = useSelector(state => state.productState)
    const { adminOrders = [] } = useSelector(state => state.orderState)
    const dispatch = useDispatch();

    const setProducts = () => {
        const data = {
            columns : [
                {
                    label: 'ID',
                    field: 'id',
                    sort: 'asc'
                },
                {
                    label: 'Name',
                    field: 'name',
                    sort: 'asc'
                },
                {
                    label: 'Price',
                    field: 'price',
                    sort: 'asc'
                },
                {
                    label: 'Stock',
                    field: 'stock',
                    sort: 'asc'
                },
                {
                    label: 'Pending',
                    field: 'pending',
                    sort: 'asc'
                },
                {
                    label: 'Shipped',
                    field: 'shipped',
                    sort: 'asc'
                },
                {
                    label: 'Completed',
                    field: 'completed',
                    sort: 'asc'
                },
                {
                    label: 'Actions',
                    field: 'actions',
                    sort: 'asc'
                }
            ],
            rows : []
        }

        products.forEach( product => {
            // compute order counts for this product from adminOrders
            const pendingCount = adminOrders.reduce((acc, order) => {
                if(order.orderStatus === 'Processing'){
                    const has = order.orderItems.some(item => item.product.toString() === product._id.toString())
                    return acc + (has ? 1 : 0)
                }
                return acc
            }, 0)

            const shippedCount = adminOrders.reduce((acc, order) => {
                if(order.orderStatus && order.orderStatus.toLowerCase().includes('ship')){
                    const has = order.orderItems.some(item => item.product.toString() === product._id.toString())
                    return acc + (has ? 1 : 0)
                }
                return acc
            }, 0)

            const completedCount = adminOrders.reduce((acc, order) => {
                if(order.orderStatus === 'Delivered'){
                    const has = order.orderItems.some(item => item.product.toString() === product._id.toString())
                    return acc + (has ? 1 : 0)
                }
                return acc
            }, 0)

            data.rows.push({
                id: product._id,
                name: product.name,
                price : `$${product.price}`,
                stock: product.stock,
                pending: pendingCount,
                shipped: shippedCount,
                completed: completedCount,
                actions: (
                    <Fragment>
                        <Link to={`/admin/product/${product._id}`} className="btn btn-primary"> <i className="fa fa-pencil"></i></Link>
                        <Button onClick={e => deleteHandler(e, product._id)} className="btn btn-danger py-1 px-2 ml-2">
                            <i className="fa fa-trash"></i>
                        </Button>
                    </Fragment>
                )
            })
        })

        return data;
    }

    const deleteHandler = (e, id) => {
        e.target.disabled = true;
        dispatch(deleteProduct(id))
    }

    useEffect(() => {
        if(error || productError) {
            toast(error || productError, {
                position: toast.POSITION.BOTTOM_CENTER,
                type: 'error',
                onOpen: ()=> { dispatch(clearError()) }
            })
            return
        }
        if(isProductDeleted) {
            toast('Product Deleted Succesfully!',{
                type: 'success',
                position: toast.POSITION.BOTTOM_CENTER,
                onOpen: () => dispatch(clearProductDeleted())
            })
            return;
        }

        dispatch(getAdminProducts())
    },[dispatch, error, isProductDeleted])


    return (
        <div className="row">
        <div className="col-12 col-md-2">
                <Sidebar/>
        </div>
        <div className="col-12 col-md-10">
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <Link to="/admin/dashboard" className="btn btn-secondary mr-3">Back</Link>
                    <h1 className="my-4 mb-0">Product List</h1>
                </div>
                <Link to="/admin/products/create" className="btn btn-primary my-4">Create Product</Link>
            </div>
            <Fragment>
                {loading ? <Loader/> : 
                    <div className="table-responsive">
                    <MDBDataTable
                        data={setProducts()}
                        bordered
                        striped
                        hover
                        className="px-3"
                    />
                    </div>
                }
            </Fragment>
        </div>
    </div>
    )
}