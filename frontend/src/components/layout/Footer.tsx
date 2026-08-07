export function Footer() {
  return (
    <footer style={{
      backgroundColor: '#f5f5f5',
      borderTop: '1px solid #ddd',
      padding: '20px',
      marginTop: 'auto',
      textAlign: 'center',
      fontSize: '0.9em',
      color: '#666',
      fontFamily: 'sans-serif'
    }}>
      <p style={{ margin: '5px 0' }}>
        <a href="mailto:adrialeonpeidro@hotmail.com" style={{ color: '#666', textDecoration: 'underline' }}>
          adrialeonpeidro@hotmail.com
        </a>
      </p>
      <p style={{ margin: '5px 0', fontSize: '0.85em' }}>
        © 2026 Medikl - All rights reserved
      </p>
    </footer>
  );
}
