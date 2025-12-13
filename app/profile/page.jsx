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
        <div className="p-6 max-w-md">
            <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-sm">First name</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm">Last name</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm">KIIT Email</label>
                    <input name="kiitEmail" value={form.kiitEmail} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm">Phone number</label>
                    <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm">WhatsApp number</label>
                    <input name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>

                <div className="flex space-x-2">
                    <button type="submit" disabled={saving} className="px-3 py-2 bg-indigo-600 text-white rounded">
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={() => router.push('/dashboard')} className="px-3 py-2 border rounded">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
