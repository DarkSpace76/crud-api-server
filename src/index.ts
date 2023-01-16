import 'dotenv/config';
import http from "http";
import cluster from "cluster";
import os from "os";
import { route, routeCluster, workers } from "./route";
import { parseArgs } from "./parse_args";

const cpus = os.cpus().length;

const PORT: number = Number(process.env.PORT) || 4000;
export let masterPort;
export const args = parseArgs();
export const app = http.createServer(!args['cluster'] ? route : routeCluster);


if (!args['cluster']) {

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}/`);
    });

} else {

    if (cluster.isPrimary) {


        for (let index = 0; index < cpus; index++) {
            const worker = cluster.fork({ PORT: PORT + index + 1, MASTERPORT: PORT });

            workers.push({ worker: worker, isActive: false, handler: null });
        }

        app.listen(PORT, () => {
            console.log(
                `Primary ${process.pid} is running at http://localhost:${PORT}/`,
            );
        });



    } else {
        const processPort = process.env.PORT;
        masterPort = process.env.MASTERPORT;

        app.listen(processPort, () => {

            console.log(
                `Worker ${process.pid} server running at http://localhost:${processPort}/`,
            );
        });
    }

}

