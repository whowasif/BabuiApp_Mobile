import React, { useState } from 'react';
import { Dialog, Tab, Transition } from '@headlessui/react';
import { XMarkIcon, LockClosedIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { supabase } from '../utils/supabaseClient';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [loginInput, setLoginInput] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let loginEmail = loginInput;

    // If the input is not an email, treat it as a phone number
    if (!loginInput.includes('@')) {
      // Query the users table for the email associated with this phone number
      const { data, error: lookupError } = await supabase
        .from('users')
        .select('email')
        .eq('phone', loginInput)
        .single();

      if (lookupError || !data) {
        setLoading(false);
        setError('No user found with this phone number.');
        return;
      }
      loginEmail = data.email;
    }

    // Now try to sign in with the resolved email
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      onClose();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!name) {
      setError('Name is required');
      setLoading(false);
      return;
    }
    if (!gender) {
      setError('Gender is required');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          gender,
        },
      },
    });
    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }
    // Insert user profile into 'users' table
    const user = data.user;
    if (user) {
      const { error: dbError } = await supabase.from('users').insert([
        {
          id: user.id,
          name_en: name,
          email: email,
          phone: phone,
          gender: gender,
        },
      ]);
      setLoading(false);
      if (dbError) {
        setError(dbError.message);
        return;
      }
      onClose();
    } else {
      setLoading(false);
      setError('Sign up succeeded but user info is missing.');
    }
  };

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                    {selectedIndex === 0 ? 'Sign In' : 'Sign Up'}
                  </Dialog.Title>
                  <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
                <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                  <Tab.List className="flex space-x-2 rounded-xl bg-gray-100 p-1 mb-6">
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full py-2.5 text-sm leading-5 font-medium rounded-lg',
                          selected ? 'bg-white shadow text-amber-600' : 'text-gray-500 hover:bg-white/[0.12]'
                        )
                      }
                    >
                      <span className="flex items-center gap-1"><LockClosedIcon className="h-5 w-5" /> Sign In</span>
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          'w-full py-2.5 text-sm leading-5 font-medium rounded-lg',
                          selected ? 'bg-white shadow text-amber-600' : 'text-gray-500 hover:bg-white/[0.12]'
                        )
                      }
                    >
                      <span className="flex items-center gap-1"><UserPlusIcon className="h-5 w-5" /> Sign Up</span>
                    </Tab>
                  </Tab.List>
                  <Tab.Panels>
                    <Tab.Panel>
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email or Phone</label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            value={loginInput}
                            onChange={e => setLoginInput(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Password</label>
                          <input
                            type="password"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <button
                          type="submit"
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                          disabled={loading}
                        >
                          {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                      </form>
                    </Tab.Panel>
                    <Tab.Panel>
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Phone Number <span className='text-xs text-gray-400'>(optional)</span></label>
                          <input
                            type="tel"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Gender</label>
                          <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            value={gender}
                            onChange={e => setGender(e.target.value)}
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Password</label>
                          <input
                            type="password"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                          <input
                            type="password"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <button
                          type="submit"
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                          disabled={loading}
                        >
                          {loading ? 'Signing up...' : 'Sign Up'}
                        </button>
                      </form>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default AuthModal; 