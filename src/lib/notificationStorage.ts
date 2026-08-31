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

export const getNotifications = (): AppNotification[] => {
  if (typeof window === 'undefined') return [];

  let assessmentResult: any = null;
  try {
    const storedAss = localStorage.getItem('statpath_assessment_results');
    if (storedAss) assessmentResult = JSON.parse(storedAss);
  } catch (e) {
    console.error(e);
  }

  const initialNotifs: AppNotification[] = [
    assessmentResult
      ? {
          id: 'n1',
          type: 'assessment',
          title: 'Baseline Assessment Verified',
          message: `Your adaptive baseline assessment score (${assessmentResult.score}%) has been recorded and your verified competency profile is active.`,
          timestamp: assessmentResult.completedAt || new Date().toISOString(),
          read: true,
          actionUrl: '/dashboard'
        }
      : {
          id: 'n1',
          type: 'assessment',
          title: 'Baseline Assessment Mandatory',
          message: 'Welcome to StatPath AI! Please complete your mandatory 15-minute adaptive baseline assessment to access your official dashboard.',
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

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNotifs));
      return initialNotifs;
    }
    const parsed: AppNotification[] = JSON.parse(data);

    // Synchronize n1 with assessment completion state if completed!
    if (assessmentResult) {
      const n1Idx = parsed.findIndex(n => n.id === 'n1');
      if (n1Idx >= 0) {
        parsed[n1Idx] = {
          id: 'n1',
          type: 'assessment',
          title: 'Baseline Assessment Verified',
          message: `Your adaptive baseline assessment score (${assessmentResult.score}%) has been recorded and your verified competency profile is active.`,
          timestamp: assessmentResult.completedAt || new Date().toISOString(),
          read: true,
          actionUrl: '/dashboard'
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    }
    return parsed;
  } catch (e) {
    return initialNotifs;
  }
};

export const markAllNotificationsRead = (): AppNotification[] => {
  if (typeof window === 'undefined') return [];
  try {
    const notifs = getNotifications();
    const updated = notifs.map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('statpath_notifications_updated'));
    return updated;
  } catch (e) {
    return [];
  }
};

export const markNotificationRead = (id: string): AppNotification[] => {
  if (typeof window === 'undefined') return [];
  try {
    const notifs = getNotifications();
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('statpath_notifications_updated'));
    return updated;
  } catch (e) {
    return [];
  }
};
