import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DatabaseService } from '../services/databaseService';
import { QueryService } from '../services/queryService';
import type { Database, Query } from '../types/models';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State - Databases
  const [databases, setDatabases] = useState<Database[]>([]);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<number | null>(null);
  const [selectedDatabaseToEdit, setSelectedDatabaseToEdit] = useState<Database | null>(null);

  // State - Queries
  const [queries, setQueries] = useState<Query[]>([]);
  const [generatedQuery, setGeneratedQuery] = useState('');

  // State - Forms
  const [createDBForm, setCreateDBForm] = useState({ name: '', description: '', sqlSchema: '' });
  const [editDBForm, setEditDBForm] = useState({ name: '', description: '', sqlSchema: '' });
  const [queryForm, setQueryForm] = useState({ description: '' });

  // State - UI Control
  const [showCreateDB, setShowCreateDB] = useState(false);
  const [showEditDB, setShowEditDB] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingDB, setIsCreatingDB] = useState(false);
  const [isEditingDB, setIsEditingDB] = useState(false);
  const [isDeletingDB, setIsDeletingDB] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const databaseService = new DatabaseService();
  const queryService = new QueryService();

  // Load databases on mount
  useEffect(() => {
    loadDatabases();
  }, []);

  // Load queries when database changes
  useEffect(() => {
    if (selectedDatabaseId) {
      loadQueries();
      setGeneratedQuery('');
      setQueryForm({ description: '' });
    }
  }, [selectedDatabaseId]);

  /**
   * Load all databases
   */
  const loadDatabases = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await databaseService.getAll();
      if (response.success) {
        const dbs = response.data || [];
        setDatabases(dbs);
        if (dbs.length > 0 && !selectedDatabaseId) {
          setSelectedDatabaseId(dbs[0].id);
        }
      } else {
        setErrorMessage(response.message || 'Error al cargar las bases de datos');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load queries for selected database
   */
  const loadQueries = async () => {
    if (!selectedDatabaseId) return;
    try {
      const response = await queryService.getAll(selectedDatabaseId);
      if (response.success) {
        setQueries(response.data || []);
      }
    } catch (err) {
      console.error('Error loading queries:', err);
    }
  };

  /**
   * Create database
   */
  const handleCreateDatabase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validations
    if (!createDBForm.name || createDBForm.name.length < 3) {
      setErrorMessage('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (!createDBForm.description || createDBForm.description.length < 10) {
      setErrorMessage('La descripción debe tener al menos 10 caracteres');
      return;
    }
    if (!createDBForm.sqlSchema || createDBForm.sqlSchema.length < 20) {
      setErrorMessage('El esquema SQL debe tener al menos 20 caracteres');
      return;
    }

    setIsCreatingDB(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await databaseService.create(
        createDBForm.name,
        createDBForm.description,
        createDBForm.sqlSchema
      );

      if (response.success) {
        setSuccessMessage('Base de datos creada exitosamente');
        setCreateDBForm({ name: '', description: '', sqlSchema: '' });
        setShowCreateDB(false);
        await loadDatabases();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.message || 'Error al crear la base de datos');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error al crear la base de datos');
    } finally {
      setIsCreatingDB(false);
    }
  };

  /**
   * Start edit database
   */
  const handleStartEditDatabase = async (dbId: number | null) => {
    if (!dbId) return;

    const db = databases.find(d => d.id === dbId);
    if (!db) {
      try {
        const response = await databaseService.getById(dbId);
        if (response.success && response.data) {
          setSelectedDatabaseToEdit(response.data);
          setEditDBForm({
            name: response.data.name,
            description: response.data.description,
            sqlSchema: response.data.sqlSchema
          });
        }
      } catch (err) {
        setErrorMessage('Error al cargar la base de datos');
      }
    } else {
      setSelectedDatabaseToEdit(db);
      setEditDBForm({
        name: db.name,
        description: db.description,
        sqlSchema: db.sqlSchema
      });
    }
    setShowEditDB(true);
  };

  /**
   * Edit database
   */
  const handleEditDatabase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedDatabaseToEdit) return;
    if (!editDBForm.name || editDBForm.name.length < 3) {
      setErrorMessage('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (!editDBForm.description || editDBForm.description.length < 10) {
      setErrorMessage('La descripción debe tener al menos 10 caracteres');
      return;
    }
    if (!editDBForm.sqlSchema || editDBForm.sqlSchema.length < 20) {
      setErrorMessage('El esquema SQL debe tener al menos 20 caracteres');
      return;
    }

    setIsEditingDB(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await databaseService.update(
        selectedDatabaseToEdit.id,
        editDBForm.name,
        editDBForm.description,
        editDBForm.sqlSchema
      );

      if (response.success) {
        setSuccessMessage('Base de datos actualizada exitosamente');
        setShowEditDB(false);
        setSelectedDatabaseToEdit(null);
        setEditDBForm({ name: '', description: '', sqlSchema: '' });
        await loadDatabases();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.message || 'Error al actualizar la base de datos');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error al actualizar la base de datos');
    } finally {
      setIsEditingDB(false);
    }
  };

  /**
   * Delete database
   */
  const handleDeleteDatabase = async (dbId: number) => {
    if (!window.confirm('¿Estás seguro? Se eliminarán también todas sus consultas.')) {
      return;
    }

    setIsDeletingDB(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // First delete all queries associated with this database
      const queriesToDelete = queries.filter(q => q.databaseId === dbId);
      for (const query of queriesToDelete) {
        await queryService.delete(query.id);
      }

      // Then delete the database
      const response = await databaseService.delete(dbId);
      if (response.success) {
        setSuccessMessage('Base de datos eliminada exitosamente');
        if (selectedDatabaseId === dbId) {
          setSelectedDatabaseId(null);
          setGeneratedQuery('');
          setQueryForm({ description: '' });
          setQueries([]);
        }
        await loadDatabases();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.message || 'Error al eliminar la base de datos');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error al eliminar la base de datos');
    } finally {
      setIsDeletingDB(false);
    }
  };

  /**
   * Generate query
   */
  const handleGenerateQuery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!queryForm.description || queryForm.description.length < 10) {
      setErrorMessage('La descripción debe tener al menos 10 caracteres');
      return;
    }
    if (!selectedDatabaseId) {
      setErrorMessage('Selecciona una base de datos primero');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await queryService.generate(selectedDatabaseId, queryForm.description);
      if (response.success && response.data) {
        setGeneratedQuery(response.data.generatedSql);
        setSuccessMessage('Query generada exitosamente');
        await loadQueries();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.message || 'Error al generar la consulta');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error al generar la consulta');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Select query from history
   */
  const handleSelectQuery = (query: Query) => {
    setQueryForm({ description: query.description });
    setGeneratedQuery(query.generatedSql);
  };

  /**
   * Delete query
   */
  const handleDeleteQuery = async (queryId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta consulta?')) {
      return;
    }

    try {
      const response = await queryService.delete(queryId);
      if (response.success) {
        setSuccessMessage('Query eliminada');
        await loadQueries();
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    } catch (err) {
      setErrorMessage('Error al eliminar la consulta');
    }
  };

  /**
   * Copy to clipboard
   */
  const handleCopyToClipboard = async () => {
    if (!generatedQuery) return;
    try {
      await navigator.clipboard.writeText(generatedQuery);
      setSuccessMessage('Query copiada al portapapeles');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch {
      setErrorMessage('Error al copiar la query');
    }
  };

  /**
   * Reset form
   */
  const handleResetForm = () => {
    setQueryForm({ description: '' });
    setGeneratedQuery('');
    setErrorMessage('');
  };

  /**
   * Logout
   */
  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="bg-gray-900 shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Query Builder AI
            </h1>
            <p className="text-gray-400 mt-1">
              Bienvenido, <span className="text-cyan-400 font-semibold">{user?.name}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow-lg"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Alerts */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-950 border border-green-900 text-green-300 rounded-lg shadow-lg animate-in fade-in">
            ✓ {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-950 border border-red-900 text-red-300 rounded-lg shadow-lg animate-in fade-in">
            ✕ {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 mt-4">Cargando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Left Panel - Generator */}
            <div className="col-span-2 space-y-6">
              {/* Database Selector Card */}
              <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800 hover:border-gray-700 transition">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Bases de Datos</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCreateDB(!showCreateDB)}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition shadow-md"
                    >
                      ➕ Crear BD
                    </button>
                    <button
                      onClick={() => handleStartEditDatabase(selectedDatabaseId)}
                      disabled={!selectedDatabaseId}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition shadow-md"
                    >
                      ✎ Editar
                    </button>
                    <button
                      onClick={() => selectedDatabaseId && handleDeleteDatabase(selectedDatabaseId)}
                      disabled={!selectedDatabaseId || isDeletingDB}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition shadow-md"
                    >
                      {isDeletingDB ? '⏳...' : '🗑️'}
                    </button>
                  </div>
                </div>

                <select
                  value={selectedDatabaseId || ''}
                  onChange={(e) => setSelectedDatabaseId(e.target.value ? Number(e.target.value) : null)}
                  disabled={databases.length === 0}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 transition"
                >
                  <option value="">-- Selecciona una BD --</option>
                  {databases.map((db) => (
                    <option key={db.id} value={db.id}>
                      {db.name}
                    </option>
                  ))}
                </select>

                {databases.length === 0 && (
                  <div className="mt-4 p-4 bg-blue-950 border border-blue-900 text-blue-300 rounded-lg">
                    ℹ️ No tienes bases de datos. Crea una para empezar.
                  </div>
                )}
              </div>

              {/* Create Database Form */}
              {showCreateDB && (
                <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800 border-l-4 border-l-cyan-500">
                  <h3 className="text-xl font-semibold text-white mb-4">Crear Nueva Base de Datos</h3>
                  <form onSubmit={handleCreateDatabase} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                      <input
                        type="text"
                        value={createDBForm.name}
                        onChange={(e) => setCreateDBForm({ ...createDBForm, name: e.target.value })}
                        placeholder="Nombre de la BD"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                      <textarea
                        value={createDBForm.description}
                        onChange={(e) => setCreateDBForm({ ...createDBForm, description: e.target.value })}
                        placeholder="Descripción clara de la BD"
                        rows={2}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">SQL Schema</label>
                      <textarea
                        value={createDBForm.sqlSchema}
                        onChange={(e) => setCreateDBForm({ ...createDBForm, sqlSchema: e.target.value })}
                        placeholder="CREATE TABLE..."
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm transition"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isCreatingDB}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold py-2 rounded-lg transition shadow-md"
                      >
                        {isCreatingDB ? 'Creando...' : 'Crear'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateDB(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit Database Form */}
              {showEditDB && (
                <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800 border-l-4 border-l-indigo-500">
                  <h3 className="text-xl font-semibold text-white mb-4">Editar Base de Datos</h3>
                  <form onSubmit={handleEditDatabase} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                      <input
                        type="text"
                        value={editDBForm.name}
                        onChange={(e) => setEditDBForm({ ...editDBForm, name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                      <textarea
                        value={editDBForm.description}
                        onChange={(e) => setEditDBForm({ ...editDBForm, description: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">SQL Schema</label>
                      <textarea
                        value={editDBForm.sqlSchema}
                        onChange={(e) => setEditDBForm({ ...editDBForm, sqlSchema: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isEditingDB}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold py-2 rounded-lg transition shadow-md"
                      >
                        {isEditingDB ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEditDB(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Query Generator Form */}
              {selectedDatabaseId && (
                <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800 hover:border-gray-700 transition">
                  <h3 className="text-xl font-semibold text-white mb-4">Describe tu Consulta</h3>
                  <form onSubmit={handleGenerateQuery} className="space-y-4">
                    <div>
                      <textarea
                        value={queryForm.description}
                        onChange={(e) => setQueryForm({ description: e.target.value })}
                        placeholder="Ejemplo: Dame todos los usuarios con más de 5 pedidos..."
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 text-white font-semibold py-2 rounded-lg transition shadow-md"
                      >
                        {isGenerating ? '⏳ Generando...' : '✨ Generar Query'}
                      </button>
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
                      >
                        Limpiar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Generated Query Display */}
              {generatedQuery && (
                <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800 border-l-4 border-l-green-500">
                  <h3 className="text-xl font-semibold text-white mb-4">Query Generada</h3>
                  <pre className="bg-gray-950 text-green-400 p-4 rounded-lg overflow-auto text-sm mb-4 border border-gray-800">
                    {generatedQuery}
                  </pre>
                  <button
                    onClick={handleCopyToClipboard}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-2 rounded-lg transition shadow-md"
                  >
                    📋 Copiar
                  </button>
                </div>
              )}
            </div>

            {/* Right Panel - History */}
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800 h-fit hover:border-gray-700 transition">
              <h3 className="text-xl font-semibold text-white mb-4">📜 Historial</h3>

              {!queries || queries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Sin consultas aún</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {queries.slice(0, 15).map((query) => (
                    <div
                      key={query.id}
                      onClick={() => handleSelectQuery(query)}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        generatedQuery === query.generatedSql
                          ? 'bg-cyan-900 border-l-4 border-cyan-400 text-cyan-100'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-l-4 border-gray-700'
                      }`}
                    >
                      <p className="text-sm font-medium truncate">
                        {query.description.substring(0, 50)}...
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(query.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuery(query.id);
                          }}
                          className="text-red-500 hover:text-red-400 text-xs font-semibold transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  {queries.length > 15 && (
                    <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-700">
                      +{queries.length - 15} más
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
