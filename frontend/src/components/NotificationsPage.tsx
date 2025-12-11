import React from 'react';
import { Bell, Check, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

const NotificationsPage: React.FC = () => {
    const { notifications, markNotificationAsRead, markAllNotificationsAsRead, setCurrentPage } = useApp();

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setCurrentPage('dashboard')}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    </div>
                    <button
                        onClick={() => markAllNotificationsAsRead()}
                        disabled={!notifications.some(n => !n.read)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${notifications.some(n => !n.read)
                                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Check size={18} />
                        Mark all as read
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                            <p className="text-gray-500 mt-2">You're all caught up! Check back later for updates.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-6 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className={`text-base ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                                    {new Date(notification.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mt-1">{notification.message}</p>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markNotificationAsRead(notification.id)}
                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-3"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
