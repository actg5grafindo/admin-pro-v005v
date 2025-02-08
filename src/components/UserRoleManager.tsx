import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Profile, UserRole } from '@/types/user';

interface UserRoleManagerProps {
  user: Profile;
  onRoleUpdate?: () => void;
}

export const UserRoleManager = ({ user, onRoleUpdate }: UserRoleManagerProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { hasRole, updateUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [isUpdating, setIsUpdating] = useState(false);

  // Only show roles that the current user can assign
  const availableRoles: UserRole[] = hasRole('superadmin')
    ? ['superadmin', 'admin', 'user']
    : hasRole('admin')
    ? ['user']
    : [];

  const handleRoleUpdate = async () => {
    if (selectedRole === user.role) return;

    setIsUpdating(true);
    const success = await updateUserRole(user.id, selectedRole);

    if (success) {
      toast({
        title: t('Success'),
        description: t('User role updated successfully'),
      });
      onRoleUpdate?.();
    } else {
      toast({
        title: t('Error'),
        description: t('Failed to update user role'),
        variant: 'destructive',
      });
    }
    setIsUpdating(false);
  };

  if (availableRoles.length === 0) return null;

  return (
    <div className="flex items-center gap-4">
      <Select
        value={selectedRole}
        onValueChange={(value) => setSelectedRole(value as UserRole)}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('Select role')} />
        </SelectTrigger>
        <SelectContent>
          {availableRoles.map((role) => (
            <SelectItem key={role} value={role}>
              {t(`roles.${role}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        onClick={handleRoleUpdate}
        disabled={selectedRole === user.role || isUpdating}
        size="sm"
      >
        {t('Update Role')}
      </Button>
    </div>
  );
};
