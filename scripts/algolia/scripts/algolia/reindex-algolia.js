'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === 'function' ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g['throw'] = verb(1)),
      (g['return'] = verb(2)),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
var prisma_1 = require('../../src/lib/prisma'); // Corrected path
var algolia_1 = require('../../src/lib/algolia'); // Corrected path
var enum_transformers_1 = require('../../src/utils/enum-transformers'); // Corrected path
function main() {
  return __awaiter(this, void 0, void 0, function () {
    var campaignsFromDb, transformedCampaigns, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          console.log('Starting re-indexing process...');
          _a.label = 1;
        case 1:
          _a.trys.push([1, 4, 5, 7]);
          console.log('Fetching campaigns from database...');
          return [
            4 /*yield*/,
            prisma_1.prisma.campaignWizard.findMany({
              // include: { Influencer: true }, // Uncomment if you need influencer data
            }),
          ];
        case 2:
          campaignsFromDb = _a.sent();
          console.log('Fetched '.concat(campaignsFromDb.length, ' campaigns.'));
          if (campaignsFromDb.length === 0) {
            console.log('No campaigns found in DB to index.');
            return [2 /*return*/];
          }
          // --- Data Transformation ---
          console.log('Transforming data for Algolia...');
          transformedCampaigns = campaignsFromDb.map(function (campaign) {
            var _a, _b, _c;
            // Use the existing frontend transformer first
            // Assert type to help TypeScript, though it might be loosely typed
            var frontendReady =
              enum_transformers_1.EnumTransformers.transformObjectFromBackend(campaign);
            // Further flatten or select specific fields if needed for Algolia
            // Example: Flatten budget, primaryContact, etc.
            return {
              objectID: frontendReady.id, // Use campaign ID as objectID
              // Use safe access with fallbacks
              campaignName: frontendReady.name || frontendReady.campaignName || 'Unknown Campaign',
              description: frontendReady.businessGoal || frontendReady.description || '',
              status: frontendReady.status || null,
              startDate: frontendReady.startDate || null, // Keep as ISO string or format if needed
              endDate: frontendReady.endDate || null,
              timeZone: frontendReady.timeZone || null,
              // Flatten budget safely
              currency:
                ((_a = frontendReady.budget) === null || _a === void 0 ? void 0 : _a.currency) ||
                null,
              totalBudget:
                ((_b = frontendReady.budget) === null || _b === void 0 ? void 0 : _b.total) || null,
              socialMediaBudget:
                ((_c = frontendReady.budget) === null || _c === void 0 ? void 0 : _c.socialMedia) ||
                null,
              // Add other fields you want searchable
              primaryKPI: frontendReady.primaryKPI || null,
              // Add influencer handles if needed (assuming Influencer relation was included)
              // influencerHandles: frontendReady.Influencer?.map((inf: any) => inf.handle).join(', ') || null,
              // ... add more fields as required for your search use case ...
            };
          });
          console.log('Data transformation complete.');
          // ------------------------
          console.log(
            'Indexing '.concat(transformedCampaigns.length, ' transformed campaigns in Algolia...')
          );
          return [4 /*yield*/, (0, algolia_1.indexCampaigns)(transformedCampaigns)];
        case 3:
          _a.sent(); // This function is in src/lib/algolia.ts
          console.log('Re-indexing complete!');
          return [3 /*break*/, 7];
        case 4:
          error_1 = _a.sent();
          console.error('Error during re-indexing:', error_1);
          process.exit(1); // Exit with error code
          return [3 /*break*/, 7];
        case 5:
          return [4 /*yield*/, prisma_1.prisma.$disconnect()];
        case 6:
          _a.sent(); // Ensure Prisma client disconnects
          console.log('Prisma client disconnected.');
          return [7 /*endfinally*/];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
main();
