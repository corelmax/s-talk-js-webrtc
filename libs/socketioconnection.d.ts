declare class SocketIoConnection {
    connection: any;
    constructor(config: any);
    on(ev: any, fn: any): void;
    emit(): void;
    getSessionid(): any;
    disconnect(): any;
}
export default SocketIoConnection;
