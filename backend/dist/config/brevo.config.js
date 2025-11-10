"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('brevo', () => {
    var _a;
    return ({
        apiKey: (_a = process.env.BREVO_API_KEY) !== null && _a !== void 0 ? _a : '',
    });
});
//# sourceMappingURL=brevo.config.js.map