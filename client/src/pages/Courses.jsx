import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { Link } from 'react-router-dom';

export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from('courses').select('*').order('difficulty', { ascending: false });
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
        {courses.map(course => (
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
