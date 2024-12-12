import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import Recorder from './components/Recorder';
import './components/recorder.css'

const App = () => {
    return (
        <Router>
            <nav className={'navbar'}>
                <Link to="/">Home</Link> | <Link to="/recorder">Recorder</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/recorder" element={<Recorder />} />
            </Routes>
        </Router>
    );
};

export default App;