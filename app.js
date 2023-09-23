import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { json } from "node:stream/consumers";

createServer(async (request, response) => {
    const requestUrl = (new URL(request.url, request.headers.host));

    if (requestUrl.pathname !== '/todo') {
        response.writeHead(404);
        response.end();
    }

    const jsonResponse = (content, statusCode = 200) => {
        response.writeHead(statusCode, {
            'Content-Type': 'application/json',
        });

        if (content !== undefined) {
            response.write(content);
        }
    };

    const getTodoById = (id, content) => {
        const todoList = JSON.parse(content);

        return todoList.find((todo) => todo.id === id);
    };

    const getTodoIndexById = (id, content) => {
        const todoList = JSON.parse(content);

        return todoList.findIndex((todo) => todo.id === id);
    };

    const storageFilename = new URL('./storage/todo.json', import.meta.url);
    const content = await readFile(storageFilename, { encoding: 'utf8' }) || '[]';

    const method = request.method;
    const queryParams = requestUrl.searchParams;

    switch (method) {
        case 'GET':
            jsonResponse(content);
            break;

        case 'POST':
            const createdData = await json(request);
            const createdTodo = Object.assign({}, { id: randomUUID() }, createdData);

            const todoList = JSON.parse(content);
            todoList.push(createdTodo);

            await writeFile(storageFilename, JSON.stringify(todoList));
            jsonResponse(JSON.stringify(createdTodo), 201);

            break;

        case 'PUT':
            if (!queryParams.get('id')) {
                jsonResponse(undefined, 400);
                break;
            }

            const alteredTodoIndex = getTodoIndexById(queryParams.get('id'), content);

            if (alteredTodoIndex < 0) {
                jsonResponse(undefined, 404);
                break;
            }

            const alteredData = await json(request);
            const currentTodo = getTodoById(queryParams.get('id'), content);
            const alteredTodo = Object.assign({}, currentTodo, alteredData);
            const updatedTodoList = JSON.parse(content);
            updatedTodoList.splice(alteredTodoIndex, 1, alteredTodo);

            await writeFile(storageFilename, JSON.stringify(updatedTodoList));

            jsonResponse(JSON.stringify(alteredTodo));

            break;

        case 'DELETE':
            if (!queryParams.get('id')) {
                jsonResponse(undefined, 400);
                break;
            }

            const todoIndex = getTodoIndexById(queryParams.get('id'), content);

            if (todoIndex < 0) {
                jsonResponse(undefined, 404);
                break;
            }

            const alteredTodoList = JSON.parse(content);
            alteredTodoList.splice(todoIndex, 1);

            await writeFile(storageFilename, JSON.stringify(alteredTodoList));

            jsonResponse(undefined, 204);
            break;

        default:
            response.writeHead(405, {
                'Allow': 'GET, POST, PUT, DELETE',
            });
    }

    response.end();
}).listen(8888);
