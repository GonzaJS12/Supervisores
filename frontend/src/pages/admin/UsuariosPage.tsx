import {
  useEffect,
  useState,
} from 'react';

import type {
  UsuarioAdmin,
} from '../../types/usuario';

import {
  obtenerUsuarios,
} from '../../services/usuarios.service';
import {
  useNavigate,
} from 'react-router-dom';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] =
    useState<UsuarioAdmin[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios =
    async () => {
      try {
        setCargando(true);
        setError('');

        const datos =
          await obtenerUsuarios();

        setUsuarios(datos);
      } catch (error) {
        console.error(error);

        setError(
          'No se pudieron cargar los usuarios.',
        );
      } finally {
        setCargando(false);
      }
    };
    const navigate = useNavigate();

  return (
    <div>

      {/* ENCABEZADO */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Usuarios
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Administración de usuarios del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/admin/usuarios/nuevo',
            )
          }
          className="self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:self-auto"
        >
          Nuevo usuario
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TABLA */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {cargando ? (

          <div className="p-8 text-center text-slate-500">
            Cargando usuarios...
          </div>

        ) : usuarios.length === 0 ? (

          <div className="p-8 text-center text-slate-500">
            No hay usuarios registrados.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Usuario
                  </th>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Email
                  </th>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Rol
                  </th>

                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Estado
                  </th>

                  <th className="px-6 py-4 text-right font-semibold text-slate-600">
                    Acciones
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {usuarios.map(
                  (usuario) => (

                    <tr
                      key={usuario.id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <p className="font-medium text-slate-800">
                          {usuario.apellido},{' '}
                          {usuario.nombre}
                        </p>

                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {usuario.email}
                      </td>

                      <td className="px-6 py-4">

                        <RolBadge
                          rol={usuario.rol}
                        />

                      </td>

                      <td className="px-6 py-4">

                        {usuario.activo ? (

                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Activo
                          </span>

                        ) : (

                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            Inactivo
                          </span>

                        )}

                      </td>

                      <td className="px-6 py-4 text-right">

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/usuarios/${usuario.id}`,
                            )
                          }
                          className="font-medium text-blue-600 transition hover:text-blue-800"
                        >
                        Ver
                        </button>

                      </td>

                    </tr>

                  ),
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

function RolBadge({
  rol,
}: {
  rol: string;
}) {
  if (rol === 'ADMIN') {
    return (
      <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        Administrador
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
      Supervisor
    </span>
  );
}