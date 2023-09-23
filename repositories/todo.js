import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { NotFoundError } from "../errors/NotFoundError.js";

const storageFilename = new URL('../storage/todo.json', import.meta.url);

export const getTodoList = async () => {
    return readFile(storageFilename, { encoding: 'utf8', });
};

export const createTodo = async ({ title, completed }) => {
    const todo = {
        id: randomUUID(),
        title,
        completed,
    };

    const todoList = [
        ...JSON.parse(await getTodoList()),
        todo,
    ];

    await writeFile(
        storageFilename,
        JSON.stringify(todoList),
    );

    return todo;
};

export const updateTodo = async (id, { title, completed }) => {
    const todoList = JSON.parse(await getTodoList());
    const todo = todoList.find((todo) => todo.id === id);

    if (!todo) {
        throw new NotFoundError();
    }

    const updatedTodoList = todoList.filter((todo) => todo.id !== id);
    updatedTodoList.push(Object.assign({}, todo, { title, completed }));

    await writeFile(
        storageFilename,
        JSON.stringify(updatedTodoList),
    );

    return todo;
};

export const removeTodo = async (id) => {
    const todoList = JSON.parse(await getTodoList());

    if (todoList.findIndex((todo) => todo.id === id) === -1) {
        throw new NotFoundError();
    }

    return writeFile(
        storageFilename,
        JSON.stringify(todoList.filter((todo) => todo.id !== id)),
    );
};
