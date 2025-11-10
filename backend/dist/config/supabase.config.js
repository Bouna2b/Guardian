"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('supabase', () => {
    var _a, _b, _c;
    return ({
        url: (_a = process.env.SUPABASE_URL) !== null && _a !== void 0 ? _a : '',
        key: (_b = process.env.SUPABASE_KEY) !== null && _b !== void 0 ? _b : '',
        serviceRoleKey: (_c = process.env.SUPABASE_SERVICE_ROLE_KEY) !== null && _c !== void 0 ? _c : '',
    });
});
//# sourceMappingURL=supabase.config.js.map