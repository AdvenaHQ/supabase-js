import o from"chalk";import n from"dayjs";const m=o.white.bold.bgGreenBright(" @advena/supabase "),i=(r,l,t=!1,s)=>{if(s)return;const a=o.gray(n().format("HH:mm:ss")),e=`${m} ${a} ${r}`;if(console.log(e),t)throw new Error(e)};export{i as log};
//# sourceMappingURL=log.js.map
