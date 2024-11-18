function Task(desc, done = false){
    this.id = Date.now();
    this.desc = desc;
    this.done = done;

    function toggleTaskStatus(){
        this.done = !this.done;
    }
}

function TaskPage(pageName = 'My Notes', pageTasks = new Map(), pageColor = '#000'){
    this.id = Date.now();
    this.name = pageName;
    this.tasks = pageTasks;
    this.color = pageColor;

    function setPageName(newPageName){
        this.name = newPageName;
    }
    function setPageColor(newPageColor){
        this.color = newPageColor;
    }
    function createTask(taskDesc){
        const newTask = new Task(taskDesc);
        this.tasks.set(newTask.id, newTask);
    }
    function deleteTask(task){
        this.tasks.delete(task.id);
    }
    function clearPage(){
        this.tasks.clear();
    }
}

function getUserTaskPagesFromLS(){  
    if (localStorage.getItem('userTaskPages') === null){
        return [new TaskPage()];
    }else{ 
        let userTaskPagesJSON = JSON.parse(localStorage.getItem('userNotebooks'))
        let userTaskPages = [];

        for (let taskPage of userTaskPagesJSON){
            let taskPageObject = new TaskPage(taskPage.name, taskPage.tasks, taskPage.color);
            userTaskPages.push(taskPageObject);
        }

        return userTaskPages;
    }
}

function setUserTaskPagePagesInLS(){
    localStorage.setItem('userTaskPages', JSON.stringify(userTaskPages));
}

function getCurrentTaskPageFromLS(){
    if (localStorage.getItem('currentTaskPage') === null){
        return 0;
    }else{ 
        return parseInt(localStorage.getItem('currentTaskPage'));
    }
}

function setCurrentTaskPageInLS(taskPageId){
    currentTaskPage = taskPageId;
    localStorage.setItem('currentTaskPage', taskPageId);
}

let userTaskPages = getUserTaskPagesFromLS();
let currentTaskPage = getCurrentTaskPageFromLS();

class App{
    constructor(){
        this.updateUserNotebooks();
        this.renderApp();
    }
    createTaskPage(){
        const newNotebook = new Notebook([], this.useNotebookColor());
        this.addNotebook(newNotebook);
    }
    selectCurrentTaskPage(notebookIndex){
        this.setActualNotebook(notebookIndex);
        this.renderApp();
    }
    deleteTaskPage(){
        if (this.userNotebooks.length > 1){
            this.addNotebookColor(this.userNotebooks[this.actualNotebookIndex].color);
            this.userNotebooks.splice(this.actualNotebookIndex, 1);
            this.updateUserNotebooks();
            this.selectNotebook(0);
        }
    }
    addTaskToTaskPage(){
        const newTaskName = document.getElementById('new-task-text-field').value;
        const actualNotebook = this.userNotebooks[this.actualNotebookIndex];

        if (newTaskName === ''){
            window.alert('Insira uma Tarefa Válida')
        } else{
            actualNotebook.createTask(newTaskName);
            this.updateUserNotebooks();
            location.reload();
        }
    }
    renderUserNotebooks(){
        const userNotebooksNav = document.getElementById('all-user-notebooks');
        userNotebooksNav.innerHTML = '';
        
        for (let notebook of this.userNotebooks){
            let notebookButtonHTML = `<button class="notebook-button" style="background-color: ${notebook.color};" onclick="app.selectNotebook(${this.userNotebooks.indexOf(notebook)})">Caderno ${this.userNotebooks.indexOf(notebook) + 1}</button>`;
            userNotebooksNav.innerHTML += notebookButtonHTML;
        }

        if (this.userNotebooks.length !== this.userNotebooksMax){
            userNotebooksNav.innerHTML += `<button id="create-new-notebook" class="notebook-button" onclick="app.createNotebook()">+</button>`;
        }
    }
    renderUserTasks(notebookIndex){
        let notebookTasks = document.getElementById('notebook-tasks');
        let selectedNotebook = this.userNotebooks[notebookIndex];
        notebookTasks.style.backgroundColor = `${selectedNotebook.color}`;
        notebookTasks.innerHTML = `<h2 id="notebook-name">Caderno ${this.userNotebooks.indexOf(selectedNotebook)}</h2>`;

        if(selectedNotebook.tasks.length === 0){
            notebookTasks.innerHTML += `
                <span id="notebook-advice">Este Caderno Esta Sem Tarefas.Tente Adicionar Algumas.</span>
                <div id="notebook-options-buttons">
                </div>`;
        } else{
            for (let task of selectedNotebook.tasks){
                const checkboxStyle = task.done === true ? 'checked': 'unchecked';
                const textStyle = task.done === true ? 'line-through': '';

                let taskHTML = `
                <div class="task">
                    <input type="checkbox" onclick="app.completeTask(${selectedNotebook.tasks.indexOf(task)})" ${checkboxStyle}> 
                    <span class="task-name" style="text-decoration: ${textStyle};">${task.name}</span>
                    <button id="delete-task-button" onclick="app.deleteTask(${selectedNotebook.tasks.indexOf(task)})"><img src="images/deleteTaskIcon.png"></button>
                </div>`;
                notebookTasks.innerHTML += taskHTML;
            }

            notebookTasks.innerHTML += `
                <div id="notebook-options-buttons">
                    <button id="clear-notebook-button" onclick="app.clearNotebook()">Limpar Tarefas</button>
                </div>`;;
        }
        
        let notebookOptionsButtons = document.getElementById('notebook-options-buttons');
        notebookOptionsButtons.innerHTML += `<button id="delete-notebook-button" onclick="app.deleteNotebook()">Deletar Caderno</button>`;
    }
    renderApp(){
        this.renderUserNotebooks();
        this.renderUserTasks(this.actualNotebookIndex);
    }
}

const app = new App();

window.addEventListener('keypress', (e) =>{
    if (e.key == 'Enter'){
        app.addTaskToNotebook();
    }
})