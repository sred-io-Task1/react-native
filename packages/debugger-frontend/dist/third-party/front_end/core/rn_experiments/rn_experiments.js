import*as e from"../root/root.js";const t=e.Runtime.RNExperimentName,i={didInitializeExperiments:!1,isReactNativeEntryPoint:!1};class n{name;title;unstable;docLink;feedbackLink;enabledByDefault;constructor(e){this.name=e.name,this.title=e.title,this.unstable=e.unstable,this.docLink=e.docLink,this.feedbackLink=e.feedbackLink,this.enabledByDefault=function(e,t){if(null==e)return()=>t;if("boolean"==typeof e)return()=>e;return e}(e.enabledByDefault,!1)}}const r=new class{#e=new Map;#t=new Set;register(e){if(i.didInitializeExperiments)throw new Error("Experiments must be registered before constructing MainImpl");const{name:t}=e;if(this.#e.has(t))throw new Error(`React Native Experiment ${t} is already registered`);this.#e.set(t,new n(e))}enableExperimentsByDefault(e){if(i.didInitializeExperiments)throw new Error("Experiments must be configured before constructing MainImpl");for(const i of e)if(Object.prototype.hasOwnProperty.call(t,i)){const e=this.#e.get(i);if(!e)throw new Error(`React Native Experiment ${i} is not registered`);e.enabledByDefault=()=>!0}else this.#t.add(i)}copyInto(e,t=""){for(const[n,r]of this.#e)e.register(n,t+r.title,r.unstable,r.docLink,r.feedbackLink),r.enabledByDefault({isReactNativeEntryPoint:i.isReactNativeEntryPoint})&&e.enableExperimentsByDefault([n]);for(const t of this.#t)e.enableExperimentsByDefault([t]);i.didInitializeExperiments=!0}};r.register({name:t.JS_HEAP_PROFILER_ENABLE,title:"Enable Heap Profiler",unstable:!1,enabledByDefault:({isReactNativeEntryPoint:e})=>!e}),r.register({name:t.REACT_NATIVE_SPECIFIC_UI,title:"Show React Native-specific UI",unstable:!1,enabledByDefault:({isReactNativeEntryPoint:e})=>e}),r.register({name:t.ENABLE_PERFORMANCE_PANEL,title:"Enable Performance panel",unstable:!0,enabledByDefault:({isReactNativeEntryPoint:e})=>!e});var a=Object.freeze({__proto__:null,RNExperimentName:t,setIsReactNativeEntryPoint:function(e){if(i.didInitializeExperiments)throw new Error("setIsReactNativeEntryPoint must be called before constructing MainImpl");i.isReactNativeEntryPoint=e},Instance:r});export{a as RNExperimentsImpl};
