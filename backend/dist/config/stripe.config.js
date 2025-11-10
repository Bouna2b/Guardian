"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('stripe', () => {
    var _a;
    return ({
        secretKey: (_a = process.env.STRIPE_SECRET_KEY) !== null && _a !== void 0 ? _a : '',
    });
});
//# sourceMappingURL=stripe.config.js.map