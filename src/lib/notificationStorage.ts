export interface AppNotification {
  id: string;
  type: 'new_course' | 'revision' | 'career' | 'achievement' | 'assessment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const STORAGE_KEY = 'statpath_user_notifications';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'assessment',
    title: 'Baseline Assessment Ready',
    message: 'Welcome to StatPath AI! Please complete your 15-minute adaptive baseline assessment to generate your baseline competency twin.',
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl: '/onboarding/assessment'
  },
  {
    id: 'n2',
    type: 'new_course',
    title: 'iGOT Karmayogi Pathway Matched',
    message: 'Sequential course pathways from the official iGOT Karmayogi catalog have been assigned to your division profile.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    actionUrl: '/dashboard/learn'
  },
  {
    id: 'n3',
    type: 'career',
    title: 'Career Simulator Configured',
    message: 'Simulate target officer roles and benchmark competency requirements for career progression in MoSPI.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    actionUrl: '/dashboard/career'
  }
];

export const getNotifications = (): AppNotification[] => {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
  }
};

export const markAllNotificationsRead = (): AppNotification[] => {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const notifs = getNotifications();
    const updated = notifs.map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('statpath_notifications_updated'));
    return updated;
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
  }
};

export const markNotificationRead = (id: string): AppNotification[] => {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const notifs = getNotifications();
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('statpath_notifications_updated'));
    return updated;
  } catch (e) {
    return INITIAL_NOTIFICATIONS;
  }
};
