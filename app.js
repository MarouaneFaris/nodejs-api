import { createServer } from "node:http";
import { all, create, remove, update } from "./actions/todo.js";
import { NotFoundError } from "./errors/NotFoundError.js";

createServer(async (request, response) => {
    try {
        const requestUrl = (new URL(request.url, `http://${request.headers.host}`));
        const queryParams = requestUrl.searchParams;
        const route = `${request.method}:${requestUrl.pathname}`;

        response.setHeader('Content-Type', 'application/json, charset=utf-8');

        switch (route) {
            case 'GET:/todo':
                await all(request, response);
                break;

            case 'POST:/todo':
                await create(request, response);
                break;

            case 'PUT:/todo':
                await update(request, response, queryParams);
                break;

            case 'DELETE:/todo':
                await remove(request, response, queryParams);
                break;

            default:
                response.writeHead(404);
        }
    } catch (error) {
        if (error instanceof NotFoundError) {
            response.writeHead(404);
        } else {
            response.writeHead(500);

            throw error;
        }
    } finally {
        response.end();
    }
}).listen(3000);
