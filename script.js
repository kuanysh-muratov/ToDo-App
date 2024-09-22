class Project {
    static projects = [];

    constructor(name) {
        this.name = name;
        this.tasks = [];
        Project.projects.push(this);
        Project.saveToLocalStorage();
    }

    addTask(task) {
        this.tasks.push(task);
        Project.saveToLocalStorage();
    }

    getName() {
        return this.name;
    }

    removeProject(index) {
        Project.projects.splice(index, 1);
        Project.saveToLocalStorage();
    }

    removeTask(index) {
        this.tasks.splice(index, 1);
        Project.saveToLocalStorage();
    }

    static saveToLocalStorage() {
        localStorage.setItem('projects', JSON.stringify(Project.projects));
    }

    static loadFromLocalStorage() {
        const storedProjects = JSON.parse(localStorage.getItem('projects'));
        if (storedProjects) {
            Project.projects = storedProjects.map(projectData => {
                const project = new Project(projectData.name);
                project.tasks = projectData.tasks.map(taskData => new Task(
                    taskData.title, taskData.dueDate, taskData.description, taskData.priority, project, taskData.complete
                ));
                return project;
            });
        }
    }
}

class Task {
    constructor(title, dueDate, description, priority, project, complete = false) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.complete = complete;
        this.projectName = project.getName();
        project.addTask(this);
    }

    toggleCompletion() {
        this.complete = !this.complete;
        Project.saveToLocalStorage();
    }
}

function initializeDOM() {
    Project.loadFromLocalStorage();

    const projectButton = document.getElementById("new-project");
    const cancelButton = document.querySelector(".cancel");
    const createButton = document.querySelector(".create");
    const modal = document.querySelector(".modal-wrapper");

    projectButton.addEventListener("click", openProjectModal);
    cancelButton.addEventListener("click", closeProjectModal);
    createButton.addEventListener("click", createProject);

    const todoCreateButton = document.querySelector(".todocreate");
    const todoCancelButton = document.querySelector(".todocancel");
    const addButton = document.getElementById("add-todo");
    const modal2 = document.querySelector(".modal-wrapper2");

    addButton.addEventListener("click", openTodoModal);
    todoCancelButton.addEventListener("click", closeTodoModal);
    todoCreateButton.addEventListener('click', createTodo);

    let currentProjectIndex = localStorage.getItem('currentProjectIndex');
    let currentProject = Project.projects.length
        ? (currentProjectIndex !== null ? Project.projects[currentProjectIndex] : Project.projects[0])
        : new Project("Default");

    function updateProjectListDisplay() {
        const currentDisplay = document.getElementById("current-project");
        currentDisplay.textContent = currentProject.getName();

        const projectList = document.getElementById("project-list");
        while (projectList.firstChild) {
            projectList.removeChild(projectList.firstChild);
        }

        for (let i = Project.projects.length - 1; i >= 0; i--) {
            const projectElement = createProjectElement(Project.projects[i], i);
            projectList.appendChild(projectElement);
        }
    }

    function createProjectElement(project, index) {
        const projectDiv = document.createElement('div');
        projectDiv.classList.add("project-options");
        projectDiv.textContent = project.getName();

        const openButton = document.createElement("button");
        openButton.classList.add("open");
        openButton.setAttribute("id", index);
        openButton.textContent = "Open";
        openButton.addEventListener("click", openProject);

        projectDiv.appendChild(openButton);

        if (index !== 0) {
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete");
            deleteButton.setAttribute("id", index);
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", deleteProject);

            projectDiv.appendChild(deleteButton);
        }

        return projectDiv;
    }

    function openProject() {
        let index = this.getAttribute("id");
        currentProject = Project.projects[index];
        localStorage.setItem('currentProjectIndex', index);
        updateProjectListDisplay();
        updateTaskListDisplay();
    }

    function deleteProject() {
        let index = this.getAttribute("id");
        currentProject = Project.projects[index - 1];
        localStorage.setItem('currentProjectIndex', index - 1);
        Project.projects[index].removeProject(index);
        updateProjectListDisplay();
        updateTaskListDisplay();
    }

    function openProjectModal() {
        modal.classList.remove("display-none");
    }

    function closeProjectModal() {
        const input = document.getElementById("projectName");
        input.value = null;
        modal.classList.add("display-none");
    }

    function createProject() {
        const input = document.getElementById("projectName");
        if (input.value.trim() === "") {
            alert("Please fill in the Project Name field.");
            input.value = null;
            return;
        }
        currentProject = new Project(input.value);
        localStorage.setItem('currentProjectIndex', Project.projects.length - 1);
        updateProjectListDisplay();
        updateTaskListDisplay();
        closeProjectModal();
    }

    function openTodoModal() {
        modal2.classList.remove("display-none");
    }

    function closeTodoModal() {
        document.getElementById("todoName").value = null;
        document.getElementById("dueDate").value = null;
        document.getElementById("description").value = null;
        document.getElementById("priority").value = "high";

        modal2.classList.add("display-none");
    }

    function createTodo() {
        const todoName = document.getElementById("todoName");
        const dueDate = document.getElementById("dueDate");
        const description = document.getElementById("description");
        const priority = document.getElementById("priority");
        if (todoName.value.trim() === "" || dueDate.value.trim() === "") {
            alert("Please fill in both the ToDo Name and Due Date fields.");
            return;
        }

        new Task(todoName.value, dueDate.value, description.value, priority.value, currentProject);
        updateTaskListDisplay();
        closeTodoModal();
    }

    function updateTaskListDisplay() {
        const taskDisplay = document.querySelector(".todo-list");
        while (taskDisplay.firstChild) {
            taskDisplay.removeChild(taskDisplay.firstChild);
        }

        for (let i = 0; i < currentProject.tasks.length; i++) {
            const taskElement = createTaskElement(currentProject.tasks[i], i);
            taskDisplay.appendChild(taskElement);
        }
    }

    function createTaskElement(task, index) {
        const taskDiv = document.createElement("div");
        const shortDescription = document.createElement("div");
        shortDescription.classList.add("short-description");
        taskDiv.classList.add("todo-item");

        switch (task.priority) {
            case "high":
                taskDiv.classList.add("priority-high");
                break;
            case "medium":
                taskDiv.classList.add("priority-medium");
                break;
            case "low":
                taskDiv.classList.add("priority-low");
                break;
        }

        const title = document.createElement("h3");
        title.textContent = task.title;
        title.classList.add("title");
        shortDescription.appendChild(title);

        const date = document.createElement("h5");
        date.textContent = task.dueDate;
        date.classList.add("date");
        shortDescription.appendChild(date);

        const description = document.createElement("p");
        description.textContent = task.description;
        description.classList.add("descrip");

        const buttonsContainer = document.createElement("div");

        const removeButton = document.createElement("button");
        removeButton.classList.add("todoButtons");
        removeButton.classList.add("remove");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", removeTask);

        const completeButton = document.createElement("button");
        completeButton.classList.add("todoButtons");
        completeButton.classList.add("complete");
        completeButton.textContent = "Complete";
        completeButton.addEventListener("click", toggleTaskCompletion);

        buttonsContainer.appendChild(removeButton);
        buttonsContainer.appendChild(completeButton);

        removeButton.setAttribute("id", index);
        completeButton.setAttribute("id", index);

        if (task.complete) {
            title.classList.add("finished");
            description.classList.add("finished");
        }

        taskDiv.appendChild(shortDescription);
        taskDiv.appendChild(description);
        taskDiv.appendChild(buttonsContainer);

        return taskDiv;
    }

    function removeTask() {
        let index = this.getAttribute("id");
        currentProject.removeTask(index);
        updateTaskListDisplay();
    }

    function toggleTaskCompletion() {
        let index = this.getAttribute("id");
        currentProject.tasks[index].toggleCompletion();
        updateTaskListDisplay();
    }

    updateProjectListDisplay();
    updateTaskListDisplay();
}

initializeDOM();
