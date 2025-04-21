import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '../supabase/client';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const user = useUser();
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('completed, course_id, courses ( title )')
        .eq('user_id', user.id);

      if (!error) setProgress(data);
    };

    if (user) fetchProgress();
  }, [user]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Your Courses</h2>
      {progress.length === 0 ? (
        <p>You haven't started any courses yet.</p>
      ) : (
        <ul>
          {progress.map((item) => (
            <li key={item.course_id}>
              <Link to={`/course/${item.course_id}`}>{item.courses.title}</Link> –{' '}
              {item.completed ? '✅ Completed' : '🕒 In Progress'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
