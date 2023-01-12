
import { ERR_BODY_INVALID_FORMAT } from "../const";

export class User {
    id: string;
    name: string;
    age: number;
    hobbies: string[];

    constructor(id: string, name: string, age: number, hobbies: string[]) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.hobbies = hobbies;

    };

    public static getUser(value: string): User {
        let userObject;
        try {
            userObject = JSON.parse(value);
        } catch (err) {
            throw new Error(ERR_BODY_INVALID_FORMAT);
        }

        if (typeof userObject.name !== 'string' || typeof userObject.age !== 'number' || !Array.isArray(userObject.hobbies)) {
            throw new Error(ERR_BODY_INVALID_FORMAT);
        }


        return new User(
            '',
            userObject.name,
            userObject.age,
            userObject.hobbies
        );




    }

}

