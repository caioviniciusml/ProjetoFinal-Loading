class Task{
    constructor(taskName){
        this.name = taskName;
        this.done = false;
    }
}

class Notebook{
    constructor(notebookTasks, notebookColor){
        this.id = Date.now();
        this.tasks = notebookTasks
        this.color = notebookColor;
    }
    createTask(newTaskName){
        const newTask = new Task(newTaskName);
        this.addTask(newTask);
    }
    addTask(task){
        this.tasks.push(task);
    }
    changeTaskStatus(taskIndex){
        if (this.tasks[taskIndex].done === true){
            this.tasks[taskIndex].done = false;
        } else{
            this.tasks[taskIndex].done = true;
        }
    }
    deleteTask(taskIndex){
        this.tasks.splice(taskIndex, 1);
    }
    clearTasks(){
        this.tasks = [];
    }
}

class App{
    constructor(){
        this.userNotebooksMax = 4;
        this.notebooksAvailableColors = this.getNotebooksAvailableColors();
        this.updateNotebooksAvailableColors();
        this.userNotebooks = this.getUserNotebooks();
        this.updateUserNotebooks();
        this.actualNotebookIndex = this.getActualNotebookIndex();
        this.selectNotebook(this.actualNotebookIndex);
        this.renderApp();
    }
    getUserNotebooks(){  
        if (localStorage.getItem('userNotebooks') === null){
            return [new Notebook([], this.useNotebookColor())];
        }else{ 
            const userNotebooksJSON = JSON.parse(localStorage.getItem('userNotebooks'))
            let userNotebooks = [];

            for (let notebook of userNotebooksJSON){
                const notebookInstance = new Notebook (notebook.tasks, notebook.color);
                userNotebooks.push(notebookInstance);
            }

            return userNotebooks;
        }
    }
    updateUserNotebooks(){
        localStorage.setItem('userNotebooks', JSON.stringify(this.userNotebooks));
    }
    getActualNotebookIndex(){
        if (localStorage.getItem('actualNotebookIndex') === null){
            return 0;
        }else{ 
            return parseInt(localStorage.getItem('actualNotebookIndex'));
        }
    }
    setActualNotebook(notebookIndex){
        this.actualNotebookIndex = notebookIndex;
        localStorage.setItem('actualNotebookIndex', notebookIndex);
    }
    getNotebooksAvailableColors(){
        if (localStorage.getItem('notebooksAvailableColors') === null){
            return ['rgb(238, 232, 170)', 'rgb(170, 247, 170)', 'rgb(160, 213, 247)', 'rgb(252, 205, 221)'];
        }else{ 
            return JSON.parse(localStorage.getItem('notebooksAvailableColors'));
        }
    }
    updateNotebooksAvailableColors(){
        localStorage.setItem('notebooksAvailableColors', JSON.stringify(this.notebooksAvailableColors));
    }
    useNotebookColor(){
        const color = this.notebooksAvailableColors[0];
        this.notebooksAvailableColors.splice(0,1);
        this.updateNotebooksAvailableColors();
        return color;
    }
    addNotebookColor(color){
        this.notebooksAvailableColors.push(color);
        this.updateNotebooksAvailableColors();
    }
    createNotebook(){
        const newNotebook = new Notebook([], this.useNotebookColor());
        this.addNotebook(newNotebook);
    }
    addNotebook(newNotebook){
        this.userNotebooks.push(newNotebook);
        this.updateUserNotebooks();
        this.selectNotebook(this.userNotebooks.indexOf(newNotebook));
    }
    selectNotebook(notebookIndex){
        this.setActualNotebook(notebookIndex);
        this.renderApp();
    }
    addTaskToNotebook(){
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
    clearNotebook(){
        this.userNotebooks[this.actualNotebookIndex].clearTasks();
        this.updateUserNotebooks();
        this.renderApp();
    }
    deleteNotebook(){
        if (this.userNotebooks.length > 1){
            this.addNotebookColor(this.userNotebooks[this.actualNotebookIndex].color);
            this.userNotebooks.splice(this.actualNotebookIndex, 1);
            this.updateUserNotebooks();
            this.selectNotebook(0);
        }
    }
    completeTask(taskIndex){
        const actualNotebook = this.userNotebooks[this.actualNotebookIndex];
        actualNotebook.changeTaskStatus(taskIndex);
        this.updateUserNotebooks();
        this.renderApp();
    }
    deleteTask(taskIndex){
        const actualNotebook = this.userNotebooks[this.actualNotebookIndex];
        actualNotebook.deleteTask(taskIndex);
        this.updateUserNotebooks();
        this.renderApp();
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