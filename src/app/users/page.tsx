'use client';

import { useState } from 'react';
import { Plus, Pencil, Power, Shield, ShieldCheck, Eye } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { RequireAuth } from '@/components/layout/auth-guard';
import { useAuth } from '@/lib/auth-provider';
import { useData } from '@/lib/data-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Input, Select, FormLabel, FormGroup } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { useLang, roleLabel } from '@/lib/i18n';
import { UserRole } from '@/lib/types';

const roleIcon = {
  admin: ShieldCheck,
  caretaker: Shield,
  viewer: Eye,
};

const roleTone: Record<UserRole, 'slate' | 'green' | 'blue' | 'yellow'> = {
  admin: 'slate',
  caretaker: 'blue',
  viewer: 'green',
};

export default function UsersPage() {
  const { currentUser, users, addUser, updateUser } = useAuth();
  const { bookings } = useData();
  const { showToast } = useToast();
  const { t, lang, fmtDateTime } = useLang();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('caretaker');
  const [password, setPassword] = useState('');

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <RequireAuth>
        <DashboardLayout>
          <Card>
            <CardContent className="py-16 text-center">
              <div className="text-5xl">🔒</div>
              <h2 className="mt-4 text-lg font-semibold text-slate-800">{t('common.permissionDenied')}</h2>
              <p className="mt-2 text-sm text-slate-500">{t('user.adminOnly')}</p>
            </CardContent>
          </Card>
        </DashboardLayout>
      </RequireAuth>
    );
  }

  function openAdd() {
    setEditingId(null);
    setFullName('');
    setEmail('');
    setRole('caretaker');
    setPassword('');
    setModalOpen(true);
  }

  function openEdit(id: string) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    setEditingId(id);
    setFullName(user.full_name);
    setEmail(user.email);
    setRole(user.role);
    setPassword('');
    setModalOpen(true);
  }

  function handleSave() {
    if (!fullName.trim() || !email.trim()) {
      showToast(t('user.nameRequired'), 'error');
      return;
    }
    if (editingId) {
      updateUser(editingId, { full_name: fullName.trim(), email: email.trim(), role, password: password || undefined });
      showToast(t('user.updated'));
    } else {
      addUser({ full_name: fullName.trim(), email: email.trim(), role, is_active: true }, password);
      showToast(t('user.added'));
    }
    setModalOpen(false);
  }

  function toggleActive(id: string) {
    const user = users.find(u => u.id === id);
    if (!user) return;
    updateUser(id, { is_active: !user.is_active });
    showToast(user.is_active ? t('user.deactivated') : t('user.activated'));
  }

  return (
    <RequireAuth>
      <DashboardLayout>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{t('user.title')}</h2>
              <p className="text-sm text-slate-500">{t('user.subtitle')}</p>
            </div>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" />
              {t('user.add')}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {users.map(user => {
              const Icon = roleIcon[user.role];
              const bookingCount = bookings.filter(b => b.created_by === user.id).length;
              return (
                <Card key={user.id} className={!user.is_active ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{user.full_name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge tone={roleTone[user.role]}>
                          <Icon className="h-3 w-3" />
                          {roleLabel(user.role, lang)}
                        </Badge>
                        <Badge tone={user.is_active ? 'green' : 'slate'}>
                          {user.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      <span>{t('user.bookingsCreated', { n: bookingCount })}</span>
                      <span>{t('user.addedDate')} {fmtDateTime(user.created_at)}</span>
                    </div>

                    <div className="mt-3 flex justify-end gap-1">
                      <Button variant="outline" size="sm" onClick={() => openEdit(user.id)}>
                        <Pencil className="h-3.5 w-3.5" />
                        {t('common.edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(user.id)}
                        title={user.is_active ? t('common.inactive') : t('common.active')}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? t('user.edit') : t('user.new')}>
          <div className="space-y-4">
            <FormGroup>
              <FormLabel>{t('user.fullName')} *</FormLabel>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t('user.fullName')} />
            </FormGroup>
            <FormGroup>
              <FormLabel>{t('user.email')} *</FormLabel>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@email.com" />
            </FormGroup>
            <FormGroup>
              <FormLabel>{t('user.role')}</FormLabel>
              <Select value={role} onChange={e => setRole(e.target.value as UserRole)}>
                <option value="admin">{roleLabel('admin', lang)}</option>
                <option value="caretaker">{roleLabel('caretaker', lang)}</option>
                <option value="viewer">{roleLabel('viewer', lang)}</option>
              </Select>
            </FormGroup>
            {!editingId && (
              <FormGroup>
                <FormLabel>{t('user.password')}</FormLabel>
                <Input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('user.passwordPlaceholder')} />
              </FormGroup>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleSave}>{t('common.save')}</Button>
            </div>
          </div>
        </Modal>
      </DashboardLayout>
    </RequireAuth>
  );
}