import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useUser } from '@supabase/auth-helpers-react';

export default function CourseDetail() {
  const { id } = useParams();
  const user = useUser();
  const [course, setCourse] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
      if (error) console.error(error);
      else setCourse(data);
    };

    const fetchProgress = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('user_progress')
          .select('completed')
          .eq('user_id', user.id)
          .eq('course_id', id)
          .single();

        if (data) setCompleted(data.completed);
      }
    };

    fetchCourse();
    fetchProgress();
  }, [id, user]);

  const markAsComplete = async () => {
    if (!user) return;

    const { error } = await supabase.from('user_progress').upsert({
      user_id: user.id,
      course_id: id,
      completed: true,
    });

    if (!error) setCompleted(true);
  };

  if (!course) return <p>Loading course...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{course.title}</h2>
      <p><strong>Difficulty:</strong> {course.difficulty}</p>
      <p>{course.description}</p>

      {!completed ? (
        <button onClick={markAsComplete}>✅ Mark as Complete</button>
      ) : (
        <p style={{ color: 'green' }}>You’ve completed this course! 🎉</p>
      )}
    </div>
  );
}
