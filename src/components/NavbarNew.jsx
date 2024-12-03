import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              UniVends
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
            >
              Accueil
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
