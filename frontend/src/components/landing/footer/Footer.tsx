import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Github,
  Youtube
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 py-12">
          {/* Logo y descripción */}
          <div className="col-span-2">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">SoulDream</span>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Plataforma all-in-one para gestión personal: metas, hábitos, finanzas, fitness y más. 
              Potenciada por inteligencia artificial para optimizar tu productividad y bienestar.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <span className="sr-only">YouTube</span>
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Producto</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Características
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Precios
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Guías
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  API
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Empresa</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Acerca de
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Empleo
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Prensa
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Términos
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Cookies
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Licencias
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Soporte</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Centro de ayuda
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Comunidad
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Tutoriales
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Línea separadora */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} SoulDream. Todos los derechos reservados.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                Mapa del sitio
              </a>
              <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                Accesibilidad
              </a>
              <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                Preferencias de cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 