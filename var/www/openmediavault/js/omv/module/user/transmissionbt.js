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
// require("js/omv/module/transmissionbt/uploadDialog.js")
// require("js/omv/module/transmissionbt/deleteDialog.js")

Ext.ns("OMV.Module.Services");

// Register the menu.
OMV.NavigationPanelMgr.registerMenu("services", "transmissionbtm", {
	text: "BitTorrent Manage",
	icon: "images/transmissionbt.png"
});

/**
 * @class OMV.Module.Services.TransmissionBTGridPanel
 * @derived OMV.grid.TBarGridPanel
 */
OMV.Module.Services.TransmissionBTGridPanel = function(config) {
	var initialConfig = {
		autoReload: true,
		reloadInterval: 10000,
		hidePagingToolbar: true,
		hideAdd: true,
		hideEdit: true,
		hideDelete: true,
		resumeWaitMsg: "Resuming selected item(s)",
		pauseWaitMsg: "Pausing selected item(s)",
		deleteWaitMsg: "Deleting selected item(s)",
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
			},{
				header: "Date Added",
				sortable: true,
				dataIndex: "addedDate",
				id: "addedDate",
				renderer: this.timestampRenderer,
				scope: this
			},{
				header: "Date Done",
				sortable: true,
				dataIndex: "doneDate",
				id: "doneDate",
				renderer: this.timestampRenderer,
				scope: this
			},{
				header: "Ratio",
				sortable: true,
				dataIndex: "uploadRatio",
				id: "uploadRatio"
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
					{ name: "rateUpload" },
					{ name: "addedDate" },
					{ name: "doneDate" },
					{ name: "uploadRatio" }
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
		this.toggleButtons();
	},
	
	toggleButtons : function()
	{
		var sm = this.getSelectionModel();
		var records = sm.getSelections();
	
		var tbarDeleteCtrl = this.getTopToolbar().findById(this.getId() + "-delete");
		var tbarPauseCtrl = this.getTopToolbar().findById(this.getId() + "-pause");
		var tbarResumeCtrl = this.getTopToolbar().findById(this.getId() + "-resume");
		if (records.length <= 0) {
			tbarDeleteCtrl.disable();
			tbarPauseCtrl.disable();
			tbarResumeCtrl.disable();
		} else if (records.length == 1) {
			var record = records.pop();
			var status = parseInt(record.get("status"));
			switch (status)
			{
				case 0: /* Torrent is stopped */
					tbarDeleteCtrl.enable();
					tbarPauseCtrl.disable();
					tbarResumeCtrl.enable();
					break;
				case 1: /* Queued to check files */
					tbarDeleteCtrl.enable();
					tbarPauseCtrl.enable();
					tbarResumeCtrl.disable();
					break;
				case 2: /* Checking files */
					tbarDeleteCtrl.enable();
					tbarPauseCtrl.enable();
					tbarResumeCtrl.disable();
					break;
				case 3: /* Queued to download */
					tbarDeleteCtrl.enable();
					tbarPauseCtrl.enable();
					tbarResumeCtrl.disable();
					break;
				case 4: /* Downloading */
					tbarDeleteCtrl.enable();
					tbarPauseCtrl.enable();
					tbarResumeCtrl.disable();
					break;
				case 5: /* Queued to seed */
					tbarDeleteCtrl.enable();
					tbarPauseCtrl.enable();
					tbarResumeCtrl.disable();
					break;
				case 6: /* Seeding */
					tbarDeleteCtrl.enable();
					tbarPauseCtrl.enable();
					tbarResumeCtrl.disable();
					break;
				default:
					break;
			}
		} else {
			tbarDeleteCtrl.enable();
			tbarPauseCtrl.enable();
			tbarResumeCtrl.enable();
		}
	},
	
	/**
	 * @method doReload
	 * Reload the grid content.
	 */
	doReload : function() {
		if (this.mode === "remote") {
			this.store.reload();
			this.toggleButtons();
		}
	},
	
	cbReloadBtnHdl : function() {
		this.doReload();
	},
	
	cbUploadBtnHdl : function() {
		var wnd = new OMV.TransmissionBT.UploadDialog({
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
	
	cbDeleteBtnHdl : function() {
		var selModel = this.getSelectionModel();
		var records = selModel.getSelections();
		var wnd = new OMV.TransmissionBT.DeleteDialog({
			title: "Upload torrent",
			service: "TransmissionBT",
			method: "upload",
			listeners: {
				success: function(wnd, delete_local_data) {
					this.startDelete(selModel, records, delete_local_data);
					this.cbReloadBtnHdl();
				},
				scope: this
			}
		});
		wnd.show();
	},
	
	startDelete: function(model, records, delete_local_data) {
		if (records.length <= 0)
			return;
		// Store selected records in a local variable
		this.deleteActionInfo = {
			records: records,
			count: records.length
		}
		// Get first record to be deleted
		var record = this.deleteActionInfo.records.pop();
		// Display progress dialog
		OMV.MessageBox.progress("", this.deleteWaitMsg, "");
		this.updateDeleteProgress();
		// Execute deletion function
		this.doDelete(record, delete_local_data);
	},
	
	doDelete : function(record, delete_local_data) {
		OMV.Ajax.request(this.cbDeleteHdl, this, "TransmissionBT", "delete", [{ id:  record.get("id"), deleteLocalData: delete_local_data }] );
		
		
	},
	
	updateDeleteProgress : function() {
		// Calculate percentage
		var p = (this.deleteActionInfo.count - this.deleteActionInfo.records.length) /
		  this.deleteActionInfo.count;
		// Create message text
		var text = Math.round(100 * p) + "% completed ...";
		// Update progress dialog
		OMV.MessageBox.updateProgress(p, text);
	},
	
	cbDeleteHdl : function(id, response, error) {
		if (error !== null) {
			// Remove temporary local variables
			delete this.deleteActionInfo;
			// Hide progress dialog
			OMV.MessageBox.hide();
			// Display error message
			OMV.MessageBox.error(null, error);
		} else {
			if (this.deleteActionInfo.records.length > 0) {
				var record = this.deleteActionInfo.records.pop();
				// Update progress dialog
				this.updateDeleteProgress();
				// Execute deletion function
				this.doDelete(record);
			} else {
				// Remove temporary local variables
				delete this.deleteActionInfo;
				// Update and hide progress dialog
				OMV.MessageBox.updateProgress(1, "100% completed ...");
				OMV.MessageBox.hide();
				this.afterDelete();
			}
		}
	},
	
	afterDelete : function() {
		if (this.mode === "remote") {
			this.doReload();
		}
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
		case 0:
			val = "Torrent is stopped";
			break;
		case 1:
			val = "Queued to check files";
			break;
		case 2:
			val = "Checking files";
			break;
		case 3:
			val = "Queued to download";
			break;
		case 4:
			val = "Downloading";
			break;
		case 5:
			val = "Queued to seed";
			break;
		case 6:
			val = "Seeding";
			break;
		default:
			val = "Missing Status: " + val;
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
	},
	
	timestampRenderer: function(val, cell, record, row, col, store) {
		if (val <= 0)
			return;
		var dt = Date.parseDate(val, "U");
		return Ext.util.Format.date(dt, 'Y-m-d H:i:s');
	}
});
OMV.NavigationPanelMgr.registerPanel("services", "transmissionbtm", {
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
	var weeks    = Math.floor (seconds / 604800),
		days    = Math.floor ((seconds % 604800) / 86400),
		hours   = Math.floor ((seconds % 86400) / 3600),
		minutes = Math.floor ((seconds % 3600) / 60),
		seconds = Math.floor (seconds % 60),
		w = weeks   + 'w',
		d = days    + 'd',
		h = hours   + 'h',
		m = minutes + 'm',
		s = seconds + 's';

	if (weeks) {
		return w + ' ' + d;
	}
	if (days) {
		return d + ' ' + h;
	}
	if (hours) {
		return h + ' ' + m;
	}
	if (minutes) {
		return m + ' ' + s;
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