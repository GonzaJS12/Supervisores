import { RolUsuario } from '@prisma/client';

export type AdminUpsertInput = {
  email: string;
  passwordHash: string;
};

/**
 * Datos de upsert del administrador del seed.
 * Si SEED_ADMIN_PASSWORD está definida, el hash debe ir tanto en create como en update
 * para que re-ejecutar el seed sincronice la contraseña.
 */
export function buildAdminUpsertData(input: AdminUpsertInput) {
  const perfil = {
    nombre: 'Administrador',
    apellido: 'Sistema',
    rol: RolUsuario.ADMIN,
    activo: true,
  };

  return {
    where: {
      email: input.email,
    },
    update: {
      ...perfil,
      passwordHash: input.passwordHash,
    },
    create: {
      ...perfil,
      email: input.email,
      passwordHash: input.passwordHash,
    },
  };
}
