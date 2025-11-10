"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const kyc_module_1 = require("./modules/kyc/kyc.module");
const mandate_module_1 = require("./modules/mandate/mandate.module");
const scan_module_1 = require("./modules/scan/scan.module");
const deletion_module_1 = require("./modules/deletion/deletion.module");
const subscription_module_1 = require("./modules/subscription/subscription.module");
const newsletter_module_1 = require("./modules/newsletter/newsletter.module");
const admin_module_1 = require("./modules/admin/admin.module");
const supabase_config_1 = require("./config/supabase.config");
const stripe_config_1 = require("./config/stripe.config");
const brevo_config_1 = require("./config/brevo.config");
const yousign_config_1 = require("./config/yousign.config");
const google_config_1 = require("./config/google.config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [supabase_config_1.default, stripe_config_1.default, brevo_config_1.default, yousign_config_1.default, google_config_1.default] }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            kyc_module_1.KycModule,
            mandate_module_1.MandateModule,
            scan_module_1.ScanModule,
            deletion_module_1.DeletionModule,
            subscription_module_1.SubscriptionModule,
            newsletter_module_1.NewsletterModule,
            admin_module_1.AdminModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map