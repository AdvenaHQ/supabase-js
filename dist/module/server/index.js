import"server-only";import{createServerClient as p}from"@supabase/ssr";import{cookies as u}from"next/headers";import{parseOptions as f}from"../helpers/parseOptions";import{extendSupabaseClient as m}from"./extend";let S;async function b(r){const o=await u(),{options:e,authStrategy:s}=f(r);let t="";s==="key"&&(e.role==="service_role"?t=e?.auth?.keys?.secret:t=e?.auth?.keys?.publishable),S=e;const i=p(e.supabaseUrl,t,{cookies:{getAll(){return e.role==="service_role"?[]:o.getAll()},setAll(l){if(e.role!=="service_role")try{for(const{name:a,value:n,options:c}of l)o.set(a,n,c)}catch{}}},...e.config});return m(i)}var v=b;export{v as default,S as globalOptions,b as useSupabase};
//# sourceMappingURL=index.js.map
