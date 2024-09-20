import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { register as registerUser } from '../../services/api';

const Register = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await registerUser(data);
      navigate('/login'); 
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-5">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">Name</label>
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Name is required' })}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block mb-1">Email</label>
          <input
            type="email"
            id="email"
            {...register('email', { required: 'Email is required', pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Invalid email address',
            }})}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">Password</label>
          <input
            type="password"
            id="password"
            {...register('password', { required: 'Password is required', minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            }})}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block mb-1">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: (val) => {
                if (watch('password') != val) {
                  return "Your passwords do not match";
                }
              },
            })}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button 
          type="submit" 
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;