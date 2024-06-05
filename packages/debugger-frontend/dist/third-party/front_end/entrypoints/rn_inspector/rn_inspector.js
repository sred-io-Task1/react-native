import"../shell/shell.js";import*as e from"../../core/common/common.js";import*as t from"../../core/i18n/i18n.js";import*as o from"../../core/root/root.js";import*as i from"../../ui/legacy/legacy.js";import*as n from"../../models/issues_manager/issues_manager.js";import*as r from"../../core/sdk/sdk.js";import*as a from"../../models/workspace/workspace.js";import*as s from"../../panels/network/forward/forward.js";import*as l from"../main/main.js";import*as c from"../../core/rn_experiments/rn_experiments.js";import*as d from"../../core/host/host.js";const g={toggleDeviceToolbar:"Toggle device toolbar",captureScreenshot:"Capture screenshot",captureFullSizeScreenshot:"Capture full size screenshot",captureNodeScreenshot:"Capture node screenshot",showMediaQueries:"Show media queries",device:"device",hideMediaQueries:"Hide media queries",showRulers:"Show rulers in the Device Mode toolbar",hideRulers:"Hide rulers in the Device Mode toolbar",showDeviceFrame:"Show device frame",hideDeviceFrame:"Hide device frame"},u=t.i18n.registerUIStrings("panels/emulation/emulation-meta.ts",g),w=t.i18n.getLazilyComputedLocalizedString.bind(void 0,u);let m;async function p(){return m||(m=await import("../../panels/emulation/emulation.js")),m}i.ActionRegistration.registerActionExtension({category:"MOBILE",actionId:"emulation.toggle-device-mode",toggleable:!0,loadActionDelegate:async()=>new((await p()).DeviceModeWrapper.ActionDelegate),condition:o.Runtime.conditions.canDock,title:w(g.toggleDeviceToolbar),iconClass:"devices",bindings:[{platform:"windows,linux",shortcut:"Shift+Ctrl+M"},{platform:"mac",shortcut:"Shift+Meta+M"}]}),i.ActionRegistration.registerActionExtension({actionId:"emulation.capture-screenshot",category:"SCREENSHOT",loadActionDelegate:async()=>new((await p()).DeviceModeWrapper.ActionDelegate),condition:o.Runtime.conditions.canDock,title:w(g.captureScreenshot)}),i.ActionRegistration.registerActionExtension({actionId:"emulation.capture-full-height-screenshot",category:"SCREENSHOT",loadActionDelegate:async()=>new((await p()).DeviceModeWrapper.ActionDelegate),condition:o.Runtime.conditions.canDock,title:w(g.captureFullSizeScreenshot)}),i.ActionRegistration.registerActionExtension({actionId:"emulation.capture-node-screenshot",category:"SCREENSHOT",loadActionDelegate:async()=>new((await p()).DeviceModeWrapper.ActionDelegate),condition:o.Runtime.conditions.canDock,title:w(g.captureNodeScreenshot)}),e.Settings.registerSettingExtension({category:"MOBILE",settingName:"show-media-query-inspector",settingType:"boolean",defaultValue:!1,options:[{value:!0,title:w(g.showMediaQueries)},{value:!1,title:w(g.hideMediaQueries)}],tags:[w(g.device)]}),e.Settings.registerSettingExtension({category:"MOBILE",settingName:"emulation.show-rulers",settingType:"boolean",defaultValue:!1,options:[{value:!0,title:w(g.showRulers)},{value:!1,title:w(g.hideRulers)}],tags:[w(g.device)]}),e.Settings.registerSettingExtension({category:"MOBILE",settingName:"emulation.show-device-outline",settingType:"boolean",defaultValue:!1,options:[{value:!0,title:w(g.showDeviceFrame)},{value:!1,title:w(g.hideDeviceFrame)}],tags:[w(g.device)]}),i.Toolbar.registerToolbarItem({actionId:"emulation.toggle-device-mode",condition:o.Runtime.conditions.canDock,location:"main-toolbar-left",order:1,showLabel:void 0,loadItem:void 0,separator:void 0}),e.AppProvider.registerAppProvider({loadAppProvider:async()=>(await p()).AdvancedApp.AdvancedAppProvider.instance(),condition:o.Runtime.conditions.canDock,order:0}),i.ContextMenu.registerItem({location:"deviceModeMenu/save",order:12,actionId:"emulation.capture-screenshot"}),i.ContextMenu.registerItem({location:"deviceModeMenu/save",order:13,actionId:"emulation.capture-full-height-screenshot"});const h={sensors:"Sensors",geolocation:"geolocation",timezones:"timezones",locale:"locale",locales:"locales",accelerometer:"accelerometer",deviceOrientation:"device orientation",locations:"Locations",touch:"Touch",devicebased:"Device-based",forceEnabled:"Force enabled",emulateIdleDetectorState:"Emulate Idle Detector state",noIdleEmulation:"No idle emulation",userActiveScreenUnlocked:"User active, screen unlocked",userActiveScreenLocked:"User active, screen locked",userIdleScreenUnlocked:"User idle, screen unlocked",userIdleScreenLocked:"User idle, screen locked",showSensors:"Show Sensors",showLocations:"Show Locations"},y=t.i18n.registerUIStrings("panels/sensors/sensors-meta.ts",h),v=t.i18n.getLazilyComputedLocalizedString.bind(void 0,y);let k;async function R(){return k||(k=await import("../../panels/sensors/sensors.js")),k}i.ViewManager.registerViewExtension({location:"drawer-view",commandPrompt:v(h.showSensors),title:v(h.sensors),id:"sensors",persistence:"closeable",order:100,loadView:async()=>new((await R()).SensorsView.SensorsView),tags:[v(h.geolocation),v(h.timezones),v(h.locale),v(h.locales),v(h.accelerometer),v(h.deviceOrientation)]}),i.ViewManager.registerViewExtension({location:"settings-view",id:"emulation-locations",commandPrompt:v(h.showLocations),title:v(h.locations),order:40,loadView:async()=>new((await R()).LocationsSettingsTab.LocationsSettingsTab),settings:["emulation.locations"]}),e.Settings.registerSettingExtension({storageType:"Synced",settingName:"emulation.locations",settingType:"array",defaultValue:[{title:"Berlin",lat:52.520007,long:13.404954,timezoneId:"Europe/Berlin",locale:"de-DE"},{title:"London",lat:51.507351,long:-.127758,timezoneId:"Europe/London",locale:"en-GB"},{title:"Moscow",lat:55.755826,long:37.6173,timezoneId:"Europe/Moscow",locale:"ru-RU"},{title:"Mountain View",lat:37.386052,long:-122.083851,timezoneId:"America/Los_Angeles",locale:"en-US"},{title:"Mumbai",lat:19.075984,long:72.877656,timezoneId:"Asia/Kolkata",locale:"mr-IN"},{title:"San Francisco",lat:37.774929,long:-122.419416,timezoneId:"America/Los_Angeles",locale:"en-US"},{title:"Shanghai",lat:31.230416,long:121.473701,timezoneId:"Asia/Shanghai",locale:"zh-Hans-CN"},{title:"São Paulo",lat:-23.55052,long:-46.633309,timezoneId:"America/Sao_Paulo",locale:"pt-BR"},{title:"Tokyo",lat:35.689487,long:139.691706,timezoneId:"Asia/Tokyo",locale:"ja-JP"}]}),e.Settings.registerSettingExtension({title:v(h.touch),reloadRequired:!0,settingName:"emulation.touch",settingType:"enum",defaultValue:"none",options:[{value:"none",title:v(h.devicebased),text:v(h.devicebased)},{value:"force",title:v(h.forceEnabled),text:v(h.forceEnabled)}]}),e.Settings.registerSettingExtension({title:v(h.emulateIdleDetectorState),settingName:"emulation.idle-detection",settingType:"enum",defaultValue:"none",options:[{value:"none",title:v(h.noIdleEmulation),text:v(h.noIdleEmulation)},{value:'{"isUserActive":true,"isScreenUnlocked":true}',title:v(h.userActiveScreenUnlocked),text:v(h.userActiveScreenUnlocked)},{value:'{"isUserActive":true,"isScreenUnlocked":false}',title:v(h.userActiveScreenLocked),text:v(h.userActiveScreenLocked)},{value:'{"isUserActive":false,"isScreenUnlocked":true}',title:v(h.userIdleScreenUnlocked),text:v(h.userIdleScreenUnlocked)},{value:'{"isUserActive":false,"isScreenUnlocked":false}',title:v(h.userIdleScreenLocked),text:v(h.userIdleScreenLocked)}]});const S={developerResources:"Developer resources",showDeveloperResources:"Show Developer resources"},f=t.i18n.registerUIStrings("panels/developer_resources/developer_resources-meta.ts",S),A=t.i18n.getLazilyComputedLocalizedString.bind(void 0,f);let N;i.ViewManager.registerViewExtension({location:"drawer-view",id:"developer-resources",title:A(S.developerResources),commandPrompt:A(S.showDeveloperResources),order:100,persistence:"closeable",loadView:async()=>new((await async function(){return N||(N=await import("../../panels/developer_resources/developer_resources.js")),N}()).DeveloperResourcesView.DeveloperResourcesView)});const T={rendering:"Rendering",showRendering:"Show Rendering",paint:"paint",layout:"layout",fps:"fps",cssMediaType:"CSS media type",cssMediaFeature:"CSS media feature",visionDeficiency:"vision deficiency",colorVisionDeficiency:"color vision deficiency",reloadPage:"Reload page",hardReloadPage:"Hard reload page",forceAdBlocking:"Force ad blocking on this site",blockAds:"Block ads on this site",showAds:"Show ads on this site, if allowed",autoOpenDevTools:"Auto-open DevTools for popups",doNotAutoOpen:"Do not auto-open DevTools for popups",disablePaused:"Disable paused state overlay",toggleCssPrefersColorSchemeMedia:"Toggle CSS media feature prefers-color-scheme"},I=t.i18n.registerUIStrings("entrypoints/inspector_main/inspector_main-meta.ts",T),b=t.i18n.getLazilyComputedLocalizedString.bind(void 0,I);let P;async function E(){return P||(P=await import("../inspector_main/inspector_main.js")),P}i.ViewManager.registerViewExtension({location:"drawer-view",id:"rendering",title:b(T.rendering),commandPrompt:b(T.showRendering),persistence:"closeable",order:50,loadView:async()=>new((await E()).RenderingOptions.RenderingOptionsView),tags:[b(T.paint),b(T.layout),b(T.fps),b(T.cssMediaType),b(T.cssMediaFeature),b(T.visionDeficiency),b(T.colorVisionDeficiency)]}),i.ActionRegistration.registerActionExtension({category:"NAVIGATION",actionId:"inspector-main.reload",loadActionDelegate:async()=>new((await E()).InspectorMain.ReloadActionDelegate),iconClass:"refresh",title:b(T.reloadPage),bindings:[{platform:"windows,linux",shortcut:"Ctrl+R"},{platform:"windows,linux",shortcut:"F5"},{platform:"mac",shortcut:"Meta+R"}]}),i.ActionRegistration.registerActionExtension({category:"NAVIGATION",actionId:"inspector-main.hard-reload",loadActionDelegate:async()=>new((await E()).InspectorMain.ReloadActionDelegate),title:b(T.hardReloadPage),bindings:[{platform:"windows,linux",shortcut:"Shift+Ctrl+R"},{platform:"windows,linux",shortcut:"Shift+F5"},{platform:"windows,linux",shortcut:"Ctrl+F5"},{platform:"windows,linux",shortcut:"Ctrl+Shift+F5"},{platform:"mac",shortcut:"Shift+Meta+R"}]}),i.ActionRegistration.registerActionExtension({actionId:"rendering.toggle-prefers-color-scheme",category:"RENDERING",title:b(T.toggleCssPrefersColorSchemeMedia),loadActionDelegate:async()=>new((await E()).RenderingOptions.ReloadActionDelegate)}),e.Settings.registerSettingExtension({category:"NETWORK",title:b(T.forceAdBlocking),settingName:"network.ad-blocking-enabled",settingType:"boolean",storageType:"Session",defaultValue:!1,options:[{value:!0,title:b(T.blockAds)},{value:!1,title:b(T.showAds)}]}),e.Settings.registerSettingExtension({category:"GLOBAL",storageType:"Synced",title:b(T.autoOpenDevTools),settingName:"auto-attach-to-created-pages",settingType:"boolean",order:2,defaultValue:!1,options:[{value:!0,title:b(T.autoOpenDevTools)},{value:!1,title:b(T.doNotAutoOpen)}]}),e.Settings.registerSettingExtension({category:"APPEARANCE",storageType:"Synced",title:b(T.disablePaused),settingName:"disable-paused-state-overlay",settingType:"boolean",defaultValue:!1}),i.Toolbar.registerToolbarItem({loadItem:async()=>(await E()).InspectorMain.NodeIndicator.instance(),order:2,location:"main-toolbar-left"}),i.Toolbar.registerToolbarItem({loadItem:async()=>(await E()).OutermostTargetSelector.OutermostTargetSelector.instance(),order:98,location:"main-toolbar-right",experiment:"outermost-target-selector"}),i.Toolbar.registerToolbarItem({loadItem:async()=>(await E()).OutermostTargetSelector.OutermostTargetSelector.instance(),order:98,location:"main-toolbar-right",showLabel:void 0,condition:void 0,separator:void 0,actionId:void 0,experiment:"outermost-target-selector"});const x={issues:"Issues",showIssues:"Show Issues"},D=t.i18n.registerUIStrings("panels/issues/issues-meta.ts",x),C=t.i18n.getLazilyComputedLocalizedString.bind(void 0,D);let L;async function M(){return L||(L=await import("../../panels/issues/issues.js")),L}i.ViewManager.registerViewExtension({location:"drawer-view",id:"issues-pane",title:C(x.issues),commandPrompt:C(x.showIssues),order:100,persistence:"closeable",loadView:async()=>new((await M()).IssuesPane.IssuesPane)}),e.Revealer.registerRevealer({contextTypes:()=>[n.Issue.Issue],destination:e.Revealer.RevealerDestination.ISSUES_VIEW,loadRevealer:async()=>new((await M()).IssueRevealer.IssueRevealer)});const V={throttling:"Throttling",showThrottling:"Show Throttling",goOffline:"Go offline",device:"device",throttlingTag:"throttling",enableSlowGThrottling:"Enable slow `3G` throttling",enableFastGThrottling:"Enable fast `3G` throttling",goOnline:"Go online"},O=t.i18n.registerUIStrings("panels/mobile_throttling/mobile_throttling-meta.ts",V),U=t.i18n.getLazilyComputedLocalizedString.bind(void 0,O);let B;async function z(){return B||(B=await import("../../panels/mobile_throttling/mobile_throttling.js")),B}i.ViewManager.registerViewExtension({location:"settings-view",id:"throttling-conditions",title:U(V.throttling),commandPrompt:U(V.showThrottling),order:35,loadView:async()=>new((await z()).ThrottlingSettingsTab.ThrottlingSettingsTab),settings:["custom-network-conditions"]}),i.ActionRegistration.registerActionExtension({actionId:"network-conditions.network-offline",category:"NETWORK",title:U(V.goOffline),loadActionDelegate:async()=>new((await z()).ThrottlingManager.ActionDelegate),tags:[U(V.device),U(V.throttlingTag)]}),i.ActionRegistration.registerActionExtension({actionId:"network-conditions.network-low-end-mobile",category:"NETWORK",title:U(V.enableSlowGThrottling),loadActionDelegate:async()=>new((await z()).ThrottlingManager.ActionDelegate),tags:[U(V.device),U(V.throttlingTag)]}),i.ActionRegistration.registerActionExtension({actionId:"network-conditions.network-mid-tier-mobile",category:"NETWORK",title:U(V.enableFastGThrottling),loadActionDelegate:async()=>new((await z()).ThrottlingManager.ActionDelegate),tags:[U(V.device),U(V.throttlingTag)]}),i.ActionRegistration.registerActionExtension({actionId:"network-conditions.network-online",category:"NETWORK",title:U(V.goOnline),loadActionDelegate:async()=>new((await z()).ThrottlingManager.ActionDelegate),tags:[U(V.device),U(V.throttlingTag)]}),e.Settings.registerSettingExtension({storageType:"Synced",settingName:"custom-network-conditions",settingType:"array",defaultValue:[]});const W={showNetwork:"Show Network",network:"Network",showNetworkRequestBlocking:"Show Network request blocking",networkRequestBlocking:"Network request blocking",showNetworkConditions:"Show Network conditions",networkConditions:"Network conditions",diskCache:"disk cache",networkThrottling:"network throttling",showSearch:"Show Search",search:"Search",recordNetworkLog:"Record network log",stopRecordingNetworkLog:"Stop recording network log",hideRequestDetails:"Hide request details",colorcodeResourceTypes:"Color-code resource types",colorCode:"color code",resourceType:"resource type",colorCodeByResourceType:"Color code by resource type",useDefaultColors:"Use default colors",groupNetworkLogByFrame:"Group network log by frame",netWork:"network",frame:"frame",group:"group",groupNetworkLogItemsByFrame:"Group network log items by frame",dontGroupNetworkLogItemsByFrame:"Don't group network log items by frame",clear:"Clear network log",addNetworkRequestBlockingPattern:"Add network request blocking pattern",removeAllNetworkRequestBlockingPatterns:"Remove all network request blocking patterns"},q=t.i18n.registerUIStrings("panels/network/network-meta.ts",W),_=t.i18n.getLazilyComputedLocalizedString.bind(void 0,q);let F;async function j(){return F||(F=await import("../../panels/network/network.js")),F}function K(e){return void 0===F?[]:e(F)}i.ViewManager.registerViewExtension({location:"panel",id:"network",commandPrompt:_(W.showNetwork),title:_(W.network),order:40,condition:o.Runtime.conditions.reactNativeUnstableNetworkPanel,loadView:async()=>(await j()).NetworkPanel.NetworkPanel.instance()}),i.ViewManager.registerViewExtension({location:"drawer-view",id:"network.blocked-urls",commandPrompt:_(W.showNetworkRequestBlocking),title:_(W.networkRequestBlocking),persistence:"closeable",order:60,loadView:async()=>new((await j()).BlockedURLsPane.BlockedURLsPane)}),i.ViewManager.registerViewExtension({location:"drawer-view",id:"network.config",commandPrompt:_(W.showNetworkConditions),title:_(W.networkConditions),persistence:"closeable",order:40,tags:[_(W.diskCache),_(W.networkThrottling),t.i18n.lockedLazyString("useragent"),t.i18n.lockedLazyString("user agent"),t.i18n.lockedLazyString("user-agent")],loadView:async()=>(await j()).NetworkConfigView.NetworkConfigView.instance()}),i.ViewManager.registerViewExtension({location:"network-sidebar",id:"network.search-network-tab",commandPrompt:_(W.showSearch),title:_(W.search),persistence:"permanent",loadView:async()=>(await j()).NetworkPanel.SearchNetworkView.instance()}),i.ActionRegistration.registerActionExtension({actionId:"network.toggle-recording",category:"NETWORK",iconClass:"record-start",toggleable:!0,toggledIconClass:"record-stop",toggleWithRedColor:!0,contextTypes:()=>K((e=>[e.NetworkPanel.NetworkPanel])),loadActionDelegate:async()=>new((await j()).NetworkPanel.ActionDelegate),options:[{value:!0,title:_(W.recordNetworkLog)},{value:!1,title:_(W.stopRecordingNetworkLog)}],bindings:[{shortcut:"Ctrl+E",platform:"windows,linux"},{shortcut:"Meta+E",platform:"mac"}]}),i.ActionRegistration.registerActionExtension({actionId:"network.clear",category:"NETWORK",title:_(W.clear),iconClass:"clear",loadActionDelegate:async()=>new((await j()).NetworkPanel.ActionDelegate),contextTypes:()=>K((e=>[e.NetworkPanel.NetworkPanel])),bindings:[{shortcut:"Ctrl+L"},{shortcut:"Meta+K",platform:"mac"}]}),i.ActionRegistration.registerActionExtension({actionId:"network.hide-request-details",category:"NETWORK",title:_(W.hideRequestDetails),contextTypes:()=>K((e=>[e.NetworkPanel.NetworkPanel])),loadActionDelegate:async()=>new((await j()).NetworkPanel.ActionDelegate),bindings:[{shortcut:"Esc"}]}),i.ActionRegistration.registerActionExtension({actionId:"network.search",category:"NETWORK",title:_(W.search),contextTypes:()=>K((e=>[e.NetworkPanel.NetworkPanel])),loadActionDelegate:async()=>new((await j()).NetworkPanel.ActionDelegate),bindings:[{platform:"mac",shortcut:"Meta+F",keybindSets:["devToolsDefault","vsCode"]},{platform:"windows,linux",shortcut:"Ctrl+F",keybindSets:["devToolsDefault","vsCode"]}]}),i.ActionRegistration.registerActionExtension({actionId:"network.add-network-request-blocking-pattern",category:"NETWORK",title:_(W.addNetworkRequestBlockingPattern),iconClass:"plus",contextTypes:()=>K((e=>[e.BlockedURLsPane.BlockedURLsPane])),loadActionDelegate:async()=>new((await j()).BlockedURLsPane.ActionDelegate)}),i.ActionRegistration.registerActionExtension({actionId:"network.remove-all-network-request-blocking-patterns",category:"NETWORK",title:_(W.removeAllNetworkRequestBlockingPatterns),iconClass:"clear",contextTypes:()=>K((e=>[e.BlockedURLsPane.BlockedURLsPane])),loadActionDelegate:async()=>new((await j()).BlockedURLsPane.ActionDelegate)}),e.Settings.registerSettingExtension({category:"NETWORK",storageType:"Synced",title:_(W.colorcodeResourceTypes),settingName:"network-color-code-resource-types",settingType:"boolean",defaultValue:!1,tags:[_(W.colorCode),_(W.resourceType)],options:[{value:!0,title:_(W.colorCodeByResourceType)},{value:!1,title:_(W.useDefaultColors)}]}),e.Settings.registerSettingExtension({category:"NETWORK",storageType:"Synced",title:_(W.groupNetworkLogByFrame),settingName:"network.group-by-frame",settingType:"boolean",defaultValue:!1,tags:[_(W.netWork),_(W.frame),_(W.group)],options:[{value:!0,title:_(W.groupNetworkLogItemsByFrame)},{value:!1,title:_(W.dontGroupNetworkLogItemsByFrame)}]}),i.ViewManager.registerLocationResolver({name:"network-sidebar",category:"NETWORK",loadResolver:async()=>(await j()).NetworkPanel.NetworkPanel.instance()}),i.ContextMenu.registerProvider({contextTypes:()=>[r.NetworkRequest.NetworkRequest,r.Resource.Resource,a.UISourceCode.UISourceCode],loadProvider:async()=>(await j()).NetworkPanel.NetworkPanel.instance(),experiment:void 0}),e.Revealer.registerRevealer({contextTypes:()=>[r.NetworkRequest.NetworkRequest],destination:e.Revealer.RevealerDestination.NETWORK_PANEL,loadRevealer:async()=>new((await j()).NetworkPanel.RequestRevealer)}),e.Revealer.registerRevealer({contextTypes:()=>[s.UIRequestLocation.UIRequestLocation],destination:void 0,loadRevealer:async()=>new((await j()).NetworkPanel.RequestLocationRevealer)}),e.Revealer.registerRevealer({contextTypes:()=>[s.NetworkRequestId.NetworkRequestId],destination:e.Revealer.RevealerDestination.NETWORK_PANEL,loadRevealer:async()=>new((await j()).NetworkPanel.RequestIdRevealer)}),e.Revealer.registerRevealer({contextTypes:()=>[s.UIFilter.UIRequestFilter],destination:e.Revealer.RevealerDestination.NETWORK_PANEL,loadRevealer:async()=>new((await j()).NetworkPanel.NetworkLogWithFilterRevealer)});const G={profiler:"Profiler",showProfiler:"Show Profiler",startStopRecording:"Start/stop recording",showRecentTimelineSessions:"Show recent timeline sessions",record:"Record",stop:"Stop",startProfilingAndReloadPage:"Start profiling and reload page"},H=t.i18n.registerUIStrings("panels/js_profiler/js_profiler-meta.ts",G),J=t.i18n.getLazilyComputedLocalizedString.bind(void 0,H);let Q,Y;async function X(){return Y||(Y=await import("../../panels/profiler/profiler.js")),Y}async function Z(){return Q||(Q=await import("../../panels/timeline/timeline.js")),Q}function $(e){return void 0===Q?[]:e(Q)}i.ViewManager.registerViewExtension({location:"panel",id:"js-profiler",title:J(G.profiler),commandPrompt:J(G.showProfiler),order:65,persistence:"permanent",experiment:"js-profiler-temporarily-enable",loadView:async()=>(await X()).ProfilesPanel.JSProfilerPanel.instance()}),i.ActionRegistration.registerActionExtension({actionId:"profiler.js-toggle-recording",category:"JAVASCRIPT_PROFILER",title:J(G.startStopRecording),iconClass:"record-start",toggleable:!0,toggledIconClass:"record-stop",toggleWithRedColor:!0,contextTypes:()=>void 0===Y?[]:(e=>[e.ProfilesPanel.JSProfilerPanel])(Y),loadActionDelegate:async()=>(await X()).ProfilesPanel.JSProfilerPanel.instance(),bindings:[{platform:"windows,linux",shortcut:"Ctrl+E"},{platform:"mac",shortcut:"Meta+E"}]}),i.ActionRegistration.registerActionExtension({actionId:"timeline.show-history",loadActionDelegate:async()=>new((await Z()).TimelinePanel.ActionDelegate),category:"PERFORMANCE",title:J(G.showRecentTimelineSessions),contextTypes:()=>$((e=>[e.TimelinePanel.TimelinePanel])),bindings:[{platform:"windows,linux",shortcut:"Ctrl+H"},{platform:"mac",shortcut:"Meta+Y"}]}),i.ActionRegistration.registerActionExtension({actionId:"timeline.toggle-recording",category:"PERFORMANCE",iconClass:"record-start",toggleable:!0,toggledIconClass:"record-stop",toggleWithRedColor:!0,contextTypes:()=>$((e=>[e.TimelinePanel.TimelinePanel])),loadActionDelegate:async()=>new((await Z()).TimelinePanel.ActionDelegate),options:[{value:!0,title:J(G.record)},{value:!1,title:J(G.stop)}],bindings:[{platform:"windows,linux",shortcut:"Ctrl+E"},{platform:"mac",shortcut:"Meta+E"}]}),i.ActionRegistration.registerActionExtension({actionId:"timeline.record-reload",iconClass:"refresh",contextTypes:()=>$((e=>[e.TimelinePanel.TimelinePanel])),category:"PERFORMANCE",title:J(G.startProfilingAndReloadPage),loadActionDelegate:async()=>new((await Z()).TimelinePanel.ActionDelegate),bindings:[{platform:"windows,linux",shortcut:"Ctrl+Shift+E"},{platform:"mac",shortcut:"Meta+Shift+E"}]});const ee={rnWelcome:"⚛️ Welcome",showRnWelcome:"Show React Native Welcome panel",debuggerBrandName:"React Native JS Inspector"},te=t.i18n.registerUIStrings("panels/rn_welcome/rn_welcome-legacy-meta.ts",ee),oe=t.i18n.getLazilyComputedLocalizedString.bind(void 0,te);let ie;i.ViewManager.registerViewExtension({location:"panel",id:"rn-welcome",title:oe(ee.rnWelcome),commandPrompt:oe(ee.showRnWelcome),order:-10,persistence:"permanent",loadView:async()=>(await async function(){return ie||(ie=await import("../../panels/rn_welcome/rn_welcome.js")),ie}()).RNWelcome.RNWelcomeImpl.instance({debuggerBrandName:oe(ee.debuggerBrandName),showTechPreviewLabel:!0}),experiment:"react-native-specific-ui"}),d.rnPerfMetrics.registerPerfMetricsGlobalPostMessageHandler(),d.rnPerfMetrics.setLaunchId(o.Runtime.Runtime.queryParam("launchId")),d.rnPerfMetrics.entryPointLoadingStarted("rn_inspector"),c.RNExperimentsImpl.setIsReactNativeEntryPoint(!0),c.RNExperimentsImpl.Instance.enableExperimentsByDefault(["js-heap-profiler-enable","js-profiler-temporarily-enable","react-native-specific-ui"]);const ne={networkTitle:"React Native",showReactNative:"Show React Native"},re=t.i18n.registerUIStrings("entrypoints/rn_inspector/rn_inspector.ts",ne),ae=t.i18n.getLazilyComputedLocalizedString.bind(void 0,re);let se;i.ViewManager.registerViewExtension({location:"navigator-view",id:"navigator-network",title:ae(ne.networkTitle),commandPrompt:ae(ne.showReactNative),order:2,persistence:"permanent",loadView:async()=>(await async function(){return se||(se=await import("../../panels/sources/sources.js")),se}()).SourcesNavigator.NetworkNavigatorView.instance()}),self.runtime=o.Runtime.Runtime.instance({forceNew:!0}),new l.MainImpl.MainImpl,d.rnPerfMetrics.entryPointLoadingFinished("rn_inspector");
