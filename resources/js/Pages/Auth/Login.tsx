import Checkbox from '@/Components/UI/Checkbox';
import InputError from '@/Components/UI/InputError';
import InputLabel from '@/Components/UI/InputLabel';
import PrimaryButton from '@/Components/UI/PrimaryButton';
import TextInput from '@/Components/UI/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({ status, canResetPassword }: { status?: string; canResetPassword?: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
                <p className="mt-2 text-sm text-slate-400">
                    Sign in to access your study planner
                </p>
            </div>

            {status && (
                <div className="mb-4 font-medium text-sm text-brand-400 bg-brand-500/10 p-3 rounded-lg border border-brand-500/20">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-slate-300" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full bg-surface-900/50 border-surface-700 text-slate-200 focus:border-brand-500 focus:ring-brand-500 placeholder-slate-600"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="you@example.com"
                    />
                    <InputError message={errors.email} className="mt-2 text-rose-400" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-slate-300" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full bg-surface-900/50 border-surface-700 text-slate-200 focus:border-brand-500 focus:ring-brand-500 placeholder-slate-600"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} className="mt-2 text-rose-400" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="bg-surface-900 border-surface-700 text-brand-500 focus:ring-brand-500 rounded"
                        />
                        <span className="ms-2 text-sm text-slate-400">Remember me</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-slate-400 hover:text-brand-400 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center bg-brand-600 hover:bg-brand-500 focus:bg-brand-500 active:bg-brand-700 text-white shadow-neon border-0" disabled={processing}>
                        {processing ? 'Signing in...' : 'Sign in'}
                    </PrimaryButton>
                </div>

                <div className="text-center text-sm text-slate-500 mt-6">
                    Don't have an account?{' '}
                    <Link
                        href={route('register')}
                        className="font-medium text-brand-400 hover:text-brand-300 transition-colors"
                    >
                        Sign up for free
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
