/**
 * Created by JetBrains PhpStorm.
 * User: mbeck
 * Date: 28.11.11
 * Time: 20:42
 * To change this template use File | Settings | File Templates.
 */

// require("js/omv/FormPanelExt.js")
// require("js/omv/form/plugins/FieldInfo.js")

// require("js/omv/module/transmissionbt/NavigationPanel.js")
// require("js/omv/module/transmissionbt/admin/NavigationPanel.js")

Ext.ns("OMV.Module.TransmissionBT");

/**
 * @class OMV.Module.TransmissionBT.SchedulingPanel
 * @derived OMV.FormPanelExt
 */
OMV.Module.TransmissionBT.SchedulingPanel = function(config) {
	var initialConfig = {
		rpcService: "TransmissionBT",
		rpcGetMethod: "getScheduling",
		rpcSetMethod: "setScheduling"
	};
	Ext.apply(initialConfig, config);
	OMV.Module.TransmissionBT.SchedulingPanel.superclass.constructor.call(
	  this, initialConfig);
};
Ext.extend(OMV.Module.TransmissionBT.SchedulingPanel, OMV.FormPanelExt, {
	getFormItems : function() {
		return [{xtype: "fieldset",
			title: "General",
			defaults: {
				labelSeparator: ""
			},
			items: [{xtype: "checkbox",
				name: "alt-speed-time-enabled",
				fieldLabel: "Scheduling",
				checked: false,
				inputValue: 1,
				boxLabel: "When enabled, this will toggle the Turtle Mode."
			},{
				xtype: "fieldset",
				title: "Time",
				defaults: {
					labelSeparator: ""
				},
				items: [{
					xtype: "compositefield",
					name: "begin-time",
					fieldLabel: "Begin",
					width: 200,
					items: [{
						xtype: "combo",
						name: "begin-hour",
						mode: "local",
						store: Array.range(0, 23),
						allowBlank: false,
						editable: false,
						triggerAction: "all",
						width: 50,
						value: 9,
						reset: function() {}
					},{
						xtype: "displayfield",
						value: ":"
					},{
						xtype: "combo",
						name: "begin-minute",
						mode: "local",
						store: Array.range(0, 59),
						allowBlank: false,
						editable: false,
						triggerAction: "all",
						width: 50,
						value: 0,
						reset: function() {}
					}]
				},{
					xtype: "compositefield",
					name: "end-time",
					fieldLabel: "End",
					width: 200,
					items: [{
						xtype: "combo",
						name: "end-hour",
						mode: "local",
						store: Array.range(0, 23),
						allowBlank: false,
						editable: false,
						triggerAction: "all",
						width: 50,
						value: 17,
						reset: function() {}
					},{
						xtype: "displayfield",
						value: ":"
					},{
						xtype: "combo",
						name: "end-minute",
						mode: "local",
						store: Array.range(0, 59),
						allowBlank: false,
						editable: false,
						triggerAction: "all",
						width: 50,
						value: 0,
						reset: function() {}
					}]
				}]
			},{
				xtype: "fieldset",
				title: "Days",
				defaults: {
					labelSeparator: ""
				},
				items: [{xtype: "checkbox",
					name: "days-sunday",
					fieldLabel: "Sunday",
					checked: true,
					inputValue: 1
				},{
					xtype: "checkbox",
					name: "days-monday",
					fieldLabel: "Monday",
					checked: true,
					inputValue: 1
				},{
					xtype: "checkbox",
					name: "days-tuesday",
					fieldLabel: "Tuesday",
					checked: true,
					inputValue: 1
				},{
					xtype: "checkbox",
					name: "days-wednesday",
					fieldLabel: "Wednesday",
					checked: true,
					inputValue: 1
				},{
					xtype: "checkbox",
					name: "days-thursday",
					fieldLabel: "Thursday",
					checked: true,
					inputValue: 1
				},{
					xtype: "checkbox",
					name: "days-friday",
					fieldLabel: "Friday",
					checked: true,
					inputValue: 1
				},{
					xtype: "checkbox",
					name: "days-saturday",
					fieldLabel: "Saturday",
					checked: true,
					inputValue: 1
				}]
			}]
		},{
			xtype: "fieldset",
			title: "Idle",
			defaults: {
				labelSeparator: ""
			},
			items: [{xtype: "checkbox",
				name: "idle-seeding-limit-enabled",
				fieldLabel: "Seeding Limit",
				checked: false,
				inputValue: 1,
				boxLabel: "Stop seeding after being idle for N minutes."
			},{
				xtype: "numberfield",
				name: "idle-seeding-limit",
				fieldLabel: "Idle Minutes",
				allowDecimals: false,
				allowNegative: false,
				allowBlank: false,
				value: 30
			}]
		},{
			xtype: "fieldset",
			title: "Ratio",
			defaults: {
				labelSeparator: ""
			},
			items: [{xtype: "checkbox",
				name: "ratio-limit-enabled",
				fieldLabel: "Ratio",
				checked: false,
				inputValue: 1,
				boxLabel: "Transmission will only seed until ratio limit is reached."
			},{
				xtype: "numberfield",
				name: "ratio-limit",
				fieldLabel: "Ratio Limit",
				allowDecimals: true,
				allowNegative: false,
				allowBlank: false,
				value: 2.0
			}]
		}];
	}
});
OMV.NavigationPanelMgr.registerPanel("transmissionbt", "admin", {
	cls: OMV.Module.TransmissionBT.SchedulingPanel,
	title: "Scheduling",
	position: 60
});