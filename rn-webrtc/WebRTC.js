var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { AbstractWEBRTC } from "../core/AbstractWebRTC";
import { PeerManager } from "./PeerManager";
import { UserMedia } from "./UserMedia";
var WebRTC = (function (_super) {
    __extends(WebRTC, _super);
    function WebRTC(configs) {
        var _this = _super.call(this, configs) || this;
        _this.peerManager = new PeerManager({ debug: _this.debug });
        _this.userMedia = new UserMedia({ debug: _this.debug });
        return _this;
    }
    return WebRTC;
}(AbstractWEBRTC.BaseWebRTC));
export { WebRTC };
