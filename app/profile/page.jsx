"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [form, setForm] = React.useState({});

    React.useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                const res = await fetch('/api/user');
                if (res.ok) {
                    const data = await res.json();
                    if (mounted) {
                        setUser(data.user);
                        setForm({
                            firstName: data.user.firstName || '',
                            lastName: data.user.lastName || '',
                            kiitEmail: data.user.kiitEmail || '',
                            phoneNumber: data.user.phoneNumber || '',
                            whatsappNumber: data.user.whatsappNumber || '',
                        });
                    }
                } else {
                    router.push('/login');
                }
            } catch (err) {
                console.error('Failed to load user', err);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => (mounted = false);
    }, [router]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/user', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                alert('Profile updated');
                router.push('/dashboard');
            } else {
                const err = await res.json().catch(() => null);
                alert(err?.error || 'Failed to update');
            }
        } catch (err) {
            console.error('Update error', err);
            alert('Failed to update');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;

    return (
        <div className="min-h-screen flex items-start justify-center py-10 px-4">
            <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6 md:flex md:items-start md:space-x-6">
                    {/* Avatar column */}
                    <div className="shrink-0 flex items-center justify-center mb-4 md:mb-0">
                        <div className="w-24 h-24 rounded-full border-2 border-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-700 bg-gray-50">
                            {((form.firstName || user?.firstName || "").charAt(0) + (form.lastName || user?.lastName || "").charAt(0)).toUpperCase() || 'U'}
                        </div>
                    </div>

                    {/* Form column */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl text-gray-600 font-bold">Edit profile</h1>
                            <div className="text-sm text-gray-500">Roll: <span className="font-medium text-gray-700">{user?.rollNumber}</span></div>
                        </div>

                        <p className="mt-2 text-sm text-gray-600">Update your personal details. Changes will be saved to your account.</p>

                        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600">First name</label>
                                <input name="firstName" value={form.firstName} onChange={handleChange} className="mt-1 block text-gray-600 w-full rounded-md border-gray-200 p-2 focus:ring-2 focus:ring-indigo-400" required />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600">Last name</label>
                                <input name="lastName" value={form.lastName} onChange={handleChange} className="mt-1 block text-gray-600 w-full rounded-md border-gray-200 p-2 focus:ring-2 focus:ring-indigo-400" required />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600">KIIT Email</label>
                                <input name="kiitEmail" value={form.kiitEmail} onChange={handleChange} className="mt-1 block text-gray-600 w-full rounded-md border-gray-200 p-2 bg-gray-50" />
                                <p className="text-xs text-gray-500 mt-1">We use this email to send OTP and updates.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600">Phone number</label>
                                <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="mt-1 block text-gray-600 w-full rounded-md border-gray-200 p-2 focus:ring-2 focus:ring-indigo-400" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600">WhatsApp number</label>
                                <input name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} className="mt-1 block w-full rounded-md text-gray-600 border-gray-200 p-2 focus:ring-2 focus:ring-indigo-400" />
                            </div>

                            <div className="md:col-span-2 flex items-center space-x-3 mt-2">
                                <button type="submit" disabled={saving} className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700">
                                    {saving ? 'Saving...' : 'Save changes'}
                                </button>
                                <button type="button" onClick={() => router.push('/dashboard')} className="px-4 py-2 border rounded-md text-sm text-gray-700">Cancel</button>
                                {saving === false && <div className="ml-3 text-sm text-green-600">{user && !saving ? '' : ''}</div>}
                            </div>

                            {/** success / error messages */}
                            <div className="md:col-span-2">
                                {/* placeholder for inline alerts handled by browser alerts already */}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
