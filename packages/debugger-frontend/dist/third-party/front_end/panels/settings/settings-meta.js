import*as e from"../../core/i18n/i18n.js";import*as t from"../../ui/legacy/legacy.js";import*as i from"../../core/common/common.js";import*as n from"../../core/root/root.js";const s={devices:"Devices",showDevices:"Show Devices"},o=e.i18n.registerUIStrings("panels/settings/emulation/emulation-meta.ts",s),r=e.i18n.getLazilyComputedLocalizedString.bind(void 0,o);let a;t.ViewManager.registerViewExtension({location:"settings-view",commandPrompt:r(s.showDevices),title:r(s.devices),order:30,loadView:async()=>new((await async function(){return a||(a=await import("./emulation/emulation.js")),a}()).DevicesSettingsTab.DevicesSettingsTab),id:"devices",settings:["standard-emulated-device-list","custom-emulated-device-list"]});const c={shortcuts:"Shortcuts",preferences:"Preferences",experiments:"Experiments",ignoreList:"Ignore List",showShortcuts:"Show Shortcuts",showPreferences:"Show Preferences",showExperiments:"Show Experiments",showIgnoreList:"Show Ignore List",settings:"Settings",documentation:"Documentation"},g=e.i18n.registerUIStrings("panels/settings/settings-meta.ts",c),d=e.i18n.getLazilyComputedLocalizedString.bind(void 0,g);let l;async function m(){return l||(l=await import("./settings.js")),l}t.ViewManager.registerViewExtension({location:"settings-view",id:"preferences",title:d(c.preferences),commandPrompt:d(c.showPreferences),order:0,loadView:async()=>new((await m()).SettingsScreen.GenericSettingsTab)}),t.ViewManager.registerViewExtension({location:"settings-view",id:"experiments",title:d(c.experiments),commandPrompt:d(c.showExperiments),order:3,experiment:"*",loadView:async()=>new((await m()).SettingsScreen.ExperimentsSettingsTab)}),t.ViewManager.registerViewExtension({location:"settings-view",id:"blackbox",title:d(c.ignoreList),commandPrompt:d(c.showIgnoreList),order:4,loadView:async()=>new((await m()).FrameworkIgnoreListSettingsTab.FrameworkIgnoreListSettingsTab)}),t.ViewManager.registerViewExtension({location:"settings-view",id:"keybinds",title:d(c.shortcuts),commandPrompt:d(c.showShortcuts),order:100,loadView:async()=>new((await m()).KeybindsSettingsTab.KeybindsSettingsTab)}),t.ActionRegistration.registerActionExtension({category:"SETTINGS",actionId:"settings.show",title:d(c.settings),loadActionDelegate:async()=>new((await m()).SettingsScreen.ActionDelegate),iconClass:"gear",bindings:[{shortcut:"F1",keybindSets:["devToolsDefault"]},{shortcut:"Shift+?"},{platform:"windows,linux",shortcut:"Ctrl+,",keybindSets:["vsCode"]},{platform:"mac",shortcut:"Meta+,",keybindSets:["vsCode"]}]}),t.ActionRegistration.registerActionExtension({category:"SETTINGS",actionId:"settings.documentation",title:d(c.documentation),loadActionDelegate:async()=>new((await m()).SettingsScreen.ActionDelegate)}),t.ActionRegistration.registerActionExtension({category:"SETTINGS",actionId:"settings.shortcuts",title:d(c.showShortcuts),loadActionDelegate:async()=>new((await m()).SettingsScreen.ActionDelegate),bindings:[{platform:"windows,linux",shortcut:"Ctrl+K Ctrl+S",keybindSets:["vsCode"]},{platform:"mac",shortcut:"Meta+K Meta+S",keybindSets:["vsCode"]}]}),t.ViewManager.registerLocationResolver({name:"settings-view",category:"SETTINGS",loadResolver:async()=>(await m()).SettingsScreen.SettingsScreen.instance()}),i.Revealer.registerRevealer({contextTypes:()=>[i.Settings.Setting,n.Runtime.Experiment],destination:void 0,loadRevealer:async()=>new((await m()).SettingsScreen.Revealer)}),t.ContextMenu.registerItem({location:"mainMenu/footer",actionId:"settings.shortcuts",order:void 0}),t.ContextMenu.registerItem({location:"mainMenuHelp/default",actionId:"settings.documentation",order:void 0});
