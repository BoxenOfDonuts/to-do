import { generateProjectForm } from './scripts/forms'
import { divFactory, createText } from './scripts/utils'
import { projectItem, todoItem } from './scripts/objects'

const displayController = (() => {
    const _projectItemLayout = (name, count) => {
        const li = document.createElement('li')
        li.classList.add('project-li')
        const div = divFactory('project-item')
        const projectName = createText(name, 'span')
        const counter = createText(count, 'span')
        counter.classList.add('project-counter')

        div.appendChild(projectName)
        div.appendChild(counter)
        li.appendChild(div)

        return li
    }

    const _todoLayout = (description, dueDate, priority) => {
        const li = document.createElement('li')
        li.classList.add('todo-li')
        const div = divFactory('todo-item')
        const checkbox = document.createElement('input')
        checkbox.setAttribute('type', 'checkbox')
        const desc = createText(description, 'div')
        const date = createText(dueDate, 'div')
        const pri = createText(priority, 'div')

        div.appendChild(checkbox)
        div.appendChild(desc)
        div.appendChild(date)
        div.appendChild(pri)
        li.appendChild(div)

        return li
    }

    const _projectFormEventListeners = () => {
        const formButtons = document.querySelectorAll('.project-form button')
        const overlay = document.querySelector('.dialog-overlay')
        // const inputs = document.querySelectorAll('.form-body > input[type=text')

        // removes event listener after it fires
        overlay.addEventListener('click', handleProjectForm)
    
        formButtons.forEach((button) => {
            button.addEventListener('click', handleProjectForm)
        })


    }

    const drawProjectForm = () => {
        const parent = document.querySelector('body')
        const overlay = document.createElement('div')
        overlay.classList.add('dialog-overlay')
        overlay.dataset['overlay'] = true

        parent.insertAdjacentElement('afterbegin', overlay)
        overlay.appendChild(generateProjectForm())

        _projectFormEventListeners()

    }

    const _clearChildNodesOf = (node) => {
        while (node.firstElementChild) {
            node.firstElementChild.remove()
        }
    }

    const drawProjects = () => {
        const parent = document.querySelector('.projects');
        _clearChildNodesOf(parent);
        let array = projectController.listProjects()
        const projects = document.querySelector('.projects')
        const projectList = document.createElement('ul')
        let counter = 0

        array.forEach((object) => {
            console.log(object.getItems().length)
            const li = _projectItemLayout(
                object.title(),
                object.getItems().length
            )
            li.dataset['projectKey'] = counter
            projectList.appendChild(li)
            counter++
        })

        projects.appendChild(projectList)
    }

    const _drawAddActions = (title) => {
        const parent = document.createElement('li')
        parent.innerHTML =  `<div class="action add-todo">
                    <i class="las la-plus"></i>
                    <p>${title}</p>
                </div>`
        return parent;
    }

    const drawProjectToDos = (key) => {
        const parent = document.querySelector('.todos-list');
        _clearChildNodesOf(parent);
        let array = projectController.listProjectItems(key);
        const list = document.createElement('ul');
        list.appendChild(_drawAddActions("Add Task"));
        let counter = 0;
        
        array.forEach((object) => {
            const li = _todoLayout(
                object.description(),
                object.dueDate(),
                object.priority()
            )
            li.dataset['itemKey'] = counter
            list.appendChild(li)
            counter++
        })
        
        parent.appendChild(list)
    }

    const closeForm = () => {
        const overlay = document.querySelector('.dialog-overlay');
        // overlay.removeEventListener('click', handleProjectForm);
        overlay.remove();
    }

    return { drawProjectForm, drawProjects, drawProjectToDos, closeForm }
})()

const projectController = (() => {
    let projectList = []

    const listProjects = () => projectList

    const addProject = (project) => {
        projectList.push(project)
    }

    const removeProject = (project) => {
        // placeholder, update
        projectList.slice(0, 1)
    }

    const listProjectItems = (key) => projectList[key].getItems()

    return { addProject, listProjects, listProjectItems }
})()

function handleClick(e) {
    displayController.drawProjectForm()
}

function handleProjectForm(e) {
    e.stopPropagation()
    const target = e.target.value
    if (target === 'add') {
        console.log('add')
        grabForm()
    } else {
        if (e.target.dataset.overlay || target === 'cancel') {
            cancelForm();
        }
    }
}

function cancelForm() {
    displayController.closeForm()
}

function grabForm() {
    const name = document.querySelector('.form-body > .name').value;
    const desc = document.querySelector('.form-body > .desc').value;

    if (!name) {
        alert("Please fill out the name!")
        return
    }

    projectController.addProject(projectItem(name, desc));
    cancelForm();
    displayController.drawProjects()
}

const projects = document.querySelector('.projects');
projects.addEventListener('click', e => {
    const projectItem = e.target.closest('li');
    if (!projectItem) return;
    const key = projectItem.dataset.projectKey;
    console.log(key);

    displayController.drawProjectToDos(key);

})



// displayController.drawProjectForm();
const addProjectButton = document.querySelector('.add-project')
addProjectButton.addEventListener('click', handleClick)

let project1 = projectItem('New Project', 'My Super Cool Project')
let x = todoItem('To Do 1', 'IDK', 'never', '!!!')
let y = todoItem('To Do 2', 'IDK', 'never', '!!!')
let z = todoItem('To Do 3', 'IDK', 'never', '!!!')

project1.addItem(x)
project1.addItem(y)
project1.addItem(z)

let project2 = projectItem('New Project 2', 'My Super Cool Project')
project2.addItem(x)
project2.addItem(y)
project2.addItem(z)

let project3 = projectItem('New Project 3', 'My Super Cool Project')

project3.addItem(x)

project1.getItems()
console.log(project1.test())

projectController.addProject(project1)
projectController.addProject(project2)
projectController.addProject(project3)

// projectController.addProject(project1);
displayController.drawProjects()

// displayController.drawProjectToDos(0)
