import React, { useState, useEffect } from 'react';
import { FiHome, FiPlayCircle, FiClock, FiEdit, FiBookOpen, FiCheckCircle } from 'react-icons/fi';
import { FiTrendingUp, FiLayers, FiActivity, FiFileText } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [activeComponent, setActiveComponent] = useState('welcome');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const localStorageName = localStorage.getItem('username') || currentUser?.name;

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Toggle dark/light mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Update active component based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') {
      setActiveComponent('welcome');
    } else if (path.includes('/starttest')) {
      setActiveComponent('test');
    } else if (path.includes('/history')) {
      setActiveComponent('history');
    } else if (path.includes('/create')) {
      setActiveComponent('create');
    } else if (path.includes('/my-questions')) {
      setActiveComponent('my-questions');
    } else if (path.includes('/attempted-questions')) {
      setActiveComponent('attempted-questions');
    }
  }, [location.pathname]);

  const handleNavClick = (component, path) => {
    setActiveComponent(component);
    navigate(path);
  };

  const renderWelcome = () => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Welcome, {currentUser?.name || localStorageName || 'User'} 👋</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Select an option from the navigation bar to begin.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => handleNavClick('test', '/dashboard/starttest')}
          className="bg-gradient-to-br from-green-200 to-green-400 dark:from-green-700 dark:to-green-900 p-6 rounded-2xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer"
        >
          <FiTrendingUp className="text-3xl text-green-800 dark:text-green-300 mb-2" />
          <h2 className="text-2xl font-bold text-green-900 dark:text-green-200 mb-1">Step 1</h2>
          <p className="text-green-800 dark:text-green-300 text-sm">Start your journey with core fundamentals</p>
        </div>
        <div 
          onClick={() => handleNavClick('test', '/dashboard/starttest')}
          className="bg-gradient-to-br from-blue-200 to-blue-400 dark:from-blue-700 dark:to-blue-900 p-6 rounded-2xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer"
        >
          <FiLayers className="text-3xl text-blue-800 dark:text-blue-300 mb-2" />
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-1">Step 2</h2>
          <p className="text-blue-800 dark:text-blue-300 text-sm">Build deeper understanding with systems-based questions</p>
        </div>
        <div 
          onClick={() => handleNavClick('test', '/dashboard/starttest')}
          className="bg-gradient-to-br from-purple-200 to-purple-400 dark:from-purple-700 dark:to-purple-900 p-6 rounded-2xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer"
        >
          <FiActivity className="text-3xl text-purple-800 dark:text-purple-300 mb-2" />
          <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-200 mb-1">Step 3</h2>
          <p className="text-purple-800 dark:text-purple-300 text-sm">Tackle real-world clinical cases and scenarios</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => handleNavClick('test', '/dashboard/starttest')}
          className="bg-gradient-to-br from-teal-200 to-teal-400 dark:from-teal-700 dark:to-teal-900 p-6 rounded-2xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer"
        >
          <FiFileText className="text-3xl text-teal-800 dark:text-teal-300 mb-2" />
          <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-200 mb-1">Take a Test</h2>
          <p className="text-teal-800 dark:text-teal-300 text-sm">Start a custom test with selected questions.</p>
        </div>
        <div 
          onClick={() => handleNavClick('history', '/dashboard/history')}
          className="bg-gradient-to-br from-yellow-200 to-yellow-400 dark:from-yellow-700 dark:to-yellow-900 p-6 rounded-2xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer"
        >
          <FiClock className="text-3xl text-yellow-800 dark:text-yellow-300 mb-2" />
          <h2 className="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mb-1">Test History</h2>
          <p className="text-yellow-800 dark:text-yellow-300 text-sm">View your previous test results and performance.</p>
        </div>
        <div 
          onClick={() => handleNavClick('create', '/dashboard/create')}
          className="bg-gradient-to-br from-pink-200 to-pink-400 dark:from-pink-700 dark:to-pink-900 p-6 rounded-2xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer"
        >
          <FiEdit className="text-3xl text-pink-800 dark:text-pink-300 mb-2" />
          <h2 className="text-2xl font-bold text-pink-900 dark:text-pink-200 mb-1">Create Question</h2>
          <p className="text-pink-800 dark:text-pink-300 text-sm">Contribute by creating new test questions.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div 
          onClick={() => handleNavClick('my-questions', '/dashboard/my-questions')}
          className="bg-gradient-to-br from-indigo-200 to-indigo-400 dark:from-indigo-700 dark:to-indigo-900 p-8 rounded-2xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer"
        >
          <FiBookOpen className="text-4xl text-indigo-800 dark:text-indigo-300 mb-3" />
          <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200 mb-2">My Created Questions</h2>
          <p className="text-indigo-800 dark:text-indigo-300 text-sm">View and manage all the questions you've created for the platform.</p>
        </div>
        <div 
          onClick={() => handleNavClick('attempted-questions', '/dashboard/attempted-questions')}
          className="bg-gradient-to-br from-orange-200 to-orange-400 dark:from-orange-700 dark:to-orange-900 p-8 rounded-2xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer"
        >
          <FiCheckCircle className="text-4xl text-orange-800 dark:text-orange-300 mb-3" />
          <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-200 mb-2">My Attempted Questions</h2>
          <p className="text-orange-800 dark:text-orange-300 text-sm">Review all questions you've attempted with detailed analysis.</p>
        </div>
      </div>
    </div>
  );

  const shouldShowWelcome = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-blue-900 dark:bg-blue-950 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-extrabold tracking-wide">Synapaxon</h1>
            <div className="flex items-center gap-3">
              <nav className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => handleNavClick('welcome', '/dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-transform transform hover:scale-105 ${
                    activeComponent === 'welcome'
                      ? 'bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-300 font-semibold shadow'
                      : 'bg-blue-700 dark:bg-blue-800 hover:bg-blue-600 dark:hover:bg-blue-700 text-white'
                  }`}
                >
                  <FiHome className="text-lg" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavClick('test', '/dashboard/starttest')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-transform transform hover:scale-105 ${
                    activeComponent === 'test'
                      ? 'bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-300 font-semibold shadow'
                      : 'bg-blue-700 dark:bg-blue-800 hover:bg-blue-600 dark:hover:bg-blue-700 text-white'
                  }`}
                >
                  <FiPlayCircle className="text-lg" />
                  Start Test
                </button>
                <button
                  onClick={() => handleNavClick('history', '/dashboard/history')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-transform transform hover:scale-105 ${
                    activeComponent === 'history'
                      ? 'bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-300 font-semibold shadow'
                      : 'bg-blue-700 dark:bg-blue-800 hover:bg-blue-600 dark:hover:bg-blue-700 text-white'
                  }`}
                >
                  <FiClock className="text-lg" />
                  Test History
                </button>
                <button
                  onClick={() => handleNavClick('create', '/dashboard/create')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-transform transform hover:scale-105 ${
                    activeComponent === 'create'
                      ? 'bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-300 font-semibold shadow'
                      : 'bg-blue-700 dark:bg-blue-800 hover:bg-blue-600 dark:hover:bg-blue-700 text-white'
                  }`}
                >
                  <FiEdit className="text-lg" />
                  Create Question
                </button>
                <button
                  onClick={() => handleNavClick('my-questions', '/dashboard/my-questions')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-transform transform hover:scale-105 ${
                    activeComponent === 'my-questions'
                      ? 'bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-300 font-semibold shadow'
                      : 'bg-blue-700 dark:bg-blue-800 hover:bg-blue-600 dark:hover:bg-blue-700 text-white'
                  }`}
                >
                  <FiBookOpen className="text-lg" />
                  My Questions
                </button>
                <button
                  onClick={() => handleNavClick('attempted-questions', '/dashboard/attempted-questions')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-transform transform hover:scale-105 ${
                    activeComponent === 'attempted-questions'
                      ? 'bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-300 font-semibold shadow'
                      : 'bg-blue-700 dark:bg-blue-800 hover:bg-blue-600 dark:hover:bg-blue-700 text-white'
                  }`}
                >
                  <FiCheckCircle className="text-lg" />
                  Attempted
                </button>
              </nav>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-block w-12 h-6 rounded-full transition-all duration-300 bg-gradient-to-r ${
                  isDarkMode
                    ? 'from-gray-200 to-gray-800 bg-right'
                    : 'from-gray-200 to-gray-800 bg-left'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 bg-gradient-to-r ${
                    isDarkMode
                      ? 'left-[calc(100%-1.25rem-0.125rem)] from-gray-200 to-gray-800 bg-left'
                      : 'left-0.5 from-gray-200 to-gray-800 bg-right'
                  }`}
                ></span>
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-500 transition shadow"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        {shouldShowWelcome ? renderWelcome() : <Outlet />}
      </div>
    </div>
  );
}

export default Dashboard;