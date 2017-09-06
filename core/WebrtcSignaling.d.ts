/**
 * WebRtcSiggnalling.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { IWebRTC } from "./IWebRTC";
export interface IMessageExchange {
    to: string;
    from?: string;
    type: string;
    payload: any;
}
export declare function withExchange(webrtcObject: IWebRTC): (message: IMessageExchange) => void;
export declare function withSendMessage(webrtcObject: IWebRTC): (messageType: string, payload: any, optional: {
    to: string;
}) => void;
