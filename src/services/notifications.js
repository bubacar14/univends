import { getDatabase, ref, onValue, push, set, query, orderByChild, equalTo } from 'firebase/database';
import { app } from '../config/firebase';

const db = getDatabase(app);

export const notificationsService = {
  // S'abonner aux notifications
  subscribeToNotifications: (userId, callback) => {
    const notificationsRef = ref(db, `notifications/${userId}`);
    return onValue(notificationsRef, (snapshot) => {
      const notifications = [];
      snapshot.forEach((child) => {
        notifications.push({
          id: child.key,
          ...child.val()
        });
      });
      callback(notifications.reverse());
    });
  },

  // Créer une nouvelle notification
  createNotification: async (userId, notification) => {
    const notificationsRef = ref(db, `notifications/${userId}`);
    const newNotificationRef = push(notificationsRef);
    await set(newNotificationRef, {
      ...notification,
      timestamp: Date.now(),
      read: false
    });
  },

  // Marquer une notification comme lue
  markAsRead: async (userId, notificationId) => {
    const notificationRef = ref(db, `notifications/${userId}/${notificationId}`);
    await set(notificationRef, { read: true });
  },

  // Supprimer une notification
  deleteNotification: async (userId, notificationId) => {
    const notificationRef = ref(db, `notifications/${userId}/${notificationId}`);
    await set(notificationRef, null);
  }
};
