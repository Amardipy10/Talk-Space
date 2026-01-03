/** @format */
import React, { useState, useEffect } from 'react';
import './Login.css';

function Login({ login, setLogin, loginUser, auth }) {
    const [formdata, setformData] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Close on successful auth
    useEffect(() => {
        if (auth?.isAuthenticated && login) {
            setLogin(false);
        }
    }, [auth?.isAuthenticated, login, setLogin]);

    const handleChange = (e) => {
        setformData({ ...formdata, [e.target.name]: e.target.value });
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        try {
            await loginUser(formdata);
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!login) return null;

    return (
        <div className="portal-overlay">
            <div className="glass-login-card">
                <button className="portal-close" onClick={() => setLogin(false)}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="portal-header">
                    <div className="brand-dot"></div>
                    <h2 className="portal-title">Access Talk Space</h2>
                    <p className="portal-subtitle">Secure gateway to your conversations</p>
                </div>

                <form onSubmit={handleLogin} className="portal-form">
                    <div className="input-wrapper">
                        <i className="far fa-user input-icon"></i>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            onChange={handleChange}
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="input-wrapper">
                        <i className="far fa-lock-alt input-icon"></i>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {auth?.errMess && (
                        <div className="portal-error">
                            <i className="fas fa-shield-exclamation me-2"></i>
                            Authentication failed.
                        </div>
                    )}

                    <button type="submit" className="portal-submit" disabled={isLoading}>
                        {isLoading ? <div className="portal-spinner"></div> : 'Enter Space'}
                    </button>
                </form>

                <div className="portal-footer">
                    <a href="#reset">Lost your key?</a>
                </div>
            </div>
        </div>
    );
}

export default Login;