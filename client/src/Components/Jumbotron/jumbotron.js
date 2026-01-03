/** @format */
import React from 'react';
import './jumbotron.css';
import SignButtons from '../SignButtons/SignButtons';
import demo from '../../shared/images/demo.webp';
import { Grid, Row, Col } from 'react-flexbox-grid';

function Jumbotron(props) {
    return (
        <section className="hero-viewport">
            <div className="animated-bg-overlay"></div>
            <Grid fluid>
                <Row className="align-center-vh">
                    <Col lg={6} md={12} className="text-section">
                        <div className="glass-content-card">
                            <div className="badge-new">v1.0</div>
                            <h1 className="hero-title">
                                Connect Beyond <span className="text-gradient">Boundaries</span>
                            </h1>
                            <p className="hero-subtitle">
                                Talk Space brings your team together with crystal-clear 
                                HD video and ultra-low latency messaging. 
                                High security. Zero friction.
                            </p>
                            
                            <div className="cta-wrapper">
                                <SignButtons
                                    auth={props.auth}
                                    loginUser={props.loginUser}
                                    logoutUser={props.logoutUser}
                                />
                            </div>
                        </div>
                    </Col>
                    
                    <Col lg={6} md={12} className="image-section">
                        <div className="floating-image-container">
                            <img
                                src={demo}
                                alt="Talk Space Dashboard"
                                className="main-hero-img"
                            />
                            <div className="glow-effect"></div>
                        </div>
                    </Col>
                </Row>
            </Grid>
        </section>
    );
}

export default Jumbotron;