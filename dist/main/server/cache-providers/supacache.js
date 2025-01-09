"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.SupacacheCacheProviderFetch=void 0,require("server-only");const h=require("../../helpers/log"),a=require("../index"),t=async(r,c)=>{if(a.globalOptions?.cache?.provider!=="supacache")return(0,h.log)("\u26A0\uFE0F The cache provider is not configured for supacache. Please check the configuration. Falling back to default fetch.","warn",!0),fetch(r,c);const e={url:new URL(r),method:c?.method||"GET",headers:new Headers(c?.headers)},s=new URL(a.globalOptions?.cache?.supacache?.url);if(e.method==="GET"){const o=new Headers({...Object.fromEntries(e?.headers?.entries()),...a.globalOptions?.config?.global?.headers||{}});return(e.url.hostname.includes(s.hostname)||e.url.hostname.includes(".supabase.co"))&&(e.url.hostname=s.hostname),o.set("x-cache-service-key",a.globalOptions?.cache?.supacache?.serviceKey),fetch(e.url,{...c,headers:o})}return fetch(r,c)};exports.SupacacheCacheProviderFetch=t;
//# sourceMappingURL=supacache.js.map
