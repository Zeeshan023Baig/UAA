import { useState } from 'react';
import { Lock } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Hardcoded credentials as requested by user
        // Ideally this should be handled by Firebase Auth, but using this for simple protection
        if (email === 'unitedassociates.official@gmail.com' && password === 'United14@chennai') {
            onLogin();
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-md bg-[#1e293b] border border-white/10 p-8 rounded-xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-[#38bdf8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6 text-[#38bdf8]" />
                    </div>
                    <h2 className="text-2xl font-serif text-white">Admin Access</h2>
                    <p className="text-white/40 text-sm mt-2">Please enter your credentials</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-[#38bdf8] focus:outline-none transition-colors"
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-[#38bdf8] focus:outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-xs text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-[#38bdf8] text-primary font-bold py-3 rounded-sm hover:bg-white transition-colors uppercase tracking-widest text-xs"
                    >
                        Login
                    </button>
                    <p className="text-white/20 text-[10px] text-center mt-4">
                        United Associates Agencies
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
