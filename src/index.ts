import http from "http";
import cluster from "cluster";
import os from "os";
import { Balancer } from "./balancer";

const cpus = os.cpus().length;

let balancer = new Balancer();

const PORT = 4000;
let workers = [];

let quee = {};
let poolRequest = [];
let workPool = [];

const app = http.createServer((req, res) => {
    if (req.url.includes('api')) {


        if (cluster.isPrimary) {

            poolRequest.unshift(res);
            sendWorkerData();

            /*  for (let i = 0; i < workers.length; i++) {
                 if (workers[i].isActive === false) {
                     workers[i].isActive = true;
                     workers[i].handler = res;
                     workers[i].worker.send('hi');
                     break;
                 }
             } */


        } else {
            res.end('resp from wroker');
        }


    }

});

async function sendWorkerData() {

    for (let i = 0; i < workers.length; i++) {
        if (workers[i].isActive === false) {
            workers[i].isActive = true;
            workers[i].handler = poolRequest.pop();
            workers[i].worker.send(JSON.stringify({ idx: 123 }));
            console.log(`new push ${workers[i].worker.process.pid}`);
            break;
        }

    }

}

if (cluster.isPrimary) {


    for (let index = 0; index < cpus; index++) {
        const worker = cluster.fork({ PORT: PORT + index + 1 });

        workers.push({ worker: worker, isActive: false, handler: null });
    }

    cluster.on('message', (worker, msg) => {
        console.log(worker.id);

        for (let i = 0; i < workers.length; i++) {
            if (workers[i].worker.id === worker.id) {
                workers[i].handler.writeHead(200);
                workers[i].handler.end(`from ${worker.process.pid}   ${msg}`);
                workers[i].isActive = false;
            }

        }


    });
    /* 
        cluster.on('message', (worker, msg) => {
            console.log(`listener worker message ${worker.process.pid}:  ${msg}`);
            // console.log(workers);
    
            for (let i = 0; i < workers.length; i++) {
                if (workers[i].worker.process.pid === worker.process.pid) {
                    console.log('workers finde');
                    console.log(workers[i].worker.process.pid);
                    // console.log(workers[i]);
                    workers[i].handler.response.writeHead(200);
                    console.log('workers head');
                    workers[i].handler.response.end(msg);
                    console.log('workers end');
                    workers[i].isActive = false;
                    workers[i].handler = null;
    
                }
    
            }
    
        }); */

    app.listen(PORT, () => {

        console.log(
            `Primary ${process.pid} is running at http://localhost:${PORT}/`,
        );
    });



} else {
    const processPort = process.env.PORT;

    process.on('message', (msg) => {
        setTimeout(() => {
            console.log(`send worker message ${process.pid}`);

            process.send(msg);
        }, 10000);
    });

    app.listen(processPort, () => {

        console.log(
            `Worker ${process.pid} server running at http://localhost:${processPort}/`,
        );
    });

}
