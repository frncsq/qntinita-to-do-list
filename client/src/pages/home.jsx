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
    const [items, setItems] = useState([])
    const [showAddItemForm, setShowAddItemForm] = useState(false)
    const [newItem, setNewItem] = useState({ title: "", description: "", status: "pending" })
    const [editingItem, setEditingItem] = useState(null)
    const [isEditingItem, setIsEditingItem] = useState(false)

    const API_URL = import.meta.env.VITE_API_URL

    useEffect(() => {
        fetchLists()
    }, [])

    const fetchLists = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await axios.get(`${API_URL}/get-list`)
            if (response.data.success) setLists(response.data.list)
        } catch {
            setError("Failed to load lists")
        } finally {
            setLoading(false)
        }
    }

    const handleSelectList = (list) => {
        setSelectedList(list)
        setEditingTitle(list.title)
        setIsEditing(false)
        fetchItems(list.id)
    }

    const fetchItems = async (id) => {
        try {
            const response = await axios.get(`${API_URL}/get-items/${id}`)
            if (response.data.success) setItems(response.data.items || [])
        } catch {
            setItems([])
        }
    }

    const handleAddList = async () => {
        if (!newTitle.trim()) return
        await axios.post(`${API_URL}/add-list`, { listTitle: newTitle })
        setNewTitle("")
        setShowAddForm(false)
        fetchLists()
    }

    const handleEditList = async () => {
        await axios.post(`${API_URL}/edit-list`, {
            id: selectedList.id,
            listTitle: editingTitle
        })
        setIsEditing(false)
        fetchLists()
    }

    const handleDeleteList = async () => {
        if (!window.confirm(`Delete "${selectedList.title}"?`)) return
        await axios.post(`${API_URL}/delete-list`, { listTitle: selectedList.title })
        setSelectedList(null)
        fetchLists()
    }

    const handleAddItem = async () => {
        if (!newItem.title.trim()) return
        await axios.post(`${API_URL}/add-item`, {
            list_id: selectedList.id,
            ...newItem
        })
        setNewItem({ title: "", description: "", status: "pending" })
        setShowAddItemForm(false)
        fetchItems(selectedList.id)
    }

    const handleEditItem = async () => {
        await axios.post(`${API_URL}/edit-item`, editingItem)
        setIsEditingItem(false)
        setEditingItem(null)
        fetchItems(selectedList.id)
    }

    const handleDeleteItem = async (id) => {
        if (!window.confirm("Delete this item?")) return
        await axios.post(`${API_URL}/delete-item`, { id })
        fetchItems(selectedList.id)
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

                {/* LEFT SIDEBAR */}
                <div className="w-full md:w-96 border-r border-gray-200 bg-white overflow-y-auto flex flex-col">
                    <div className="p-8 flex-1 flex flex-col">
                        <h1 className="text-3xl font-bold text-pink-900 mb-8 text-center">My Lists</h1>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-400 rounded text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {showAddForm ? (
                            <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                                <input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Enter list title..."
                                    className="w-full px-4 py-2 border border-pink-200 rounded-lg mb-3"
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleAddList} className="flex-1 bg-green-600 text-white py-2 rounded">
                                        Create
                                    </button>
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 bg-gray-400 text-white py-2 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="text-pink-600 font-medium mb-8"
                            >
                                + New List
                            </button>
                        )}

                        <div className="space-y-3 flex-1">
                            {lists.map((list) => (
                                <div
                                    key={list.id}
                                    onClick={() => handleSelectList(list)}
                                    className={`p-4 rounded-lg cursor-pointer border ${
                                        selectedList?.id === list.id
                                            ? "bg-pink-100 border-pink-300"
                                            : "bg-white border-gray-200"
                                    }`}
                                >
                                    <h3 className="font-medium text-gray-800 text-center">{list.title}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                {selectedList ? (
                    <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
                        <div className="max-w-4xl mx-auto">

                            {/* HEADER */}
                            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
                                {isEditing ? (
                                    <input
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        className="text-3xl font-bold w-full text-center border rounded"
                                    />
                                ) : (
                                    <h1 className="text-4xl font-bold text-pink-900">{selectedList.title}</h1>
                                )}

                                <div className="flex gap-3 justify-center mt-6">
                                    {isEditing ? (
                                        <>
                                            <button onClick={handleEditList} className="bg-green-600 text-white px-6 py-2 rounded">
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="bg-gray-400 text-white px-6 py-2 rounded"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="bg-blue-600 text-white px-6 py-2 rounded"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={handleDeleteList}
                                                className="bg-red-600 text-white px-6 py-2 rounded"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* ITEMS */}
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold mb-6">Items to Do</h2>

                                {showAddItemForm ? (
                                    <div className="mb-6 p-4 bg-pink-50 rounded border">
                                        <input
                                            value={newItem.title}
                                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                            className="w-full border mb-2 p-2 rounded"
                                            placeholder="Item title"
                                        />
                                        <textarea
                                            value={newItem.description}
                                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                            className="w-full border mb-2 p-2 rounded"
                                            placeholder="Description"
                                        />
                                        <select
                                            value={newItem.status}
                                            onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                                            className="w-full border mb-2 p-2 rounded"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        <div className="flex gap-2">
                                            <button onClick={handleAddItem} className="bg-green-600 text-white px-4 py-2 rounded">
                                                Add Item
                                            </button>
                                            <button
                                                onClick={() => setShowAddItemForm(false)}
                                                className="bg-gray-400 text-white px-4 py-2 rounded"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowAddItemForm(true)}
                                        className="text-green-600 mb-4"
                                    >
                                        + Add Item
                                    </button>
                                )}

                                {items.map((item) => (
                                    <div key={item.id} className="border rounded-lg p-4 mb-4">
                                        {isEditingItem && editingItem?.id === item.id ? (
                                            <>
                                                <input
                                                    value={editingItem.title}
                                                    onChange={(e) =>
                                                        setEditingItem({ ...editingItem, title: e.target.value })
                                                    }
                                                    className="w-full border p-2 mb-2 rounded"
                                                />
                                                <textarea
                                                    value={editingItem.description}
                                                    onChange={(e) =>
                                                        setEditingItem({ ...editingItem, description: e.target.value })
                                                    }
                                                    className="w-full border p-2 mb-2 rounded"
                                                />
                                                <select
                                                    value={editingItem.status}
                                                    onChange={(e) =>
                                                        setEditingItem({ ...editingItem, status: e.target.value })
                                                    }
                                                    className="w-full border p-2 mb-2 rounded"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                                <div className="flex gap-2">
                                                    <button onClick={handleEditItem} className="bg-green-600 text-white px-4 py-1 rounded">
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsEditingItem(false)
                                                            setEditingItem(null)
                                                        }}
                                                        className="bg-gray-400 text-white px-4 py-1 rounded"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between mb-2">
                                                    <h3 className="font-bold">{item.title}</h3>
                                                    <span className="text-sm">{item.status}</span>
                                                </div>
                                                <p className="text-gray-600 mb-3">{item.description}</p>
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => {
                                                            setEditingItem(item)
                                                            setIsEditingItem(true)
                                                        }}
                                                        className="bg-blue-600 text-white px-3 py-1 rounded"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="bg-red-600 text-white px-3 py-1 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a list to view and manage items
                    </div>
                )}
            </div>
        </>
    )
}

export default Home
