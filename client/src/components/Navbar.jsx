import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching admin status:', error.message);
      } else {
        setIsAdmin(data?.is_admin);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/" className="cursor-pointer">Home</Link> |{' '}
      {user ? (
        <>
          <Link to="/dashboard" className="cursor-pointer">Dashboard</Link> |{' '}
          <Link to="/courses" className="cursor-pointer">Courses</Link> |{' '}
          {isAdmin && (
            <>
              <Link to="/admin/add-course" className="cursor-pointer">Add Course</Link> |{' '}
            </>
          )}
          <button onClick={handleLogout} className="cursor-pointer">Logout</button>
        </>
      ) : (
        <Link to="/login" className="cursor-pointer">Login</Link>
      )}
    </nav>
  );
}
