import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Register() {
	const [name, setName] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [message, setMessage] = useState('');
	const [messageType, setMessageType] = useState('');
	const navigate = useNavigate();

	const API_URL = import.meta.env.VITE_API_URL;

	const handleRegister = async () => {
		if (!name || !username || !password || !confirm) {
			setMessage('All fields are required');
			setMessageType('error');
			return;
		}

		try {
			const response = await axios.post(`${API_URL}/register`, {
				name: name,
				username: username,
				password: password,
				confirm: confirm
			});
			
			if (response.data.success) {
				setMessage('Registration successful! Redirecting to login...');
				setMessageType('success');
				setTimeout(() => {
					navigate('/');
				}, 2000);
			}
			else {
				setMessage(response.data.message || 'Registration failed');
				setMessageType('error');
			}
		} catch (error) {
			if (error.response?.status === 401) {
				setMessage(error.response.data.message || 'Passwords do not match');
				setMessageType('error');
			} else {
				setMessage('An error occurred during registration');
				setMessageType('error');
			}
		}
	};

	const handleLoginLink = () => {
		navigate('/');
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-blue-140 py-10 px-3 sm:px-5 lg:px-7">
			<div className="max-w-sm w-full bg-pink-100 shadow-lg rounded-lg overflow-hidden">
				<div className="p-6 md:p-8">
					<h2 className="text-2xl font-semibold mb-6 text-center text-pink-800">REGISTER</h2>
					<h3 className="text-sm font-large text-pink-600 text-center mb-6">Create a new account</h3>
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
							<label className="block text-sm font-medium text-gray-700">Name</label>
							<input type="text" 
						value={name} 
						onChange={(e) => setName(e.target.value)} 
						required 
						placeholder='Enter your name'
							className="mt-1 block w-full px-4 py-2 border border-pink-200 rounded-lg placeholder-pink-280 focus:outline-none focus:ring-2 focus:ring-pink-500" />
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Username</label>
							<input type="text" 
							value={username} 
							onChange={(e) => setUsername(e.target.value)} 
							required 
							placeholder='Choose a username'
							className="mt-1 block w-full px-4 py-2 border border-pink-200 rounded-lg placeholder-pink-280 focus:outline-none focus:ring-2 focus:ring-pink-500" />
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Password</label>
							<input type="password" 
							value={password}
							onChange={(e) => setPassword(e.target.value)} 
							required
							placeholder='Enter a password'
							className="mt-1 block w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Confirm Password</label>
							<input type="password" 
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)} 
						placeholder='Confirm your password'
						className="mt-1 block w-full px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
						required />
						</div>

						<div>
							<button type="button" onClick={handleRegister} className="w-full py-2 px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-800 transition">Create Account</button>
						</div>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">Already have an account? <button onClick={handleLoginLink} className="text-indigo-600 hover:underline font-medium bg-none border-none cursor-pointer">Sign in</button></p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Register