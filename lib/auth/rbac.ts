export type Role = 'sadmin' | 'admin' | 'worker';

export const PERMISSIONS = {
  sadmin: ['*'],
  admin: [
    'sales:read',
    'sales:create',
    'sales:delete',
    'stock:read',
    'stock:create',
    'stock:update',
    'stock:delete',
    'products:read',
    'products:create',
    'products:update',
    'products:delete',
    'customers:read',
    'customers:create',
    'users:read',
    'analytics:read',
    'settings:read',
    'settings:update'
  ],
  worker: [
    'sales:read',
    'sales:create',
    'stock:read',
    'products:read',
    'customers:read'
  ]
};

export function hasPermission(role: Role, permission: string): boolean {
  const rolePermissions = PERMISSIONS[role];
  
  if (rolePermissions.includes('*')) {
    return true;
  }
  
  return rolePermissions.includes(permission);
}

export function canAccessRoute(role: Role, route: string): boolean {
  const routePermissions: Record<string, string> = {
    '/sell/cartons': 'sales:create',
    '/sell/kilos': 'sales:create',
    '/sales/history': 'sales:read',
    '/stock': 'stock:read',
    '/stock/add': 'stock:create',
    '/products': 'products:read',
    '/customers': 'customers:read',
    '/users': 'users:read',
    '/users/signup': 'users:create',
    '/analytics': 'analytics:read',
    '/settings': 'settings:read'
  };

  const requiredPermission = routePermissions[route];
  if (!requiredPermission) return true;
  
  return hasPermission(role, requiredPermission);
}
