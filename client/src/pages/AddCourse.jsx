import { useState } from 'react';
import { supabase } from '../supabase/client';
import { useAdminCheck } from '../hooks/useAdminCheck';

export default function AddCourse() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const isAdmin = useAdminCheck();

  if (!isAdmin) return <p>⛔ You must be an admin to access this page.</p>

  const handleAddCourse = async () => {
    const { error } = await supabase.from('courses').insert([
      { title, description, difficulty },
    ]);

    if (error) {
      alert('Error adding course: ' + error.message);
    } else {
      alert('Course added!');
      setTitle('');
      setDescription('');
      setDifficulty('Beginner');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Add New Course</h2>
      <input
        type="text"
        placeholder="Course Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      /><br />
      <textarea
        placeholder="Course Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      /><br />
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      >
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
      </select><br />
      <button onClick={handleAddCourse}>Add Course</button>
    </div>
  );
}
