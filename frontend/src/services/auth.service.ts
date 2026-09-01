import { api } from './api';
import type { LoginRequest, LoginResponse } from '../types/auth';

export const login = async (
  datos: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    '/auth/login',
    datos,
  );

  return response.data;
};