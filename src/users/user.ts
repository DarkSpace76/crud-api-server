import { MyError } from "../app_error";
import { ErrorMessage, StatusCode } from "../const";


export class User {
    id?: string;
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
            throw new MyError(ErrorMessage.ERR_BODY_INVALID_FORMAT, StatusCode.C400);
        }

        if (typeof userObject.name !== 'string' || typeof userObject.age !== 'number' || !Array.isArray(userObject.hobbies)) {
            throw new MyError(ErrorMessage.ERR_BODY_INVALID_FORMAT, StatusCode.C400);
        }


        return new User(
            '',
            userObject.name,
            userObject.age,
            userObject.hobbies
        );
    }

    public static fromJson(value: any): User {
        return new User(
            value.id,
            value.name,
            value.age,
            value.hobbies
        );
    }

}

