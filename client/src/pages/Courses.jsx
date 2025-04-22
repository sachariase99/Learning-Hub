import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { Link } from 'react-router-dom';

export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error getting user:', userError.message);
        return;
      }

      // Fetch completed course IDs for this user
      const { data: completedCourses, error: completedError } = await supabase
        .from('user_progress')
        .select('course_id')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (completedError) {
        console.error('Error fetching completed courses:', completedError.message);
        return;
      }

      const completedIds = completedCourses.map((item) => item.course_id);

      // Fetch all courses, excluding completed ones
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('difficulty', { ascending: false })
        .not('id', 'in', `(${completedIds.join(',')})`);

      if (error) {
        console.error('Error loading courses:', error.message);
      } else {
        setCourses(data);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Courses</h2>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            <Link to={`/course/${course.id}`}>
              <strong>{course.title}</strong> – {course.difficulty}
            </Link>
            <p>{course.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
