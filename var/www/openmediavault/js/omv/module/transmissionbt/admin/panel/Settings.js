/**
 * Created by JetBrains PhpStorm.
 * User: mbeck
 * Date: 28.11.11
 * Time: 20:39
 * To change this template use File | Settings | File Templates.
 */

// require("js/omv/FormPanelExt.js")
// require("js/omv/form/PasswordField.js")
// require("js/omv/form/SharedFolderComboBox.js")
// require("js/omv/form/plugins/FieldInfo.js")

// require("js/omv/module/transmissionbt/NavigationPanel.js")
// require("js/omv/module/transmissionbt/admin/NavigationPanel.js")

Ext.ns("OMV.Module.TransmissionBT");

/**
 * @class OMV.Module.TransmissionBT.SettingsPanel
 * @derived OMV.FormPanelExt
 */
OMV.Module.TransmissionBT.SettingsPanel = function(config) {
	var initialConfig = {
		rpcService: "TransmissionBT",
		rpcGetMethod: "getSettings",
		rpcSetMethod: "setSettings"
	};
	Ext.apply(initialConfig, config);
	OMV.Module.TransmissionBT.SettingsPanel.superclass.constructor.call(
	  this, initialConfig);
};
Ext.extend(OMV.Module.TransmissionBT.SettingsPanel, OMV.FormPanelExt, {
	initComponent : function() {
		OMV.Module.TransmissionBT.SettingsPanel.superclass.
		  initComponent.apply(this, arguments);
		this.on("load", this._updateFormFields, this);
	},

	getFormItems : function() {
		return [{
			xtype: "fieldset",
			title: "General settings",
			defaults: {
//				anchor: "100%",
				labelSeparator: ""
			},
			items: [{
				xtype: "checkbox",
				name: "enable",
				fieldLabel: "Enable",
				checked: false,
				inputValue: 1,
				listeners: {
					check: this._updateFormFields,
					scope: this
				}
			},{
				xtype: "sharedfoldercombo",
				name: "sharedfolderref",
				hiddenName: "sharedfolderref",
				fieldLabel: "Shared folder",
				allowNone: true,
				plugins: [ OMV.form.plugins.FieldInfo ],
				infoText: "Make sure the group 'debian-transmission' has read/write access to the shared folder."
			},{
				xtype: "checkbox",
				name: "pexenabled",
				fieldLabel: "Peer exchange",
				checked: true,
				inputValue: 1,
				boxLabel: "Enable peer exchange (PEX)."
			},{
				xtype: "checkbox",
				name: "dhtenabled",
				fieldLabel: "Distributed hash table (DHT).",
				checked: true,
				inputValue: 1,
				boxLabel: "Enable distributed hash table."
			},{
				xtype: "checkbox",
				name: "lpd-enabled",
				fieldLabel: "Local Peer Discovery (LPD).",
				checked: false,
				inputValue: 1,
				boxLabel: "Enable local peer discovery."
			},{
				xtype: "checkbox",
				name: "utp-enabled",
				fieldLabel: "Micro Transport Protocol (&micro;TP).",
				checked: true,
				inputValue: 1,
				boxLabel: "Enable micro transport protocol."
			},{
				xtype: "combo",
				name: "encryption",
				hiddenName: "encryption",
				fieldLabel: "Encryption",
				mode: "local",
				store: new Ext.data.SimpleStore({
					fields: [ "value","text" ],
					data: [
						[ 0,"Off" ],
						[ 1,"Preferred" ],
						[ 2,"Forced" ]
					]
				}),
				displayField: "text",
				valueField: "value",
				allowBlank: false,
				editable: false,
				triggerAction: "all",
				value: 1,
				plugins: [ OMV.form.plugins.FieldInfo ],
				infoText: "The peer connection encryption mode."
			},{
				xtype: "combo",
				name: "message-level",
				hiddenName: "message-level",
				fieldLabel: "Message Level",
				mode: "local",
				store: new Ext.data.SimpleStore({
					fields: [ "value","text" ],
					data: [
						[ 0,"None" ],
						[ 1,"Error" ],
						[ 2,"Info" ],
						[ 3,"Debug" ]
					]
				}),
				displayField: "text",
				valueField: "value",
				allowBlank: false,
				editable: false,
				triggerAction: "all",
				value: 2,
				plugins: [ OMV.form.plugins.FieldInfo ],
				infoText: "Set verbosity of transmission messages."
			},{
				xtype: "checkbox",
				name: "lazy-bitfield-enabled",
				fieldLabel: "Lazy Bitfield",
				checked: true,
				inputValue: 1,
				boxLabel: "May help get around some ISP filtering."
			},{
				xtype: "checkbox",
				name: "scrape-paused-torrents-enabled",
				fieldLabel: "Scrape paused torrents.",
				checked: true,
				inputValue: 1,
				boxLabel: "Enable paused torrent scraping."
			},{
				xtype: "numberfield",
				name: "umask",
				fieldLabel: "Umask",
				allowDecimals: false,
				allowNegative: false,
				allowBlank: false,
				value: 18,
				plugins: [ OMV.form.plugins.FieldInfo ],
				infoText: "Sets transmission's file mode creation mask."
			}]
		},{
			xtype: "fieldset",
			title: "Remote administration settings",
			defaults: {
//				anchor: "100%",
				labelSeparator: ""
			},
			items: [{
				xtype: "checkbox",
				name: "rpcenabled",
				fieldLabel: "Enable",
				checked: true,
				inputValue: 1,
				boxLabel: "Enable remote administration."
			},{
				xtype: "numberfield",
				name: "rpcport",
				fieldLabel: "Port",
				vtype: "port",
				minValue: 1024,
				maxValue: 65535,
				allowDecimals: false,
				allowNegative: false,
				allowBlank: false,
				value: 9091,
				plugins: [ OMV.form.plugins.FieldInfo ],
				infoText: "Port to open and listen for RPC requests on."
			},{
				xtype: "checkbox",
				name: "rpcauthenticationrequired",
				fieldLabel: "Authentication",
				checked: true,
				inputValue: 1,
				boxLabel: "Require clients to authenticate themselves.",
				listeners: {
					check: this._updateFormFields,
					scope: this
				}
			},{
				xtype: "textfield",
				name: "rpcusername",
				fieldLabel: "Username",
				allowBlank: false,
				vtype: "username",
				plugins: [ OMV.form.plugins.FieldInfo ],
				infoText: "Used for client authentication."
			},{
				xtype: "passwordfield",
				name: "rpcpassword",
				fieldLabel: "Password",
				allowBlank: false,
				plugins: [ OMV.form.plugins.FieldInfo ],
				infoText: "Used for client authentication."
			}]
		},{
			xtype: "fieldset",
			title: "Blocklists",
			defaults: {
//				anchor: "100%",
				labelSeparator: ""
			},
			items: [{
				xtype: "checkbox",
				name: "blocklistenabled",
				fieldLabel: "Enable",
				checked: false,
				inputValue: 1,
				boxLabel: "Use blocklists."
			},{
				xtype: "checkbox",
				name: "blocklistsyncenabled",
				fieldLabel: "Auto sync",
				checked: false,
				inputValue: 1,
				boxLabel: "Update blocklists automatically.",
				listeners: {
					check: this._updateFormFields,
					scope: this
				}
			},{
				xtype: "combo",
				name: "blocklistsyncfrequency",
				hiddenName: "blocklistsyncfrequency",
				fieldLabel: "Sync frequency",
				mode: "local",
				store: new Ext.data.SimpleStore({
					fields: [ "value","text" ],
					data: [
						[ "hourly","Hourly" ],
						[ "daily","Daily" ],
						[ "weekly","Weekly" ],
						[ "monthly","Monthly" ]
					]
				}),
				displayField: "text",
				valueField: "value",
				allowBlank: false,
				editable: false,
				triggerAction: "all",
				value: "daily"
			},{
				xtype: "textfield",
				name: "blocklisturl",
				fieldLabel: "URL",
				allowBlank: true,
				width: 300,
				value: "http://update.transmissionbt.com/level1.gz",
				plugins: [ OMV.form.plugins.FieldInfo ],
				infoText: "The URL of the blocklist."
			}]
		}];
	},

	/**
	 * Private function to update the states of various form fields.
	 */
	_updateFormFields : function() {
		// Update authentication settings
		var field = this.findFormField("rpcauthenticationrequired");
		var checked = field.checked;
		var fields = [ "rpcusername", "rpcpassword" ];
		for (var i = 0; i < fields.length; i++) {
			field = this.findFormField(fields[i]);
			if (!Ext.isEmpty(field)) {
				field.allowBlank = !checked;
				field.setReadOnly(!checked);
			}
		}
		// Update blocklist settings
		field = this.findFormField("blocklistsyncenabled");
		checked = field.checked;
		fields = [ "blocklistsyncfrequency", "blocklisturl" ];
		for (var i = 0; i < fields.length; i++) {
			field = this.findFormField(fields[i]);
			if (!Ext.isEmpty(field)) {
				field.allowBlank = !checked;
				field.setReadOnly(!checked);
			}
		}
		// Update 'sharedfolderref' field settings
		field = this.findFormField("enable");
		var checked = field.checked;
		field = this.findFormField("sharedfolderref");
		if (!Ext.isEmpty(field)) {
			field.allowBlank = !checked;
		}
	}
});
OMV.NavigationPanelMgr.registerPanel("transmissionbt", "admin", {
	cls: OMV.Module.TransmissionBT.SettingsPanel,
	title: "Settings",
	position: 10
});