const i=(f,e)=>{for(const n of Object.keys(e))e[n]instanceof Object&&f[n]!==void 0&&Object.assign(e[n],i(f[n],e[n]));return{...f,...e}};export{i as deepMerge};
//# sourceMappingURL=deepMerge.js.map
