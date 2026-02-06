import React, { useEffect, useState } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AppNavbar = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  return (
    <Navbar bg="white" className="shadow-sm mb-3 glass">
      <Container>
        <Navbar.Brand className="fw-bold">Smart City AI</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/" aria-label="Go to Dashboard">Dashboard</Nav.Link>
          <Nav.Link as={Link} to="/upload" aria-label="Go to Upload">Upload</Nav.Link>
        </Nav>
        <Nav.Link as={Link} to="/pothole-detection">
           Pothole Detection
        </Nav.Link>

        <Button
          size="sm"
          variant="outline-secondary"
          onClick={() => setDarkMode(!darkMode)}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;