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

    remove(index) {
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
        if(storedProjects){
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

    toComplete() {
        this.complete = !this.complete;
        Project.saveToLocalStorage();
    }
}

function DOM(){
    Project.loadFromLocalStorage();

    const projectButton = document.getElementById("new-project");
    const cancelButton = document.querySelector(".cancel");
    const createButton = document.querySelector(".create");
    const modal = document.querySelector(".modal-wrapper");

    projectButton.addEventListener("click", projectButtonEvent);
    cancelButton.addEventListener("click", closeModalEvent);
    createButton.addEventListener("click", createButtonEvent);



    const todoCreateButton = document.querySelector(".todocreate");
    const todoCancelButton = document.querySelector(".todocancel");
    const addButton = document.getElementById("add-todo");
    const modal2 = document.querySelector(".modal-wrapper2");

    addButton.addEventListener("click", addButtonEvent);
    todoCancelButton.addEventListener("click", todoCancelButtonEvent);
    todoCreateButton.addEventListener('click', todoCreateButtonEvent);

    let currentProjectIndex = localStorage.getItem('currentProjectIndex');
    let currentProject = Project.projects.length ? (currentProjectIndex !== null ? Project.projects[currentProjectIndex] : Project.projects[0]) : new Project("Default");

    function updateCurrentDisplay() {
        const currentDisplay = document.getElementById("current-project");
        currentDisplay.textContent = currentProject.getName();

        const list = document.getElementById("project-list");
        while(list.firstChild){
            list.removeChild(list.firstChild);
        }

        for (let i = Project.projects.length - 1; i >= 0; i--) {
            const newProject = fillProject(Project.projects[i], i);
            list.appendChild(newProject);
        }
    }

    function fillProject(project, i) {
        const newProject = document.createElement('div');
        newProject.classList.add("project-options");
        newProject.textContent = project.getName();

        const openButton = document.createElement("button");
        openButton.classList.add("open");
        openButton.setAttribute("id", i);
        openButton.textContent = "Open";
        openButton.addEventListener("click", openProjectButtonEvent);
        newProject.appendChild(openButton);

        if(i!==0){
            const deleteButton = document.createElement("button")
            deleteButton.classList.add("delete");
            deleteButton.setAttribute("id", i);
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", deleteProjectButtonEvent);
            newProject.appendChild(deleteButton);
        }
        return newProject;
    }

    function openProjectButtonEvent() {
        let index = this.getAttribute("id");
        currentProject = Project.projects[index];
        localStorage.setItem('currentProjectIndex', index);
        updateCurrentDisplay();
        updateToDoDisplay();
    }

    function deleteProjectButtonEvent() {
        let index = this.getAttribute("id");
        currentProject = Project.projects[index - 1];
        localStorage.setItem('currentProjectIndex', index - 1);
        Project.projects[index].remove(index);
        updateCurrentDisplay();
        updateToDoDisplay();
    }


    function projectButtonEvent() {
        modal.classList.remove("display-none");
    }

    function closeModalEvent() {
        const input = document.getElementById("projectName");
        input.value = null;
        modal.classList.add("display-none");
    }

    function createButtonEvent() {
        const input = document.getElementById("projectName");
        if(input.value.trim()===""){
            alert("Please fill in the Project Name field.");
            input.value=null;
            return;
        }
        currentProject = new Project(input.value);
        localStorage.setItem('currentProjectIndex', Project.projects.length - 1);
        updateCurrentDisplay();
        updateToDoDisplay();
        closeModalEvent();
    }

    function addButtonEvent() {
        modal2.classList.remove("display-none");
    }

    function todoCancelButtonEvent() {
        document.getElementById("todoName").value = null;
        document.getElementById("dueDate").value = null;
        document.getElementById("description").value = null;
        document.getElementById("priority").value = "high";

        modal2.classList.add("display-none");
    }

    function todoCreateButtonEvent() {
        const todoName = document.getElementById("todoName");
        const dueDate = document.getElementById("dueDate");
        const description = document.getElementById("description");
        const priority = document.getElementById("priority");
        if(todoName.value.trim() === "" || dueDate.value.trim() === ""){
            alert("Please fill in both the ToDo Name and Due Date fields.");
            return;
        }
            
        new Task(todoName.value, dueDate.value, description.value, priority.value, currentProject);
        updateToDoDisplay();
        todoCancelButtonEvent();
    }

    function updateToDoDisplay() {
        const todoDisplay = document.querySelector(".todo-list");
        while (todoDisplay.firstChild) {
            todoDisplay.removeChild(todoDisplay.firstChild);
        }

        for(let i=0; i<currentProject.tasks.length; i++){
            const todo = fillToDo(currentProject.tasks[i], i);
            todoDisplay.appendChild(todo);
        }
    }

    function fillToDo(task, i) {
        const todo = document.createElement("div");
        const small = document.createElement("div");
        small.classList.add("short-description");
        todo.classList.add("todo-item");
        switch (task.priority) {
            case "high":
                todo.classList.add("priority-high");
                break;
            case "medium":
                todo.classList.add("priority-medium");
                break;
            case "low":
                todo.classList.add("priority-low");
                break;
        }

        const title = document.createElement("h3");
        title.textContent = task.title;
        title.classList.add("title");
        small.appendChild(title);

        const date = document.createElement("h5");
        date.textContent = task.dueDate;
        date.classList.add("date");
        small.appendChild(date);

        const description = document.createElement("p");
        description.textContent = task.description;
        description.classList.add("descrip");

        const buttonsContainer = document.createElement("div");

        const todoRemove = document.createElement("button");
        todoRemove.classList.add("todoButtons");
        todoRemove.classList.add("remove");
        todoRemove.textContent = "Remove";
        todoRemove.addEventListener("click", removeToDo);

        const todoComplete = document.createElement("button");
        todoComplete.classList.add("todoButtons");
        todoComplete.classList.add("complete");
        todoComplete.textContent = "Complete";
        todoComplete.addEventListener("click", completeToDo);

        buttonsContainer.appendChild(todoRemove);
        buttonsContainer.appendChild(todoComplete);

        todoRemove.setAttribute("id", i);
        todoComplete.setAttribute("id", i);

        if (task.complete === true) {
            title.classList.add("finished");
            description.classList.add("finished");
        }

        todo.appendChild(small);
        todo.appendChild(description);
        todo.appendChild(buttonsContainer);

        return todo;
    }

    function removeToDo() {
        let index = this.getAttribute("id");
        currentProject.removeTask(index);
        updateToDoDisplay();
    }

    function completeToDo() {
        let index = this.getAttribute("id");
        currentProject.tasks[index].toComplete();
        updateToDoDisplay();
    }

    updateCurrentDisplay();
    updateToDoDisplay();
}

DOM();