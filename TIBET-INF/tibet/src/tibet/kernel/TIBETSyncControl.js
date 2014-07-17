//  ========================================================================
/*
NAME:   TIBETSyncControl.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

/**
 * @type {TP.core.SyncAsync}
 * @synopsis An abstract type designed to be mixed in to other types which
 *     require support for synchronous and asynchronous mode control. Examples
 *     are TP.core.Resource and TP.core.URI and their subtypes.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:SyncAsync');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation.
TP.core.SyncAsync.isAbstract(true);

//  ------------------------------------------------------------------------

//  resources can handle requests either synchronously or asynchronously, or
//  both depending on the nature of the resource.
TP.core.SyncAsync.Type.defineConstant('SYNCHRONOUS', 0);
TP.core.SyncAsync.Type.defineConstant('ASYNCHRONOUS', 1);
TP.core.SyncAsync.Type.defineConstant('DUAL_MODE', 2);

//  keep a list of valid processing modes for validation checks
TP.core.SyncAsync.Type.defineConstant('MODES',
        TP.ac(
            TP.core.SyncAsync.SYNCHRONOUS,
            TP.core.SyncAsync.ASYNCHRONOUS,
            TP.core.SyncAsync.DUAL_MODE));

//  what modes does this service support? presumably we can do either in
//  most cases, but this is often overridden by non-HTTP resource types.
TP.core.SyncAsync.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.DUAL_MODE);

//  what mode is the default mode for this service? we default to async
//  since that's the typical way of communicating with users and servers
TP.core.SyncAsync.Type.defineAttribute('mode', TP.core.SyncAsync.ASYNCHRONOUS);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.SyncAsync.Type.defineMethod('isAsyncOnly',
function() {

    /**
     * @name isAsyncOnly
     * @synopsis Returns true if the receiver can't process synchronously.
     * @returns {Boolean} 
     */

    return this.$get('supportedModes') === TP.core.SyncAsync.ASYNCHRONOUS;
});

//  ------------------------------------------------------------------------

TP.core.SyncAsync.Type.defineMethod('isDualMode',
function() {

    /**
     * @name isSyncOnly
     * @synopsis Returns true if the receiver can process body synchronously and
     *     asynchronously.
     * @returns {Boolean} 
     */

    return this.$get('supportedModes') === TP.core.SyncAsync.DUAL_MODE;
});

//  ------------------------------------------------------------------------

TP.core.SyncAsync.Type.defineMethod('isSyncOnly',
function() {

    /**
     * @name isSyncOnly
     * @synopsis Returns true if the receiver can't process asynchronously.
     * @returns {Boolean} 
     */

    return this.$get('supportedModes') === TP.core.SyncAsync.SYNCHRONOUS;
});

//  ------------------------------------------------------------------------

TP.core.SyncAsync.Type.defineMethod('setMode',
function(aProcessMode) {

    /**
     * @name setMode
     * @synopsis Sets the default processing mode (sync or async) for the
     *     receiving type. The mode must be one of those supported for the type
     *     based on the value of supportedModes.
     * @param {String} aProcessMode A TP.core.SyncAsync constant.
     * @returns {TP.core.SyncAsync} The receiver.
     * @todo
     */

    var supported;

    //  validate mode against our list of 'approved' modes
    if (!TP.core.SyncAsync.MODES.containsString(aProcessMode)) {
        return this.raise('TP.sig.InvalidProcessMode', arguments);
    }

    //  if we're not dual mode then the mode better match the supported mode
    if ((supported = this.get('supportedModes')) !==
                                            TP.core.SyncAsync.DUAL_MODE) {
        if (aProcessMode !== supported) {
            return this.raise('TP.sig.InvalidProcessMode', arguments);
        }
    }

    return this.$set('mode', aProcessMode);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.SyncAsync.Inst.defineAttribute('mode');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.SyncAsync.Inst.defineMethod('getMode',
function() {

    /**
     * @name getMode
     * @synopsis Returns the current default processinng mode, sync or async,
     *     for the resource. If there is an instance value that is returned,
     *     otherwise any value specified for the type will be used.
     * @returns {Constant} A TP.core.Resource processing mode constant.
     * @todo
     */

    return TP.ifInvalid(this.$get('mode'), this.getType().get('mode'));
});

//  ------------------------------------------------------------------------

TP.core.SyncAsync.Inst.defineMethod('isSynchronous',
function() {

    /**
     * @name isSynchronous
     * @synopsis Returns true if the receiver can support synchronous operation.
     * @returns {Boolean} 
     */

    return !this.getType().isAsyncOnly();
});

//  ------------------------------------------------------------------------

TP.core.SyncAsync.Inst.defineMethod('rewriteRequestMode',
function(aRequest) {

    /**
     * @name rewriteRequestMode
     * @synopsis Returns the request mode which should be used for the request.
     *     In most cases this is the value provided in the request by in some
     *     cases it's possible to have an exception thrown when the request
     *     specifies a mode that the service can't support (for example asking
     *     an async-only service to process a synchronous request.
     * @param {TP.sig.Request} aRequest The request to rewrite.
     * @raises TP.sig.InvalidProcessMode
     * @returns {Boolean} True for asynchronous (for use in the 'async'
     *     parameter).
     */

    var mode,
        async,
        uri,
        refresh;

    async = TP.ifKeyInvalid(aRequest, 'async', null);
    refresh = TP.ifKeyInvalid(aRequest, 'refresh', null);
    uri = TP.ifKeyInvalid(aRequest, 'uri', TP.str(TP.uri(this)));

    if (TP.notValid(async)) {
        //  One special case is that when a resource isn't being refreshed
        //  we'll be reading from the cache which can be synchronous even
        //  when the resource is inherently async. This can make things a
        //  lot cleaner for certain operations that are checking the cache.
        if (!refresh) {
            return false;
        }

        mode = this.getMode();
        switch (mode) {
            case TP.core.SyncAsync.SYNCHRONOUS:
                async = false;
                break;
            case TP.core.SyncAsync.ASYNCHRONOUS:
                async = true;
                break;
            default:
                async = false;
                break;
        }
    }

    if (this.getType().isDualMode()) {
        return async;
    }

    if (async && this.getType().isSyncOnly()) {
        TP.ifWarn() ?
            TP.warn('Overriding async request for sync-only URI: ' + uri,
                    TP.LOG,
                    arguments) : 0;

        async = false;
    }

    if (!async && this.getType().isAsyncOnly()) {
        //  One special case is that when a resource isn't being refreshed
        //  we'll be reading from the cache which can be synchronous even
        //  when the resource is inherently async. This can make things a
        //  lot cleaner for certain operations that are checking the cache.
        if (!refresh) {
            return false;
        }

        TP.ifWarn() ?
            TP.warn('Overriding sync request for async-only URI: ' + uri,
                    TP.LOG,
                    arguments) : 0;

        async = true;
    }

    return async;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
