import { json } from "node:stream/consumers";
import { createTodo, getTodoList, removeTodo, updateTodo } from "../repositories/todo.js";

export const all = async (request, response) => {
    return response.write(await getTodoList());
};

export const create = async (request, response) => {
    const data = await json(request);

    return response
        .writeHead(201)
        .write(
            JSON.stringify(await createTodo(data))
        );
};

export const update = async (request, response, queryParams) => {
    const id = queryParams.get('id');
    const data = await json(request);

    return response.write(JSON.stringify(await updateTodo(id, data)));
};

export const remove = async (request, response, queryParams) => {
    const id = queryParams.get('id');
    await removeTodo(id);

    return response.writeHead(204);
};
