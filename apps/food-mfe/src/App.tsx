import { Card, CardHeader, CardBody } from '@fitlog/ui';
import { Apple } from '@fitlog/icons';

function FoodApp() {
  return (
    <div className="food-app">
      <div className="food-header">
        <h2><Apple size={24} /> Food Tracker</h2>
      </div>

      <div className="food-dashboard">
        <Card>
          <CardHeader>
            <strong>Today's Summary</strong>
          </CardHeader>
          <CardBody>
            <div className="calorie-display">
              <span className="calories-consumed">0</span>
              <span className="calories-label">calories consumed</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <strong>Recent Meals</strong>
          </CardHeader>
          <CardBody>
            <p className="empty-state">No meals logged yet</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default FoodApp;