import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/" style={{ color: '#0284c7' }}>Go back home</Link>
    </div>
  );
}
