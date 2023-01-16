import test from 'supertest';
import { app } from "../src/index";
import { User } from "../src/users/user";
import { ErrorMessage, StatusCode } from "../src/const";

const url = '/api/users';

describe('validate user', () => {
    let instance = new User(
        "43141b40-559d5a15b5cf",
        "testUser",
        25,
        [
            "prog",
            "sport"
        ]
    );

    it('get user by unvalidate id', async () => {
        const response = await test(app).get(`${url}/${instance.id}`);

        expect(response.statusCode).toBe(400);
        expect(response.text).toEqual(`"${ErrorMessage.ERR_USERID_INVALID}"`);
    });

    it('update user by unvalidate id', async () => {
        const response = await test(app).put(`${url}/${instance.id}`)
            .send(JSON.stringify(instance));

        expect(response.statusCode).toBe(400);
        expect(response.text).toEqual(`"${ErrorMessage.ERR_USERID_INVALID}"`);
    });

    it('delte user by unvalidate id', async () => {
        const response = await test(app).delete(`${url}/${instance.id}`);
        expect(response.statusCode).toBe(400);
        expect(response.text).toEqual(`"${ErrorMessage.ERR_USERID_INVALID}"`);
    });

});

describe('default operations', () => {
    let instance;

    it('empty data users ', async () => {
        const exp = {};

        const response = await test(app).get(url);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(exp);

    });

    it('create user', async () => {
        instance = User.getUser(`{
            "name": "testUser",
            "age": 25,
            "hobbies": [
                "prog",
                "sport"
            ]
        }`);

        const response = await test(app).post(url)
            .send(JSON.stringify(instance));

        const resUser = User.fromJson(JSON.parse(response.text));
        instance.id = resUser.id;
        expect(response.statusCode).toBe(201);
        expect(response.body.id).not.toBe('');
        expect(resUser).toEqual(instance);

    });

    it('get user', async () => {
        const response = await test(app).get(`${url}/${instance.id}`);
        const resUser = User.fromJson(JSON.parse(response.text));

        expect(response.statusCode).toBe(200);
        expect(resUser).toEqual(instance);
    });

    it('update user', async () => {
        instance.name = 'testUpdate';
        instance.age = 25;
        instance.hobbies = ['sport'];
        const instanceUpdate = User.getUser(`{
            "name": "testUpdate",
            "age": 25,
            "hobbies": [
                "sport"
            ]
        }`);

        const response = await test(app).put(`${url}/${instance.id}`)
            .send(JSON.stringify(instanceUpdate));
        const resUser = User.fromJson(JSON.parse(response.text));

        expect(response.statusCode).toBe(200);
        expect(resUser).toEqual(instance);
    });

    it('delete user', async () => {
        const response = await test(app).delete(`${url}/${instance.id}`);
        expect(response.statusCode).toBe(204);
    });

});


describe('when there is no user with this id', () => {
    let instance = new User(
        "43141b40-95af-11ed-8b8d-559d5a15b5cf",
        "testUser",
        25,
        [
            "prog",
            "sport"
        ]
    );

    it('no page 404', async () => {
        const response = await test(app).get(`${url}/${url}/${instance.id}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).not.toBeUndefined;
        expect(response.text).toEqual(`"${ErrorMessage.ERR_RESOURCE_NOT_FOUND}"`);
    });


    it('get user 404', async () => {
        const response = await test(app).get(`${url}/${instance.id}`);

        expect(response.statusCode).toBe(404);
        expect(response.text).toEqual(`"${ErrorMessage.ERR_USER_NOT_FOUND}"`);
    });

    it('update user 404', async () => {
        const response = await test(app).put(`${url}/${instance.id}`)
            .send(JSON.stringify(instance));

        expect(response.statusCode).toBe(404);
        expect(response.text).toEqual(`"${ErrorMessage.ERR_USER_NOT_FOUND}"`);
    });

    it('delete user 404', async () => {
        const response = await test(app).delete(`${url}/${instance.id}`);
        expect(response.statusCode).toBe(404);
        expect(response.text).toEqual(`"${ErrorMessage.ERR_USER_NOT_FOUND}"`);
    });

});