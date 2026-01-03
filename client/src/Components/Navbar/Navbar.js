/** @format */
import React, { useState } from 'react'
import './Navbar.css'
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap'
import mslogo from '../../shared/images/mslogo.svg'
import NavItems from '../../shared/storage/data.js'

function NavbarMain() {
    const [isOpen, setIsOpen] = useState(false)

    const toggle = () => setIsOpen(!isOpen);

    return (
        <header className="main-nav-wrapper">

            <Navbar expand='md' className="glass-navbar">
                <div className='container-fluid'>
                    <NavbarBrand href='/home' className='brand-identity'>
                        <div className="logo-container">
                            <img src={mslogo} alt='Talk Space Logo' className='brand-logo' />
                        </div>
                        <span className='brand-text'>Talk Space</span>
                    </NavbarBrand>

                    <NavbarToggler onClick={toggle} className="custom-toggler">
                        <div className={`animated-icon1 ${isOpen ? 'open' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </NavbarToggler>

                    <Collapse isOpen={isOpen} navbar>
                        <Nav className='ms-auto align-items-center' navbar>
                            {NavItems.map((item, index) => (
                                <NavItem key={index}>
                                    <NavLink href={item.link} className="nav-custom-item">
                                        {item.product}
                                    </NavLink>
                                </NavItem>
                            ))}
                            <NavItem className="ms-md-3">
                                <NavLink href="/login" className="get-started-btn">
                                    Get Started
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </div>
            </Navbar>
        </header>
    )
}

export default NavbarMain