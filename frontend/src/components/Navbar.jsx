import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Camera, BarChart2, Home } from 'lucide-react';

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.logoGroup}>
        <Pill size={28} color="#0284c7" />
        <h2 style={styles.title}>PillSync</h2>
      </div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}><Home size={18} /> Dashboard</Link>
        <Link to="/scan" style={styles.link}><Camera size={18} /> OCR Scan</Link>
        <Link to="/analytics" style={styles.link}><BarChart2 size={18} /> Analytics & Refills</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0' },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  title: { margin: 0, color: '#0f172a', fontSize: '1.25rem' },
  links: { display: 'flex', gap: '1.5rem' },
  link: { textDecoration: 'none', color: '#475569', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.3rem' }
};