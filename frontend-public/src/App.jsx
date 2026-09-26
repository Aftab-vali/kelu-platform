import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Survey from './pages/Survey';
import ReportIssue from './pages/ReportIssue';
import Suggestion from './pages/Suggestion';
import Candidate from './pages/Candidate';
import Updates from './pages/Updates';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/survey" element={<Survey />} />
          <Route path="/report-issue" element={<ReportIssue />} />
          <Route path="/suggestion" element={<Suggestion />} />
          <Route path="/candidate" element={<Candidate />} />
          <Route path="/updates" element={<Updates />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
