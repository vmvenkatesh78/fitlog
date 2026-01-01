import { useState } from 'react';
import { Button, Card, CardHeader, CardBody, Input } from '@fitlog/ui';
import { Dumbbell, Plus, Check } from '@fitlog/icons';
import { emit, Events } from '@fitlog/utils';

interface Workout {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  calories: number;
  timestamp: Date;
}

function WorkoutApp() {
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('fitlog-workouts');
    if (!saved) return [];
    
    // Parse and convert timestamp strings back to Date objects
    return JSON.parse(saved).map((w: Workout) => ({
      ...w,
      timestamp: new Date(w.timestamp),
    }));
  });
  const [showForm, setShowForm] = useState(false);

  const handleLogWorkout = (workout: Omit<Workout, 'id' | 'timestamp'>) => {
    const newWorkout: Workout = {
      ...workout,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    // Save to state
    const updatedWorkouts = [newWorkout, ...workouts];
    setWorkouts(updatedWorkouts);
    setShowForm(false);

    // Persist to localStorage
    localStorage.setItem('fitlog-workouts', JSON.stringify(updatedWorkouts));

    // Emit event to notify other MFEs
    emit(Events.WORKOUT_LOGGED, {
      exercise: workout.exercise,
      sets: workout.sets,
      reps: workout.reps,
    });
  };

  return (
    <div className="workout-app">
      <div className="workout-header">
        <h2><Dumbbell size={24} /> My Workouts</h2>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          New Workout
        </Button>
      </div>

      {showForm && (
        <WorkoutForm
          onSubmit={handleLogWorkout}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="workout-cards">
        {workouts.length === 0 ? (
          <Card>
            <CardBody>
              <p className="empty-state">No workouts yet. Log your first workout!</p>
            </CardBody>
          </Card>
        ) : (
          workouts.map((workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <strong>{workout.exercise}</strong>
                <span className="workout-date">
                  {workout.timestamp.toLocaleTimeString()}
                </span>
              </CardHeader>
              <CardBody>
                <p>{workout.sets} sets × {workout.reps} reps</p>
                <p className="workout-calories">{workout.calories} cal burned</p>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

interface WorkoutFormProps {
  onSubmit: (workout: Omit<Workout, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

function WorkoutForm({ onSubmit, onCancel }: WorkoutFormProps) {
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [calories, setCalories] = useState('50');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise.trim()) return;

    onSubmit({
      exercise: exercise.trim(),
      sets: parseInt(sets) || 0,
      reps: parseInt(reps) || 0,
      calories: parseInt(calories) || 0,
    });
  };

  return (
    <Card className="workout-form-card">
      <CardHeader>
        <strong>Log Workout</strong>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="workout-form">
          <Input
            label="Exercise"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            placeholder="e.g., Squats, Bench Press"
          />
          <div className="form-row">
            <Input
              label="Sets"
              type="number"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
            />
            <Input
              label="Reps"
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
            <Input
              label="Calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              <Check size={18} />
              Log Workout
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export default WorkoutApp;