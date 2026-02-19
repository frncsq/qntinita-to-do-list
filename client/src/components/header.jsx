function Header({ onLogout }) {
    return (
        <header className="bg-pink-100 py-6 px-8 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <h2 className="text-xl font-bold text-pink-900">PINKY TO-DO-LIST</h2>
                <nav>
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 transition-colors"
                        >
                            Logout
                        </button>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default Header