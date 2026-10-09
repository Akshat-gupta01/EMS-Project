
export const hasPermission=(userPermissions=[],requiredPermission,userRole='')=>{

      // 1. Agar user Admin hai, toh hamesha TRUE (sab dikhega)
     if (userRole?.toLowerCase() === 'admin') return true;

      // 2. Agar permission list me exist karta hai
  return userPermissions.includes(requiredPermission);
};

