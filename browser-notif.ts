/**
*  BrowserNotif.JS
*  (c) 2016 Ipan Ardian
*
*  Lets a web page send notifications that are displayed outside the page at the system level. 
*  This lets web apps send information to a user even if the application is idle, in the background, switched tabs or moved to a different app.
*  For details, see the web site: https://github.com/ipanardian/browser-notif
*  The MIT License
*/

/// <reference path='notification.d.ts' />

'use strict';

/**
 * Interface for BrowserNotif configuration
 * 
 * dir?: NotificationDirection;
 * lang?: string;
 * body?: string;
 * tag?: string;
 * image?: string;
 * icon?: string;
 * badge?: string;
 * sound?: string;
 * vibrate?: number | number[],
 * timestamp?: number,
 * renotify?: boolean;
 * silent?: boolean;
 * requireInteraction?: boolean;
 * data?: any;
 * actions?: NotificationAction[]
 * timeout?: number
 */
interface BrowserNotifConfig extends NotificationOptions {
    timeout?: number
}

/**
 * Interface for BrowserNotif
 */
interface BrowserNotifInterface {
    requestPermission(callback: (ev: string) => void): BrowserNotif
    notify(title: string, body: string, callback: (notif: Notification) => void): BrowserNotif
    click(callback: () => void): BrowserNotif
    close(): void
    error(callback: () => void): BrowserNotif
}

class BrowserNotif implements BrowserNotifInterface  
{
    /**
     * Title notification
     * @type {string}
     */
    protected title: string
    
    /**
     * Notification instance
     * @type {Notification}
     */
    protected notification: Notification
    
    /**
     * BrowserNotif configuration
     * @type {BrowserNotifConfig}
     */
    protected configs: BrowserNotifConfig = {}
    
    /**
     * Notification Options
     * @type {NotificationOptions}
     */
    protected options: NotificationOptions = {}
    
    /**
     * How long notification will appear in second. Set to 0 to make always visible
     * @type {number}
     */
    protected timeout: number = 0 
    
    /**
     * BrowserNotif constructor
     * @param  {BrowserNotifConfig} configs Optional config in object literal form
     */
    constructor (configs?: BrowserNotifConfig) {
        if (configs) {
            Object.assign(this.configs, configs)
        }
        
        this._setOptions(this.configs)
        
        if (configs.timeout) {
            this.timeout = configs.timeout
        }
        
        if (!BrowserNotif.isSupported()) {
            console.warn('This browser does not support system notifications');
        }
        
    }
    
    /**
     * Check is browser support for system notification
     * @return {boolean} 
     */
    public static isSupported(): boolean {
        if (!("Notification" in window)) {
            return false
        }
        return true
    }
    
    /**
     * Set notification options
     * @param {BrowserNotifConfig} configs
     */
    protected _setOptions(configs: BrowserNotifConfig): void {
        for (let config in configs) {
            if (['timeout'].indexOf(config) == -1) {
                this.options[config] = configs[config]
            }
        }
    }
    
    /**
     * Get request permission
     * @param  {string} callback 
     * @return {BrowserNotif}          
     */
    public requestPermission(callback: (permission: NotificationPermission) => void): BrowserNotif {
        Notification.requestPermission((permission: NotificationPermission) => {
            if (typeof callback === 'function') {
                callback.call(this, permission);
            }
        });
        return this;
    }
    
    /**
     * Trigger notify
     * @param  {string} title    
     * @param  {string} body     
     * @param  {Event}  callback 
     * @return {BrowserNotif}          
     */
    public notify(title: string, body: string, callback: (notif: Notification) => void): BrowserNotif {
        if (!BrowserNotif.isSupported()) {
            return this
        }
        
        this.title = title;
        this.options.body = body;
        if ("granted" === Notification.permission) {
            this._notify(callback);
        }
        else if ('denied' !== Notification.permission) {
            this.requestPermission(permission => {
                if ("granted" === permission) {
                    this._notify(callback);
                }
            });
        }
        else {
            console.warn('User denied the notification permission')
        }
        
        return this
    }
    
    /**
     * Create an instance of Notification API
     * @param  {Notification} callback
     * @return {[type]}
     */
    protected _notify(callback: (notif: Notification) => void): void {
        this.notification = new Notification(this.title, this.options)
        this._closeNotification()
        if (typeof callback === 'function') {
            callback.call(this, this.notification);
        }
    }
    
    /**
     * Close an instance of Notification automatically by given timeout
     */
    protected _closeNotification(): void {
        if (this.timeout > 0 && this.notification instanceof Notification) {
            setTimeout(this.notification.close.bind(this.notification), this.timeout * 1000);
        }
    }
    
    /**
     * Click event on Notification
     * @param  {}  callback
     * @return {BrowserNotif}
     */
    public click(callback: () => void): BrowserNotif {
        if (typeof callback === 'function' && this.notification instanceof Notification) {
            this.notification.onclick = () => {
                callback.call(this);
            }
        }
        return this
    }
    
    /**
     * Close an instance of Notification
     */
    public close(): void {
        if (this.notification instanceof Notification) {
            this.notification.close()
        }
    }
    
    /**
     * Error of Notification
     * @param  {}  callback
     * @return {BrowserNotif}
     */
    public error(callback: () => void): BrowserNotif {
        if (typeof callback === 'function' && this.notification instanceof Notification) {
            this.notification.onerror = () => {
                callback.call(this);
            }
        }
        return this
    }
}