/**
 * WebRtcSiggnalling.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { IWebRTC } from "./IWebRTC";
export declare function withExchange(webrtcObject: IWebRTC): (message: any) => void;
export declare function withSendMessage(webrtcObject: IWebRTC): (messageType: string, payload: any, optional: {
    to: string;
}) => void;
