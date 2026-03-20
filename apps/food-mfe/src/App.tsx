import { useState, useCallback } from 'react';
import { Button, Card, CardHeader, CardBody, Input } from '@fitlog/ui';
import { Apple, Plus, Check } from '@fitlog/icons';
import { emit, Events, formatCalories, formatRelativeTime } from '@fitlog/utils';
import { getMeals, saveMeal } from '@fitlog/api';
import type { Meal } from '@fitlog/api';
import './index.css';

function FoodApp() {
  const [meals, setMeals] = useState<Meal[]>(() => getMeals());
  const [showForm, setShowForm] = useState(false);

  const todayMeals = meals.filter((m) =>
    m.timestamp.startsWith(new Date().toISOString().split('T')[0])
  );

  const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const todayProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);
  const todayCarbs = todayMeals.reduce((sum, m) => sum + m.carbs, 0);
  const todayFat = todayMeals.reduce((sum, m) => sum + m.fat, 0);

  const handleLogMeal = useCallback((data: Omit<Meal, 'id' | 'timestamp'>) => {
    const newMeal = saveMeal(data);
    setMeals((prev) => [newMeal, ...prev]);
    setShowForm(false);

    emit(Events.MEAL_LOGGED, {
      name: data.name,
      calories: data.calories,
    });
  }, []);

  return (
    <div className="food-app">
      <div className="food-header">
        <h2><Apple size={24} /> Food Tracker</h2>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Log meal
        </Button>
      </div>

      {showForm && (
        <MealForm
          onSubmit={handleLogMeal}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="food-summary-grid">
        <Card padding="sm">
          <CardBody>
            <div className="macro-stat">
              <span className="macro-value">{formatCalories(todayCalories)}</span>
              <span className="macro-label">consumed</span>
            </div>
          </CardBody>
        </Card>
        <Card padding="sm">
          <CardBody>
            <div className="macro-stat">
              <span className="macro-value macro-protein">{todayProtein}g</span>
              <span className="macro-label">protein</span>
            </div>
          </CardBody>
        </Card>
        <Card padding="sm">
          <CardBody>
            <div className="macro-stat">
              <span className="macro-value macro-carbs">{todayCarbs}g</span>
              <span className="macro-label">carbs</span>
            </div>
          </CardBody>
        </Card>
        <Card padding="sm">
          <CardBody>
            <div className="macro-stat">
              <span className="macro-value macro-fat">{todayFat}g</span>
              <span className="macro-label">fat</span>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="food-meals">
        {meals.length === 0 ? (
          <Card>
            <CardBody>
              <div className="empty-state">
                <p>No meals logged yet. Track your first meal.</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          meals.map((meal) => (
            <Card key={meal.id} padding="sm">
              <CardBody>
                <div className="meal-row">
                  <div className="meal-info">
                    <strong>{meal.name}</strong>
                    <span className="meal-time">{formatRelativeTime(meal.timestamp)}</span>
                  </div>
                  <div className="meal-macros">
                    <span>{meal.calories} cal</span>
                    <span className="meal-macro-detail">P {meal.protein}g · C {meal.carbs}g · F {meal.fat}g</span>
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

interface MealFormProps {
  onSubmit: (data: Omit<Meal, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

function MealForm({ onSubmit, onCancel }: MealFormProps) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fat, setFat] = useState('0');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Meal name is required');
      return;
    }

    const cal = parseInt(calories);
    if (isNaN(cal) || cal <= 0) {
      setError('Enter a valid calorie count');
      return;
    }

    setError('');
    onSubmit({
      name: name.trim(),
      calories: cal,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fat: parseInt(fat) || 0,
    });
  };

  return (
    <Card className="meal-form-card">
      <CardHeader>
        <strong>Log meal</strong>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="meal-form">
          {error && <p className="form-error">{error}</p>}
          <Input
            label="Meal name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Chicken breast, Rice bowl"
          />
          <Input
            label="Calories"
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="e.g., 350"
          />
          <div className="form-row">
            <Input
              label="Protein (g)"
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
            <Input
              label="Carbs (g)"
              type="number"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
            />
            <Input
              label="Fat (g)"
              type="number"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              <Check size={18} />
              Log meal
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export default FoodApp;
