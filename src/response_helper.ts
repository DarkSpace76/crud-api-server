export class ResponseHelper<Type> {
    data: Type;
    code: number;

    constructor(data: Type, code: number) {
        this.data = data;
        this.code = code;
    }
}

