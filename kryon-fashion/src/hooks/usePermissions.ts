import { useMemo } from 'react';

export const usePermissions = (user: any) => {
  const permissions: string[] = useMemo(() => user?.permissoes || [], [user]);

  const hasPermission = (key: string) => {
    // Admin tem acesso total sempre
    if (user?.perfis?.nome === 'Administrador' || user?.perfis?.nome === 'Admin') {
      return true;
    }
    return permissions.includes(key);
  };

  const isBlocked = user?.lojas?.status === 'BLOQUEADA';

  return { permissions, hasPermission, isBlocked };
};
