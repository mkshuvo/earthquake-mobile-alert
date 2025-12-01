declare module 'react-native-paho-mqtt' {
    export class Message {
        constructor(payload: string);
        destinationName: string;
        payloadString: string;
        qos: number;
        retained: boolean;
    }

    export interface ConnectOptions {
        onSuccess?: () => void;
        onFailure?: (error: any) => void;
        userName?: string;
        password?: string;
        cleanSession?: boolean;
        keepAliveInterval?: number;
        timeout?: number;
        useSSL?: boolean;
        reconnect?: boolean;
        hosts?: string[];
        ports?: number[];
    }

    export class Client {
        constructor(options: { uri: string; clientId: string; storage?: any });
        connect(options?: ConnectOptions): Promise<void>;
        subscribe(topic: string, options?: any): Promise<void>;
        unsubscribe(topic: string): Promise<void>;
        send(message: Message): Promise<void>;
        on(event: string, callback: any): void;
        isConnected(): boolean;
        disconnect(): void;
        onConnectionLost: (responseObject: { errorCode: number; errorMessage: string }) => void;
        onMessageArrived: (message: Message) => void;
    }
}
