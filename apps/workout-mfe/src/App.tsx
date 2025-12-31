import { Routes, Route } from 'react-router-dom';
import { Button, Card, CardHeader, CardBody } from '@fitlog/ui';
import { Dumbbell, Plus } from '@fitlog/icons';

function WorkoutApp() {
  return (
    <div className="workout-app">
      <Routes>
        <Route path="/" element={<WorkoutList />} />
        <Route path="/new" element={<NewWorkout />} />
      </Routes>
    </div>
  );
}

function WorkoutList() {
  return (
    <div className="workout-list">
      <div className="workout-header">
        <h2><Dumbbell size={24} /> My Workouts</h2>
        <Button variant="primary">
          <Plus size={18} />
          New Workout
        </Button>
      </div>
      
      <div className="workout-cards">
        <Card>
          <CardHeader>
            <strong>Morning Strength</strong>
            <span className="workout-date">Today, 7:00 AM</span>
          </CardHeader>
          <CardBody>
            <p>Squats, Bench Press, Deadlift</p>
            <p className="workout-stats">3 exercises • 45 min</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <strong>Evening Cardio</strong>
            <span className="workout-date">Yesterday, 6:00 PM</span>
          </CardHeader>
          <CardBody>
            <p>Running, Cycling</p>
            <p className="workout-stats">2 exercises • 30 min</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function NewWorkout() {
  return (
    <div className="new-workout">
      <h2>Log New Workout</h2>
      <p>Coming soon...</p>
    </div>
  );
}

export default WorkoutApp;