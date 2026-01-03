/** @format */
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, Button } from 'reactstrap';
import './Header.css';
import mslogo from '../../shared/images/mslogo.svg';

function Header({ logoutUser }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <header className='custom-header-wrapper'>
            <Navbar expand='md' className='glass-nav'>
                <div className='container-fluid px-4'>
                    <NavbarBrand href='/home' className='brand-identity'>
                        <div className='logo-glow-wrapper'>
                            <img src={mslogo} alt='TalkSpace' className='brand-logo' />
                        </div>
                        <span className='brand-name-text'>TalkSpace</span>
                    </NavbarBrand>

                    <NavbarToggler onClick={toggle} className='border-0 shadow-none'>
                        <div className={`modern-hamburger ${isOpen ? 'is-open' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </NavbarToggler>

                    <Collapse isOpen={isOpen} navbar>
                        <Nav className='ms-auto align-items-center' navbar>
                            <NavItem>
                                <NavLink to='/home' className='nav-custom-link' activeClassName="active">
                                    <i className="fas fa-home me-2"></i>Home
                                </NavLink>
                            </NavItem>
                            
                            <NavItem>
                                <NavLink to='/conversations' className='nav-custom-link' activeClassName="active">
                                    <i className="fas fa-comment-dots me-2"></i>Chats
                                </NavLink>
                            </NavItem>

                            <NavItem>
                                <NavLink to='/dashboard' className='nav-custom-link' activeClassName="active">
                                    <i className="fas fa-chart-pie me-2"></i>Insights
                                </NavLink>
                            </NavItem>

                            <NavItem className='ms-md-3 mt-3 mt-md-0'>
                                <Button
                                    className='btn-logout-neon'
                                    onClick={logoutUser}>
                                    <span className='iconify me-2' data-icon='mdi-power'></span>
                                    Logout
                                </Button>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </div>
            </Navbar>
        </header>
    );
}

export default Header;