"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSentUserIdsForCampaignQuery = getSentUserIdsForCampaignQuery;
exports.addEmailCampaignSendQuery = addEmailCampaignSendQuery;
const dbconfig_1 = __importDefault(require("../dbconfig"));
function getSentUserIdsForCampaignQuery(campaignSlug, userIds) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!userIds.length) {
            return { rows: [] };
        }
        const query = {
            text: `
      SELECT user_id
      FROM public."EmailCampaignSend"
      WHERE campaign_slug = $1
        AND user_id = ANY($2::int[])
    `,
            values: [campaignSlug, userIds.map((id) => Number(id))],
        };
        return yield dbconfig_1.default.query(query);
    });
}
function addEmailCampaignSendQuery(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      INSERT INTO public."EmailCampaignSend" (campaign_slug, user_id, email)
      VALUES ($1, $2, $3)
      ON CONFLICT (campaign_slug, user_id) DO NOTHING
      RETURNING *
    `,
            values: [data.campaign_slug, Number(data.user_id), data.email],
        };
        return yield dbconfig_1.default.query(query);
    });
}
