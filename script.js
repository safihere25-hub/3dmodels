// DOM Elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const clearAllBtn = document.getElementById('clearAll');

// State
let tasks = [];
let currentFilter = 'all';

// Local Storage Keys
const STORAGE_KEY = 'todoTasks';

// Initialize App
function init() {
    loadTasks();
    renderTasks();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach((b) => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);
}

// Add Task
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    tasks.push(newTask);
    saveTasks();
    taskInput.value = '';
    taskInput.focus();
    renderTasks();
}

// Toggle Task Completion
function toggleTask(id) {
    tasks = tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
}

// Delete Task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter((task) => task.id !== id);
        saveTasks();
        renderTasks();
    }
}

// Clear Completed Tasks
function clearCompleted() {
    const completedCount = tasks.filter((task) => task.completed).length;
    if (completedCount === 0) {
        alert('No completed tasks to clear!');
        return;
    }
    if (confirm(`Clear ${completedCount} completed task(s)?`)) {
        tasks = tasks.filter((task) => !task.completed);
        saveTasks();
        renderTasks();
    }
}

// Clear All Tasks
function clearAll() {
    if (tasks.length === 0) {
        alert('No tasks to clear!');
        return;
    }
    if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
}

// Filter Tasks
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter((task) => !task.completed);
        case 'completed':
            return tasks.filter((task) => task.completed);
        case 'all':
        default:
            return tasks;
    }
}

// Render Tasks
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    todoList.innerHTML = '';

    if (filteredTasks.length === 0) {
        emptyState.classList.add('show');
        todoList.style.display = 'none';
    } else {
        emptyState.classList.remove('show');
        todoList.style.display = 'block';
        filteredTasks.forEach((task) => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTask(${task.id})"
                >
                <span class="todo-text" title="${task.text}">${escapeHtml(task.text)}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            `;
            todoList.appendChild(li);
        });
    }

    updateStats();
}

// Update Statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    totalTasksSpan.textContent = `Total: ${total}`;
    completedTasksSpan.textContent = `Completed: ${completed}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Local Storage Functions
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
        try {
            tasks = JSON.parse(storedTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasks = [];
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
