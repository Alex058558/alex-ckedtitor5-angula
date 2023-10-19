export default class Adapter {
    loader: any;
    reader: any;
    config: any;
    constructor(loader: any, config: any);
    upload(): Promise<any>;
    read(file: Blob): Promise<unknown>;
    abort(): void;
}
