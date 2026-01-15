import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Segments from './components/Segments';
import TechDiff from './components/TechDiff';
import WhyUs from './components/WhyUs';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Services />
      <Segments />
      <TechDiff />
      <WhyUs />
      <Footer />
    </div>
  );
}

export default App;
