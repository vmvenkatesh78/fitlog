import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@fitlog/ui';
import { ChartBar } from '@fitlog/icons';
import { on, Events } from '@fitlog/utils';

function AnalyticsApp() {
  const [workoutCount, setWorkoutCount] = useState(() => {
    const saved = localStorage.getItem('fitlog-workouts');
    return saved ? JSON.parse(saved).length : 0;
  });
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    // Listen for real-time updates
    const cleanup = on(Events.WORKOUT_LOGGED, () => {
      setWorkoutCount((prev: number) => prev + 1);
    });

    return cleanup;
  }, []);

  return (
    <div className="analytics-app">
      <div className="analytics-header">
        <h2><ChartBar size={24} /> Analytics Dashboard</h2>
      </div>

      <div className="analytics-cards">
        <Card>
          <CardHeader>
            <strong>Workouts Logged</strong>
          </CardHeader>
          <CardBody>
            <div className="stat-display">
              <span className="stat-value">{workoutCount}</span>
              <span className="stat-label">this session</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <strong>Calories Burned</strong>
          </CardHeader>
          <CardBody>
            <div className="stat-display">
              <span className="stat-value stat-calories">—</span>
              <span className="stat-label">coming soon</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <strong>Weekly Progress</strong>
          </CardHeader>
          <CardBody>
            <div className="chart-placeholder">
              <ChartBar size={48} />
              <p>Chart coming soon</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsApp;