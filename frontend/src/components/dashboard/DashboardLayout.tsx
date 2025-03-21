import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  BarChart2, 
  DollarSign, 
  Dumbbell, 
  MessageSquare, 
  Settings, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  LogOut,
  User,
  Target,
  CheckCircle2,
  Bot,
  Sparkles,
  Activity,
  Timer,
  ListTodo,
  Bookmark,
  BarChart3
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useStore();
  const { user, signOut } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  return (
    <div className={`h-screen flex ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        `}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6 px-2">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">SoulDream</span>
            </Link>
            <button 
              onClick={toggleSidebar}
              className="md:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2"
            >
              <X size={20} />
            </button>
          </div>
          
          <ul className="space-y-2 font-medium">
            <li>
              <Link 
                href="/dashboard" 
                className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <Home className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                <span className="ml-3">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/tasks" 
                className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <CheckSquare className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                <span className="ml-3">Tareas</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/habits" 
                className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <CheckCircle2 className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                <span className="ml-3">Hábitos</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/goals" 
                className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <Target className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                <span className="ml-3">Metas</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/calendar" 
                className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                <span className="ml-3">Calendario</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/finance" 
                className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                <span className="ml-3">Finanzas</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/ai-assistant" 
                className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                <span className="ml-3">Asistente IA</span>
              </Link>
            </li>
            <li>
              <div className="flex flex-col">
                <button 
                  onClick={() => toggleSubmenu('workout')}
                  className="flex items-center justify-between w-full p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <div className="flex items-center">
                    <Dumbbell className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                    <span className="ml-3">Workout</span>
                  </div>
                  <svg className={`w-3 h-3 transform ${openSubmenu === 'workout' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {openSubmenu === 'workout' && (
                  <ul className="pl-4 mt-1 space-y-1">
                    <li>
                      <Link 
                        href="/dashboard/workout" 
                        className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                      >
                        <Activity className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                        <span className="ml-3">Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/dashboard/workout/tracker" 
                        className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                      >
                        <Timer className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                        <span className="ml-3">Rastreador</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/dashboard/workout?view=list" 
                        className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                      >
                        <ListTodo className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                        <span className="ml-3">Mis Entrenamientos</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/dashboard/workout?view=templates" 
                        className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                      >
                        <Bookmark className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                        <span className="ml-3">Plantillas</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/dashboard/workout?view=stats" 
                        className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                      >
                        <BarChart3 className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                        <span className="ml-3">Estadísticas</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            </li>
            <li>
              <Link 
                href="/dashboard/analytics" 
                className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              >
                <BarChart2 className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                <span className="ml-3">Analítica</span>
              </Link>
            </li>
          </ul>
          
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <ul className="space-y-2 font-medium">
              <li>
                <Link 
                  href="/dashboard/profile" 
                  className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <User className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  <span className="ml-3">Mi Perfil</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/settings" 
                  className="flex items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  <span className="ml-3">Configuración</span>
                </Link>
              </li>
              <li>
                <button 
                  onClick={toggleTheme}
                  className="flex w-full items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  )}
                  <span className="ml-3">{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={signOut}
                  className="flex w-full items-center p-2 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                  <span className="ml-3">Cerrar sesión</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 flex justify-between items-center">
            <button 
              onClick={toggleSidebar}
              className="md:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2"
            >
              <Menu size={20} />
            </button>
            
            <div className="flex items-center">
              {user && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.email}
                  </span>
                  <Link href="/dashboard/profile">
                    <div className="relative w-8 h-8 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 cursor-pointer hover:ring-2 hover:ring-indigo-500">
                      <svg className="absolute w-10 h-10 text-gray-400 -left-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
} 