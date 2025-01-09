"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.deepMerge=void 0;const t=(n,e)=>{for(const d of Object.keys(e))e[d]instanceof Object&&n[d]!==void 0&&Object.assign(e[d],(0,exports.deepMerge)(n[d],e[d]));return{...n,...e}};exports.deepMerge=t;
//# sourceMappingURL=deepMerge.js.map
