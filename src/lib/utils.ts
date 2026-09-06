import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString('bn-BD')}`;
}

export function formatCurrencyEN(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  return `${day} ${months[month - 1]}, ${year}`;
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  const d = new Date(date);
  const s = new Date(start);
  const e = new Date(end);
  return d >= s && d <= e;
}

export function datesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  return s1 < e2 && s2 < e1;
}

export function calculateDays(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(days, 1);
}

export function getToday(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function getMonthStart(): string {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
}

export function getMonthEnd(): string {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
}

export function getWeekStart(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(today.getFullYear(), today.getMonth(), diff).toISOString().split('T')[0];
}

export function getWeekEnd(): string {
  const start = new Date(getWeekStart());
  start.setDate(start.getDate() + 6);
  return start.toISOString().split('T')[0];
}

export function toCSVRow(values: (string | number)[]): string {
  return values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
}
