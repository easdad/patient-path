import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Set launch date to 30 days from now
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Newsletter signup state
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = launchDate - new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };
    
    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    
    return () => clearInterval(timer);
  }, []);
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // In a real application, this would send the email to a server
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };
  
  return (
    <div className="patient-path-app">
      <header className="main-header">
        <div className="logo-container">
          <div className="logo">
            <span className="logo-icon">+</span>
            <span className="logo-text">Patient Path</span>
          </div>
        </div>
        <nav className="main-nav">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>
      
      <main>
        <section className="hero-section">
          <div className="hero-content">
            <h1>Transforming Healthcare Coordination</h1>
            <p className="hero-subtitle">
              Patient Path connects patients, providers, and caregivers for better health outcomes.
              Our platform launches soon.
            </p>
            
            <div className="countdown-display">
              <div className="countdown-item">
                <span className="countdown-number">{timeLeft.days}</span>
                <span className="countdown-label">Days</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{timeLeft.hours}</span>
                <span className="countdown-label">Hours</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{timeLeft.minutes}</span>
                <span className="countdown-label">Minutes</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{timeLeft.seconds}</span>
                <span className="countdown-label">Seconds</span>
              </div>
            </div>
            
            <div className="newsletter-signup">
              <h3>Get notified when we launch</h3>
              <form onSubmit={handleSubmit}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email} 
                  onChange={handleEmailChange} 
                  required 
                />
                <button type="submit">Notify Me</button>
              </form>
              {subscribed && <p className="success-message">Thank you! You'll be notified when we launch.</p>}
            </div>
          </div>
          <div className="hero-image">
            <div className="image-placeholder">
              <img 
                src="https://img.freepik.com/free-vector/healthcare-background-with-medical-symbols-hexagonal-frame_1017-26363.jpg?w=740&t=st=1714007118~exp=1714007718~hmac=0eb9a5b1efde857a8eaeac18e9ed4d1e2afa0f8acb08c1c54e16df675dbab90d" 
                alt="Healthcare professionals using Patient Path"
                className="hero-img"
              />
            </div>
          </div>
        </section>
        
        <section className="features-section" id="features">
          <h2>How Patient Path Improves Healthcare</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="icon-coordinate">🔄</i>
              </div>
              <h3>Care Coordination</h3>
              <p>Seamlessly connect all members of a patient's care team for improved communication and better outcomes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="icon-records">📋</i>
              </div>
              <h3>Medical Records</h3>
              <p>Securely access and share medical records with authorized providers, eliminating redundant tests and procedures.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="icon-appointment">📅</i>
              </div>
              <h3>Appointment Management</h3>
              <p>Schedule, reschedule, and get reminders for upcoming appointments with any provider in your network.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="icon-analytics">📊</i>
              </div>
              <h3>Health Analytics</h3>
              <p>Track health metrics over time and receive personalized insights to improve your wellbeing.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="icon-medication">💊</i>
              </div>
              <h3>Medication Management</h3>
              <p>Keep track of prescriptions, dosages, and refills all in one place with automated reminders.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="icon-telemedicine">🖥️</i>
              </div>
              <h3>Telemedicine</h3>
              <p>Connect with healthcare providers through secure video consultations for non-emergency care.</p>
            </div>
          </div>
        </section>
        
        <section className="about-section" id="about">
          <div className="about-content">
            <h2>About Patient Path</h2>
            <p>
              Patient Path was founded by healthcare professionals who experienced firsthand the fragmentation 
              in healthcare coordination. Our mission is to create a seamless experience for patients navigating 
              complex healthcare journeys.
            </p>
            <p>
              Our team combines expertise in healthcare, technology, and user experience design to build a 
              platform that addresses the real needs of patients and providers alike.
            </p>
          </div>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>2023 Q4</h4>
                <p>Research & Development</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>2024 Q1</h4>
                <p>Platform Design</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker active"></div>
              <div className="timeline-content">
                <h4>2024 Q2</h4>
                <p>Beta Testing</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>2024 Q3</h4>
                <p>Public Launch</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="main-footer" id="contact">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo">
              <span className="logo-icon">+</span>
              <span className="logo-text">Patient Path</span>
            </div>
            <p>Transforming healthcare coordination through technology</p>
          </div>
          
          <div className="footer-links">
            <div className="link-group">
              <h4>Platform</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#roadmap">Roadmap</a></li>
              </ul>
            </div>
            <div className="link-group">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">Our Team</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="link-group">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#hipaa">HIPAA Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="contact-info">
            <h4>Contact Us</h4>
            <p><a href="mailto:info@patientpath.com">info@patientpath.com</a></p>
            <div className="social-icons">
              <a href="#" className="social-icon">𝕏</a>
              <a href="#" className="social-icon">ƒ</a>
              <a href="#" className="social-icon">𝕚𝕟</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Patient Path, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
