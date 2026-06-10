import { format, parseISO } from 'date-fns';

export function formatDateLabel(dateString) {
  return format(parseISO(dateString), 'EEE, dd MMM yyyy');
}

export function formatShortDate(dateString) {
  return format(parseISO(dateString), 'dd MMM');
}

export function formatTimeLabel(timeString = '') {
  const [hours = '0', minutes = '0'] = timeString.split(':');
  const clockTime = new Date(2000, 0, 1, Number(hours), Number(minutes));
  return format(clockTime, 'hh:mm a');
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}
