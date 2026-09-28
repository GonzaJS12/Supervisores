import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil } from 'lucide-react';

import type { UsuarioAdmin } from '../../types/usuario';
import { obtenerUsuarios } from '../../services/usuarios.service';
import { obtenerMensajeError } from '../../utils/http-error';
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
} from '../../components/ui/FeedbackBlock';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { RoleBadge, StatusBadge } from '../../components/ui/Badge';
import TableShell, {
  Table,
  THead,
  Th,
  TBody,
  Tr,
  Td,
} from '../../components/ui/TableShell';

export default function UsuariosPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError('');
      const datos = await obtenerUsuarios();
      setUsuarios(datos);
    } catch (err) {
      console.error(err);
      setError(
        obtenerMensajeError(err, 'No se pudieron cargar los usuarios.'),
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Administración de usuarios del sistema."
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/admin/usuarios/nuevo')}
          >
            Nuevo usuario
          </Button>
        }
      />

      {error ? (
        <ErrorBanner
          className="mb-4"
          title="No se pudieron cargar los usuarios"
          message={error}
        />
      ) : null}

      {cargando ? (
        <LoadingState title="Cargando usuarios…" />
      ) : usuarios.length === 0 ? (
        <EmptyState
          title="Sin usuarios"
          message="No hay usuarios registrados."
        />
      ) : (
        <TableShell>
          <Table>
            <THead>
              <tr>
                <Th>Usuario</Th>
                <Th>Email</Th>
                <Th>Rol</Th>
                <Th>Área operativa</Th>
                <Th>Estado</Th>
                <Th align="right">Acciones</Th>
              </tr>
            </THead>
            <TBody>
              {usuarios.map((usuario) => (
                <Tr key={usuario.id}>
                  <Td>
                    <p className="font-medium text-slate-800">
                      {usuario.apellido}, {usuario.nombre}
                    </p>
                  </Td>
                  <Td>{usuario.email}</Td>
                  <Td>
                    <RoleBadge rol={usuario.rol} />
                  </Td>
                  <Td>
                    {usuario.rol === 'SUPERVISOR'
                      ? (usuario.areaOperativa?.nombre ?? 'Sin área')
                      : '—'}
                  </Td>
                  <Td>
                    <StatusBadge activo={usuario.activo} />
                  </Td>
                  <Td align="right">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Pencil className="h-3.5 w-3.5" />}
                      onClick={() =>
                        navigate(`/admin/usuarios/${usuario.id}`)
                      }
                    >
                      Modificar
                    </Button>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </TableShell>
      )}
    </div>
  );
}
