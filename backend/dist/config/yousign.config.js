"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('yousign', () => {
    var _a;
    return ({
        apiKey: (_a = process.env.YOUSIGN_API_KEY) !== null && _a !== void 0 ? _a : '',
    });
});
//# sourceMappingURL=yousign.config.js.map