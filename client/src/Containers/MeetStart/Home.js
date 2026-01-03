/** @format */
import React, { useState } from 'react';
import { Input, Button, Form, FormGroup } from 'reactstrap';
import "./Home.css"

function Home({ auth }) {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    const joinRoom = (event) => {
        event.preventDefault();
        setError('');

        if (url.trim() === "") {
            // Generate a sleek 5-character room code
            const newRoom = Math.random().toString(36).substring(2, 7);
            window.location.href = `/room/${newRoom}`;
            return;
        }

        // Robust URL/Code Parsing
        const parts = url.split('/');
        const roomCode = parts[parts.length - 1].trim();

        if (roomCode.length === 5) {
            window.location.href = `/room/${roomCode}`;
        } else {
            setError("Please enter a valid 5-character room code.");
        }
    }

    return (
        <div className="meet-home-container">
            <div className="hero-content fade-in">
                <div className="status-badge">
                    <span className="dot"></span> System Ready
                </div>
                <h1 className="welcome-greet">
                    Hello, <span className="user-name">{auth.user.username}</span>
                </h1>
                <p className="sub-greet">
                    Start a secure encrypted meeting or join an existing session.
                </p>
            </div>

            <div className="join-card-glass">
                <div className="card-top">
                    <i className="fas fa-video-plus icon-main"></i>
                    <h3>Launch Meeting</h3>
                </div>
                
                <Form onSubmit={joinRoom} className="join-form">
                    <FormGroup className="input-animate">
                        <Input 
                            type="text" 
                            placeholder="Paste link or enter code..." 
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            className="custom-join-input"
                        />
                    </FormGroup>

                    <Button type="submit" className="connect-btn-neon">
                        {url.length > 0 ? 'Join Space' : 'Create New Space'}
                    </Button>
                    
                    <p className="hint-text">
                        {url.length === 0 && "No code? We'll generate one for you."}
                    </p>
                </Form>

                {error && <div className="join-error-toast">{error}</div>}
            </div>
        </div>
    );
}

export default Home;