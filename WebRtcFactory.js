var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * WebRtcFactory.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
import { REACT_NATIVE, REACTJS } from "../consts/Platform";
export class WebRtcFactory {
    static getObject(options) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("userAgent", global["userAgent"]);
            if (!!global["userAgent"] && global["userAgent"] === REACTJS) {
                const { WebRTC } = yield import("./react-webrtc/WebRTC");
                return new WebRTC(options);
            }
            else if (!!global["userAgent"] && global["userAgent"] === REACT_NATIVE) {
                // const { WebRTC } = require("./rn-webrtc/WebRTC");
                // return await new WebRTC(options);
            }
        });
    }
}
