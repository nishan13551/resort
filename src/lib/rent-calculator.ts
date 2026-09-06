import { GuestType } from './types';
import { GUEST_TYPE_RATES } from './constants';

export function getDailyRate(guestType: GuestType): number {
  return GUEST_TYPE_RATES[guestType];
}

export function calculateTotalRent(guestType: GuestType, numberOfDays: number): number {
  const dailyRate = getDailyRate(guestType);
  return dailyRate * numberOfDays;
}

export function calculateDueAmount(totalRent: number, amountPaid: number): number {
  return Math.max(totalRent - amountPaid, 0);
}
