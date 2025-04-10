"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.algoliaConfig = void 0;
exports.searchCampaigns = searchCampaigns;
exports.indexCampaigns = indexCampaigns;
// Initialize the Algolia client configuration
var appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'SJ76D9C6X0';
var apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '19398b60d78da7cf2ecf128c35b4db09';
var indexName = 'campaigns';
// Function to search campaigns using the Algolia REST API
function searchCampaigns(query) {
    return __awaiter(this, void 0, void 0, function () {
        var fetchTimerLabel, url, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!query || query.trim() === '') {
                        return [2 /*return*/, []];
                    }
                    fetchTimerLabel = "Algolia Fetch: ".concat(query);
                    console.time(fetchTimerLabel); // Start fetch timer
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    url = "https://".concat(appId, "-dsn.algolia.net/1/indexes/").concat(indexName, "/query");
                    return [4 /*yield*/, fetch(url, {
                            method: 'POST',
                            headers: {
                                'X-Algolia-API-Key': apiKey,
                                'X-Algolia-Application-Id': appId,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                params: "query=".concat(encodeURIComponent(query))
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Algolia search failed: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    return [2 /*return*/, data.hits];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error searching campaigns:', error_1);
                    return [2 /*return*/, []];
                case 5:
                    console.timeEnd(fetchTimerLabel); // End fetch timer
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Function to index campaign data from database
function indexCampaigns(campaigns) {
    return __awaiter(this, void 0, void 0, function () {
        var records_1, url;
        return __generator(this, function (_a) {
            if (!campaigns || campaigns.length === 0) {
                console.warn('No campaigns to index');
                return [2 /*return*/, Promise.resolve()];
            }
            try {
                records_1 = campaigns.map(function (campaign) { return (__assign(__assign({}, campaign), { objectID: campaign.id || campaign.objectID || "campaign_".concat(Date.now(), "_").concat(Math.random().toString(36).substring(2, 9)) })); });
                url = "https://".concat(appId, ".algolia.net/1/indexes/").concat(indexName, "/batch");
                return [2 /*return*/, fetch(url, {
                        method: 'POST',
                        headers: {
                            'X-Algolia-API-Key': process.env.ALGOLIA_ADMIN_API_KEY || apiKey,
                            'X-Algolia-Application-Id': appId,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            requests: records_1.map(function (record) { return ({
                                action: 'addObject',
                                body: record
                            }); })
                        })
                    })
                        .then(function (response) {
                        if (!response.ok) {
                            return response.json().then(function (errorData) {
                                throw new Error("Algolia indexing failed: ".concat(JSON.stringify(errorData)));
                            });
                        }
                        console.log("Successfully indexed ".concat(records_1.length, " campaigns!"));
                    })
                        .catch(function (error) {
                        console.error('Error indexing campaigns:', error);
                        throw error;
                    })];
            }
            catch (error) {
                console.error('Error indexing campaigns:', error);
                return [2 /*return*/, Promise.reject(error)];
            }
            return [2 /*return*/];
        });
    });
}
// For use with react-instantsearch
exports.algoliaConfig = {
    appId: appId,
    apiKey: apiKey,
    indexName: indexName
};
