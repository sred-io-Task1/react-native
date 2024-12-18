import*as t from"../../core/platform/platform.js";class e{callFrame;callUID;self;total;id;parent;children;functionName;depth;deoptReason;constructor(t){this.callFrame=t,this.callUID=`${t.functionName}@${t.scriptId}:${t.lineNumber}:${t.columnNumber}`,this.self=0,this.total=0,this.id=0,this.functionName=t.functionName,this.parent=null,this.children=[]}get scriptId(){return String(this.callFrame.scriptId)}get url(){return this.callFrame.url}get lineNumber(){return this.callFrame.lineNumber}get columnNumber(){return this.callFrame.columnNumber}setFunctionName(t){null!==t&&(this.functionName=t)}}class i{root;total;maxDepth;constructor(){}initialize(t){this.root=t,this.assignDepthsAndParents(),this.total=this.calculateTotals(this.root)}assignDepthsAndParents(){const t=this.root;t.depth=-1,t.parent=null,this.maxDepth=0;const e=[t];for(;e.length;){const t=e.pop(),i=t.depth+1;i>this.maxDepth&&(this.maxDepth=i);const s=t.children;for(const o of s)o.depth=i,o.parent=t,e.push(o)}}calculateTotals(t){const e=[t],i=[];for(;e.length;){const t=e.pop();t.total=t.self,i.push(t),e.push(...t.children)}for(;i.length>1;){const t=i.pop();t.parent&&(t.parent.total+=t.total)}return t.total}}var s=Object.freeze({__proto__:null,ProfileNode:e,ProfileTreeModel:i});class o extends e{id;self;positionTicks;deoptReason;constructor(t,e){super(t.callFrame||{functionName:t.functionName,scriptId:t.scriptId,url:t.url,lineNumber:t.lineNumber-1,columnNumber:t.columnNumber-1}),this.id=t.id,this.self=(t.hitCount||0)*e,this.positionTicks=t.positionTicks,this.deoptReason=t.deoptReason&&"no reason"!==t.deoptReason?t.deoptReason:null}}var r=Object.freeze({__proto__:null,CPUProfileNode:o,CPUProfileDataModel:class extends i{profileStartTime;profileEndTime;timestamps;samples;lines;totalHitCount;profileHead;#t;gcNode;programNode;idleNode;#e;#i;constructor(t){super();Boolean(t.head)?(this.profileStartTime=1e3*t.startTime,this.profileEndTime=1e3*t.endTime,this.timestamps=t.timestamps,this.compatibilityConversionHeadToNodes(t)):(this.profileStartTime=t.startTime/1e3,this.profileEndTime=t.endTime/1e3,this.timestamps=this.convertTimeDeltas(t)),this.samples=t.samples,this.lines=t.lines,this.totalHitCount=0,this.profileHead=this.translateProfileTree(t.nodes),this.initialize(this.profileHead),this.extractMetaNodes(),this.samples?.length&&(this.sortSamples(),this.normalizeTimestamps(),this.fixMissingSamples())}compatibilityConversionHeadToNodes(t){if(!t.head||t.nodes)return;const e=[];!function t(i){return e.push(i),i.children=i.children.map(t),i.id}(t.head),t.nodes=e,delete t.head}convertTimeDeltas(t){if(!t.timeDeltas)return[];let e=t.startTime;const i=new Array(t.timeDeltas.length);for(let s=0;s<t.timeDeltas.length;++s)e+=t.timeDeltas[s],i[s]=e;return i}translateProfileTree(t){const e=new Map;for(let i=0;i<t.length;++i){const s=t[i];e.set(s.id,s)}!function(t,i){if("number"!=typeof t[0].hitCount){if(!i)throw new Error("Error: Neither hitCount nor samples are present in profile.");for(let e=0;e<t.length;++e)t[e].hitCount=0;for(let t=0;t<i.length;++t){const s=e.get(i[t]);s&&void 0!==s.hitCount&&s.hitCount++}}}(t,this.samples),function(t){if(!t[0].children){t[0].children=[];for(let i=1;i<t.length;++i){const s=t[i],o=e.get(s.parent);o&&(o.children?o.children.push(s.id):o.children=[s.id])}}}(t),this.totalHitCount=t.reduce(((t,e)=>t+(e.hitCount||0)),0);const i=(this.profileEndTime-this.profileStartTime)/this.totalHitCount,s=t[0],r=new Map([[s.id,s.id]]);this.#t=new Map;const n=new o(s,i);if(this.#t.set(s.id,n),!s.children)throw new Error("Missing children for root");const l=s.children.map((()=>n)),a=s.children.map((t=>e.get(t)));for(;a.length;){let t=l.pop();const s=a.pop();if(!s||!t)continue;s.children||(s.children=[]);const n=new o(s,i);t.children.push(n),t=n,r.set(s.id,t.id),l.push.apply(l,s.children.map((()=>t))),a.push.apply(a,s.children.map((t=>e.get(t)))),this.#t.set(s.id,n)}return this.samples&&(this.samples=this.samples.map((t=>r.get(t)))),n}sortSamples(){if(!this.timestamps||!this.samples)return;const t=this.timestamps,e=this.samples,i=t.map(((t,e)=>e));i.sort(((e,i)=>t[e]-t[i])),this.timestamps=[],this.samples=[];for(let s=0;s<i.length;s++){const o=i[s];this.timestamps.push(t[o]),this.samples.push(e[o])}}normalizeTimestamps(){if(!this.samples)return;let t=this.timestamps;if(t){for(let e=0;e<t.length;++e)t[e]/=1e3;if(this.samples.length===t.length){const e=t.at(-1)||0,i=(e-t[0])/(t.length-1);this.timestamps.push(e+i)}this.profileStartTime=t.at(0)||this.profileStartTime,this.profileEndTime=t.at(-1)||this.profileEndTime}else{const e=this.profileStartTime,i=(this.profileEndTime-e)/this.samples.length;t=new Array(this.samples.length+1);for(let s=0;s<t.length;++s)t[s]=e+s*i;this.timestamps=t}}extractMetaNodes(){const t=this.profileHead.children;for(let e=0;e<t.length&&!(this.gcNode&&this.programNode&&this.idleNode);e++){const i=t[e];"(garbage collector)"===i.functionName?this.gcNode=i:"(program)"===i.functionName?this.programNode=i:"(idle)"===i.functionName&&(this.idleNode=i)}}fixMissingSamples(){const t=this.samples;if(!t)return;const e=t.length;if(!this.programNode||e<3)return;const i=this.#t,s=this.programNode.id,o=this.gcNode?this.gcNode.id:-1,r=this.idleNode?this.idleNode.id:-1;let n=t[0],l=t[1];for(let o=1;o<e-1;o++){const e=t[o+1],r=i.get(n),d=i.get(e);void 0!==n&&void 0!==e&&r&&d?(l!==s||h(n)||h(e)||a(r)!==a(d)||(t[o]=n),n=l,l=e):console.error(`Unexpectedly found undefined nodes: ${n} ${e}`)}function a(t){for(;t.parent&&t.parent.parent;)t=t.parent;return t}function h(t){return t===s||t===o||t===r}}forEachFrame(e,i,s,o){if(!this.profileHead||!this.samples)return;s=s||0,o=o||1/0;const r=this.samples,n=this.timestamps,l=this.#t,a=this.gcNode,h=r.length,d=t.ArrayUtilities.lowerBound(n,s,t.ArrayUtilities.DEFAULT_COMPARATOR);let p=0;const c=[];let m,u=this.profileHead.id,f=null;const g=this.maxDepth+3;this.#e||(this.#e=new Array(g));const N=this.#e;this.#i||(this.#i=new Array(g));const T=this.#i;let P,D;for(D=d;D<h&&(m=n[D],!(m>=o));D++){const t=r[D];if(t===u)continue;P=l.get(t);let s=l.get(u)||null;if(s)if(a&&P===a)f=s,e(f.depth+1,a,D,m),N[++p]=m,T[p]=0,u=t;else{if(a&&s===a&&f){const t=N[p],e=m-t;T[p-1]+=e,i(f.depth+1,a,D,t,e,e-T[p]),--p,s=f,u=s.id,f=null}for(;P&&P.depth>s.depth;)c.push(P),P=P.parent;for(;s&&s!==P;){const t=N[p],e=m-t;T[p-1]+=e,i(s.depth,s,D,t,e,e-T[p]),--p,P&&P.depth===s.depth&&(c.push(P),P=P.parent),s=s.parent}for(;c.length;){const t=c.pop();if(!t)break;P=t,e(t.depth,t,D,m),N[++p]=m,T[p]=0}u=t}}if(m=n[D]||this.profileEndTime,P&&f&&l.get(u)===a){const t=N[p],e=m-t;T[p-1]+=e,i(f.depth+1,P,D,t,e,e-T[p]),--p,u=f.id}for(let t=l.get(u);t&&t.parent;t=t.parent){const e=N[p],s=m-e;T[p-1]+=s,i(t.depth,t,D,e,s,s-T[p]),--p}}nodeByIndex(t){return this.samples&&this.#t.get(this.samples[t])||null}nodeById(t){return this.#t.get(t)||null}nodes(){return this.#t?[...this.#t.values()]:null}}});export{r as CPUProfileDataModel,s as ProfileTreeModel};
