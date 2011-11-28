/**
 * Created by JetBrains PhpStorm.
 * User: mbeck
 * Date: 28.11.11
 * Time: 20:41
 * To change this template use File | Settings | File Templates.
 */

// require("js/omv/FormPanelExt.js")
// require("js/omv/form/plugins/FieldInfo.js")

// require("js/omv/module/transmissionbt/NavigationPanel.js")
// require("js/omv/module/transmissionbt/admin/NavigationPanel.js")

Ext.ns("OMV.Module.TransmissionBT");

/**
 * @class OMV.Module.TransmissionBT.PeerPanel
 * @derived OMV.FormPanelExt
 */
OMV.Module.TransmissionBT.PeerPanel = function(config) {
	var initialConfig = {
		rpcService: "TransmissionBT",
		rpcGetMethod: "getPeer",
		rpcSetMethod: "setPeer"
	};
	Ext.apply(initialConfig, config);
	OMV.Module.TransmissionBT.PeerPanel.superclass.constructor.call(
	  this, initialConfig);
};
Ext.extend(OMV.Module.TransmissionBT.PeerPanel, OMV.FormPanelExt, {
	getFormItems : function() {
		return [{
			xtype: "fieldset",
			title: "Peers",
			defaults: {
				labelSeparator: ""
			},
			items: [{
				xtype: "fieldset",
				title: "Bindings",
				defaults: {
					labelSeparator: ""
				},
				items: [{
					xtype: "textfield",
					name: "bind-address-ipv4",
					fieldLabel: "IPv4",
					vtype: "IPv4Net",
					allowBlank: false,
					value: "0.0.0.0",
					plugins: [ OMV.form.plugins.FieldInfo ],
					infoText: "IPv4 address to listen on. Use 0.0.0.0 for all host IPs."
				},{
					xtype: "textfield",
					name: "bind-address-ipv6",
					fieldLabel: "IPv6",
					allowBlank: false,
					value: "::",
					plugins: [ OMV.form.plugins.FieldInfo ],
					infoText: "IPv6 address to listen on. Use :: for all host IPs."
				}]
			},{
				xtype: "fieldset",
				title: "Limits",
				defaults: {
					labelSeparator: ""
				},
				items: [{
					xtype: "numberfield",
					name: "peer-limit-global",
					fieldLabel: "Global",
					allowDecimals: false,
					allowNegative: false,
					allowBlank: false,
					value: 240
				},{
					xtype: "numberfield",
					name: "peer-limit-per-torrent",
					fieldLabel: "Per torrent",
					allowDecimals: false,
					allowNegative: false,
					allowBlank: false,
					value: 60
				},{
					xtype: "combo",
					name: "peer-socket-tos",
					hiddenName: "peer-socket-tos",
					fieldLabel: "Socket TOS",
					mode: "local",
					store: new Ext.data.SimpleStore({
						fields: [ "value","text" ],
						data: [
							[ "default","default" ],
							[ "lowcost","lowcost" ],
							[ "throughput","throughput" ],
							[ "lowdelay","lowdelay" ],
							[ "reliability","reliability" ]
						]
					}),
					displayField: "text",
					valueField: "value",
					allowBlank: false,
					editable: false,
					triggerAction: "all",
					value: "default"
				}]
			}]
		},{
			xtype: "fieldset",
			title: "Peer Ports",
			defaults: {
				labelSeparator: ""
			},
			items: [{
				xtype: "numberfield",
				name: "peer-port",
				fieldLabel: "Peer port",
				vtype: "port",
				minValue: 1024,
				maxValue: 65535,
				allowDecimals: false,
				allowNegative: false,
				allowBlank: false,
				value: 51413,
				plugins: [ OMV.form.plugins.FieldInfo ],
				infoText: "Port to listen for incoming peer connections."
			},{
				xtype: "checkbox",
				name: "peer-port-random-on-start",
				fieldLabel: "Random Port",
				checked: false,
				inputValue: 1,
				boxLabel: "Random Port on start."
			},{
				xtype: "numberfield",
				name: "peer-port-random-low",
				fieldLabel: "Random low",
				allowBlank: false,
				vtype: "port",
				minValue: 1024,
				maxValue: 65535,
				allowDecimals: false,
				allowNegative: false,
				allowBlank: false,
				value: 1024
			},{
				xtype: "numberfield",
				name: "peer-port-random-high",
				fieldLabel: "Random high",
				vtype: "port",
				minValue: 1024,
				maxValue: 65535,
				allowDecimals: false,
				allowNegative: false,
				allowBlank: false,
				value: 65535
			},{
				xtype: "checkbox",
				name: "port-forwarding-enabled",
				fieldLabel: "Port forwarding",
				checked: true,
				inputValue: 1,
				boxLabel: "Enable port forwarding via NAT-PMP or UPnP."
			}]
		}];
	}
});
OMV.NavigationPanelMgr.registerPanel("transmissionbt", "admin", {
	cls: OMV.Module.TransmissionBT.PeerPanel,
	title: "Peer",
	position: 20
});