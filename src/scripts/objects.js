const getTitle = (data) => ({
    title: () => data.title,
})

const getDescription = (data) => ({
    description: () => data.description,
})

const getDueDate = (data) => ({
    dueDate: () => data.dueDate,
})

const getPriority = (data) => ({
    priority: () => data.priority,
})

const getToDos = (data) => ({
    getItems: () => data.list,
    unpackItems: () => {
        const unpacked = data.list.map(task => {
            const taskObject = {
                title: task.title(),
                description: task.description(),
                dueDate: task.dueDate(),
                priority: task.priority(),
            }
            return taskObject
        })

        const projectItem = {
            title: data.title,
            description: data.description,
            unpacked: unpacked,
            item: data.item,
        }

        return projectItem;
    }
})

const pushNewItem = (data) => ({
    addItem: (item) => {
        data.list.push(item)
    },
})

const getNumberTodos = (data) => ({
    numberOf: () => data.list.length,
    test: () => data.description,
})

const todoItem = (title, description, dueDate, priority) => {
    const data = {
        title,
        description,
        dueDate,
        priority,
    }

    return Object.assign(
        {},
        getTitle(data),
        getDescription(data),
        getDueDate(data),
        getPriority(data)
    )
}

const projectItem = (title, description) => {
    let data = {
        title,
        description,
        list: [],
        item: '',
    }

    return Object.assign(
        {},
        getTitle(data),
        getDescription(data),
        getToDos(data),
        pushNewItem(data),
        getNumberTodos(data)
    )
}

export { projectItem, todoItem }