import Link from 'next/link';
import { 
  CheckCircle, 
  ArrowRight, 
  BarChart2, 
  Calendar, 
  DollarSign, 
  Dumbbell, 
  MessageSquare, 
  Target 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">SoulDream</span>
            </div>
            <nav className="hidden md:flex space-x-10">
              <a href="#features" className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Características
              </a>
              <a href="#pricing" className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Precios
              </a>
              <a href="#testimonials" className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Testimonios
              </a>
              <a href="#faq" className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                FAQ
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login" 
                className="text-base font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Iniciar sesión
              </Link>
              <Link 
                href="/auth/register" 
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 bg-gradient-to-b from-white to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Tu vida organizada en</span>
              <span className="block text-indigo-600 dark:text-indigo-400">una sola plataforma</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Gestiona tus tareas, hábitos, finanzas, fitness y más con la ayuda de inteligencia artificial. 
              Todo en un solo lugar para optimizar tu productividad y bienestar.
            </p>
            <div className="mt-10 sm:flex sm:justify-center">
              <div className="rounded-md shadow">
                <Link 
                  href="/auth/register" 
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Comenzar gratis
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <a 
                  href="#features" 
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10"
                >
                  Conocer más
                </a>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="max-w-4xl mx-auto">
              <div className="relative shadow-xl rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-emerald-600 opacity-10"></div>
                <img 
                  className="relative rounded-2xl border border-gray-200 dark:border-gray-700" 
                  src="https://placehold.co/1200x600/f8fafc/4f46e5?text=SoulDream+Dashboard&font=montserrat" 
                  alt="SoulDream Dashboard" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">Características</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Todo lo que necesitas para una vida organizada
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
              SoulDream integra todas las herramientas que necesitas para gestionar tu vida diaria de manera eficiente.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-md shadow-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Gestión de tareas</h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Organiza tus tareas con un sistema Kanban intuitivo. Establece prioridades, fechas límite y categorías para mantener todo bajo control.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-emerald-600 rounded-md shadow-lg">
                        <Target className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Seguimiento de hábitos</h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Desarrolla hábitos positivos con nuestro sistema de seguimiento. Mantén rachas, recibe recordatorios y visualiza tu progreso.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-amber-600 rounded-md shadow-lg">
                        <DollarSign className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Gestión financiera</h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Controla tus finanzas con herramientas de seguimiento de gastos, presupuestos y metas de ahorro personalizadas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-md shadow-lg">
                        <Dumbbell className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Seguimiento fitness</h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Registra tus entrenamientos, sigue tu progreso y recibe rutinas personalizadas para alcanzar tus objetivos de salud.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-emerald-600 rounded-md shadow-lg">
                        <Calendar className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Calendario integrado</h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Visualiza todos tus eventos, tareas y hábitos en un calendario unificado. Sincroniza con Google Calendar para mayor comodidad.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="pt-6">
                <div className="flow-root bg-gray-50 dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-amber-600 rounded-md shadow-lg">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Asistente IA</h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Recibe recomendaciones personalizadas, respuestas a tus preguntas y ayuda para optimizar tu productividad con nuestro asistente IA.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 dark:bg-indigo-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">¿Listo para transformar tu vida?</span>
            <span className="block text-indigo-200">Comienza a usar SoulDream hoy mismo.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Comenzar gratis
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-800"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Acerca de
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Blog
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Empleos
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Prensa
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Privacidad
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Términos
              </a>
            </div>
            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                Contacto
              </a>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-500 dark:text-gray-400">
            &copy; 2023 SoulDream. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
