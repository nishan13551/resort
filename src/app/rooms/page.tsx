'use client';

import { useState } from 'react';
import { Plus, Pencil, Power } from 'lucide-react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { RequireAuth } from '@/components/layout/auth-guard';
import { useAuth } from '@/lib/auth-provider';
import { useData } from '@/lib/data-provider';
import { useRoomsWithStatus } from '@/lib/use-dashboard-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Badge, RoomStatusBadge } from '@/components/ui/badge';
import { Input, FormLabel, FormGroup } from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { useLang, guestTypeLabel, bookingStatusLabel } from '@/lib/i18n';

export default function RoomsPage() {
  const { hasRole } = useAuth();
  const { bookings, addRoom, updateRoom } = useData();
  const rooms = useRoomsWithStatus();
  const { showToast } = useToast();
  const { t, lang, fmtDate, fmtCurrency } = useLang();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomName, setRoomName] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const canManage = hasRole('admin', 'caretaker');

  function openAddModal() {
    setEditingRoom(null);
    setRoomNumber('');
    setRoomName('');
    setModalOpen(true);
  }

  function openEditModal(id: string) {
    const room = rooms.find(r => r.id === id);
    if (!room) return;
    setEditingRoom(id);
    setRoomNumber(room.room_number);
    setRoomName(room.room_name);
    setModalOpen(true);
  }

  function handleSave() {
    if (!roomNumber.trim()) {
      showToast(t('room.roomNumberRequired'), 'error');
      return;
    }
    if (editingRoom) {
      updateRoom(editingRoom, { room_number: roomNumber.trim(), room_name: roomName.trim() });
      showToast(t('room.updated'));
    } else {
      addRoom({ room_number: roomNumber.trim(), room_name: roomName.trim() || `${t('roomLabel')} ${roomNumber.trim()}`, is_active: true });
      showToast(t('room.added'));
    }
    setModalOpen(false);
  }

  function toggleRoomStatus(id: string) {
    const room = rooms.find(r => r.id === id);
    if (!room) return;
    updateRoom(id, { is_active: !room.is_active });
    showToast(room.is_active ? t('room.deactivated') : t('room.activated'));
  }

  const selectedRoomData = rooms.find(r => r.id === selectedRoom);
  const selectedBookings = bookings.filter(b => b.room_id === selectedRoom);

  return (
    <RequireAuth>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{t('title.rooms')}</h2>
              <p className="text-sm text-slate-500">{t('nav.rooms')}</p>
            </div>
            {canManage && (
              <Button onClick={openAddModal}>
                <Plus className="h-4 w-4" />
                {t('room.addRoom')}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rooms.map(room => {
              const bookingCount = bookings.filter(b => b.room_id === room.id && b.booking_status !== 'cancelled').length;
              return (
                <Card key={room.id} className={!room.is_active ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-lg font-bold text-slate-800">{room.room_number}</div>
                        <div className="text-xs text-slate-500">{room.room_name}</div>
                      </div>
                      <RoomStatusBadge status={room.status} />
                    </div>

                    <div className="mt-3">
                      {room.current_booking ? (
                        <div className="rounded-lg bg-slate-50 p-3">
                          <div className="text-sm font-medium text-slate-700">{room.current_booking.guest_name}</div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {guestTypeLabel(room.current_booking.guest_type, lang)}
                            {room.current_booking.organization ? ` • ${room.current_booking.organization}` : ''}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {fmtDate(room.current_booking.check_in_date)} → {fmtDate(room.current_booking.check_out_date)}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-400">
                          {t('noActiveBookingLabel')}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <Badge tone="slate">{t('room.bookingsCount', { n: bookingCount })}</Badge>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => setSelectedRoom(room.id)}>
                          {t('common.history')}
                        </Button>
                        {canManage && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(room.id)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toggleRoomStatus(room.id)}>
                              <Power className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingRoom ? t('room.editRoom') : t('room.newRoom')}>
            <div className="space-y-4">
              <FormGroup>
                <FormLabel>{t('room.roomNumber2')}</FormLabel>
                <Input value={roomNumber} onChange={e => setRoomNumber(e.target.value)} placeholder={t('room.exampleNumber')} />
              </FormGroup>
              <FormGroup>
                <FormLabel>{t('room.roomName2')}</FormLabel>
                <Input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder={t('room.exampleName')} />
              </FormGroup>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
                <Button onClick={handleSave}>{t('common.save')}</Button>
              </div>
            </div>
          </Modal>

          <Modal
            open={!!selectedRoom}
            onClose={() => setSelectedRoom(null)}
            title={`${t('roomLabel')} ${selectedRoomData?.room_number ?? ''} - ${t('common.history')}`}
            size="lg"
          >
            <div className="space-y-3">
              {selectedBookings.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">{t('room.noBookings')}</p>
              ) : (
                selectedBookings.map(b => (
                  <div key={b.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-800">{b.guest_name}</span>
                      <Badge tone={b.booking_status === 'checked_in' ? 'red' : b.booking_status === 'booked' ? 'yellow' : 'green'}>
                        {bookingStatusLabel(b.booking_status, lang)}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>{fmtDate(b.check_in_date)} → {fmtDate(b.check_out_date)}</span>
                      <span>{b.number_of_days} {t('ci.days')}</span>
                      <span className="font-medium text-emerald-700">{fmtCurrency(b.total_rent)}</span>
                      {b.due_amount > 0 && <span className="text-red-600">{t('dueLabel')}: {fmtCurrency(b.due_amount)}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Modal>
        </div>
      </DashboardLayout>
    </RequireAuth>
  );
}