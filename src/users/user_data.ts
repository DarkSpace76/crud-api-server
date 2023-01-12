import { User } from "./user";
import { v1, validate } from 'uuid';

export class DataBase {
    private users: User[] = [];

    async creat(user: User): Promise<User> {
        user.id = v1();
        this.users.push(user);

        return user;
    }

    async getAll(): Promise<User[]> {
        return this.users;
    }

    async getOne(id: string): Promise<User> {
        if (validate(id)) {
            return this.users.find(((elem, idx, obj) => {
                if (elem.id === id)
                    return elem;
            }));
        }
    }

    async update(id: string, user: User): Promise<User> {
        if (validate(id)) {
            const index = this.users.findIndex((item) => item.id === id);
            if (index != -1) {
                this.users[index].name = user.name;
                this.users[index].age = user.age;
                this.users[index].hobbies = user.hobbies;
                return this.users[index];
            }


        }
    }

    async remove(id: string): Promise<User> {
        if (validate(id)) {
            const index = this.users.findIndex((item) => item.id === id);
            if (index != -1) {
                const user = this.users.splice(index, 1);
                return user[0];
            }
        }
    }



}



