/**
 * This file is part of OpenMediaVault.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @copyright Copyright (c) 2009-2011 Volker Theile
 *
 * OpenMediaVault is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * OpenMediaVault is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with OpenMediaVault. If not, see <http://www.gnu.org/licenses/>.
 */
// require("js/omv/NavigationPanel.js")
// require("js/omv/data/DataProxy.js")
// require("js/omv/data/Store.js")
// require("js/omv/CfgObjectDialog.js")
// require("js/omv/grid/TBarGridPanel.js")
// require("js/omv/form/MultiSelect.js")
// require("js/omv/util/Format.js")
// require("js/omv/ExecCmdDialog.js")
// require("js/omv/UploadDialog.js")

Ext.ns("OMV.Module.Services");

// Register the menu.
OMV.NavigationPanelMgr.registerMenu("services", "transmissionbt", {
	text: "BitTorrent",
	icon: "images/transmissionbt.png"
});

/**
 * @class OMV.Module.Services.TransmissionBTGridPanel
 * @derived OMV.grid.TBarGridPanel
 */
OMV.Module.Services.TransmissionBTGridPanel = function(config) {
	var initialConfig = {
		autoReload: true,
		reloadInterval: 5000,
		hidePagingToolbar: true,
		hideAdd: true,
		hideEdit: true,
		hideDelete: true,
		resumeWaitMsg: "Resuming selected item(s)",
		pauseWaitMsg: "Pausing selected item(s)",
		stateId: "cb44cbf3-b1cb-b6ba-13548ab0dc7c246c",
		colModel: new Ext.grid.ColumnModel({
			columns: [{
				header: "ID",
				sortable: true,
				dataIndex: "id",
				id: "id"
			},{
				header: "Name",
				sortable: true,
				dataIndex: "name",
				id: "name"
			},{
				header: "Status",
				sortable: true,
				dataIndex: "status",
				id: "status",
				renderer: this.statusRenderer,
				scope: this
			},{
				header: "Done",
				sortable: true,
				dataIndex: "percentDone",
				id: "percentDone",
				renderer: this.doneRenderer,
				scope: this
			},{
				header: "ETA",
				sortable: true,
				dataIndex: "eta",
				id: "eta",
				renderer: this.etaRenderer,
				scope: this
			},{
				header: "Peers",
				sortable: true,
				id: "peers",
				renderer: this.peersRenderer,
				scope: this
			},{
				header: "DL-Rate",
				sortable: true,
				dataIndex: "rateDownload",
				id: "rateDownload",
				renderer: this.rateRenderer,
				scope: this
			},{
				header: "UL-Rate",
				sortable: true,
				dataIndex: "rateUpload",
				id: "rateUpload",
				renderer: this.rateRenderer,
				scope: this
			}]
		})
	};
	Ext.apply(initialConfig, config);
	OMV.Module.Services.TransmissionBTGridPanel.superclass.constructor.call(this,
	  initialConfig);
};
Ext.extend(OMV.Module.Services.TransmissionBTGridPanel, OMV.grid.TBarGridPanel, {
	initComponent : function() {
		this.store = new OMV.data.Store({
			autoLoad: true,
			remoteSort: false,
			proxy: new OMV.data.DataProxy("TransmissionBT", "getList",
				[ [ "userdefined" ] ]),
			reader: new Ext.data.JsonReader({
				idProperty: "id",
				totalProperty: "total",
				root: "data",
				fields: [
					{ name: "id" },
					{ name: "name" },
					{ name: "status" },
					{ name: "totalSize" },
					{ name: "haveValid" },
					{ name: "percentDone" },
					{ name: "eta" },
					{ name: "peersConnected" },
					{ name: "peersSendingToUs" },
					{ name: "rateDownload" },
					{ name: "rateUpload" }
    			]
			})
		});
		OMV.Module.Services.TransmissionBTGridPanel.superclass.initComponent.apply(this,
		  arguments);
	},

	initToolbar : function() {
		var tbar = OMV.Module.Services.TransmissionBTGridPanel.superclass.initToolbar.apply(
		  this);
		tbar.insert(0, {
			id: this.getId() + "-reload",
			xtype: "button",
			text: "Reload",
			icon: "images/reload.png",
			handler: this.cbReloadBtnHdl,
			scope: this
		});
		tbar.insert(1, {
			id: this.getId() + "-upload",
			xtype: "button",
			text: "Upload",
			icon: "images/upload.png",
			handler: this.cbUploadBtnHdl,
			scope: this
		});
		tbar.insert(2, {
			id: this.getId() + "-delete",
			xtype: "button",
			text: "Delete",
			icon: "images/delete.png",
			handler: this.cbDeleteBtnHdl,
			scope: this,
			disabled: true
		});
		tbar.insert(3, {
			id: this.getId() + "-pause",
			xtype: "button",
			text: "pause",
			icon: "images/transmissionbt_pause.png",
			handler: this.cbPauseBtnHdl,
			scope: this,
			disabled: true
		});
		tbar.insert(4, {
			id: this.getId() + "-resume",
			xtype: "button",
			text: "Resume",
			icon: "images/transmissionbt_resume.png",
			handler: this.cbResumeBtnHdl,
			scope: this,
			disabled: true
		});
		return tbar;
	},

	cbSelectionChangeHdl : function(model) {
		OMV.Module.Services.TransmissionBTGridPanel.superclass.cbSelectionChangeHdl.apply(this, arguments);
		// Process additional buttons
		var records = model.getSelections();
		var tbarDeleteCtrl = this.getTopToolbar().findById(this.getId() + "-delete");
		var tbarPauseCtrl = this.getTopToolbar().findById(this.getId() + "-pause");
		var tbarResumeCtrl = this.getTopToolbar().findById(this.getId() + "-resume");
		if (records.length <= 0) {
			tbarDeleteCtrl.disable();
			tbarPauseCtrl.disable();
			tbarResumeCtrl.disable();
		} else {
			tbarDeleteCtrl.enable();
			tbarPauseCtrl.enable();
			tbarResumeCtrl.enable();
		}
	},
	
	cbReloadBtnHdl : function() {
		this.doReload();
	},
	
	cbUploadBtnHdl : function() {
		var wnd = new OMV.UploadDialog({
			title: "Upload torrent",
			service: "TransmissionBT",
			method: "upload",
			listeners: {
				success: function(wnd, response) {
					// The upload was successful, now resynchronize the
					// package index files from their sources.
					this.cbReloadBtnHdl();
				},
				scope: this
			}
		});
		wnd.show();
	},
	
	doDeletion : function(record) {
		OMV.Ajax.request(this.cbDeletionHdl, this, "TransmissionBT",
		  "delete", [ record.get("id") ]);
	},
	
	cbResumeBtnHdl : function() {
		var selModel = this.getSelectionModel();
		var records = selModel.getSelections();
		
		this.startResume(selModel, records);
	},
	
	startResume: function(model, records) {
		if (records.length <= 0)
			return;
		// Store selected records in a local variable
		this.resumeActionInfo = {
			records: records,
			count: records.length
		}
		// Get first record to be deleted
		var record = this.resumeActionInfo.records.pop();
		// Display progress dialog
		OMV.MessageBox.progress("", this.resumeWaitMsg, "");
		this.updateResumeProgress();
		// Execute deletion function
		this.doResume(record);
	},
	
	doResume : function(record) {
		OMV.Ajax.request(this.cbResumeHdl, this, "TransmissionBT", "resume", [ record.get("id") ]);
		//cbResumeHdl(null, null, null);
	},
	
	updateResumeProgress : function() {
		// Calculate percentage
		var p = (this.resumeActionInfo.count - this.resumeActionInfo.records.length) /
		  this.resumeActionInfo.count;
		// Create message text
		var text = Math.round(100 * p) + "% completed ...";
		// Update progress dialog
		OMV.MessageBox.updateProgress(p, text);
	},
	
	cbResumeHdl : function(id, response, error) {
		if (error !== null) {
			// Remove temporary local variables
			delete this.resumeActionInfo;
			// Hide progress dialog
			OMV.MessageBox.hide();
			// Display error message
			OMV.MessageBox.error(null, error);
		} else {
			if (this.resumeActionInfo.records.length > 0) {
				var record = this.resumeActionInfo.records.pop();
				// Update progress dialog
				this.updateResumeProgress();
				// Execute deletion function
				this.doResume(record);
			} else {
				// Remove temporary local variables
				delete this.resumeActionInfo;
				// Update and hide progress dialog
				OMV.MessageBox.updateProgress(1, "100% completed ...");
				OMV.MessageBox.hide();
				this.afterResume();
			}
		}
	},
	
	afterResume : function() {
		if (this.mode === "remote") {
			this.doReload();
		}
	},
	
	cbPauseBtnHdl : function() {
		var selModel = this.getSelectionModel();
		var records = selModel.getSelections();
		
		this.startPause(selModel, records);
	},
	
	startPause: function(model, records) {
		if (records.length <= 0)
			return;
		// Store selected records in a local variable
		this.pauseActionInfo = {
			records: records,
			count: records.length
		}
		// Get first record to be deleted
		var record = this.pauseActionInfo.records.pop();
		// Display progress dialog
		OMV.MessageBox.progress("", this.pauseWaitMsg, "");
		this.updatePauseProgress();
		// Execute deletion function
		this.doPause(record);
	},
	
	doPause : function(record) {
		OMV.Ajax.request(this.cbPauseHdl, this, "TransmissionBT", "pause", [ record.get("id") ]);
	},
	
	updatePauseProgress : function() {
		// Calculate percentage
		var p = (this.pauseActionInfo.count - this.pauseActionInfo.records.length) /
		  this.pauseActionInfo.count;
		// Create message text
		var text = Math.round(100 * p) + "% completed ...";
		// Update progress dialog
		OMV.MessageBox.updateProgress(p, text);
	},
	
	cbPauseHdl : function(id, response, error) {
		if (error !== null) {
			// Remove temporary local variables
			delete this.pauseActionInfo;
			// Hide progress dialog
			OMV.MessageBox.hide();
			// Display error message
			OMV.MessageBox.error(null, error);
		} else {
			if (this.pauseActionInfo.records.length > 0) {
				var record = this.pauseActionInfo.records.pop();
				// Update progress dialog
				this.updatePauseProgress();
				// Execute deletion function
				this.doPause(record);
			} else {
				// Remove temporary local variables
				delete this.pauseActionInfo;
				// Update and hide progress dialog
				OMV.MessageBox.updateProgress(1, "100% completed ...");
				OMV.MessageBox.hide();
				this.afterPause();
			}
		}
	},
	
	afterPause : function() {
		if (this.mode === "remote") {
			this.doReload();
		}
	},
	
	doneRenderer : function(val, cell, record, row, col, store) {
		var percentage = parseInt(record.get("percentDone"));
		var totalSize = parseInt(record.get("totalSize"));
		var haveValid = parseInt(record.get("haveValid"));
		
		if (-1 == percentage) {
			return val;
		}
		var id = Ext.id();
		(function(){
			new Ext.ProgressBar({
				renderTo: id,
				value: percentage / 100,
				text: bytesToSize(haveValid) + '/' + bytesToSize(totalSize) + ' (' + percentage + '%)'
			});
		}).defer(25)
		return '<div id="' + id + '"></div>';
	},
	
	statusRenderer : function(val, cell, record, row, col, store) {
		switch (val) {
		case 1:
			val = "Waiting in queue to check files";
			break;
		case 2:
			val = "Checking files";
			break;
		case 4:
			val = "Downloading";
			break;
		case 8:
			val = "Seeding";
			break;
		case 16:
			val = "Torrent is stopped";
			break;
		default:
			val = "Missing: " + val;
			break;
		}
		return val;
	},
	
	etaRenderer : function(val, cell, record, row, col, store) {
		switch (val) {
		case -1:
			val = "Not available";
			break;
		case -2:
			val = "Unknown";
			break;
		default:
			val = timeInterval(val);
			break;
		}
		return val;
	},
	
	peersRenderer : function(val, cell, record, row, col, store) {
		var peersConnected = parseInt(record.get("peersConnected"));
		var peersSendingToUs = parseInt(record.get("peersSendingToUs"));
		
		val = peersSendingToUs + ' / ' + peersConnected;
		
		return val;
	},
	
	rateRenderer : function(val, cell, record, row, col, store) {
		val = rate(val);
		return val;
	}
});
OMV.NavigationPanelMgr.registerPanel("services", "transmissionbt", {
	cls: OMV.Module.Services.TransmissionBTGridPanel
});

function bytesToSize (bytes) {
  var sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  if (bytes == 0) return 'n/a';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return ((i == 0)? (bytes / Math.pow(1024, i)) : (bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
};

function timeInterval (seconds)
{
	var days    = Math.floor (seconds / 86400),
		hours   = Math.floor ((seconds % 86400) / 3600),
		minutes = Math.floor ((seconds % 3600) / 60),
		seconds = Math.floor (seconds % 60),
		d = days    + ' ' + (days    > 1 ? 'days'    : 'day'),
		h = hours   + ' ' + (hours   > 1 ? 'hours'   : 'hour'),
		m = minutes + ' ' + (minutes > 1 ? 'minutes' : 'minute'),
		s = seconds + ' ' + (seconds > 1 ? 'seconds' : 'second');

	if (days) {
		if (days >= 4 || !hours)
			return d;
		return d + ', ' + h;
	}
	if (hours) {
		if (hours >= 4 || !minutes)
			return h;
		return h + ', ' + m;
	}
	if (minutes) {
		if (minutes >= 4 || !seconds)
			return m;
		return m + ', ' + s;
	}
	return s;
};

function rate (Bps)
{
	var speed = Math.floor(Bps / 1000);

	if (speed <= 999.95) // 0 KBps to 999 K
		return [ speed.toTruncFixed(0), 'KB/s' ].join(' ');

	speed /= 1000;

	if (speed <= 99.995) // 1 M to 99.99 M
		return [ speed.toTruncFixed(2), 'MB/s' ].join(' ');
	if (speed <= 999.95) // 100 M to 999.9 M
		return [ speed.toTruncFixed(1), 'MB/s' ].join(' ');

	// insane speeds
	speed /= 1000;
	return [ speed.toTruncFixed(2), 'GB/s' ].join(' ');
};

Number.prototype.toTruncFixed = function(place) {
        var ret = Math.floor(this * Math.pow (10, place)) / Math.pow(10, place);
        return ret.toFixed(place);
}

Number.prototype.toStringWithCommas = function() {
    return this.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
}