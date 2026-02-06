import Header from "../components/header"
import { useState, useEffect } from "react"
import axios from "axios"

function Home() {
    const [lists, setLists] = useState([])
    const [selectedList, setSelectedList] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [editingTitle, setEditingTitle] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState("")
    const [tasks, setTasks] = useState([])
    const [showAddTaskForm, setShowAddTaskForm] = useState(false)
    const [newTask, setNewTask] = useState({ title: "", description: "", status: "pending" })
    const [editingTask, setEditingTask] = useState(null)
    const [isEditingTask, setIsEditingTask] = useState(false)

    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        fetchLists()
    }, [])

    const fetchLists = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await axios.get(`${API_URL}/get-list`)
            if (response.data.success) {
                setLists(response.data.list)
            }
        } catch (error) {
            console.error('Error fetching lists:', error)
            setError("Failed to load lists")
        } finally {
            setLoading(false)
        }
    }

    const handleAddList = async () => {
        if (!newTitle.trim()) {
            setError("Please enter a title")
            return
        }

        try {
            setError("")
            const response = await axios.post(`${API_URL}/add-list`, {
                listTitle: newTitle
            })
            if (response.data.success) {
                setNewTitle("")
                setShowAddForm(false)
                fetchLists()
            }
        } catch (error) {
            console.error('Error adding list:', error)
            setError("Failed to add list")
        }
    }

    const handleEditList = async () => {
        if (!editingTitle.trim() || !selectedList) {
            setError("Please enter a title")
            return
        }

        try {
            setError("")
            const response = await axios.post(`${API_URL}/edit-list`, {
                listTitle: editingTitle,
                id: selectedList.id
            })
            if (response.data.success) {
                setIsEditing(false)
                fetchLists()
                setSelectedList(null)
            }
        } catch (error) {
            console.error('Error editing list:', error)
            setError("Failed to edit list")
        }
    }

    const handleDeleteList = async () => {
        if (!selectedList) return

        if (!window.confirm(`Delete "${selectedList.title}"?`)) return

        try {
            setError("")
            const response = await axios.post(`${API_URL}/delete-list`, {
                listTitle: selectedList.title
            })
            if (response.data.success) {
                setSelectedList(null)
                fetchLists()
            }
        } catch (error) {
            console.error('Error deleting list:', error)
            setError("Failed to delete list")
        }
    }

    const handleSelectList = (list) => {
        setSelectedList(list)
        setEditingTitle(list.title)
        setIsEditing(false)
    }

    if (loading) {
        return (
            <>
                <Header />
                <div className="flex h-screen items-center justify-center bg-gray-50">
                    <p className="text-pink-600 text-lg">Loading...</p>
                </div>
            </>
        )
    }

    return (
        <>
            <Header />
            <div className="flex h-screen bg-gray-50">
                {/* Left Sidebar - List of Lists */}
                <div className="w-full md:w-96 border-r border-gray-200 bg-white overflow-y-auto flex flex-col">
                    <div className="p-8 flex-1 flex flex-col">
                        <h1 className="text-3xl font-bold text-pink-900 mb-8 text-center">My Lists</h1>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-400 rounded text-red-700 text-sm animate-pulse">
                                {error}
                            </div>
                        )}

                        {/* Add new list form */}
                        {showAddForm ? (
                            <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Enter list title..."
                                    className="w-full px-4 py-2 border border-pink-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    autoFocus
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddList()}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddList}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                                    >
                                        Create
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddForm(false)
                                            setNewTitle("")
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center justify-center gap-2 text-pink-600 hover:text-pink-800 font-medium mb-8 transition"
                            >
                                <span className="text-2xl">+</span> New List
                            </button>
                        )}

                        {/* Lists */}
                        <div className="space-y-3 flex-1">
                            {lists.length === 0 ? (
                                <p className="text-gray-500 text-center py-12">No lists yet. Create one to get started!</p>
                            ) : (
                                lists.map((list) => (
                                    <div
                                        key={list.id}
                                        onClick={() => handleSelectList(list)}
                                        className={`p-4 rounded-lg cursor-pointer transition border ${
                                            selectedList?.id === list.id
                                                ? "bg-pink-100 border-pink-300 shadow-md"
                                                : "bg-white border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        <h3 className="font-medium text-gray-800 truncate text-center">{list.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1 text-center">Status: {list.status}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - List Details */}
                {selectedList ? (
                    <div className="flex-1 overflow-y-auto flex items-center justify-center bg-gray-100 p-8">
                        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
                            {/* Title */}
                            <div className="mb-8 text-center">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        className="w-full text-3xl font-bold text-pink-900 px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-center"
                                        autoFocus
                                    />
                                ) : (
                                    <h1 className="text-4xl font-bold text-pink-900">{selectedList.title}</h1>
                                )}
                            </div>

                            {/* Status */}
                            <div className="mb-8 pb-8 border-b border-gray-200 text-center">
                                <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                                <span className="inline-block px-4 py-2 bg-pink-100 text-pink-700 rounded-full font-medium capitalize">
                                    {selectedList.status}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-center">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleEditList}
                                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false)
                                                setEditingTitle(selectedList.title)
                                            }}
                                            className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleDeleteList}
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-100">
                        <p className="text-gray-500 text-lg">Select a list to view details</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default Home