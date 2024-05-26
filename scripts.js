document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('.todo-input');
    const addButton = document.querySelector('.todo-button');
    const clearButton = document.querySelector('.clear-button');
    const todoList = document.querySelector('.todo-list');

    loadTasks();

    addButton.addEventListener('click', addTask);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    clearButton.addEventListener('click', () => {
        localStorage.removeItem('tasks');
        todoList.innerHTML = '';
    });

    function addTask() {
        const task = input.value.trim();
        if (task !== "") {
            const taskItem = createTaskElement(task);
            todoList.appendChild(taskItem);
            input.value = '';
            saveTasks();
        }
    }

    function createTaskElement(task) {
        const taskItem = document.createElement('li');
        taskItem.className = 'todo-item';
        taskItem.setAttribute('draggable', true);

        const taskSpan = document.createElement('span');
        taskSpan.textContent = task;
        taskSpan.contentEditable = true;
        taskSpan.addEventListener('blur', saveTasks);

        const taskComplete = document.createElement('input');
        taskComplete.type = 'checkbox';
        taskComplete.addEventListener('change', () => {
            taskItem.classList.toggle('completed');
            saveTasks();
        });

        const taskDelete = document.createElement('button');
        taskDelete.textContent = 'X';
        taskDelete.addEventListener('click', () => {
            taskItem.remove();
            saveTasks();
        });

        taskItem.appendChild(taskComplete);
        taskItem.appendChild(taskSpan);
        taskItem.appendChild(taskDelete);

        taskItem.addEventListener('dragstart', dragStart);
        taskItem.addEventListener('dragover', dragOver);
        taskItem.addEventListener('drop', drop);
        taskItem.addEventListener('dragend', dragEnd);

        return taskItem;
    }

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('.todo-item').forEach(item => {
            const task = {
                text: item.querySelector('span').textContent,
                completed: item.classList.contains('completed')
            };
            tasks.push(task);
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            const taskItem = createTaskElement(task.text);
            if (task.completed) {
                taskItem.classList.add('completed');
                taskItem.querySelector('input').checked = true;
            }
            todoList.appendChild(taskItem);
        });
    }

    let draggedItem = null;

    function dragStart(event) {
        draggedItem = event.target;
        setTimeout(() => {
            event.target.style.display = 'none';
        }, 0);
    }

    function dragOver(event) {
        event.preventDefault();
        const currentTask = event.target;
        const bounding = currentTask.getBoundingClientRect();
        const offset = bounding.y + (bounding.height / 2);
        if (event.clientY - offset > 0) {
            currentTask.style['border-bottom'] = 'solid 4px #ccc';
            currentTask.style['border-top'] = '';
        } else {
            currentTask.style['border-top'] = 'solid 4px #ccc';
            currentTask.style['border-bottom'] = '';
        }
    }

    function drop(event) {
        event.preventDefault();
        if (event.target.classList.contains('todo-item')) {
            if (event.target.style['border-bottom']) {
                event.target.style['border-bottom'] = '';
                event.target.parentNode.insertBefore(draggedItem, event.target.nextSibling);
            } else if (event.target.style['border-top']) {
                event.target.style['border-top'] = '';
                event.target.parentNode.insertBefore(draggedItem, event.target);
            }
        }
    }

    function dragEnd(event) {
        event.target.style.display = 'block';
        event.target.style['border-bottom'] = '';
        event.target.style['border-top'] = '';
        saveTasks();
    }
});