import { RolUsuario } from '@prisma/client';
import { buildAdminUpsertData } from './seed-admin.util';

describe('buildAdminUpsertData', () => {
  it('incluye passwordHash en create y en update', () => {
    const data = buildAdminUpsertData({
      email: 'admin@supervision.local',
      passwordHash: 'hash-sincronizado',
    });

    expect(data.where).toEqual({ email: 'admin@supervision.local' });
    expect(data.create.passwordHash).toBe('hash-sincronizado');
    expect(data.update.passwordHash).toBe('hash-sincronizado');
    expect(data.create.rol).toBe(RolUsuario.ADMIN);
    expect(data.update.rol).toBe(RolUsuario.ADMIN);
    expect(data.create).not.toHaveProperty('password');
    expect(data.update).not.toHaveProperty('password');
  });
});
