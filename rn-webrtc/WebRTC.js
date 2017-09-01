"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractWebRTC_1 = require("../core/AbstractWebRTC");
var PeerManager_1 = require("./PeerManager");
var UserMedia_1 = require("./UserMedia");
var WebRTC = (function (_super) {
    __extends(WebRTC, _super);
    function WebRTC(configs) {
        var _this = _super.call(this, configs) || this;
        _this.peerManager = new PeerManager_1.PeerManager({ debug: _this.debug });
        _this.userMedia = new UserMedia_1.UserMedia({ debug: _this.debug });
        return _this;
    }
    return WebRTC;
}(AbstractWebRTC_1.AbstractWEBRTC.BaseWebRTC));
exports.WebRTC = WebRTC;
