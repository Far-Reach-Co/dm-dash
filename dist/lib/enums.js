"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.megabytesInBytes = exports.userSubscriptionStatus = void 0;
var userSubscriptionStatus;
(function (userSubscriptionStatus) {
    userSubscriptionStatus["userIsNotPro"] = "USER_IS_NOT_PRO";
    userSubscriptionStatus["projectIsNotPro"] = "PROJECT_IS_NOT_PRO";
})(userSubscriptionStatus || (userSubscriptionStatus = {}));
exports.userSubscriptionStatus = userSubscriptionStatus;
var megabytesInBytes;
(function (megabytesInBytes) {
    megabytesInBytes[megabytesInBytes["oneHundred"] = 104857600] = "oneHundred";
})(megabytesInBytes || (megabytesInBytes = {}));
exports.megabytesInBytes = megabytesInBytes;
