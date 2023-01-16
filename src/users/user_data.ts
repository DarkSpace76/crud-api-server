import { MyError } from "../app_error";
import { User } from "./user";
import { v1, validate } from 'uuid';
import { Cmd, ErrorMessage, StatusCode } from "../const";
import { ResponseHelper } from "../response_helper";
import cluster from "cluster";
import http from "http";

function httpReq(method, path = '') {
    return http.request({
        hostname: 'localhost',
        port: '4000',
        path: `/api/users/${path}`,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'cmd': 'cmdMaster'
        }
    }, (res) => {
        let resMsg = '';
        res.on('data', function (chunk) {
            resMsg += chunk;
        });
        res.on('end', function () {
            let data = JSON.parse(resMsg);
            process.send(JSON.stringify({ code: data.code, data: JSON.stringify(data.data) }));



        });
    });
}

export class DataBase {
    private users: User[] = [];

    async creat(user: User): Promise<ResponseHelper<User>> {

        user.id = v1();


        if (!cluster.isPrimary) {

            let req = httpReq('POST');
            req.end(JSON.stringify(user));


        } else {
            this.users.push(user);
        }
        return new ResponseHelper(user, StatusCode.C201);
    }

    async getAll(): Promise<ResponseHelper<User[]>> {
        if (!cluster.isPrimary) {

            let req = httpReq('GET');
            req.end();

        }
        return new ResponseHelper(this.users, StatusCode.C200);
    }

    async getOne(id: string): Promise<ResponseHelper<User>> {
        if (!cluster.isPrimary) {
            let req = httpReq('GET', id);
            req.end();

        } else {
            if (validate(id)) {
                let usrResult = this.users.find(((elem, idx, obj) => {
                    if (elem.id === id)
                        return elem;
                }));

                if (!usrResult) throw new MyError(ErrorMessage.ERR_USER_NOT_FOUND, StatusCode.C404)


                return new ResponseHelper(usrResult, StatusCode.C200);

            } else
                throw new MyError(ErrorMessage.ERR_USERID_INVALID, StatusCode.C400);
        }
    }

    async update(id: string, user: User): Promise<ResponseHelper<User>> {
        if (!cluster.isPrimary) {

            let req = httpReq('PUT', id);
            req.end(JSON.stringify(user));

        } else {
            if (validate(id)) {
                const index = this.users.findIndex((item) => item.id === id);
                if (index != -1) {
                    this.users[index].name = user.name;
                    this.users[index].age = user.age;
                    this.users[index].hobbies = user.hobbies;
                    return new ResponseHelper(this.users[index], StatusCode.C200);
                }
                else {
                    throw new MyError(ErrorMessage.ERR_USER_NOT_FOUND, StatusCode.C404);
                }
            } else
                throw new MyError(ErrorMessage.ERR_USERID_INVALID, StatusCode.C400);
        }
    }

    async remove(id: string): Promise<ResponseHelper<User>> {
        if (!cluster.isPrimary) {

            let req = httpReq('DELETE', id);
            req.end();

        } else {
            if (validate(id)) {
                const index = this.users.findIndex((item) => item.id === id);
                if (index != -1) {
                    const user = this.users.splice(index, 1);
                    return new ResponseHelper(user[0], StatusCode.C204);
                } else {
                    throw new MyError(ErrorMessage.ERR_USER_NOT_FOUND, StatusCode.C404);
                }
            } else
                throw new MyError(ErrorMessage.ERR_USERID_INVALID, StatusCode.C400);
        }
    }



}



