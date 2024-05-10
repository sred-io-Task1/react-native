import*as e from"../../core/i18n/i18n.js";import*as t from"../../ui/legacy/legacy.js";import*as n from"../../core/common/common.js";import*as o from"../../core/platform/platform.js";import*as a from"../../core/sdk/sdk.js";import*as i from"../../ui/visual_logging/visual_logging.js";import*as s from"./graph_visualizer/graph_visualizer.js";export{EdgeView,GraphManager,GraphStyle,GraphView,NodeRendererUtility,NodeView}from"./graph_visualizer/graph_visualizer.js";const d={state:"State",sampleRate:"Sample Rate",callbackBufferSize:"Callback Buffer Size",maxOutputChannels:"Max Output Channels",currentTime:"Current Time",callbackInterval:"Callback Interval",renderCapacity:"Render Capacity"},r=e.i18n.registerUIStrings("panels/web_audio/AudioContextContentBuilder.ts",d),l=e.i18n.getLocalizedString.bind(void 0,r);class c{fragment;container;constructor(e){this.fragment=document.createDocumentFragment(),this.container=document.createElement("div"),this.container.classList.add("context-detail-container"),this.fragment.appendChild(this.container),this.build(e)}build(t){const n="realtime"===t.contextType?e.i18n.lockedString("AudioContext"):e.i18n.lockedString("OfflineAudioContext");this.addTitle(n,t.contextId),this.addEntry(l(d.state),t.contextState),this.addEntry(l(d.sampleRate),t.sampleRate,"Hz"),"realtime"===t.contextType&&this.addEntry(l(d.callbackBufferSize),t.callbackBufferSize,"frames"),this.addEntry(l(d.maxOutputChannels),t.maxOutputChannelCount,"ch")}addTitle(e,n){this.container.appendChild(t.Fragment.html`
  <div class="context-detail-header">
  <div class="context-detail-title">${e}</div>
  <div class="context-detail-subtitle">${n}</div>
  </div>
  `)}addEntry(e,n,o){const a=n+(o?` ${o}`:"");this.container.appendChild(t.Fragment.html`
  <div class="context-detail-row">
  <div class="context-detail-row-entry">${e}</div>
  <div class="context-detail-row-value">${a}</div>
  </div>
  `)}getFragment(){return this.fragment}}class h{fragment;constructor(e,n){const o=n.currentTime.toFixed(3),a=(1e3*n.callbackIntervalMean).toFixed(3),i=(1e3*Math.sqrt(n.callbackIntervalVariance)).toFixed(3),s=(100*n.renderCapacity).toFixed(3);this.fragment=document.createDocumentFragment(),this.fragment.appendChild(t.Fragment.html`
  <div class="context-summary-container">
  <span>${l(d.currentTime)}: ${o} s</span>
  <span>\u2758</span>
  <span>${l(d.callbackInterval)}: μ = ${a} ms, σ = ${i} ms</span>
  <span>\u2758</span>
  <span>${l(d.renderCapacity)}: ${s} %</span>
  </div>
  `)}getFragment(){return this.fragment}}var u=Object.freeze({__proto__:null,ContextDetailBuilder:c,ContextSummaryBuilder:h});const p=new CSSStyleSheet;p.replaceSync(":host{padding:2px 1px 2px 2px;white-space:nowrap;display:flex;flex-direction:column;height:36px;justify-content:center}.title{overflow:hidden;text-overflow:ellipsis;flex-grow:0}\n/*# sourceURL=audioContextSelector.css */\n");const m={noRecordings:"(no recordings)",audioContextS:"Audio context: {PH1}"},x=e.i18n.registerUIStrings("panels/web_audio/AudioContextSelector.ts",m),g=e.i18n.getLocalizedString.bind(void 0,x);class I extends n.ObjectWrapper.ObjectWrapper{placeholderText;items;dropDown;toolbarItemInternal;selectedContextInternal;constructor(){super(),this.placeholderText=g(m.noRecordings),this.items=new t.ListModel.ListModel,this.dropDown=new t.SoftDropDown.SoftDropDown(this.items,this,"audio-context"),this.dropDown.setPlaceholderText(this.placeholderText),this.toolbarItemInternal=new t.Toolbar.ToolbarItem(this.dropDown.element),this.toolbarItemInternal.setEnabled(!1),this.toolbarItemInternal.setTitle(g(m.audioContextS,{PH1:this.placeholderText})),this.items.addEventListener("ItemsReplaced",this.onListItemReplaced,this),this.toolbarItemInternal.element.classList.add("toolbar-has-dropdown"),this.selectedContextInternal=null}onListItemReplaced(){const e=Boolean(this.items.length);this.toolbarItemInternal.setEnabled(e),e||this.toolbarItemInternal.setTitle(g(m.audioContextS,{PH1:this.placeholderText}))}contextCreated({data:e}){this.items.insert(this.items.length,e),1===this.items.length&&this.dropDown.selectItem(e)}contextDestroyed({data:e}){const t=this.items.findIndex((t=>t.contextId===e));t>-1&&this.items.remove(t)}contextChanged({data:e}){const t=this.items.findIndex((t=>t.contextId===e.contextId));t>-1&&(this.items.replace(t,e),this.selectedContextInternal&&this.selectedContextInternal.contextId===e.contextId&&this.dropDown.selectItem(e))}createElementForItem(e){const n=document.createElement("div"),a=t.Utils.createShadowRootWithCoreStyles(n,{cssFile:[p],delegatesFocus:void 0}).createChild("div","title");return t.UIUtils.createTextChild(a,o.StringUtilities.trimEndWithMaxLength(this.titleFor(e),100)),n}selectedContext(){return this.selectedContextInternal?this.selectedContextInternal:null}highlightedItemChanged(e,t,n,o){n&&n.classList.remove("highlighted"),o&&o.classList.add("highlighted")}isItemSelectable(e){return!0}itemSelected(e){e&&(this.selectedContextInternal&&this.selectedContextInternal.contextId===e.contextId||(this.selectedContextInternal=e,this.toolbarItemInternal.setTitle(g(m.audioContextS,{PH1:this.titleFor(e)}))),this.dispatchEventToListeners("ContextSelected",e))}reset(){this.items.replaceAll([])}titleFor(e){return`${e.contextType} (${e.contextId.substr(-6)})`}toolbarItem(){return this.toolbarItemInternal}}var v=Object.freeze({__proto__:null,AudioContextSelector:I});class C extends a.SDKModel.SDKModel{enabled;agent;constructor(e){super(e),this.enabled=!1,this.agent=e.webAudioAgent(),e.registerWebAudioDispatcher(this),a.TargetManager.TargetManager.instance().addModelListener(a.ResourceTreeModel.ResourceTreeModel,a.ResourceTreeModel.Events.FrameNavigated,this.flushContexts,this)}flushContexts(){this.dispatchEventToListeners("ModelReset")}async suspendModel(){this.dispatchEventToListeners("ModelSuspend"),await this.agent.invoke_disable()}async resumeModel(){if(!this.enabled)return Promise.resolve();await this.agent.invoke_enable()}ensureEnabled(){this.enabled||(this.agent.invoke_enable(),this.enabled=!0)}contextCreated({context:e}){this.dispatchEventToListeners("ContextCreated",e)}contextWillBeDestroyed({contextId:e}){this.dispatchEventToListeners("ContextDestroyed",e)}contextChanged({context:e}){this.dispatchEventToListeners("ContextChanged",e)}audioListenerCreated({listener:e}){this.dispatchEventToListeners("AudioListenerCreated",e)}audioListenerWillBeDestroyed({listenerId:e,contextId:t}){this.dispatchEventToListeners("AudioListenerWillBeDestroyed",{listenerId:e,contextId:t})}audioNodeCreated({node:e}){this.dispatchEventToListeners("AudioNodeCreated",e)}audioNodeWillBeDestroyed({contextId:e,nodeId:t}){this.dispatchEventToListeners("AudioNodeWillBeDestroyed",{contextId:e,nodeId:t})}audioParamCreated({param:e}){this.dispatchEventToListeners("AudioParamCreated",e)}audioParamWillBeDestroyed({contextId:e,nodeId:t,paramId:n}){this.dispatchEventToListeners("AudioParamWillBeDestroyed",{contextId:e,nodeId:t,paramId:n})}nodesConnected({contextId:e,sourceId:t,destinationId:n,sourceOutputIndex:o,destinationInputIndex:a}){this.dispatchEventToListeners("NodesConnected",{contextId:e,sourceId:t,destinationId:n,sourceOutputIndex:o,destinationInputIndex:a})}nodesDisconnected({contextId:e,sourceId:t,destinationId:n,sourceOutputIndex:o,destinationInputIndex:a}){this.dispatchEventToListeners("NodesDisconnected",{contextId:e,sourceId:t,destinationId:n,sourceOutputIndex:o,destinationInputIndex:a})}nodeParamConnected({contextId:e,sourceId:t,destinationId:n,sourceOutputIndex:o}){this.dispatchEventToListeners("NodeParamConnected",{contextId:e,sourceId:t,destinationId:n,sourceOutputIndex:o})}nodeParamDisconnected({contextId:e,sourceId:t,destinationId:n,sourceOutputIndex:o}){this.dispatchEventToListeners("NodeParamDisconnected",{contextId:e,sourceId:t,destinationId:n,sourceOutputIndex:o})}async requestRealtimeData(e){return(await this.agent.invoke_getRealtimeData({contextId:e})).realtimeData}}a.SDKModel.SDKModel.register(C,{capabilities:2,autostart:!1});var b=Object.freeze({__proto__:null,WebAudioModel:C});const w=new CSSStyleSheet;w.replaceSync(":host{overflow:hidden}.web-audio-toolbar-container{background-color:var(--sys-color-cdt-base-container);border-bottom:1px solid var(--sys-color-divider);min-height:fit-content}.web-audio-toolbar{display:inline-block}.web-audio-landing-page{position:absolute;background-color:var(--sys-color-cdt-base-container);justify-content:center;align-items:center;overflow:auto;font-size:13px;color:var(--sys-color-on-surface)}.web-audio-landing-page > div{max-width:500px;margin:10px}.web-audio-landing-page > div > p{flex:none;white-space:pre-line}.web-audio-content-container{overflow-y:auto}.web-audio-details-container{min-height:fit-content}.web-audio-summary-container{flex-shrink:0}.context-detail-container{flex:none;display:flex;background-color:var(--sys-color-cdt-base-container);flex-direction:column}.context-detail-header{border-bottom:1px solid var(--sys-color-divider);padding:12px 24px;margin-bottom:10px}.context-detail-title{font-size:15px;font-weight:400}.context-detail-subtitle{font-size:12px;margin-top:10px;user-select:text}.context-detail-row{flex-direction:row;display:flex;line-height:18px;padding-left:24px}.context-detail-row-entry:not(:empty){color:var(--sys-color-token-subtle);overflow:hidden;width:130px}.context-detail-row-value{user-select:text;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.context-summary-container{flex:0 0 27px;line-height:27px;padding-left:5px;background-color:var(--sys-color-cdt-base-container);border-top:1px solid var(--sys-color-divider);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.context-summary-container span{margin-right:6px}\n/*# sourceURL=webAudio.css */\n");const y={openAPageThatUsesWebAudioApiTo:"Open a page that uses Web Audio API to start monitoring."},f=e.i18n.registerUIStrings("panels/web_audio/WebAudioView.ts",y),L=e.i18n.getLocalizedString.bind(void 0,f);class E extends t.ThrottledWidget.ThrottledWidget{contextSelector;contentContainer;detailViewContainer;graphManager;landingPage;summaryBarContainer;constructor(){super(!0,1e3),this.element.setAttribute("jslog",`${i.panel("web-audio").track({resize:!0})}`),this.element.classList.add("web-audio-drawer");const e=this.contentElement.createChild("div","web-audio-toolbar-container vbox");this.contextSelector=new I;const n=new t.Toolbar.Toolbar("web-audio-toolbar",e);n.appendToolbarItem(t.Toolbar.Toolbar.createActionButtonForId("components.collect-garbage")),n.appendSeparator(),n.appendToolbarItem(this.contextSelector.toolbarItem()),n.element.setAttribute("jslog",`${i.toolbar()}`),this.contentContainer=this.contentElement.createChild("div","web-audio-content-container vbox flex-auto"),this.detailViewContainer=this.contentContainer.createChild("div","web-audio-details-container vbox flex-auto"),this.graphManager=new s.GraphManager.GraphManager,this.landingPage=new t.Widget.VBox,this.landingPage.contentElement.classList.add("web-audio-landing-page","fill"),this.landingPage.contentElement.appendChild(t.Fragment.html`
  <div>
  <p>${L(y.openAPageThatUsesWebAudioApiTo)}</p>
  </div>
  `),this.landingPage.show(this.detailViewContainer),this.summaryBarContainer=this.contentContainer.createChild("div","web-audio-summary-container"),this.contextSelector.addEventListener("ContextSelected",(e=>{const t=e.data;t&&this.updateDetailView(t),this.doUpdate()})),a.TargetManager.TargetManager.instance().observeModels(C,this)}wasShown(){super.wasShown(),this.registerCSSFiles([w]);for(const e of a.TargetManager.TargetManager.instance().models(C))this.addEventListeners(e)}willHide(){for(const e of a.TargetManager.TargetManager.instance().models(C))this.removeEventListeners(e)}modelAdded(e){this.isShowing()&&this.addEventListeners(e)}modelRemoved(e){this.removeEventListeners(e)}async doUpdate(){await this.pollRealtimeData(),this.update()}addEventListeners(e){e.ensureEnabled(),e.addEventListener("ContextCreated",this.contextCreated,this),e.addEventListener("ContextDestroyed",this.contextDestroyed,this),e.addEventListener("ContextChanged",this.contextChanged,this),e.addEventListener("ModelReset",this.reset,this),e.addEventListener("ModelSuspend",this.suspendModel,this),e.addEventListener("AudioListenerCreated",this.audioListenerCreated,this),e.addEventListener("AudioListenerWillBeDestroyed",this.audioListenerWillBeDestroyed,this),e.addEventListener("AudioNodeCreated",this.audioNodeCreated,this),e.addEventListener("AudioNodeWillBeDestroyed",this.audioNodeWillBeDestroyed,this),e.addEventListener("AudioParamCreated",this.audioParamCreated,this),e.addEventListener("AudioParamWillBeDestroyed",this.audioParamWillBeDestroyed,this),e.addEventListener("NodesConnected",this.nodesConnected,this),e.addEventListener("NodesDisconnected",this.nodesDisconnected,this),e.addEventListener("NodeParamConnected",this.nodeParamConnected,this),e.addEventListener("NodeParamDisconnected",this.nodeParamDisconnected,this)}removeEventListeners(e){e.removeEventListener("ContextCreated",this.contextCreated,this),e.removeEventListener("ContextDestroyed",this.contextDestroyed,this),e.removeEventListener("ContextChanged",this.contextChanged,this),e.removeEventListener("ModelReset",this.reset,this),e.removeEventListener("ModelSuspend",this.suspendModel,this),e.removeEventListener("AudioListenerCreated",this.audioListenerCreated,this),e.removeEventListener("AudioListenerWillBeDestroyed",this.audioListenerWillBeDestroyed,this),e.removeEventListener("AudioNodeCreated",this.audioNodeCreated,this),e.removeEventListener("AudioNodeWillBeDestroyed",this.audioNodeWillBeDestroyed,this),e.removeEventListener("AudioParamCreated",this.audioParamCreated,this),e.removeEventListener("AudioParamWillBeDestroyed",this.audioParamWillBeDestroyed,this),e.removeEventListener("NodesConnected",this.nodesConnected,this),e.removeEventListener("NodesDisconnected",this.nodesDisconnected,this),e.removeEventListener("NodeParamConnected",this.nodeParamConnected,this),e.removeEventListener("NodeParamDisconnected",this.nodeParamDisconnected,this)}contextCreated(e){const t=e.data;this.graphManager.createContext(t.contextId),this.contextSelector.contextCreated(e)}contextDestroyed(e){const t=e.data;this.graphManager.destroyContext(t),this.contextSelector.contextDestroyed(e)}contextChanged(e){const t=e.data;this.graphManager.hasContext(t.contextId)&&this.contextSelector.contextChanged(e)}reset(){this.landingPage.isShowing()&&this.landingPage.detach(),this.contextSelector.reset(),this.detailViewContainer.removeChildren(),this.landingPage.show(this.detailViewContainer),this.graphManager.clearGraphs()}suspendModel(){this.graphManager.clearGraphs()}audioListenerCreated(e){const t=e.data,n=this.graphManager.getGraph(t.contextId);n&&n.addNode({nodeId:t.listenerId,nodeType:"Listener",numberOfInputs:0,numberOfOutputs:0})}audioListenerWillBeDestroyed(e){const{contextId:t,listenerId:n}=e.data,o=this.graphManager.getGraph(t);o&&o.removeNode(n)}audioNodeCreated(e){const t=e.data,n=this.graphManager.getGraph(t.contextId);n&&n.addNode({nodeId:t.nodeId,nodeType:t.nodeType,numberOfInputs:t.numberOfInputs,numberOfOutputs:t.numberOfOutputs})}audioNodeWillBeDestroyed(e){const{contextId:t,nodeId:n}=e.data,o=this.graphManager.getGraph(t);o&&o.removeNode(n)}audioParamCreated(e){const t=e.data,n=this.graphManager.getGraph(t.contextId);n&&n.addParam({paramId:t.paramId,paramType:t.paramType,nodeId:t.nodeId})}audioParamWillBeDestroyed(e){const{contextId:t,paramId:n}=e.data,o=this.graphManager.getGraph(t);o&&o.removeParam(n)}nodesConnected(e){const{contextId:t,sourceId:n,destinationId:o,sourceOutputIndex:a,destinationInputIndex:i}=e.data,s=this.graphManager.getGraph(t);s&&s.addNodeToNodeConnection({sourceId:n,destinationId:o,sourceOutputIndex:a,destinationInputIndex:i})}nodesDisconnected(e){const{contextId:t,sourceId:n,destinationId:o,sourceOutputIndex:a,destinationInputIndex:i}=e.data,s=this.graphManager.getGraph(t);s&&s.removeNodeToNodeConnection({sourceId:n,destinationId:o,sourceOutputIndex:a,destinationInputIndex:i})}nodeParamConnected(e){const{contextId:t,sourceId:n,destinationId:o,sourceOutputIndex:a}=e.data,i=this.graphManager.getGraph(t);if(!i)return;const s=i.getNodeIdByParamId(o);s&&i.addNodeToParamConnection({sourceId:n,destinationId:s,sourceOutputIndex:a,destinationParamId:o})}nodeParamDisconnected(e){const{contextId:t,sourceId:n,destinationId:o,sourceOutputIndex:a}=e.data,i=this.graphManager.getGraph(t);if(!i)return;const s=i.getNodeIdByParamId(o);s&&i.removeNodeToParamConnection({sourceId:n,destinationId:s,sourceOutputIndex:a,destinationParamId:o})}updateDetailView(e){this.landingPage.isShowing()&&this.landingPage.detach();const t=new c(e);this.detailViewContainer.removeChildren(),this.detailViewContainer.appendChild(t.getFragment())}updateSummaryBar(e,t){const n=new h(e,t);this.summaryBarContainer.removeChildren(),this.summaryBarContainer.appendChild(n.getFragment())}clearSummaryBar(){this.summaryBarContainer.removeChildren()}async pollRealtimeData(){const e=this.contextSelector.selectedContext();if(e)for(const t of a.TargetManager.TargetManager.instance().models(C))if("realtime"===e.contextType){if(!this.graphManager.hasContext(e.contextId))continue;const n=await t.requestRealtimeData(e.contextId);n&&this.updateSummaryBar(e.contextId,n)}else this.clearSummaryBar();else this.clearSummaryBar()}}var S=Object.freeze({__proto__:null,WebAudioView:E});export{u as AudioContextContentBuilder,v as AudioContextSelector,b as WebAudioModel,S as WebAudioView};
