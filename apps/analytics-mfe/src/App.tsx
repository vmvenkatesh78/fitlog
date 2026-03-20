import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardBody } from '@fitlog/ui';
import { ChartBar } from '@fitlog/icons';
import { on, Events, formatCalories } from '@fitlog/utils';
import { getWorkouts, getMeals } from '@fitlog/api';
import type { Workout, Meal } from '@fitlog/api';
import './index.css';

function getWeeklyData(workouts: Workout[]): { day: string; count: number; calories: number }[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const weekData: { day: string; count: number; calories: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayWorkouts = workouts.filter((w) => w.timestamp.startsWith(dateStr));

    weekData.push({
      day: days[date.getDay()],
      count: dayWorkouts.length,
      calories: dayWorkouts.reduce((sum, w) => sum + w.calories, 0),
    });
  }

  return weekData;
}

function AnalyticsApp() {
  const [workouts, setWorkouts] = useState<Workout[]>(() => getWorkouts());
  const [meals, setMeals] = useState<Meal[]>(() => getMeals());

  useEffect(() => {
    const cleanupWorkout = on(Events.WORKOUT_LOGGED, () => {
      setWorkouts(getWorkouts());
    });
    const cleanupMeal = on(Events.MEAL_LOGGED, () => {
      setMeals(getMeals());
    });
    return () => {
      cleanupWorkout();
      cleanupMeal();
    };
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayWorkouts = workouts.filter((w) => w.timestamp.startsWith(todayStr));
  const todayMeals = meals.filter((m) => m.timestamp.startsWith(todayStr));

  const totalBurned = todayWorkouts.reduce((sum, w) => sum + w.calories, 0);
  const totalConsumed = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const netCalories = totalConsumed - totalBurned;

  const weeklyData = useMemo(() => getWeeklyData(workouts), [workouts]);
  const maxCount = Math.max(...weeklyData.map((d) => d.count), 1);

  return (
    <div className="analytics-app">
      <div className="analytics-header">
        <h2><ChartBar size={24} /> Analytics</h2>
      </div>

      <div className="analytics-stats">
        <Card padding="sm">
          <CardBody>
            <div className="stat-block">
              <span className="stat-number">{todayWorkouts.length}</span>
              <span className="stat-label">workouts today</span>
            </div>
          </CardBody>
        </Card>
        <Card padding="sm">
          <CardBody>
            <div className="stat-block">
              <span className="stat-number stat-burned">{formatCalories(totalBurned)}</span>
              <span className="stat-label">burned</span>
            </div>
          </CardBody>
        </Card>
        <Card padding="sm">
          <CardBody>
            <div className="stat-block">
              <span className="stat-number stat-consumed">{formatCalories(totalConsumed)}</span>
              <span className="stat-label">consumed</span>
            </div>
          </CardBody>
        </Card>
        <Card padding="sm">
          <CardBody>
            <div className="stat-block">
              <span className={`stat-number ${netCalories > 0 ? 'stat-consumed' : 'stat-burned'}`}>
                {netCalories > 0 ? '+' : ''}{formatCalories(netCalories)}
              </span>
              <span className="stat-label">net</span>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <strong>Weekly workouts</strong>
        </CardHeader>
        <CardBody>
          {workouts.length === 0 ? (
            <div className="empty-state">
              <p>No workout data yet. Log workouts to see your weekly trend.</p>
            </div>
          ) : (
            <div className="chart">
              <div className="chart-bars">
                {weeklyData.map((d) => (
                  <div key={d.day} className="chart-column">
                    <span className="chart-value">{d.count}</span>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{ height: `${(d.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="chart-label">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {workouts.length > 0 && (
        <Card>
          <CardHeader>
            <strong>Recent workouts</strong>
          </CardHeader>
          <CardBody>
            <div className="recent-list">
              {workouts.slice(0, 5).map((w) => (
                <div key={w.id} className="recent-row">
                  <span className="recent-exercise">{w.exercise}</span>
                  <span className="recent-detail">
                    {w.sets}x{w.reps} &middot; {w.calories} cal
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default AnalyticsApp;
