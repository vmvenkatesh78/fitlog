import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

function Header() {
  const user = useSelector((state: RootState) => state.user);
  const preferences = useSelector((state: RootState) => state.preferences);

  return (
    <header className="header">
      <div className="header-brand">
        <Link to="/">🏋️ FitLog</Link>
      </div>
      <nav className="header-nav">
        <Link to="/workout">Workout</Link>
        <Link to="/food">Food</Link>
        <Link to="/analytics">Analytics</Link>
      </nav>
      <div className="header-user">
        {user.name} | {preferences.theme}
      </div>
    </header>
  );
}

export default Header;
