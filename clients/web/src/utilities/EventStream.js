import _ from 'underscore';
import Backbone from 'backbone';

import { apiRoot } from 'girder/rest';

/**
 * The EventStream type wraps window.EventSource to listen to the unified
 * per-user event channel endpoint using the SSE protocol. When events are
 * received on the SSE channel, this triggers a Backbone event of the form
 * 'g:event.<type>' where <type> is the value of the event type field.
 * Listeners can bind to specific event types on the channel.
 */
function EventStream(settings) {
    var defaults = {
        timeout: null,
        streamPath: '/notification/stream'
    };

    this.settings = _.extend(defaults, settings);

    return _.extend(this, Backbone.Events);
}

var prototype = EventStream.prototype;

/*
 * This method is used to kill the event stream socket when the girder tab is not
 * visible using window.requestAnimationFrame. It creates a dead man switch to
 * close the frame after 5 seconds if requestAnimationFrame is not called in that time.
 */
prototype._heartbeat = function () {
    if (!this._stopHeartbeat) {
        window.requestAnimationFrame(() => { this._heartbeat(); });
    }

    if (this._eventSource) {
        window.clearTimeout(this._closeTimeout);
        this._closeTimeout = window.setTimeout(() => {
            this._eventSource.close();
            this._eventSource = null;
        }, 5000);
    } else {
        this.open();
    }
};

prototype.open = function () {
    if (window.EventSource) {
        var stream = this,
            url = apiRoot + this.settings.streamPath;

        if (this.settings.timeout) {
            url += '?timeout=' + this.settings.timeout;
        }

        this._eventSource = new window.EventSource(url);

        this._eventSource.onmessage = function (e) {
            var obj;
            try {
                obj = window.JSON.parse(e.data);
            } catch (err) {
                console.error('Invalid JSON from SSE stream: ' + e.data + ',' + err);
                stream.trigger('g:error', e);
                return;
            }
            stream.trigger('g:event.' + obj.type, obj);
        };
        this._stopHeartbeat = false;
        this._heartbeat();
    } else {
        console.error('EventSource is not supported on this platform.');
    }
};

prototype.close = function () {
    this._stopHeartbeat = true;
    if (this._eventSource) {
        this._eventSource.close();
        this._eventSource = null;
    }
};

var eventStream = new EventStream();

export default eventStream;
