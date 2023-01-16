import { IncomingMessage, ServerResponse } from "node:http"
import { ErrorMessage, StatusCode, Cmd } from "./const"
import { MyError } from "./app_error"
import { DataBase } from "./users/user_data";
import { User } from "./users/user";
import { ResponseHelper } from "./response_helper";
import cluster from "cluster";
import { args } from "../src";

const db = new DataBase();


const route = async (request: IncomingMessage, response: ServerResponse) => {
    let resRequest: ResponseHelper<any>;

    try {
        let id = checkUrl(request.url);

        const buffers = [] as any;

        for await (const chunk of request) {
            buffers.push(chunk);
        }

        const body = Buffer.concat(buffers).toString();

        switch (request.method) {
            case 'GET':
                if (id)
                    resRequest = await db.getOne(id);
                else
                    resRequest = await db.getAll();
                break;

            case 'POST':
                //if (id) throw new MyError(ErrorMessage.ERR_BODY_INVALID_FORMAT, StatusCode.C400);
                resRequest = await db.creat(User.getUser(body));
                break;

            case 'PUT':
                resRequest = await db.update(id, User.getUser(body));
                break;

            case 'DELETE':
                resRequest = await db.remove(id);
                break;

            default:
                throw new MyError(ErrorMessage.ERR_RESOURCE_NOT_FOUND, StatusCode.C404);
        }




    } catch (err) {
        if (err instanceof MyError) {
            resRequest = new ResponseHelper<String>(err.message, err.code);

        } else {
            resRequest = new ResponseHelper<String>(ErrorMessage.ERR_UNEXPECTED_ERROR, StatusCode.C500);
        }
    }

    response.writeHead(resRequest.code);
    response.end(JSON.stringify(resRequest.data));

}


let workers = [];
let poolRequest = [];

const routeCluster = async (request: IncomingMessage, response: ServerResponse) => {
    if (cluster.isPrimary) {


        if (request.headers['cmd'] === 'cmdMaster') {
            try {
                const buffers = [] as any;

                for await (const chunk of request) {
                    buffers.push(chunk);
                }

                const body = Buffer.concat(buffers).toString();

                let id = checkUrl(request.url);


                switch (request.method) {
                    case 'GET': {


                        if (id) {

                            let resp = JSON.stringify(await db.getOne(id));
                            response.writeHead(200);
                            response.end(resp);
                        }
                        else {
                            let resp = JSON.stringify(await db.getAll());

                            response.writeHead(200);
                            response.end(resp);
                        }
                    }
                        break;

                    case 'POST':
                        let newUser = await db.creat(User.getUser(body));
                        response.writeHead(200);
                        response.end(JSON.stringify(newUser));
                        break;

                    case 'PUT':

                        response.writeHead(200);
                        response.end(JSON.stringify(await db.update(id, User.getUser(body))));
                        break;

                    case 'DELETE':

                        response.writeHead(200);
                        response.end(JSON.stringify(await db.remove(id)));
                        break;

                    default:
                        throw new MyError(ErrorMessage.ERR_RESOURCE_NOT_FOUND, StatusCode.C404);
                }

            } catch (err) {
                let resRequest;
                if (err instanceof MyError) {
                    resRequest = new ResponseHelper<String>(err.message, err.code);

                } else {
                    resRequest = new ResponseHelper<String>(ErrorMessage.ERR_UNEXPECTED_ERROR, StatusCode.C500);
                }

                response.writeHead(200);
                response.end(JSON.stringify({ code: resRequest.code, data: JSON.stringify(resRequest.data) }));
            }
        } else {
            poolRequest.unshift({ req: request, res: response });
            sendDataWorker();
        }

    }
}

cluster.on('message', async (worker, msg) => {

    for (let i = 0; i < workers.length; i++) {
        if (workers[i].worker.process.pid === worker.process.pid) {
            let json = JSON.parse(msg.toString());
            const hedler = workers[i].handler.res;
            hedler.setHeader('Content-Type', 'application/json');
            hedler.setHeader('workerId', `${worker.process.pid}`);
            hedler.writeHead(json.code);
            hedler.end(json.data);
            workers[i].isActive = false;
            workers[i].handler = null;

        }

    }





});

if (!cluster.isPrimary) {
    process.on('message', async (msg) => {
        let resRequest: ResponseHelper<any>;
        let json = JSON.parse(msg.toString());
        try {
            let id = checkUrl(json.url);

            switch (json.method) {
                case 'GET':
                    if (id)
                        resRequest = await db.getOne(id);
                    else
                        resRequest = await db.getAll();
                    break;

                case 'POST':
                    resRequest = await db.creat(User.getUser(json.body));
                    break;

                case 'PUT':
                    resRequest = await db.update(id, User.getUser(json.body));
                    break;

                case 'DELETE':
                    resRequest = await db.remove(id);
                    break;

                default:
                    throw new MyError(ErrorMessage.ERR_RESOURCE_NOT_FOUND, StatusCode.C404);
            }




        } catch (err) {

            if (err instanceof MyError) {
                resRequest = new ResponseHelper<String>(err.message, err.code);

            } else {
                resRequest = new ResponseHelper<String>(ErrorMessage.ERR_UNEXPECTED_ERROR, StatusCode.C500);
            }

            process.send(JSON.stringify({ code: resRequest.code, data: JSON.stringify(resRequest.data) }));
        }



    });
}

let nextWorker = 0;
async function sendDataWorker() {
    let handler = poolRequest.pop();
    const buffers = [] as any;

    for await (const chunk of handler.req) {
        buffers.push(chunk);
    }

    const body = Buffer.concat(buffers).toString();

    nextWorker++;
    if (nextWorker === workers.length) nextWorker = 1;

    if (workers[nextWorker].isActive === false && handler) {
        workers[nextWorker].isActive = true;
        workers[nextWorker].handler = handler;
        let data = JSON.stringify({ url: handler.req.url, body: body, method: handler.req.method });
        workers[nextWorker].worker.send(data);

    }
}

function checkUrl(url: string) {
    const params = url.split('/').filter(Boolean);
    const api = params[0];
    const users = params[1];
    const id = params[2];
    const otherParams = params.slice(3, params.length);

    if (`${api}/${users}` !== 'api/users' || otherParams.length > 0) {
        throw new MyError(ErrorMessage.ERR_RESOURCE_NOT_FOUND, StatusCode.C404);
    }

    return id;
}

export {
    route,
    routeCluster,
    checkUrl,
    workers
}