/**
 * Formatting utilities for Dominion City Asaba Information Desk
 */

export function formatNaira(amount: number): string {
  if (isNaN(amount)) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount).replace('NGN', '₦');
}

export function formatCompactNaira(amount: number): string {
  if (isNaN(amount)) return '₦0';
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₦${(amount / 1_000).toFixed(0)}K`;
  }
  return `₦${amount}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
