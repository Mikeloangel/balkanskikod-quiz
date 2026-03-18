export const DONATE_URL = import.meta.env.VITE_TELEGRAM_DONATE_URL?.trim() || '';
export const isDonateEnabled = (): boolean => DONATE_URL.length > 0;
