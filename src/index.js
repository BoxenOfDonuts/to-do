/* eslint-disable no-use-before-define */
import { generateProjectForm, generateTaskForm } from './scripts/forms'
import { divFactory, createText } from './scripts/utils'
import { projectItem, todoItem } from './scripts/objects'
import './resources/styles/index.css'

const displayController = (() => {
    const _projectItemLayout = (name, count, key) => {
        const li = document.createElement('li')
        const button = document.createElement('i')
        const div = divFactory('project-item')
        const projectName = createText(name, 'span')
        const counter = createText(count, 'span')
        const textDiv = divFactory('text')
        button.value = key
        button.classList.add('las', 'la-trash')
        li.classList.add('project-li')
        counter.classList.add('project-counter')

        textDiv.appendChild(projectName)
        textDiv.appendChild(counter)
        div.appendChild(textDiv)
        div.appendChild(button)
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

    const _clearChildNodesOf = (node) => {
        while (node.firstElementChild) {
            node.firstElementChild.remove()
        }
    }

    const _setActiveProject = (key) => {
        const projectsItems = document.querySelectorAll('.project-li')
        const newActiveProject = document.querySelector(
            `li[data-project-key='${key}']`
        )
        projectsItems.forEach((project) => {
            if (project.classList.contains('active')) {
                project.classList.remove('active')
            }
        })

        newActiveProject.classList.add('active')
    }

    const _drawAddActions = (title) => {
        const parent = document.createElement('li')
        parent.classList.add('action-li')
        parent.innerHTML = `<div class="action add-todo">
                    <p class="plus">+</p>
                    <p>${title}</p>
                </div>`

        return parent
    }

    const _updateTaskHeader = (project) => {
        const header = document.querySelector('.task-tab > h1')
        header.innerHTML = project
    }

    const _projectFormEventListeners = () => {}

    const _addTaskListener = () => {
        const addButton = document.querySelector('.add-todo')
        addButton.addEventListener('click', handleAddTask)
    }

    const drawProjectForm = () => {
        const parent = document.querySelector('body')
        const overlay = document.createElement('div')
        overlay.classList.add('dialog-overlay')
        overlay.dataset.overlay = true

        parent.insertAdjacentElement('afterbegin', overlay)
        overlay.appendChild(generateProjectForm())

        // was in the _projectFormEventListeners
        eventListenerController.addForEach(
            '.project-form button',
            'click',
            handleProjectForm
        )
        eventListenerController.add(
            '.dialog-overlay',
            'click',
            handleProjectForm
        )
    }

    const drawTaskForm = () => {
        const parent = document.querySelector('.action-li')
        _clearChildNodesOf(parent)
        parent.append(generateTaskForm())

        eventListenerController.addForEach(
            '.todo-footer button',
            'click',
            handleTaskForm
        )
    }

    const drawProjects = () => {
        const parent = document.querySelector('.projects')
        _clearChildNodesOf(parent)
        const array = projectController.listProjects()
        const projectList = document.createElement('ul')
        let counter = 0

        array.forEach((object) => {
            const li = _projectItemLayout(
                object.title(),
                object.getItems().length,
                counter
            )
            li.dataset.projectKey = counter
            projectList.appendChild(li)
            counter += 1
        })

        parent.appendChild(projectList)
    }

    const drawProjectToDos = (key) => {
        const parent = document.querySelector('.todo-list')
        parent.dataset.currentProject = key
        _clearChildNodesOf(parent)
        if (key === false) return
        const array = projectController.listProjectItems(key)
        const list = document.createElement('ul')
        list.appendChild(_drawAddActions('Add Task'))
        let counter = 0

        array.forEach((object) => {
            const li = _todoLayout(
                object.description(),
                object.dueDate(),
                object.priority()
            )
            li.dataset.itemKey = counter
            list.appendChild(li)
            counter += 1
        })

        parent.appendChild(list)
        _updateTaskHeader(projectController.projectTitle(key))
        _setActiveProject(key)
        _addTaskListener()
    }

    const closeForm = () => {
        const overlay = document.querySelector('.dialog-overlay')
        // overlay.removeEventListener('click', handleProjectForm);
        overlay.remove()
    }

    return {
        drawProjectForm,
        drawProjects,
        drawProjectToDos,
        closeForm,
        drawTaskForm,
    }
})()

const projectController = (() => {
    const projectList = []

    const _unpack = () => {
        const unpacked = projectList.map((project) => project.unpackProjects())
        return unpacked
    }

    const _save = () => {
        storageController.saveToLocalStorage(_unpack())
    }

    const _loadFromStorage = () => {}

    const listProjectItems = (key) => projectList[key].getItems()

    const projectTitle = (key) => projectList[key].title()

    const listProjects = () => projectList

    const numberOfProjects = () => projectList.length

    const welcomeProject = () => {
        const welcome = projectItem('Welcome!', '')
        const welcomeTask = todoItem(
            '',
            'Your First Task! Click the checkbox to complete me',
            '',
            0
        )

        welcome.addItem(welcomeTask)
        projectList.push(welcome)
        displayController.drawProjects()
        displayController.drawProjectToDos(0)
    }

    const initialProjectLoad = (savedProjects) => {
        // projectList = [...savedProjects];
        savedProjects.forEach((project) => {
            const projectI = projectItem(project.title, project.description)
            project.unpacked.forEach((task) => {
                const todo = todoItem(
                    task.title,
                    task.description,
                    task.dueDate,
                    task.priority
                )
                projectI.addItem(todo)
            })
            projectList.push(projectI)
        })
        displayController.drawProjects()
        displayController.drawProjectToDos(0)
    }

    const addProject = (project) => {
        projectList.push(project)
        _save()
    }

    const removeProject = (key) => {
        const defaultDraw = key - 1 <= 0 ? 0 : key - 1
        projectList.splice(key, 1)
        _save()
        displayController.drawProjects()
        if (projectList.length !== 0) {
            displayController.drawProjectToDos(defaultDraw)
        } else {
            storageController.removeFromLocalStorage()
            displayController.drawProjectToDos(false)
        }
    }

    const removeTask = (key) => {
        const projectId = document.querySelector('.todo-list').dataset
            .currentProject
        projectList[projectId].getItems().splice(key, 1)
        _save()
        displayController.drawProjects()
        displayController.drawProjectToDos(projectId)
    }

    const addTaskToProject = (key, todo) => {
        const currentProject = projectList[key]
        currentProject.addItem(todo)
        _save()
    }

    return {
        addProject,
        listProjects,
        listProjectItems,
        addTaskToProject,
        numberOfProjects,
        initialProjectLoad,
        removeProject,
        removeTask,
        projectTitle,
        welcomeProject,
    }
})()

const storageController = (() => {
    const saveName = 'projects'

    const saveToLocalStorage = (object) => {
        // const object= projectController.listProjects()
        localStorage.setItem(saveName, JSON.stringify(object))
    }
    const removeFromLocalStorage = () => {
        localStorage.removeItem(saveName)
    }

    const loadFromLocalStorage = () => {
        const doesExist = localStorage.getItem(saveName)

        if (doesExist) {
            projectController.initialProjectLoad(JSON.parse(doesExist))
        } else {
            projectController.welcomeProject()
        }
    }

    return { saveToLocalStorage, removeFromLocalStorage, loadFromLocalStorage }
})()

const eventListenerController = (() => {
    const add = (selector, type, func) => {
        const parent = document.querySelector(selector)
        parent.addEventListener(type, func)
    }

    const addForEach = (selector, type, func) => {
        const parent = document.querySelectorAll(selector)
        parent.forEach((child) => child.addEventListener(type, func))
    }

    return { add, addForEach }
})()

function handleClick(e) {
    displayController.drawProjectForm()
}

function handleProjectForm(e) {
    e.stopPropagation()
    const target = e.target.value
    if (target === 'add') {
        const { name, desc } = grabForm()
        projectController.addProject(projectItem(name, desc))
        cancelForm()
        displayController.drawProjects()
        displayController.drawProjectToDos(
            projectController.numberOfProjects() - 1
        )
    } else if (e.target.dataset.overlay || target === 'cancel') {
        cancelForm()
    }
}

function cancelForm() {
    displayController.closeForm()
}

function grabForm() {
    const name = document.querySelector('.form-body > .name').value
    const desc = document.querySelector('.form-body > .desc').value

    if (!name) {
        alert('Please fill out the name!')
        return
    }

    return { name, desc }
}

function handleTaskForm(e) {
    const target = e.target.value
    const project = document.querySelector('.todo-list').dataset.currentProject

    if (target === 'add') {
        const { title, date, priority } = grabTaskForm()
        const todo = todoItem('title', title, date, priority)
        projectController.addTaskToProject(project, todo)
        displayController.drawProjectToDos(project)
        displayController.drawProjects()
    } else {
        displayController.drawProjectToDos(project)
    }
}

function grabTaskForm() {
    const title = document.querySelector('.todo-container > .task').value
    const date = document.querySelector('.form-container > input[type=date]')
        .value
    const priority = document.querySelector('.form-container > select').value

    return { title, date, priority }
}

const projects = document.querySelector('.projects')
projects.addEventListener('click', (e) => {
    const tag = e.target.tagName
    if (tag !== 'I') return
    const confirmAction = confirm('Are you Sure?')
    if (confirmAction) {
        const key = Number(e.target.value)
        projectController.removeProject(key)
    }
})
projects.addEventListener('click', (e) => {
    const li = e.target.closest('li')
    if (!li || e.target.tagName === 'I') return
    const key = li.dataset.projectKey
    displayController.drawProjectToDos(key)
})

function handleChecks(e) {
    const li = e.target.closest('li')
    if (!li || !e.target.checked) return
    const key = li.dataset.itemKey

    setTimeout(() => {
        projectController.removeTask(key)
    }, 3000)
}

function handleAddTask(e) {
    displayController.drawTaskForm()
}

const checkboxes = document.querySelector('.task-tab')
checkboxes.addEventListener('change', handleChecks)
checkboxes.addEventListener('transitionend', handleChecks)

const addProjectButton = document.querySelector('.add-project')
addProjectButton.addEventListener('click', handleClick)
storageController.loadFromLocalStorage()
