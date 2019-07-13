"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var TutorialContract1 = __importStar(require("./TutorialContract1"));
// Invoke the setMark entry point on an instance of Tutorial Contract 1
TutorialContract1.setMark('"Hello World"');
