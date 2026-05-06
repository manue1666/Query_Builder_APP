import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  /**
   * Manejar cambios en los inputs del formulario
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  /**
   * Manejar el envío del formulario
   */
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;

      if (isLogin) {
        response = await login(form.email, form.password);
      } else {
        response = await register(form.name, form.email, form.password);
      }

      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.message || 'Error en la autenticación');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle entre Login y Register
   */
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setForm({ email: '', password: '', name: '' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Grid background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml?utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect fill=%22%23111827%22 width=%2260%22 height=%2260%22/><path d=%22M0 0h60v60H0z%22 fill=%22none%22 stroke=%22%23374151%22 stroke-width=%22.5%22/></svg>')] opacity-30"></div>
      </div>

      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800 relative z-10">
        {/* Gradient accent */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-75"></div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
          {isLogin ? 'Inicia sesión con tus credenciales' : 'Únete a Query Builder AI'}
        </p>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-950 border border-red-900 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Name (solo registro) */}
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="Juan Pérez"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                required={!isLogin}
              />
            </div>
          )}

          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              required
            />
          </div>

          {/* Campo Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              required
            />
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg"
          >
            {isLoading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-500">O</span>
          </div>
        </div>

        {/* Toggle Login/Register */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-3">
            {isLogin ? '¿No tienes cuenta aún?' : '¿Ya tienes cuenta?'}
          </p>
          <button
            onClick={toggleMode}
            className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition underline underline-offset-2"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
