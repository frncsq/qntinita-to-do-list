import { useState } from 'react'
import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');

	const API_URL = import.meta.env.VITE_API_URL; 

	const handleLogin = async () => {
		try {
			const response = await axios.post(`${API_URL}/login`, {
				username: username,
				password: password
			});
			
			if (response.data.success) {
				setMessage('Login successful!');
				setMessageType('success');
				setTimeout(() => {
					navigate('/home');
				}, 500);
			}
			else {
				setMessage(response.data.message);
				setMessageType('error');
			}
		} catch (error) {
			if (error.response?.status === 401) {
				setMessage('Invalid login credentials');
				setMessageType('error');
			} else {
				setMessage('Invalid credentials.');
				setMessageType('error');
			}
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-blue-140 py-10 px-3 sm:px-5 lg:px-7">
            <div className="max-w-sm w-full bg-pink-100 shadow-lg rounded-lg overflow-hidden">

				<div className="p-6 md:p-8">
					<h2 className="text-2xl font-semibold mb-6 text-center text-pink-800">LOGIN</h2>
					<h3 className="text-sm font-large text-pink-600 text-center mb-6">Sign in to your account</h3>
					{message && (
						<div className={`mb-6 p-4 rounded-lg text-center font-medium ${
							messageType === 'success' 
								? 'bg-green-100 text-green-800 border border-green-300' 
								: 'bg-red-100 text-red-800 border border-red-300'
						}`}>
							{message}
						</div>
					)}
					<form className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">Username</label>
							<input type="text" 
							value={username} 
							onChange={(e) => setUsername(e.target.value)} required 
							placeholder='Andong sa imong tanan'
							className="mt-1 block w-full px-4 py-2 border border-pink-200 rounded-lg placeholder-pink-280 focus:outline-none focus:ring-2 focus:ring-pink-500" />
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Password</label>
							<input type="password" 
							value ={password}
							onChange={(e) => setPassword(e.target.value)} required
							placeholder='secret'
							 className="mt-1 block w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
						</div>

						<div className="flex items-center justify-between text-sm">
							<label className="flex items-center">
								<input type="checkbox" className="h-4 w-4 text-pink-600 border-pink-300 rounded" />
								<span className="ml-2 text-pink-600">Remember me</span>
							</label>
							<a href="#" className="text-pink-600 hover:underline">Forgot password?</a>
						</div>

						<div>
							<button type="button" onClick={handleLogin} className="w-full py-2 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-800 transition">Sign in</button>
						</div>
					</form>

					<div className="mt-6 text-center">
					<p className="text-sm text-gray-600">Don't have an account? <a href='/register' className="text-pink-600 hover:underline font-medium">Create account</a></p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Login