/**
 * WebRtc Modules.
 *
 * Copyright 2017 Ahoo Studio.co.th.
 */
export var AbstractMediaStream;
(function (AbstractMediaStream) {
    AbstractMediaStream.fullHdConstraints = {
        video: { width: { exact: 1920 }, height: { exact: 1080 } }
    };
    AbstractMediaStream.hdConstraints = {
        video: {
            mandatory: {
                minWidth: 1280,
                minHeight: 720
            }
        }
    };
    AbstractMediaStream.vgaConstraints = {
        video: {
            mandatory: {
                maxWidth: 640,
                maxHeight: 360
            }
        }
    };
    AbstractMediaStream.qvgaConstraints = {
        video: {
            mandatory: {
                maxWidth: 320,
                maxHeight: 240
            }
        }
    };
})(AbstractMediaStream || (AbstractMediaStream = {}));
