class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.editingTaskId = null;
        this.activeTab = 'pending';
        this.init();
    }

    init() {
        // Form submission
        document.getElementById('addTaskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Tab switching
        document.querySelector('.tabs').addEventListener('click', (e) => {
            const tab = e.target.closest('.tab');
            if (tab) {
                this.switchTab(tab.dataset.tab);
            }
        });

        this.render();
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Show/hide task lists
        document.getElementById('pendingTasks').hidden = tabName !== 'pending';
        document.getElementById('completedTasks').hidden = tabName !== 'completed';
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.render();
    }

    addTask() {
        const input = document.getElementById('newTaskInput');
        const text = input.value.trim();
        
        if (!text) return;

        const task = {
            id: crypto.randomUUID(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
        };

        this.tasks.unshift(task);
        this.saveTasks();
        input.value = '';
    }

    toggleTask(id) {
        this.tasks = this.tasks.map(task => {
            if (task.id === id) {
                return {
                    ...task,
                    completed: !task.completed,
                    completedAt: !task.completed ? new Date().toISOString() : undefined
                };
            }
            return task;
        });
        this.saveTasks();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
    }

    startEditing(id) {
        this.editingTaskId = id;
        this.render();
    }

    saveEdit(id, newText) {
        if (!newText.trim()) return;
        
        this.tasks = this.tasks.map(task => 
            task.id === id ? { ...task, text: newText.trim() } : task
        );
        
        this.editingTaskId = null;
        this.saveTasks();
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    }

    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;

        const toggleButton = this.createIconButton(
            task.completed ? 'check-circle' : 'circle',
            () => this.toggleTask(task.id),
            'toggle'
        );

        let textContainer;
        if (this.editingTaskId === task.id) {
            textContainer = document.createElement('input');
            textContainer.className = 'task-edit-input';
            textContainer.value = task.text;
            textContainer.autoFocus = true;
        } else {
            textContainer = document.createElement('span');
            textContainer.className = 'task-text';
            textContainer.textContent = task.text;
        }

        const dateContainer = document.createElement('div');
        dateContainer.className = task.completed ? 'task-dates' : 'task-date';
        
        if (task.completed) {
            dateContainer.innerHTML = `
                <span>Created: ${this.formatDate(task.createdAt)}</span>
                <span>Completed: ${this.formatDate(task.completedAt)}</span>
            `;
        } else {
            dateContainer.textContent = this.formatDate(task.createdAt);
        }

        const actions = document.createElement('div');
        actions.className = 'actions';

        if (!task.completed) {
            if (this.editingTaskId === task.id) {
                actions.appendChild(this.createIconButton(
                    'save',
                    () => this.saveEdit(task.id, textContainer.value),
                    'save'
                ));
                actions.appendChild(this.createIconButton(
                    'x',
                    () => {
                        this.editingTaskId = null;
                        this.render();
                    },
                    'edit'
                ));
            } else {
                actions.appendChild(this.createIconButton(
                    'edit',
                    () => this.startEditing(task.id),
                    'edit'
                ));
            }
        }

        actions.appendChild(this.createIconButton(
            'trash',
            () => this.deleteTask(task.id),
            'delete'
        ));

        div.appendChild(toggleButton);
        div.appendChild(textContainer);
        div.appendChild(dateContainer);
        div.appendChild(actions);

        return div;
    }

    createIconButton(type, onClick, className) {
        const button = document.createElement('button');
        button.className = `icon-button ${className}`;
        button.onclick = onClick;

        let icon;
        switch (type) {
            case 'circle':
                icon = `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                </svg>`;
                break;
            case 'check-circle':
                icon = `<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M8.5 12.5 L10.5 14.5 L15.5 9.5" stroke-dasharray="0"/>
                </svg>`;
                break;
                case 'edit':
                    icon = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M13.5 3.5l3 3L7 16H4v-3L13.5 3.5z"/>
                        <path d="M13.5 3.5l3 3" stroke-width="2.5"/>
                    </svg>`;
                    break;
            case 'trash':
                icon = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h14"/>
                    <path d="M14.5 6v10a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V6"/>
                    <path d="M7 3h6a1 1 0 0 1 1 1v2H6V4a1 1 0 0 1 1-1z"/>
                    <path d="M8 9v6"/>
                    <path d="M12 9v6"/>
                </svg>`;
                break;
            case 'save':
                icon = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4a2 2 0 0 1 2-2h8l4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z"/>
                    <path d="M14 2v4h-4V2"/>
                    <rect x="6" y="10" width="8" height="4" rx="1"/>
                </svg>`;
                break;
            case 'x':
                icon = `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 5 L5 15"/>
                    <path d="M5 5 L15 15"/>
                </svg>`;
                break;
        }
        button.innerHTML = icon;
        return button;
    }

    render() {
        const pendingTasks = this.tasks.filter(task => !task.completed);
        const completedTasks = this.tasks.filter(task => task.completed);

        // Update counts
        document.getElementById('pendingCount').textContent = pendingTasks.length;
        document.getElementById('completedCount').textContent = completedTasks.length;

        // Render pending tasks
      
        const pendingContainer = document.getElementById('pendingTasks');
        pendingContainer.innerHTML = '';
        pendingTasks.forEach(task => {
            pendingContainer.appendChild(this.createTaskElement(task));
        });

        // Render completed tasks
        const completedContainer = document.getElementById('completedTasks');
        completedContainer.innerHTML = '';
        completedTasks.forEach(task => {
            completedContainer.appendChild(this.createTaskElement(task));
        });
    }
}

// Initialize the app
const taskManager = new TaskManager();