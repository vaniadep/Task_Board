import { useEffect, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import Board from './components/Board';

type Theme = 'dark' | 'light';

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('taskboard-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('taskboard-theme', theme);
  }, [theme]);

  return (
    <div className="appShell" data-theme={theme}>
      <header className="appHeader">
        <h1>Task <span>Board</span></h1>
        <p>Ваше пространство для продуктивной работы</p>
      </header>
      <Board />
      <button
        type="button"
        className="themeToggle"
        onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
        aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
        title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      >
        {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        <span>{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>
      </button>
    </div>
  );
}

export default App;
