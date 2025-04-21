import { Link } from 'react-router-dom';
import { supabase } from '../supabase/client';

export default function Navbar({ user }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/" className='cursor-pointer'>Home</Link> |{' '}
      {user ? (
        <>
          <Link to="/dashboard" className='cursor-pointer'>Dashboard</Link> |{' '}
          <button onClick={handleLogout} className='cursor-pointer'>Logout</button> |{' '}
        </>
      ) : (
        <>
          <Link to="/login" className='cursor-pointer'>Login</Link> |{' '}
        </>
      )}
      <Link to="/courses" className='cursor-pointer'>Courses</Link>
    </nav>
  );
}
