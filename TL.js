// Type Writer

const lines = [
  "Hello, Pilot.",
  "MISSION CONTROL SYSTEM ONLINE.",
  "Synchronization complete.",
  "All systems are stable.",
  "Organize your tasks. Complete your missions one by one.",
  "Stay focused. Stay synchronized.",
  "Stand by for the next operation...",
  "Access full project on GitHub.",
];

const target = document.querySelector("#intro-text");

let line = 0; // شماره خط
let char = 0; // شماره حرف داخل آن خط

function typeWriter() {
  // تا وقتی هنوز خطی باقی مانده
  if (line < lines.length) {
    // تا وقتی هنوز حرفی در آن خط باقی مانده
    if (char < lines[line].length) {
      target.innerHTML += lines[line].charAt(char);

      char++;

      setTimeout(typeWriter, Math.random() * 20 + 25);
    }

    // خط تمام شده
    else {
      target.innerHTML += "<br><br>";

      line++;

      char = 0;

      setTimeout(typeWriter, 250);
    }
  } else {
    target.innerHTML += `
      <br><br>
      <div class = "git-container">
        <a href="https://github.com/ArturyaZero" target="_blank">
        <img src="assets/github-white-icon.webp" alt="GitHub-icon" class ="git">
        </a>
      </div>
    `;
  }
}

typeWriter();

// Input section animtion

const inputSection = document.querySelector(".input-section");
const fillterSection = document.querySelector(".filter-section");
const startBtn = document.querySelector(".start-btn");
const mT = document.querySelector(".mt");
const tD = document.querySelector(".todo-list");
function show() {
  if (inputSection.classList.contains("input-section-show")) {
    inputSection.classList.remove("input-section-show");
    fillterSection.classList.remove("filter-section-show");
    mT.classList.remove("filter-section-show");
    tD.classList.remove("todo-list-show");
  } else {
    inputSection.classList.add("input-section-show");
    fillterSection.classList.add("filter-section-show");
    mT.classList.add("filter-section-show");
    tD.classList.add("todo-list-show");
  }
}
startBtn.addEventListener("click", show);

// input section logic + smoe extras for fillter section

const input = document.querySelector("#todo-input");
const addBtn = document.querySelector("#add-btn");
const todoList = document.querySelector("#todo-list");
const filterBtns = document.querySelectorAll(".filter-section button");
const STORAGE_KEYS = {
  tasks: "mission-todo-tasks",
  filter: "mission-todo-filter",
  draft: "mission-todo-draft",
};
const FILTERS = ["all", "done", "active"];

let tasks = loadTasks();
let currentFilter = loadFilter();

input.value = loadDraft();

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks));

    if (!Array.isArray(savedTasks)) return [];

    return savedTasks
      .filter((task) => task && typeof task.text === "string")
      .map((task, index) => ({
        id: Number.isFinite(Number(task.id))
          ? Number(task.id)
          : Date.now() + index,
        text: task.text.trim(),
        done: Boolean(task.done),
      }))
      .filter((task) => task.text !== "");
  } catch (error) {
    return [];
  }
}

function loadFilter() {
  try {
    const savedFilter = localStorage.getItem(STORAGE_KEYS.filter);

    return FILTERS.includes(savedFilter) ? savedFilter : "all";
  } catch (error) {
    return "all";
  }
}

function loadDraft() {
  try {
    return localStorage.getItem(STORAGE_KEYS.draft) || "";
  } catch (error) {
    return "";
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  } catch (error) {
    console.warn("Tasks could not be saved.", error);
  }
}

function saveFilter() {
  try {
    localStorage.setItem(STORAGE_KEYS.filter, currentFilter);
  } catch (error) {
    console.warn("Filter could not be saved.", error);
  }
}

function saveDraft() {
  try {
    localStorage.setItem(STORAGE_KEYS.draft, input.value);
  } catch (error) {
    console.warn("Draft could not be saved.", error);
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEYS.draft);
  } catch (error) {
    console.warn("Draft could not be cleared.", error);
  }
}

function addTask() {
  if (input.value.trim() == "") return;
  const task = {
    id: Date.now(),
    text: input.value.trim(),
    done: false,
  };
  tasks.push(task); // for fillter section
  saveTasks();

  renderTasks();

  input.value = "";
  clearDraft();
}

// fillter section logic + second part of input section logic

function renderTasks() {
  todoList.innerHTML = "";
  filterBtns.forEach((btn) => {
    btn.classList.toggle("active-filter", btn.id === currentFilter);
  });

  let filteredTasks = tasks;

  if (currentFilter === "active") {
    filteredTasks = tasks.filter((t) => !t.done);
  }

  if (currentFilter === "done") {
    filteredTasks = tasks.filter((t) => t.done);
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    const taskText = document.createElement("span");
    const taskActions = document.createElement("div");

    taskText.classList.add("task-text");
    taskText.textContent = task.text;
    taskActions.classList.add("task-actions");

    if (task.done) {
      li.classList.add("done");
    }

    // ✔ DONE BUTTON
    const doneBtn = document.createElement("button");
    doneBtn.textContent = task.done ? "UNDO" : "DONE";
    doneBtn.classList.add("done-btn");
    doneBtn.setAttribute("aria-label", "Toggle mission status");

    doneBtn.addEventListener("click", () => {
      task.done = !task.done;
      saveTasks();
      renderTasks();
    });

    // ❌ DELETE BUTTON
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "DEL";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.setAttribute("aria-label", "Delete mission");

    deleteBtn.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    taskActions.appendChild(doneBtn);
    taskActions.appendChild(deleteBtn);

    li.appendChild(taskText);
    li.appendChild(taskActions);

    todoList.appendChild(li);
  });
}

renderTasks();

input.addEventListener("input", saveDraft);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

addBtn.addEventListener("click", addTask);

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.id;
    saveFilter();
    renderTasks();
  });
});

window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEYS.tasks) {
    tasks = loadTasks();
    renderTasks();
  }

  if (e.key === STORAGE_KEYS.filter) {
    currentFilter = loadFilter();
    renderTasks();
  }

  if (e.key === STORAGE_KEYS.draft) {
    input.value = loadDraft();
  }
});
