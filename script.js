
console.log("LoaderLens is working!");

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
let editingTaskId = null;

const STORAGE_KEY = "loaderLensTasks";

// Load saved tasks from the browser
let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
} catch (error) {
    console.error("Could not load saved tasks:", error);
    tasks = [];
}

// Save tasks to the browser
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    updateDashboard();
    updateUpcomingTasks();
}

// Display a task on the webpage
function renderTask(taskData) {
    const task = document.createElement("div");
    task.className = "task-row";

    if (taskData.completed) {
        task.classList.add("completed-task");
    }

    const details = document.createElement("div");
    details.className = "task-details";

    const name = document.createElement("strong");
    name.textContent = taskData.taskName;

    if (taskData.completed) {
        name.style.textDecoration = "line-through";
    }

    const info = document.createElement("p");
    info.textContent =
        taskData.subject + " | " + taskData.category +
        " | Due: " + taskData.deadline +
        " | Priority: " + taskData.priority;

    details.appendChild(name);
    details.appendChild(info);

    const status = document.createElement("span");
    status.className = taskData.completed
        ? "tag green"
        : "tag blue";
    status.textContent = taskData.completed
        ? "Completed"
        : "Pending";

    const completeButton = document.createElement("button");
    completeButton.textContent = taskData.completed
        ? "✓ Completed"
        : "✓ Complete";
    completeButton.className = "complete-button";
    completeButton.disabled = taskData.completed;

    completeButton.addEventListener("click", function () {
        taskData.completed = true;
        saveTasks();
        refreshTaskList();
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", function () {
        if (confirm("Do you want to delete this task?")) {
            tasks = tasks.filter(item => item.id !== taskData.id);
            saveTasks();
            refreshTaskList();
        }
    });
    
const editButton = document.createElement("button");
editButton.textContent = "Edit";
editButton.className = "edit-button";

editButton.addEventListener("click", function () {
    editingTaskId = taskData.id;
    document.getElementById("submitTaskButton").textContent = "Update Task";
    document.getElementById("taskName").value = taskData.taskName;
    document.getElementById("subject").value = taskData.subject;
    document.getElementById("category").value = taskData.category;
    document.getElementById("deadline").value = taskData.deadline;
    document.getElementById("priority").value = taskData.priority;

    document.getElementById("taskName").focus();
});

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.appendChild(completeButton);
    actions.appendChild(deleteButton);
    actions.appendChild(editButton);

    task.appendChild(details);
    task.appendChild(status);
    task.appendChild(actions);

    taskList.appendChild(task);
}

// Display all saved tasks

function refreshTaskList() {
    const searchInput = document.getElementById("searchTask");
    const categoryFilter = document.getElementById("filterCategory");
    const statusFilter = document.getElementById("filterStatus");

    const searchText = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedStatus = statusFilter.value;

    const filteredTasks = tasks.filter(task => {
        const matchesSearch =
            task.taskName.toLowerCase().includes(searchText) ||
            task.subject.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            task.category === selectedCategory;

        const matchesStatus =
            selectedStatus === "All" ||
            (selectedStatus === "Completed" && task.completed) ||
            (selectedStatus === "Pending" && !task.completed);

        return matchesSearch && matchesCategory && matchesStatus;
    });
    

const sortPriority = document.getElementById("sortPriority").value;

const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3
};

if (sortPriority === "deadline") {
    filteredTasks.sort((a, b) =>
        a.deadline.localeCompare(b.deadline)
    );
} else if (sortPriority !== "default") {
    filteredTasks.sort((a, b) => {
        if (sortPriority === "high") {
            return priorityOrder[a.priority.toLowerCase()] -
                   priorityOrder[b.priority.toLowerCase()];
        }

        if (sortPriority === "medium") {
            return Math.abs(priorityOrder[a.priority.toLowerCase()] - 2) -
                   Math.abs(priorityOrder[b.priority.toLowerCase()] - 2);
        }

        return priorityOrder[b.priority.toLowerCase()] -
               priorityOrder[a.priority.toLowerCase()];
    });
}


    taskList.innerHTML = "";

    if (filteredTasks.length === 0) {
        const message = document.createElement("p");
        message.className = "muted";
        message.textContent = tasks.length === 0
            ? "Your added tasks will appear here."
            : "No tasks match your search or filters.";

        taskList.appendChild(message);
        return;
    }

    filteredTasks.forEach(renderTask);
}


// Add a new task
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskName = document.getElementById("taskName").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const category = document.getElementById("category").value;
    const deadline = document.getElementById("deadline").value;
    const priority = document.getElementById("priority").value;

    if (!taskName || !subject || !category || !deadline || !priority) {
        alert("Please fill in all the fields.");
        return;
    }

   
if (editingTaskId !== null) {
    const taskToUpdate = tasks.find(task => task.id === editingTaskId);

    if (taskToUpdate) {
        taskToUpdate.taskName = taskName;
        taskToUpdate.subject = subject;
        taskToUpdate.category = category;
        taskToUpdate.deadline = deadline;
        taskToUpdate.priority = priority;
    }

    editingTaskId = null;
} else {
    const newTask = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        taskName: taskName,
        subject: subject,
        category: category,
        deadline: deadline,
        priority: priority,
        completed: false
    };

    tasks.push(newTask);
}

    saveTasks();
    refreshTaskList();

    taskForm.reset();
    editingTaskId = null;
    document.getElementById("submitTaskButton").textContent = "+ Add Task"; 
});

// Show saved tasks when the page opens
refreshTaskList();

function updateDashboard() {
    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const pendingTasks = tasks.filter(task => !task.completed);

    const dueSoon = pendingTasks.filter(task => {
        const deadline = new Date(task.deadline + "T00:00:00");
        return deadline >= today && deadline <= nextWeek;
    }).length;

    const overdue = pendingTasks.filter(task => {
        const deadline = new Date(task.deadline + "T00:00:00");
        return deadline < today;
    }).length;

    document.getElementById("statTotal").textContent = total;
    document.getElementById("statDueSoon").textContent = dueSoon;
    document.getElementById("statCompleted").textContent = completed;
    document.getElementById("statOverdue").textContent = overdue;
}
updateDashboard();

function updateUpcomingTasks() {
    const upcomingList = document.getElementById("upcomingList");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingTasks = tasks
        .filter(task => {
            const deadline = new Date(task.deadline + "T00:00:00");
            return !task.completed && deadline >= today;
        })
        .sort((a, b) => a.deadline.localeCompare(b.deadline))
        .slice(0, 5);

    upcomingList.innerHTML = "";

    if (upcomingTasks.length === 0) {
        const message = document.createElement("p");
        message.className = "muted";
        message.textContent = "No upcoming tasks. You're all caught up!";
        upcomingList.appendChild(message);
        return;
    }

    upcomingTasks.forEach(taskData => {
        const row = document.createElement("div");
        row.className = "task-row";

        const details = document.createElement("div");

        const name = document.createElement("strong");
        name.textContent = taskData.taskName;

        const info = document.createElement("p");
        info.textContent =
            taskData.subject + " | Due: " + taskData.deadline;

        const category = document.createElement("span");
        category.className = "tag blue";
        category.textContent = taskData.category;

        details.appendChild(name);
        details.appendChild(info);

        row.appendChild(details);
        row.appendChild(category);

        upcomingList.appendChild(row);
    });
}
updateDashboard();
updateUpcomingTasks();
document.getElementById("searchTask").addEventListener("input", refreshTaskList);

document.getElementById("filterCategory").addEventListener("change", refreshTaskList);

document.getElementById("filterStatus").addEventListener("change", refreshTaskList);

document.getElementById("sortPriority").addEventListener("change", refreshTaskList);