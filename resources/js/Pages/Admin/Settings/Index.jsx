import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ settings }) {
    const [activeGroup, setActiveGroup] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [toast, setToast] = useState(null);

    // Flatten settings into a form-friendly structure
    const initialValues = {};
    Object.values(settings || {}).flat().forEach((setting) => {
        initialValues[setting.key] = setting.value ?? '';
    });

    const { data, setData, put, errors } = useForm({
        settings: Object.entries(initialValues).map(([key, value]) => ({ key, value })),
    });

    // Get group keys
    const groups = Object.keys(settings || {});

    // Set default active group
    React.useEffect(() => {
        if (!activeGroup && groups.length > 0) {
            setActiveGroup(groups[0]);
        }
    }, [groups, activeGroup]);

    // Update a single setting value
    const updateValue = (key, value) => {
        const updated = data.settings.map((item) =>
            item.key === key ? { ...item, value } : item
        );
        setData('settings', updated);
    };

    // Get value for a key
    const getValue = (key) => {
        const found = data.settings.find((item) => item.key === key);
        return found ? found.value : '';
    };

    // Handle submit
    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        put(route('admin.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setToast({ type: 'success', message: 'Settings saved successfully.' });
                setTimeout(() => setToast(null), 4000);
            },
            onError: () => {
                setToast({ type: 'error', message: 'Failed to save settings. Please try again.' });
                setTimeout(() => setToast(null), 4000);
            },
            onFinish: () => setProcessing(false),
        });
    };

    // Reset to saved values
    const handleReset = () => {
        setData('settings', Object.entries(initialValues).map(([key, value]) => ({ key, value })));
    };

    // Get group label
    const getGroupLabel = (group) => {
        return group
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    };

    // Get group icon
    const getGroupIcon = (group) => {
        const icons = {
            general: '⚙️',
            site: '🌐',
            email: '📧',
            social: '🔗',
            seo: '🔍',
            analytics: '📊',
            payment: '💳',
            notification: '🔔',
            security: '🔒',
            appearance: '🎨',
        };
        return icons[group] || '📋';
    };

    // Detect input type based on key/value
    const getInputType = (key, value) => {
        if (key.includes('email')) return 'email';
        if (key.includes('url') || key.includes('link')) return 'url';
        if (key.includes('password') || key.includes('secret')) return 'password';
        if (key.includes('number') || key.includes('count')) return 'number';
        if (key.includes('date')) return 'date';
        if (typeof value === 'boolean' || value === '1' || value === '0') return 'toggle';
        if (key.includes('description') || key.includes('content') || key.includes('about')) return 'textarea';
        return 'text';
    };

    // Format key to label
    const formatLabel = (key) => {
        const parts = key.split('.');
        const name = parts[parts.length - 1];
        return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const activeSettings = activeGroup ? settings[activeGroup] || [] : [];

    return (
        <div className="space-y-6 pb-12">
            <Head title="System Settings" />

            {/* TOAST */}
            {toast && (
                <div
                    className={`fixed top-20 right-4 z-50 max-w-sm w-full p-4 rounded-xl border shadow-lg animate-in slide-in-from-top-2 duration-300 ${
                        toast.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            {toast.type === 'success' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => setToast(null)}
                            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        System Settings
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Configure your platform's global settings and preferences.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all hover:text-white"
                    >
                        Reset Changes
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl border border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* SIDEBAR - Groups */}
                <aside className="lg:col-span-1">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sticky top-24">
                        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Settings Groups
                        </div>
                        <nav className="space-y-1">
                            {groups.length > 0 ? (
                                groups.map((group) => {
                                    const count = settings[group]?.length || 0;
                                    const active = activeGroup === group;
                                    return (
                                        <button
                                            key={group}
                                            onClick={() => setActiveGroup(group)}
                                            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                                                active
                                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`text-base transition-transform group-hover:scale-110 ${active ? 'opacity-100' : 'opacity-70'}`}>
                                                    {getGroupIcon(group)}
                                                </span>
                                                <span className="truncate">{getGroupLabel(group)}</span>
                                            </div>
                                            {count > 0 && (
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                                    active ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                                                }`}>
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="px-3 py-4 text-xs text-slate-500 text-center">
                                    No settings groups found.
                                </p>
                            )}
                        </nav>
                    </div>
                </aside>

                {/* MAIN CONTENT - Settings Form */}
                <main className="lg:col-span-3">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {activeGroup && activeSettings.length > 0 ? (
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
                                {/* Group Header */}
                                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{getGroupIcon(activeGroup)}</span>
                                        <div>
                                            <h2 className="text-sm font-bold text-white">
                                                {getGroupLabel(activeGroup)}
                                            </h2>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                {activeSettings.length} {activeSettings.length === 1 ? 'setting' : 'settings'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Settings Fields */}
                                <div className="divide-y divide-slate-800/80">
                                    {activeSettings.map((setting) => {
                                        const inputType = getInputType(setting.key, setting.value);
                                        const value = getValue(setting.key);

                                        return (
                                            <div
                                                key={setting.key}
                                                className="px-6 py-5 hover:bg-slate-800/20 transition"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                                    {/* Label */}
                                                    <div className="md:col-span-1">
                                                        <label className="text-xs font-semibold text-slate-200 block">
                                                            {formatLabel(setting.key)}
                                                        </label>
                                                        <p className="text-[10px] text-slate-500 font-mono mt-1 truncate" title={setting.key}>
                                                            {setting.key}
                                                        </p>
                                                    </div>

                                                    {/* Input */}
                                                    <div className="md:col-span-2">
                                                        {inputType === 'textarea' ? (
                                                            <textarea
                                                                value={value}
                                                                onChange={(e) => updateValue(setting.key, e.target.value)}
                                                                rows={4}
                                                                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-600 resize-y"
                                                                placeholder={`Enter ${formatLabel(setting.key).toLowerCase()}...`}
                                                            />
                                                        ) : inputType === 'toggle' ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => updateValue(setting.key, value === '1' ? '0' : '1')}
                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                                    value === '1' ? 'bg-amber-500' : 'bg-slate-700'
                                                                }`}
                                                            >
                                                                <span
                                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                                        value === '1' ? 'translate-x-6' : 'translate-x-1'
                                                                    }`}
                                                                />
                                                            </button>
                                                        ) : (
                                                            <input
                                                                type={inputType}
                                                                value={value}
                                                                onChange={(e) => updateValue(setting.key, e.target.value)}
                                                                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-600"
                                                                placeholder={`Enter ${formatLabel(setting.key).toLowerCase()}...`}
                                                            />
                                                        )}

                                                        {errors[`settings.${setting.key}`] && (
                                                            <p className="text-rose-400 text-[10px] mt-1">
                                                                {errors[`settings.${setting.key}`]}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center">
                                <div className="text-5xl mb-4">⚙️</div>
                                <p className="text-sm font-semibold text-slate-400">
                                    No settings available
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {groups.length === 0
                                        ? 'Settings will appear here once they are added to the database.'
                                        : 'Select a settings group from the sidebar.'}
                                </p>
                            </div>
                        )}

                        {/* Bottom Action Bar */}
                        {activeGroup && activeSettings.length > 0 && (
                            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                                <p className="text-xs text-slate-500">
                                    Changes will be applied after clicking Save.
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all hover:text-white"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl border border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </main>
            </div>

            {/* Info Box */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        ℹ️
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">About System Settings</h3>
                        <ul className="mt-2 space-y-1 text-xs text-slate-400">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>Settings are organized by groups. Select a group from the sidebar to view and edit.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>Changes are not applied until you click <strong className="text-white">Save Changes</strong>.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>Use the <strong className="text-white">Reset</strong> button to discard unsaved changes.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Persistent Inertia Layout Assignment
Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;