import{createBrowserClient as s}from"@supabase/ssr";import{parseOptions as a}from"./helpers/parseOptions";let u;async function n(o){const{options:e,authStrategy:r}=a(o,void 0,"browser");let t="";return r==="key"&&(t=e?.auth?.keys?.publishable),s(e?.supabaseUrl,t,{...e.config})}var l=n;export{l as default,u as globalOptions,n as useSupabase};
//# sourceMappingURL=browser.js.map
