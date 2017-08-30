import { AbstractWEBRTC } from "./index";
export declare class WebRtcFactory {
    static getObject(options: AbstractWEBRTC.WebRtcConfig): Promise<AbstractWEBRTC.IWebRTC | undefined>;
}
