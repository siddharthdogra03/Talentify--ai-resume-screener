import React from 'react';
import { User, Shield, ArrowLeft, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AccountSettingsPage: React.FC = () => {
    const { user, logout, setCurrentPage } = useApp();

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => setCurrentPage('dashboard')}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                                <p className="text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                        <section>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User size={20} className="text-blue-600" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Full Name</label>
                                    <div className="font-medium text-gray-900">{user?.name || 'Not set'}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Email Address</label>
                                    <div className="font-medium text-gray-900">{user?.email}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Role</label>
                                    <div className="font-medium text-gray-900 capitalize">{user?.role || 'User'}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Department</label>
                                    <div className="font-medium text-gray-900">{user?.department || 'Not set'}</div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        <section>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield size={20} className="text-purple-600" />
                                Security
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <div className="font-medium text-gray-900">Password</div>
                                        <div className="text-sm text-gray-500">Last changed: Never</div>
                                    </div>
                                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                        Change Password
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                                        <div className="text-sm text-gray-500">Add an extra layer of security</div>
                                    </div>
                                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                        Enable
                                    </button>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        <div className="pt-2">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
                            >
                                <LogOut size={20} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettingsPage;
