import Header from "../components/header"
import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"


function Home() {
    const [lists, setLists] = useState([])
    const [selectedList, setSelectedList] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newTitle, setNewTitle] = useState("")
    const [editingTitle, setEditingTitle] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState("")


    const [tasksByList, setTasksByList] = useState({})
    const [showAddTaskForm, setShowAddTaskForm] = useState(false)
    const [newTask, setNewTask] = useState({ title: "", description: "", status: "pending" })
    const [editingTask, setEditingTask] = useState(null)

    const API_URL = import.meta.env.VITE_API_URL
    const navigate = useNavigate()

    useEffect(() => {
        fetchLists()
    }, [])

    const fetchLists = async () => {
        try {
            setLoading(true)
            setError("")
            const response = await axios.get(`${API_URL}/get-list`)
            if (response.data.success) {
                const fetchedLists = response.data.list || []
                setLists(fetchedLists)

                // Load items for each list so counters are in sync with backend
                fetchedLists.forEach((list) => {
                    fetchItemsForList(list.id)
                })
            }
        } catch (error) {
            console.error("Error fetching lists:", error)
            setError("Failed to load lists")
        } finally {
            setLoading(false)
        }
    }

    const fetchItemsForList = async (listId) => {
        if (!listId) return

        try {
            const response = await axios.get(`${API_URL}/get-items/${listId}`)
            if (response.data.success) {
                const items = response.data.items || []
                setTasksByList((prev) => ({
                    ...prev,
                    [listId]: items
                }))
            }
        } catch (error) {
            console.error("Error fetching items for list:", listId, error)
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
            console.error("Error adding list:", error)
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
            console.error("Error editing list:", error)
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
                // Remove any cached tasks for this list as well
                setTasksByList((prev) => {
                    const next = { ...prev }
                    delete next[selectedList.id]
                    return next
                })
                setSelectedList(null)
                fetchLists()
            }
        } catch (error) {
            console.error("Error deleting list:", error)
            setError("Failed to delete list")
        }
    }

    const handleSelectList = (list) => {
        setSelectedList(list)
        setEditingTitle(list.title)
        setIsEditing(false)
        setShowAddTaskForm(false)
        setEditingTask(null)
        // Ensure tasks for this list are loaded from backend
        fetchItemsForList(list.id)
    }

    const handleBackToLists = () => {
        setSelectedList(null)
        setIsEditing(false)
        setEditingTitle("")
        setShowAddTaskForm(false)
        setEditingTask(null)
    }

    // --- Task handlers ---
    const selectedListTasks = selectedList ? tasksByList[selectedList.id] || [] : []

    const handleAddTask = async () => {
        if (!selectedList || !newTask.title.trim()) return
        if (!newTask.description.trim()) {
            setError("Description is required")
            return
        }
        setError("")

        try {
            await axios.post(`${API_URL}/add-item`, {
                list_id: selectedList.id,
                title: newTask.title.trim(),
                description: newTask.description.trim(),
                status: "pending"
            })

            setNewTask({ title: "", description: "", status: "pending" })
            setShowAddTaskForm(false)

            // Refresh tasks for this list from backend
            fetchItemsForList(selectedList.id)
        } catch (error) {
            console.error("Error adding task:", error)
            setError("Failed to add task")
        }
    }

    const handleToggleTaskStatus = async (taskId) => {
        if (!selectedList) return

        const tasksForList = tasksByList[selectedList.id] || []
        const task = tasksForList.find((t) => t.id === taskId)
        if (!task) return

        const newStatus = task.status === "completed" ? "pending" : "completed"

        try {
            await axios.post(`${API_URL}/edit-item`, {
                id: task.id,
                title: task.title,
                description: task.description,
                status: newStatus
            })

            fetchItemsForList(selectedList.id)
        } catch (error) {
            console.error("Error updating task status:", error)
            setError("Failed to update task")
        }
    }

    const handleDeleteTask = async (taskId) => {
        if (!selectedList) return

        const tasksForList = tasksByList[selectedList.id] || []
        const task = tasksForList.find((t) => t.id === taskId)
        
        if (!window.confirm(`Delete "${task?.title}"?`)) return

        try {
            await axios.post(`${API_URL}/delete-item`, { id: taskId })
            fetchItemsForList(selectedList.id)
        } catch (error) {
            console.error("Error deleting task:", error)
            setError("Failed to delete task")
        }
    }

    const handleStartEditTask = (task) => {
        setEditingTask({ ...task })
        setShowAddTaskForm(false)
    }

    const handleSaveEditTask = async () => {
        if (!editingTask || !editingTask.title.trim()) return
        const desc = (editingTask.description ?? "").trim()
        if (!desc) {
            setError("Description is required")
            return
        }
        setError("")

        try {
            await axios.post(`${API_URL}/edit-item`, {
                id: editingTask.id,
                title: editingTask.title.trim(),
                description: (editingTask.description || "").trim(),
                status: editingTask.status || "pending"
            })

            setEditingTask(null)
            if (selectedList) {
                fetchItemsForList(selectedList.id)
            }
        } catch (error) {
            console.error("Error saving task:", error)
            setError("Failed to save task")
        }
    }

    if (loading) {
        return (
            <>
                <Header />
                <div className="flex h-screen items-center justify-center bg-slate-50">
                    <p className="text-pink-600 text-lg">Loading...</p>
                </div>
            </>
        )
    }
    
    

    // --- First screen: My To-Do Lists ---
    if (!selectedList) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-slate-50">
                    <div className="max-w-5xl mx-auto px-4 py-10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">My To-Do Lists</h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Keep all your work, shopping, and personal tasks organized.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowAddForm((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-full bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-pink-300 hover:bg-pink-700 hover:shadow-md transition-all"
                            >
                                <span className="mr-2 text-lg leading-none">+</span>
                                New list
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                                {error}
                            </div>
                        )}

                        {showAddForm && (
                            <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100">
                                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">
                                    List title
                                </label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g. Work Tasks, Shopping, Personal"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-pink-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-200"
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && handleAddList()}
                                />
                                <div className="mt-3 flex gap-2 justify-end">
                                    <button
                                        onClick={() => {
                                            setShowAddForm(false)
                                            setNewTitle("")
                                        }}
                                        className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddList}
                                        className="rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pink-300 hover:bg-pink-700 hover:shadow-md transition"
                                    >
                                        Create list
                                    </button>
                                </div>
                            </div>
                        )}

                        {lists.length === 0 ? (
                            <div className="mt-16 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center shadow-sm shadow-slate-100">
                                <p className="text-sm text-slate-500">
                                    You don&apos;t have any lists yet. Start by creating your first to-do list.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {lists.map((list) => {
                                    const itemCount = (tasksByList[list.id] || []).length
                                    const countLabel = `${itemCount} item${itemCount === 1 ? "" : "s"}`

                                    return (
                                        <button
                                            key={list.id}
                                            onClick={() => handleSelectList(list)}
                                            className="group flex flex-col items-start rounded-3xl border border-slate-100 bg-white px-5 py-5 text-left shadow-sm shadow-slate-100 transition-all hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md"
                                        >
                                            <div className="mb-3 inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                                                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                {list.status || "pending"}
                                            </div>
                                            <h2 className="text-base font-semibold text-slate-900 truncate mb-1">
                                                {list.title}
                                            </h2>
                                            <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                                                {/* Show description when your API provides it */}
                                                {list.description || "Tap to see and manage the tasks in this list."}
                                            </p>
                                            <div className="mt-auto flex w-full items-center justify-between text-xs text-slate-500">
                                                <span className="font-medium text-slate-700">{countLabel}</span>
                                                <span className="inline-flex items-center gap-1 text-pink-600 group-hover:text-pink-700">
                                                    View tasks
                                                    <span className="text-sm transition-transform group-hover:translate-x-0.5">
                                                        →
                                                    </span>
                                                </span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </>
        )
    }

    // --- Second screen: single list with its tasks ---
    return (
        <>
            <Header />
            <main className="min-h-screen bg-slate-50">
                <div className="max-w-3xl mx-auto px-4 py-8">
                    <button
                        onClick={handleBackToLists}
                        className="mb-6 inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        <span className="mr-2 text-lg leading-none">←</span>
                        Back to lists
                    </button>

                    <div className="rounded-3xl bg-white px-6 py-6 shadow-md shadow-slate-100 border border-slate-100">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xl font-semibold text-slate-900 focus:border-pink-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-200"
                                        autoFocus
                                    />
                                ) : (
                                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                        {selectedList?.title}
                                    </h1>
                                )}
                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedList?.description ||
                                        "Review today’s tasks, check off what’s done, and keep track of what’s next."}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleEditList}
                                            className="rounded-xl bg-pink-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-pink-300 hover:bg-pink-700 hover:shadow-md transition"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false)
                                                setEditingTitle(selectedList?.title || "")
                                            }}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                                        >
                                            Rename
                                        </button>
                                        <button
                                            onClick={handleDeleteList}
                                            className="rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-red-300 hover:bg-red-600 hover:shadow-md transition"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                                Tasks
                            </h2>
                            <span className="text-xs text-slate-500">
                                {selectedListTasks.length} item
                                {selectedListTasks.length === 1 ? "" : "s"}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {selectedListTasks.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-500">
                                    No tasks yet. Add your first task for this list.
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {selectedListTasks.map((task) => {
                                        const isCompleted = task.status === "completed"
                                        const isEditingThis = editingTask && editingTask.id === task.id

                                        return (
                                            <li
                                                key={task.id}
                                                className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-sm shadow-slate-100 hover:border-pink-200 hover:bg-white transition"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isCompleted}
                                                        onChange={() => handleToggleTaskStatus(task.id)}
                                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                                                    />
                                                    <div>
                                                        {isEditingThis ? (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    value={editingTask.title}
                                                                    onChange={(e) =>
                                                                        setEditingTask((prev) => ({
                                                                            ...prev,
                                                                            title: e.target.value
                                                                        }))
                                                                    }
                                                                    className="mb-1 w-full rounded-xl border border-slate-200 bg-white px-2 py-1 text-sm font-medium text-slate-900 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-200"
                                                                />
                                                                <textarea
                                                                    value={editingTask.description || ""}
                                                                    onChange={(e) =>
                                                                        setEditingTask((prev) => ({
                                                                            ...prev,
                                                                            description: e.target.value
                                                                        }))
                                                                    }
                                                                    rows={2}
                                                                    className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-200"
                                                                    placeholder="Description (required)"
                                                                    required
                                                                />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p
                                                                    className={`text-sm font-medium ${
                                                                        isCompleted
                                                                            ? "line-through text-slate-400"
                                                                            : "text-slate-800"
                                                                    }`}
                                                                >
                                                                    {task.title}
                                                                </p>
                                                                {task.description && (
                                                                    <p
                                                                        className={`mt-0.5 text-xs ${
                                                                            isCompleted
                                                                                ? "text-slate-300"
                                                                                : "text-slate-500"
                                                                        }`}
                                                                    >
                                                                        {task.description}
                                                                    </p>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-1">
                                                    {isEditingThis ? (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={handleSaveEditTask}
                                                                className="rounded-lg bg-pink-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-pink-700"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingTask(null)}
                                                                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleStartEditTask(task)}
                                                                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTask(task.id)}
                                                                className="rounded-lg bg-red-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-600"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}

                                                    <span
                                                        className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                                            isCompleted
                                                                ? "bg-emerald-50 text-emerald-600"
                                                                : "bg-amber-50 text-amber-700"
                                                        }`}
                                                    >
                                                        {isCompleted ? "Completed" : "Pending"}
                                                    </span>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>

                        {/* Add task form */}
                        <div className="mt-6 border-t border-slate-100 pt-4">
                            {showAddTaskForm ? (
                                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                                    <div className="mb-2">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">
                                            Task title
                                        </label>
                                        <input
                                            type="text"
                                            value={newTask.title}
                                            onChange={(e) =>
                                                setNewTask((prev) => ({
                                                    ...prev,
                                                    title: e.target.value
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-200"
                                            placeholder="e.g. Kumporme ubraem"
                                            autoFocus
                                            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={newTask.description}
                                            onChange={(e) =>
                                                setNewTask((prev) => ({
                                                    ...prev,
                                                    description: e.target.value
                                                }))
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-200"
                                            placeholder="Add details like location, time, or notes"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setShowAddTaskForm(false)
                                                setNewTask({ title: "", description: "", status: "pending" })
                                            }}
                                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddTask}
                                            className="rounded-xl bg-pink-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-pink-300 hover:bg-pink-700 hover:shadow-md transition"
                                        >
                                            Add task
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowAddTaskForm(true)
                                        setEditingTask(null)
                                    }}
                                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-slate-400 hover:bg-black hover:shadow-md transition"
                                >
                                    <span className="mr-2 text-base leading-none">+</span>
                                    Add task
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default Home