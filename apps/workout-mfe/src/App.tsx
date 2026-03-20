import { useState, useCallback } from 'react';
import { Button, Card, CardHeader, CardBody, Input } from '@fitlog/ui';
import { Dumbbell, Plus, Check } from '@fitlog/icons';
import { emit, Events, formatRelativeTime } from '@fitlog/utils';
import { getWorkouts, saveWorkout } from '@fitlog/api';
import type { Workout } from '@fitlog/api';
import './index.css';

function WorkoutApp() {
  const [workouts, setWorkouts] = useState<Workout[]>(() => getWorkouts());
  const [showForm, setShowForm] = useState(false);

  const handleLogWorkout = useCallback(
    (data: Omit<Workout, 'id' | 'timestamp'>) => {
      const newWorkout = saveWorkout(data);
      setWorkouts((prev) => [newWorkout, ...prev]);
      setShowForm(false);

      emit(Events.WORKOUT_LOGGED, {
        exercise: data.exercise,
        sets: data.sets,
        reps: data.reps,
      });
    },
    [],
  );

  return (
    <div className="workout-app">
      <div className="workout-header">
        <h2><Dumbbell size={24} /> My Workouts</h2>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          New workout
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
              <div className="empty-state">
                <p>No workouts logged yet. Start your first session.</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          workouts.map((workout) => (
            <Card key={workout.id} padding="sm">
              <CardBody>
                <div className="workout-row">
                  <div className="workout-info">
                    <strong>{workout.exercise}</strong>
                    <span className="workout-detail">
                      {workout.sets} sets x {workout.reps} reps
                    </span>
                  </div>
                  <div className="workout-meta">
                    <span className="workout-calories">{workout.calories} cal</span>
                    <span className="workout-time">
                      {formatRelativeTime(workout.timestamp)}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

interface WorkoutFormProps {
  onSubmit: (data: Omit<Workout, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

function WorkoutForm({ onSubmit, onCancel }: WorkoutFormProps) {
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [calories, setCalories] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!exercise.trim()) {
      setError('Exercise name is required');
      return;
    }

    const setsNum = parseInt(sets);
    const repsNum = parseInt(reps);
    const calNum = parseInt(calories);

    if (isNaN(setsNum) || setsNum <= 0) {
      setError('Enter a valid number of sets');
      return;
    }

    if (isNaN(repsNum) || repsNum <= 0) {
      setError('Enter a valid number of reps');
      return;
    }

    if (isNaN(calNum) || calNum <= 0) {
      setError('Enter calories burned');
      return;
    }

    setError('');
    onSubmit({
      exercise: exercise.trim(),
      sets: setsNum,
      reps: repsNum,
      calories: calNum,
    });
  };

  return (
    <Card className="workout-form-card">
      <CardHeader>
        <strong>Log workout</strong>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="workout-form">
          {error && <p className="form-error">{error}</p>}
          <Input
            label="Exercise"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            placeholder="e.g., Squats, Bench press"
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
              placeholder="e.g., 150"
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              <Check size={18} />
              Log workout
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export default WorkoutApp;
