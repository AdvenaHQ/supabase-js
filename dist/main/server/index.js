"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.globalOptions=void 0,exports.useSupabase=s,require("server-only");const p=require("@supabase/ssr"),_=require("next/headers"),f=require("../helpers/parseOptions"),b=require("./extend");async function s(o){const r=await(0,_.cookies)(),{options:e,authStrategy:i}=(0,f.parseOptions)(o);let t="";i==="key"&&(e.role==="service_role"?t=e?.auth?.keys?.secret:t=e?.auth?.keys?.publishable),exports.globalOptions=e;const n=(0,p.createServerClient)(e.supabaseUrl,t,{cookies:{getAll(){return e.role==="service_role"?[]:r.getAll()},setAll(l){if(e.role!=="service_role")try{for(const{name:a,value:u,options:c}of l)r.set(a,u,c)}catch{}}},...e.config});return(0,b.extendSupabaseClient)(n)}exports.default=s;
//# sourceMappingURL=index.js.map
