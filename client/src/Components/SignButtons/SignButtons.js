/** @format */
import React, { useState } from 'react'
import { Button, Spinner } from 'reactstrap'
import { Link } from 'react-router-dom'
import './SignButtons.css'
import Login from '../../Containers/Login/Login'
import Signup from '../../Containers/Signup/Signup'

function SignButtons({ auth, loginUser, logoutUser }) {
    const [login, setLogin] = useState(false);
    const [sign, setSignin] = useState(false);
    
    const toggleLog = () => setLogin(!login);
    const toggleSign = () => setSignin(!sign);

    return (
        <div className="auth-action-group">
            {auth.isAuthenticated ? (
                <div className="auth-welcome-card fade-in">
                    <h3 className="welcome-text">
                        Welcome back, <span className="user-glow">{auth.user?.username}</span>
                    </h3>
                    <div className="btn-stack">
                        <Button className="btn-logout" onClick={logoutUser}>
                            {auth.isLoading ? <Spinner size="sm" /> : <><i className="fas fa-sign-out-alt me-2"></i> Logout</>}
                        </Button>
                        <Link to="/dashboard" className="btn-dashboard">
                            Go to Dashboard <i className="fas fa-arrow-right ms-2"></i>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="auth-guest-stack">
                    <div className="main-actions">
                        <Button onClick={toggleLog} className="btn-signin-neon">
                            {auth.isLoading ? <Spinner size="sm" /> : "Sign In"}
                        </Button>
                        <Button onClick={toggleSign} className="btn-signup-glass">
                            Create Free Account
                        </Button>
                    </div>
                    
                    {auth.errMess && (
                        <div className="auth-error-pill">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            Invalid credentials. Please try again.
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {login && !auth.isAuthenticated && (
                <Login loginUser={loginUser} login={login} auth={auth} setLogin={setLogin} />
            )}
            {sign && !auth.isAuthenticated && (
                <Signup sign={sign} auth={auth} setSignin={setSignin} />
            )}
        </div>
    )
}

export default SignButtons;