/** @format */
import React, { useState } from 'react'
import './Signup.css';
import { baseUrl } from '../../shared/basUrl';

function Signup({ sign, setSignin }) {
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const toggleModal = () => setSignin(!sign);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name] : e.target.value});
        if (errors[e.target.name]) setErrors({...errors, [e.target.name]: ''});
    }

    const handleSignup = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        
        // Simple validation check
        if (formData.password !== formData.cpassword) {
            setErrors({ cpassword: "Passwords don't match" });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(baseUrl + 'users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            
            if (result.err) {
                setErrors({ general: result.err.message });
            } else {
                setSuccess(true);
                setTimeout(toggleModal, 2500);
            }
        } catch (error) {
            setErrors({ general: 'Network connection failed.' });
        } finally {
            setIsLoading(false);
        }
    }

    if (!sign) return null;

    return (
        <div className="portal-overlay">
            <div className="portal-card signup-glass">
                <button className="portal-close" onClick={toggleModal}>
                    <i className="fas fa-times"></i>
                </button>

                {success ? (
                    <div className="success-state">
                        <div className="success-icon-wrap">
                            <i className="fas fa-check"></i>
                        </div>
                        <h2>Account Created!</h2>
                        <p>Welcome to Talk Space. Redirecting you...</p>
                    </div>
                ) : (
                    <>
                        <div className="portal-header">
                            <div className="brand-dot glow-purple"></div>
                            <h2 className="portal-title">Join the Space</h2>
                            <p className="portal-subtitle">Create an account to start meeting</p>
                        </div>

                        <form onSubmit={handleSignup} className="portal-form">
                            <div className="form-grid">
                                <div className="input-wrapper">
                                    <i className="far fa-signature input-icon"></i>
                                    <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
                                </div>
                                <div className="input-wrapper">
                                    <i className="far fa-at input-icon"></i>
                                    <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="input-wrapper">
                                <i className="far fa-key input-icon"></i>
                                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                            </div>

                            <div className="input-wrapper">
                                <i className="far fa-shield-check input-icon"></i>
                                <input type="password" name="cpassword" placeholder="Confirm Password" onChange={handleChange} required />
                            </div>

                            {errors.general && <div className="portal-error-msg">{errors.general}</div>}
                            {errors.cpassword && <div className="portal-error-msg">{errors.cpassword}</div>}

                            <button type="submit" className="portal-submit-btn" disabled={isLoading}>
                                {isLoading ? <div className="mini-loader"></div> : 'Launch Account'}
                            </button>
                        </form>

                        <div className="portal-footer">
                            <p>Got an account? <span className="link-text" onClick={toggleModal}>Sign In</span></p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Signup;