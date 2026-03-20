import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, toggleTheme } from '../store';
import { Dumbbell, Apple, ChartBar, User, Settings } from '@fitlog/icons';

function Header() {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.user);
  const preferences = useSelector((state: RootState) => state.preferences);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="header">
      <div className="header-brand">
        <Link to="/home">
          <Dumbbell size={20} />
          <span>FitLog</span>
        </Link>
      </div>
      <nav className="header-nav">
        <Link to="/workout" className={isActive('/workout') ? 'active' : ''}>
          <Dumbbell size={16} />
          Workout
        </Link>
        <Link to="/food" className={isActive('/food') ? 'active' : ''}>
          <Apple size={16} />
          Food
        </Link>
        <Link to="/analytics" className={isActive('/analytics') ? 'active' : ''}>
          <ChartBar size={16} />
          Analytics
        </Link>
      </nav>
      <div className="header-actions">
        <div className="header-user">
          <User size={16} />
          <span>{user.name}</span>
        </div>
        <button
          className="theme-toggle"
          onClick={() => dispatch(toggleTheme())}
          aria-label={`Switch to ${preferences.theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}

export default Header;
