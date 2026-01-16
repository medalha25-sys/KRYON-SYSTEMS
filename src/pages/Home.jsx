import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Segments from '../components/Segments';
import TechDiff from '../components/TechDiff';
import WhyUs from '../components/WhyUs';
import Contact from '../components/Contact';

const Home = () => {
    return (
        <main>
            <Hero />
            <Services />
            <Segments />
            <TechDiff />
            <WhyUs />
            <Contact />
        </main>
    );
};

export default Home;
