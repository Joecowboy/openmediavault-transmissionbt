<?php
/**
 * This file is part of OpenMediaVault.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @author    Marcel Beck <marcel.beck@mbeck.org>
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
require_once("openmediavault/object.inc");
require_once("openmediavault/error.inc");
require_once("openmediavault/util.inc");
require_once("openmediavault/rpc.inc");
require_once("openmediavault/notify.inc");

class TransmissionBTRpc extends OMVRpc {
	public function __construct() {
		$this->methodSchemata = array(
			"setSettings" => array('{
				"type":"object",
				"properties":{
					"enable":{"type":"boolean"},
					"sharedfolderref":{'.$GLOBALS['OMV_JSONSCHEMA_UUID_NONE'].'},
					"pexenabled":{"type":"boolean"},
					"dhtenabled":{"type":"boolean"},
					"encryption":{"type":"integer","enum":[0,1,2]},
					"rpcenabled":{"type":"boolean"},
					"rpcport":{"type":"integer","minimum":1024,"maximum":65535},
					"rpcauthenticationrequired":{"type":"boolean"},
					"rpcusername":{"type":"string"},
					"rpcpassword":{"type":"string"},
					"blocklistenabled":{"type":"boolean"},
					"blocklistsyncenabled":{"type":"boolean"},
					"blocklistsyncfrequency":{"type":"string","enum":'.'["hourly","daily","weekly","monthly"]},
					"blocklisturl":{"type":"string"}
				}
			}'),
			"setLocationsAndFiles" => array('{
				"type":"object",
				"properties":{
					"download-dir":{"type":"string"},
					"incomplete-dir":{"type":"string"},
					"incomplete-dir-enabled":{"type":"boolean"},
					"watch-dir":{"type":"string"},
					"watch-dir-enabled":{"type":"boolean"},
					
					"preallocation":{"type":"integer","enum":[0,1,2]},
					"rename-partial-files":{"type":"boolean"},
					"start-added-torrents":{"type":"boolean"},
					"trash-original-torrent-files":{"type":"boolean"}
				}
			}'),
			"setBandwidth" => array('{
				"type":"object",
				"properties":{
					"speed-limit-down":{"type":"integer"},
					"speed-limit-down-enabled":{"type":"boolean"},
					"speed-limit-up":{"type":"integer"},
					"speed-limit-up-enabled":{"type":"boolean"},
					"upload-slots-per-torrent":{"type":"integer"},
					
					"alt-speed-enabled":{"type":"boolean"},
					"alt-speed-up":{"type":"integer"},
					"alt-speed-down":{"type":"integer"}
				}
			}'),
			"setQueuing" => array('{
				"type":"object",
				"properties":{
					"queue-stalled-enabled":{"type":"boolean"},
					"queue-stalled-minutes":{"type":"integer"},
					
					"download-queue-enabled":{"type":"boolean"},
					"download-queue-size":{"type":"integer"},
					
					"seed-queue-enabled":{"type":"boolean"},
					"seed-queue-size":{"type":"integer"}
				}
			}'),
			"setPeer" => array('{
				"type":"object",
				"properties":{
					"bind-address-ipv4":{"type":"string"},
					"bind-address-ipv6":{"type":"string"},
					"peer-limit-global":{"type":"integer"},
					"peer-limit-per-torrent":{"type":"integer"},
					"peer-socket-tos":{"type":"string","enum":'.'["default","lowcost","throughput","lowdelay","reliability"]},
					
					"peer-port":{"type":"integer","minimum":1024,"maximum":65535},
					"peer-port-random-high":{"type":"integer","minimum":1024,"maximum":65535},
					"peer-port-random-low":{"type":"integer","minimum":1024,"maximum":65535},
					"peer-port-random-on-start":{"type":"boolean"}
					"port-forwarding-enabled":{"type":"boolean"}
				}
			}')
		);
	}

	/**
	 * Get configuration object.
	 */
	function getSettings() {
		global $xmlConfig;
		// Check permissions
		$this->validateSession();
		if (!$this->hasRole(OMV_ROLE_ADMINISTRATOR)) {
			throw new OMVException(OMVErrorMsg::E_RPC_SERVICE_INVALID_PERMISSION);
		}
		$this->commitSession();
		// Get configuration object
		$xpath = "//services/transmissionbt";
		$object = $xmlConfig->get($xpath);
		if (is_null($object)) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Modify result data
		$object['enable'] = boolval($object['enable']);
		$object['pexenabled'] = boolval($object['pexenabled']);
		$object['dhtenabled'] = boolval($object['dhtenabled']);
		$object['encryption'] = intval($object['encryption']);
		$object['rpcenabled'] = boolval($object['rpcenabled']);
		$object['rpcport'] = intval($object['rpcport']);
		$object['rpcauthenticationrequired'] = boolval($object['rpcauthenticationrequired']);
		$object['blocklistenabled'] = boolval($object['blocklistenabled']);
		$object['blocklistsyncenabled'] = boolval($object['blocklistsyncenabled']);
		return $object;
	}

	/**
	 * Set configuration object.
	 */
	function setSettings($data) {
//		$this->debug(var_export(func_get_args(), TRUE));
		global $xmlConfig;
		// Check permissions
		$this->validateSession();
		if (!$this->hasRole(OMV_ROLE_ADMINISTRATOR)) {
			throw new OMVException(OMVErrorMsg::E_RPC_SERVICE_INVALID_PERMISSION);
		}
		$this->commitSession();
		// Validate method parameters
		$this->validateParams(__METHOD__, func_get_args());
		
		// Get existing configuration object
		$xpath = "//services/transmissionbt";
		$oldObject = $xmlConfig->get($xpath);
		if (is_null($oldObject)) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		
		// Prepare configuration data
		$object = array(
			"enable" => array_boolval($data, 'enable'),
			"sharedfolderref" => $data['sharedfolderref'],
			"pexenabled" => array_boolval($data, 'pexenabled'),
			"dhtenabled" => array_boolval($data, 'dhtenabled'),
			"encryption" => $data['encryption'],
			"rpcenabled" => array_boolval($data, 'rpcenabled'),
			"rpcport" => $data['rpcport'],
			"rpcauthenticationrequired" => array_boolval($data,'rpcauthenticationrequired'),
			"rpcusername" => $data['rpcusername'],
			"rpcpassword" => $data['rpcpassword'],
			"blocklistenabled" => array_boolval($data, 'blocklistenabled'),
			"blocklistsyncenabled" => array_boolval($data,'blocklistsyncenabled'),
			"blocklistsyncfrequency" => $data['blocklistsyncfrequency'],
			"blocklisturl" => $data['blocklisturl'],
			"modules" => isset($oldObject['modules']) ?
			  $oldObject['modules'] : array()
		);
		// Set configuration object		
		if (FALSE === $xmlConfig->replace($xpath, $object)) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
		}
		// Save configuration
		if (FALSE === $xmlConfig->save()) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_SAVE_FAILED,
			  $xmlConfig->getError());
		}
		// Notify configuration changes
		$dispatcher = &OMVNotifyDispatcher::getInstance();
		$dispatcher->notify(OMV_NOTIFY_MODIFY,
		  "org.openmediavault.services.transmissionbt", $object);
	}
	
	/**
	 * Get configuration object.
	 */
	function getLocationsAndFiles() {
		global $xmlConfig;
		// Check permissions
		$this->validateSession();
		if (!$this->hasRole(OMV_ROLE_ADMINISTRATOR)) {
			throw new OMVException(OMVErrorMsg::E_RPC_SERVICE_INVALID_PERMISSION);
		}
		$this->commitSession();
		// Get configuration object
		$xpath = "//services/transmissionbt/modules/locationsandfiles";
		$object = $xmlConfig->get($xpath);
		if (is_null($object)) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Modify result data
		// Locations
		$object['incomplete-dir-enabled'] = boolval($object['incomplete-dir-enabled']);
		$object['watch-dir-enabled'] = boolval($object['watch-dir-enabled']);
		
		// Files
		$object['preallocation'] = intval($object['preallocation']);
		$object['rename-partial-files'] = boolval($object['rename-partial-files']);
		$object['start-added-torrents'] = boolval($object['start-added-torrents']);
		$object['trash-original-torrent-files'] = boolval($object['trash-original-torrent-files']);
		
		return $object;
	}

	/**
	 * Set configuration object.
	 */
	function setLocationsAndFiles($data) {
//		$this->debug(var_export(func_get_args(), TRUE));
		global $xmlConfig;
		// Check permissions
		$this->validateSession();
		if (!$this->hasRole(OMV_ROLE_ADMINISTRATOR)) {
			throw new OMVException(OMVErrorMsg::E_RPC_SERVICE_INVALID_PERMISSION);
		}
		$this->commitSession();
		// Validate method parameters
		$this->validateParams(__METHOD__, func_get_args());
		// Prepare configuration data
		$object = array(
			// Locations
			"download-dir" => $data['download-dir'],
			"incomplete-dir" => $data['incomplete-dir'],
			"incomplete-dir-enabled" => $data['incomplete-dir-enabled'],
			"watch-dir" => $data['watch-dir'],
			"watch-dir-enabled" => $data['watch-dir-enabled'],
			
			// Files
			"preallocation" => $data['preallocation'],
			"rename-partial-files" => array_boolval($data, 'rename-partial-files'),
			"start-added-torrents" => array_boolval($data, 'start-added-torrents'),
			"trash-original-torrent-files" => array_boolval($data, 'trash-original-torrent-files'),
		);
		// Set configuration object
		$xpath = "//services/transmissionbt/modules/locationsandfiles";
		if (FALSE === $xmlConfig->replace($xpath, $object)) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
		}
		// Save configuration
		if (FALSE === $xmlConfig->save()) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_SAVE_FAILED,
			  $xmlConfig->getError());
		}
		// Notify configuration changes
		$dispatcher = &OMVNotifyDispatcher::getInstance();
		$dispatcher->notify(OMV_NOTIFY_MODIFY,
		  "org.openmediavault.services.transmissionbt", $object);
	}
	
	/**
	 * Get configuration object.
	 */
	function getBandwidth() {
		global $xmlConfig;
		// Check permissions
		$this->validateSession();
		if (!$this->hasRole(OMV_ROLE_ADMINISTRATOR)) {
			throw new OMVException(OMVErrorMsg::E_RPC_SERVICE_INVALID_PERMISSION);
		}
		$this->commitSession();
		// Get configuration object
		$xpath = "//services/transmissionbt/modules/bandwidth";
		$object = $xmlConfig->get($xpath);
		if (is_null($object)) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Modify result data
		// Speed
		$object['speed-limit-down-enabled'] = boolval($object['speed-limit-down-enabled']);
		$object['speed-limit-up-enabled'] = boolval($object['speed-limit-up-enabled']);
		
		// Turtle Mode
		$object['alt-speed-enabled'] = boolval($object['alt-speed-enabled']);
		
		return $object;
	}

	/**
	 * Set configuration object.
	 */
	function setBandwidth($data) {
//		$this->debug(var_export(func_get_args(), TRUE));
		global $xmlConfig;
		// Check permissions
		$this->validateSession();
		if (!$this->hasRole(OMV_ROLE_ADMINISTRATOR)) {
			throw new OMVException(OMVErrorMsg::E_RPC_SERVICE_INVALID_PERMISSION);
		}
		$this->commitSession();
		// Validate method parameters
		$this->validateParams(__METHOD__, func_get_args());
		// Prepare configuration data
		$object = array(
			// Speed
			"speed-limit-down" => $data['speed-limit-down'],
			"speed-limit-down-enabled" => array_boolval($data, 'speed-limit-down-enabled'),
			"speed-limit-up" => $data['speed-limit-up'],
			"speed-limit-up-enabled" => array_boolval($data, 'speed-limit-up-enabled'),
			"upload-slots-per-torrent" => $data['upload-slots-per-torrent'],
			
			// Turtle Mode
			"alt-speed-enabled" => array_boolval($data, 'alt-speed-enabled'),
			"alt-speed-up" => $data['alt-speed-up'],
			"alt-speed-down" => $data['alt-speed-down'],
		);
		// Set configuration object
		$xpath = "//services/transmissionbt/modules/bandwidth";
		if (FALSE === $xmlConfig->replace($xpath, $object)) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
		}
		// Save configuration
		if (FALSE === $xmlConfig->save()) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_SAVE_FAILED,
			  $xmlConfig->getError());
		}
		// Notify configuration changes
		$dispatcher = &OMVNotifyDispatcher::getInstance();
		$dispatcher->notify(OMV_NOTIFY_MODIFY,
		  "org.openmediavault.services.transmissionbt", $object);
	}
	
	/**
	 * Get configuration object.
	 */
	function getQueuing() {
		global $xmlConfig;
		// Check permissions
		$this->validateSession();
		if (!$this->hasRole(OMV_ROLE_ADMINISTRATOR)) {
			throw new OMVException(OMVErrorMsg::E_RPC_SERVICE_INVALID_PERMISSION);
		}
		$this->commitSession();
		// Get configuration object
		$xpath = "//services/transmissionbt/modules/queuing";
		$object = $xmlConfig->get($xpath);
		if (is_null($object)) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Modify result data
		// General
		$object['queue-stalled-enabled'] = boolval($object['queue-stalled-enabled']);
		
		// Download
		$object['download-queue-enabled'] = boolval($object['download-queue-enabled']);
		
		// Seed
		$object['seed-queue-enabled'] = boolval($object['seed-queue-enabled']);
		
		return $object;
	}

	/**
	 * Set configuration object.
	 */
	function setQueuing($data) {
//		$this->debug(var_export(func_get_args(), TRUE));
		global $xmlConfig;
		// Check permissions
		$this->validateSession();
		if (!$this->hasRole(OMV_ROLE_ADMINISTRATOR)) {
			throw new OMVException(OMVErrorMsg::E_RPC_SERVICE_INVALID_PERMISSION);
		}
		$this->commitSession();
		// Validate method parameters
		$this->validateParams(__METHOD__, func_get_args());
		// Prepare configuration data
		$object = array(
			// General
			"queue-stalled-enabled" => array_boolval($data, 'queue-stalled-enabled'),
			"queue-stalled-minutes" => $data['queue-stalled-minutes'],
			
			// Download
			"download-queue-enabled" => array_boolval($data, 'download-queue-enabled'),
			"download-queue-size" => $data['download-queue-size'],
			
			// Seed
			"seed-queue-enabled" => array_boolval($data, 'seed-queue-enabled'),
			"seed-queue-size" => $data['seed-queue-size'],
		);
		// Set configuration object
		$xpath = "//services/transmissionbt/modules/queuing";
		if (FALSE === $xmlConfig->replace($xpath, $object)) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
		}
		// Save configuration
		if (FALSE === $xmlConfig->save()) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_SAVE_FAILED,
			  $xmlConfig->getError());
		}
		// Notify configuration changes
		$dispatcher = &OMVNotifyDispatcher::getInstance();
		$dispatcher->notify(OMV_NOTIFY_MODIFY,
		  "org.openmediavault.services.transmissionbt", $object);
	}
	
	/**
	 * Get configuration object.
	 */
	function getPeer() {
		global $xmlConfig;
		// Check permissions
		$this->validateSession();
		if (!$this->hasRole(OMV_ROLE_ADMINISTRATOR)) {
			throw new OMVException(OMVErrorMsg::E_RPC_SERVICE_INVALID_PERMISSION);
		}
		$this->commitSession();
		// Get configuration object
		$xpath = "//services/transmissionbt/modules/peer";
		$object = $xmlConfig->get($xpath);
		if (is_null($object)) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		// Modify result data
		// Peer Ports
		$object['peer-port-random-on-start'] = boolval($object['peer-port-random-on-start']);
		$object['port-forwarding-enabled'] = boolval($object['port-forwarding-enabled']);
		
		return $object;
	}

	/**
	 * Set configuration object.
	 */
	function setPeer($data) {
//		$this->debug(var_export(func_get_args(), TRUE));
		global $xmlConfig;
		// Check permissions
		$this->validateSession();
		if (!$this->hasRole(OMV_ROLE_ADMINISTRATOR)) {
			throw new OMVException(OMVErrorMsg::E_RPC_SERVICE_INVALID_PERMISSION);
		}
		$this->commitSession();
		// Validate method parameters
		$this->validateParams(__METHOD__, func_get_args());
		// Prepare configuration data
		$object = array(
			// Peers
			// Bindings
			"bind-address-ipv4" => $data['bind-address-ipv4'],
			"bind-address-ipv6" => $data['bind-address-ipv6'],
			
			// Limits
			"peer-limit-global" => $data['peer-limit-global'],
			"peer-limit-per-torrent" => $data['peer-limit-per-torrent'],
			"peer-socket-tos" => $data['peer-socket-tos'],
			
			// Peer Ports
			"peer-port" => $data['peer-port'],
			"peer-port-random-high" => $data['peer-port-random-high'],
			"peer-port-random-low" => $data['peer-port-random-low'],
			"peer-port-random-on-start" => array_boolval($data, 'peer-port-random-on-start'),
			"port-forwarding-enabled" => array_boolval($data, 'port-forwarding-enabled'),
		);
		// Set configuration object
		$xpath = "//services/transmissionbt/modules/peer";
		if (FALSE === $xmlConfig->replace($xpath, $object)) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
		}
		// Save configuration
		if (FALSE === $xmlConfig->save()) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_SAVE_FAILED,
			  $xmlConfig->getError());
		}
		// Notify configuration changes
		$dispatcher = &OMVNotifyDispatcher::getInstance();
		$dispatcher->notify(OMV_NOTIFY_MODIFY,
		  "org.openmediavault.services.transmissionbt", $object);
	}
}
?>
