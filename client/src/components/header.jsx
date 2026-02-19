import { useNavigate } from "react-router-dom"
import axios from "axios"

function Header() {
    const navigate = useNavigate()
    const API_URL = import.meta.env.VITE_API_URL

    const handleLogout = async () => {
        try {
            const response = await axios.post(`${API_URL}/logout`, {}, {
                withCredentials: true
            })
            if (response.data.success) {
                navigate("/") // redirect to login
            } else {
                console.error("Logout failed:", response.data.message)
            }
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    return (
        <header className="bg-pink-100 py-6 px-8 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h2 className="text-xl font-bold text-pink-900">PINKY TO-DO-LIST</h2>
                <button
                    onClick={handleLogout}
                    className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 transition-colors"
                >
                    Logout
                </button>
            </div>
        </header>
    )
}

export default Header