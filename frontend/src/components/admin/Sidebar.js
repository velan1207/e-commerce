import { Link, useNavigate } from 'react-router-dom';
import { NavDropdown } from 'react-bootstrap';
import { useState } from 'react';

export default function Sidebar () {

    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const close = () => setOpen(false);

    return (
        <div className="sidebar-wrapper">
            {/* overlay shown on mobile when sidebar open */}
            <div className={`sidebar-overlay ${open ? 'active' : ''}`} onClick={close} />

            <button className="sidebar-toggle" onClick={() => setOpen(true)} aria-label="Open menu">
                <i className="fa fa-bars"></i>
            </button>

            <nav id="sidebar" className={open ? 'mobile-open' : ''}>
                <div className="sidebar-close-wrapper d-md-none">
                    <button className="sidebar-close" onClick={close} aria-label="Close menu"><i className="fa fa-times"></i></button>
                </div>
                <ul className="list-unstyled components">
                <li onClick={close}>
                    <Link to="/admin/dashboard"><i className="fas fa-tachometer-alt"></i> Dashboard</Link>
                </li>
        
                <li>
                    <NavDropdown title={
                        <i className='fa fa-product-hunt'> Product</i>
                    }>
                        <NavDropdown.Item  onClick={() => { navigate('/admin/products'); close(); }} > <i className='fa fa-shopping-basket'> All</i></NavDropdown.Item>
                        <NavDropdown.Item  onClick={() => { navigate('/admin/products/create'); close(); }} > <i className='fa fa-plus'> Create </i></NavDropdown.Item>
                    </NavDropdown>
                </li>

                <li onClick={close}>
                    <Link to="/admin/orders"><i className="fa fa-shopping-basket"></i> Orders</Link>
                </li>

                <li onClick={close}>
                    <Link to="/admin/users"><i className="fa fa-users"></i> Users</Link>
                </li>

                <li onClick={close}>
                    <Link to="/admin/reviews"><i className="fa fa-users"></i> Reviews</Link>
                </li>
        
            </ul>
            </nav>
        </div>
    )
}