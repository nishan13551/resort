'use client';

import { useState } from 'react';
import { BedSingle } from 'lucide-react';
import { Room, Booking } from '@/lib/types';
import { RoomStatusBadge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Card, CardContent } from '@/components/ui/card';
import { useLang, guestTypeLabel } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function RoomOverview({
  rooms,
  bookings,
}: {
  rooms: Room[];
  bookings: Booking[];
}) {
  const { t, lang, fmtDate, fmtCurrency } = useLang();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <h2 className="mb-3 text-base font-semibold text-slate-800">{t('dash.roomStatusOverview')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {rooms
            .filter(r => r.is_active)
            .map(room => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={cn(
                  'rounded-lg border p-3 text-left transition-all hover:shadow-md',
                  room.status === 'available' && 'border-green-200 bg-green-50 hover:bg-green-100',
                  room.status === 'booked' && 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100',
                  room.status === 'occupied' && 'border-red-300 bg-red-50 hover:bg-red-100'
                )}
              >
                <div className="flex items-center gap-2">
                  <BedSingle className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-800">
                    {room.room_number}
                  </span>
                </div>
                <div className="mt-2">
                  <RoomStatusBadge status={room.status} />
                </div>
                {room.status !== 'available' && room.current_booking && (
                  <div className="mt-2 truncate text-xs text-slate-500">
                    {room.current_booking.guest_name}
                  </div>
                )}
              </button>
            ))}
        </div>
      </CardContent>

      <Modal
        open={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        title={`${t('roomLabel')} ${selectedRoom?.room_number ?? ''}${selectedRoom?.room_name ? ` - ${selectedRoom.room_name}` : ''}`}
        size="lg"
      >
        {selectedRoom && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <RoomStatusBadge status={selectedRoom.status} />
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-600">{t('room.currentGuest')}</h4>
              {selectedRoom.current_booking ? (
                <div className="rounded-lg bg-slate-50 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800">
                      {selectedRoom.current_booking.guest_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {guestTypeLabel(selectedRoom.current_booking.guest_type, lang)}
                    </span>
                  </div>
                  {selectedRoom.current_booking.organization && (
                    <div className="mt-1 text-xs text-slate-500">
                      {selectedRoom.current_booking.organization}
                    </div>
                  )}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-slate-400">{t('checkInLabel')}</div>
                      <div className="font-medium text-slate-700">
                        {fmtDate(selectedRoom.current_booking.check_in_date)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">{t('checkOutLabel')}</div>
                      <div className="font-medium text-slate-700">
                        {fmtDate(selectedRoom.current_booking.check_out_date)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">{t('totalRentLabel')}</div>
                      <div className="font-medium text-emerald-700">
                        {fmtCurrency(selectedRoom.current_booking.total_rent)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">{t('common.status')}</div>
                      <div className="font-medium text-slate-700">
                        {selectedRoom.current_booking.booking_status === 'checked_in'
                          ? t('roomStatus.occupied')
                          : t('roomStatus.booked')}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-400">
                  {t('room.noGuest')}
                </div>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-slate-600">{t('room.bookingHistory')}</h4>
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {bookings
                  .filter(b => b.room_id === selectedRoom.id && b.booking_status !== 'cancelled')
                  .slice(0, 10)
                  .map(b => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs"
                    >
                      <div>
                        <span className="font-medium text-slate-700">{b.guest_name}</span>
                        <span className="ml-2 text-slate-400">
                          {fmtDate(b.check_in_date)} → {fmtDate(b.check_out_date)}
                        </span>
                      </div>
                      <span className="font-semibold text-emerald-700">
                        {fmtCurrency(b.total_rent)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}