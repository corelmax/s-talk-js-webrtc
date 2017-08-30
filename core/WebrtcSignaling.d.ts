/**
 * WebRtcSiggnalling.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { AbstractWEBRTC } from "./IWebRTC";
export declare function withExchange(webrtcObject: AbstractWEBRTC.IWebRTC): (message: any) => void;
export declare function withSendMessage(webrtcObject: AbstractWEBRTC.IWebRTC): (messageType: string, payload: any, optional: {
    to: string;
}) => void;
