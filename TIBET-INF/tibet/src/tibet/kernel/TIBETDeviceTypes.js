/*
//  ========================================================================
NAME:   TIBETDeviceTypes.js
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
//  ========================================================================

/**
 * @
 * @todo
 */

//  ========================================================================
//  TP.core.Device
//  ========================================================================

TP.core.SignalSource.defineSubtype('core:Device');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  the forwarding function used when we need to pass events to the main
//  notification center.
TP.core.Device.Type.defineConstant('REDIRECTOR',
    function(aSignal) {

        var normalizedEvent,
            targetElem;

        TP.debug('break.device_redirect');

        normalizedEvent = aSignal.getEvent();

        if (TP.isElement(targetElem =
                            TP.eventGetResolvedTarget(normalizedEvent))) {
            //  NOTE that device events are natively DOM events so we fire
            //  with a DOM_FIRING policy here
            aSignal.fire(TP.elementGetEventIds(targetElem),
                            normalizedEvent,
                            TP.DOM_FIRING);
        }
    });

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @name addObserver
     * @synopsis Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} anOrigin One or more origins to observe.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     * @todo
     */

    var signals,
        len,
        map,
        i,
        signal,
        count,
        handler,
        dict,
        arr;

    TP.debug('break.device_observe');

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    arguments,
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();

    //  if there's a policy or the origin is specific rather than the
    //  receiver's device name then we just want to set up a "redirect"
    //  handler that pushes the signal to the notification system where
    //  things like policy and origin targeting can be processed.
    if (TP.notEmpty(aPolicy) ||
        ((anOrigin !== this) && (anOrigin !== this.getName()))) {
        //  we have to track observe/ignore stats more closely when we set
        //  up redirections since each ignore says to remove the redirector,
        //  but we need to keep at least one as long as we've got more
        //  observes than we do ignores
        map = this.get('redirections');

        for (i = 0; i < len; i++) {
            signal = signals.at(i).getSignalName();
            count = map.at(signal);

            if (TP.isNumber(count) && count > 1) {
                //  increment the count
                map.atPut(signal, count + 1);
            } else {
                map.atPut(signal, 1);
            }
        }

        handler = this.REDIRECTOR;
    } else {
        handler = aHandler;
    }

    //  invalid handler, no response can happen
    if (TP.notValid(handler)) {
        this.raise('TP.sig.InvalidHandler', arguments);

        return false;
    }

    dict = this.get('observers');

    for (i = 0; i < len; i++) {
        signal = signals.at(i).getSignalName();

        //  Signal paths are signals with a '__' separation. We use a
        //  subtype specific method to process those. Keyboard shortcuts are
        //  the typically use of this syntax.
        if (/__/.test(signal)) {
            this.addShortcutObserver(signal, handler);
        } else {
            if (TP.notValid(arr = dict.at(signal))) {
                arr = TP.ac();
                dict.atPut(signal, arr);
            }

            arr.push(handler);

            //  unfortunately there's a bit of potential overhead here since
            //  we need to unique for each possible signal name in the list
            arr.unique();
        }
    }

    //  if the handler we registered was not the original one then we
    //  swapped it out for the redirector and we want the notification
    //  center to go ahead and register it.
    return (handler !== aHandler);
});

//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('addShortcutObserver',
function(aSignal, aHandler) {

    /**
     * @name addShortcutObserver
     * @synopsis Adds a local signal observation for a "signal path", which is
     *     effectively a "gesture". Keyboard shortcuts are the primary example
     *     of signal paths. The default implementation simply returns.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @todo
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('getDOMSignalName',
function(normalizedEvent) {

    /**
     * @name getDOMSignalName
     * @synopsis Returns the DOM signal name for a particular event.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {String} The key event DOM signal name.
     */

    return TP.DOM_SIGNAL_TYPE_MAP.at(TP.eventGetType(normalizedEvent));
});

//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('invokeObservers',
function(singletonName, normalizedEvent, aSignal) {

    /**
     * @name invokeObservers
     * @synopsis Runs the event handlers for any registered observers.
     * @description Each native event type has a singleton TIBET signal instance
     *     registered with the device type. This singleton is acquired, updated,
     *     and then passed to each handler for processing. The normalizedEvent
     *     becomes the payload/native event for the signal and is thereby
     *     available to each handler for use.
     * @param {String} singletonName The attribute name used to acquire a
     *     singleton signal instance for the invocation.
     * @param {Event} normalizedEvent A normalized (augmented) native event
     *     object conforming to a set of common and W3-compliant methods.
     * @param {TP.sig.Signal} aSignal Optional signal to use rather than the
     *     singleton/event pair.
     * @returns {TP.sig.Signal} The TIBET signal instance used during
     *     notification.
     * @todo
     */

    TP.override();

    return aSignal;
});

//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @name removeObserver
     * @synopsis Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Array} anOrigin One or more origins to ignore.
     * @param {Object|Array} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     * @todo
     */

    var signals,
        len,
        map,
        i,
        signal,
        count,
        handler,
        dict,
        arr;

    TP.debug('break.device_ignore');

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    arguments,
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();

    if (TP.notEmpty(aPolicy) ||
        ((anOrigin !== this) && (anOrigin !== this.getName()))) {
        map = this.get('redirections');

        for (i = 0; i < len; i++) {
            signal = signals.at(i).getSignalName();
            count = map.at(signal);

            if (TP.isNumber(count) && count > 1) {
                //  decrement the count
                map.atPut(signal, count - 1);
            } else {
                map.atPut(signal, 0);
            }
        }

        handler = this.REDIRECTOR;
    } else {
        handler = aHandler;
    }

    dict = this.get('observers');
    for (i = 0; i < len; i++) {
        signal = signals.at(i).getSignalName();

        //  Signal paths are signals with a '__' separation. We use a
        //  subtype specific method to process those. Keyboard shortcuts are
        //  the typically use of this syntax.
        if (/__/.test(signal)) {
            this.removeShortcutObserver(signal, handler);
        } else {
            if (TP.isArray(arr = dict.at(signal))) {
                //  NOTE: We use an *identical* compare here - otherwise,
                //  the system wanders all over trying to compute equality
                //  values for the handlers.
                arr.remove(handler, TP.IDENTITY);
            }
        }
    }

    //  If we've changed the handler to the redirector we need to make sure
    //  the notification center removes it as well.
    return (handler !== aHandler);
});

//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('removeShortcutObserver',
function(aSignal, aHandler) {

    /**
     * @name removeShortcutObserver
     * @synopsis Removes a local signal observation for a "signal path", which
     *     is effectively a "gesture". Keyboard shortcuts are the primary
     *     example of signal paths. The default implementation simply returns.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @todo
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.Device.Type.defineMethod('signalObservers',
function(anOrigin, aSignal, aContext, aPayload, aPolicy, aType,
isCancelable, isBubbling) {

    /**
     * @name signalObservers
     * @synopsis Signals a local signal observation which is roughly like a DOM
     *     element throwing an event. The observer is typically the handler
     *     provided to a signal() call while the signal is a signal or string
     *     which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object} anOrigin The originator of the signal.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Context} aContext The originating context.
     * @param {Object} aPayload Optional argument object.
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be constructed.
     *     Defaults to TP.sig.Signal.
     * @param {Boolean} isCancelable Optional flag for dynamic signals defining
     *     if they can be cancelled.
     * @param {Boolean} isBubbling Optional flag for dynamic signals defining
     *     whether they bubble (when using TP.DOM_FIRING).
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to signal the signal, false otherwise.
     * @todo
     */

    var signals,
        len,
        i,
        signame,
        signal,
        typename,
        type;

    TP.debug('break.device_signal');

    //  have to recast this into something we can pass to the invoke
    //  observers call, or we have to duplicate that logic when provided
    //  with a signal that somehow didn't originate from the lower-level
    //  device traps...perhaps it's a synthetic key/mouse event.

    if ((anOrigin !== this) && (anOrigin !== this.getName())) {
        return true;
    }

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    arguments,
                    'Improper signal definition.');

        return false;
    }

    len = signals.getSize();

    for (i = 0; i < len; i++) {
        signal = signals.at(i);
        if (!TP.isKindOf(signal, TP.sig.Signal)) {
            if (TP.regex.KEY_EVENT.test(signal)) {
                if (signal.indexOf('_Up') !== TP.NOT_FOUND) {
                    typename = 'TP.sig.DOMKeyUp';
                } else if (signal.indexOf('_Press') !== TP.NOT_FOUND) {
                    typename = 'TP.sig.DOMKeyPress';
                } else {
                    typename = 'TP.sig.DOMKeyDown';
                }
            } else {
                typename = signal;
            }

            //  might be a type if the signal is already real
            type = TP.isTypeName(typename) ?
                    TP.sys.getTypeByName(typename) :
                    TP.sys.require(typename);

            if (TP.notValid(type)) {
                this.raise('TP.sig.InvalidType',
                            arguments,
                            'Unable to find signal type: ' + typename);

                return false;
            }

            signame = signal;

            signal = type.construct(aPayload);
            if (TP.notValid(signal)) {
                this.raise(
                    'TP.sig.InvalidSignal',
                    arguments,
                    'Unable to construct signal instance: ' + signame);

                return false;
            }

            signal.setSignalName(signame);
        }

        this.invokeObservers(null, null, signal);
    }

    return false;
});

//  ========================================================================
//  TP.core.Keyboard
//  ========================================================================

TP.core.Device.defineSubtype('Keyboard');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  overall hash of observations made locally to a specific device
TP.core.Keyboard.Type.defineAttribute('observers', TP.hc());

//  map of signals which we've placed redirectors for
TP.core.Keyboard.Type.defineAttribute('redirections', TP.hc());

//  last event for each of down, press, and up events
TP.core.Keyboard.Type.defineAttribute('lastDown');
TP.core.Keyboard.Type.defineAttribute('lastPress');
TP.core.Keyboard.Type.defineAttribute('lastUp');

//  encached instances of prebuilt signals
TP.core.Keyboard.Type.defineAttribute('keyup');
TP.core.Keyboard.Type.defineAttribute('keydown');
TP.core.Keyboard.Type.defineAttribute('keypress');

//  container for a singleton TP.sig.DOMModifierKeyChange signal used for
//  notification of a change in one or more modifier keys
TP.core.Keyboard.Type.defineAttribute('modifierkeychange');

//  current state of the modifier keys (alt, ctrl, meta/command, and shift)
TP.core.Keyboard.Type.defineAttribute('altDown', false);
TP.core.Keyboard.Type.defineAttribute('ctrlDown', false);
TP.core.Keyboard.Type.defineAttribute('metaDown', false);
TP.core.Keyboard.Type.defineAttribute('shiftDown', false);

//  the current keyboard subtype the user has configured
TP.core.Keyboard.Type.defineAttribute('currentKeyboard');

//  the keyboard's XML map URI, whose contentNode is the actual map
TP.core.Keyboard.Type.defineAttribute('mapuri');

//  a common cache for the current keyboard's XML map
TP.core.Keyboard.Type.defineAttribute('mapxml');

//  a timer used in certain situations to wait for press before signaling
TP.core.Keyboard.Type.defineAttribute('downTimer');

//  a timer used when the keyboard is processing keyboard shortcuts.
TP.core.Keyboard.Type.defineAttribute('shortcutsTimer');

//  a map of keyboard shortcuts which have been observed via a__b syntax
TP.core.Keyboard.Type.defineAttribute('shortcuts', TP.hc());
TP.core.Keyboard.Type.defineAttribute('shortcutIndex', TP.core.Keyboard.shortcuts);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Performs one-time setup for the type on startup/import.
     */

    var name,
        type;

    //  construct a template instance for signals we care about
    this.$set('keyup',
        TP.sys.require('TP.sig.DOMKeyUp').construct(null, true));
    this.$set('keydown',
        TP.sys.require('TP.sig.DOMKeyDown').construct(null, true));
    this.$set('keypress',
        TP.sys.require('TP.sig.DOMKeyPress').construct(null, true));
    this.$set('modifierkeychange',
        TP.sys.require('TP.sig.DOMModifierKeyChange').construct(null,
                                                                true));

    //  load the current keyboard type and its associated keymap
    name = TP.ifInvalid(TP.sys.cfg('tibet.keyboard'),
                        'TP.core.USAscii101Keyboard');

    type = TP.sys.require(name) ||
            TP.sys.getTypeByName('TP.core.USAscii101Keyboard');

    if (TP.notValid(type)) {
        TP.ifError() ?
                TP.error('Unable to install keyboard type: ' + name,
                            TP.LOG, arguments) : 0;

        return;
    }

    //  configure the initial keyboard (and load the initial keymap)
    this.setCurrentKeyboard(type);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('addShortcutObserver',
function(aSignal, aHandler) {

    /**
     * @name addShortcutObserver
     * @synopsis Adds a local signal observation for a "signal path", which is
     *     effectively a "gesture".
     * @description Keyboard shortcuts are stored as a nested set of hashes
     *     where each hash contains the name of the overall shortcut signal, an
     *     optional hash of shortcuts which extend the current one, and an
     *     optional array of handler objects/functions (observers).
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @returns {Array} The handler array with the new observer added.
     * @todo
     */

    var shortcutData,
        handlers;

    shortcutData = this.getShortcutData(aSignal, true);
    if (TP.notValid(handlers = shortcutData.at('handlers'))) {
        handlers = TP.ac();
        shortcutData.atPut('handlers', handlers);
    }

    handlers.push(aHandler);
    handlers.unique();

    return handlers;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('getShortcutData',
function(aSignal, shouldBuild) {

    /**
     * @name getShortcutData
     * @synopsis Returns the hash used to store shortcut information for a
     *     specific signal path.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Boolean} shouldBuild
     * @returns {TP.lang.Hash} The shortcut data.
     * @todo
     */

    var shortcuts,

        path,
        name,
        parts,

        len,
        i,
        part,

        dict,
        subS;

    /*
        shortcuts = {
            a:
            {
                h = [...],
                s =
                {
                    b:
                    {
                        h = [...],
                        s =
                        {
                            c:
                            {
                                h = [...],
                                n = 'a__b__c'
                            }
                        }
                        n = 'a__b'
                    }
                }
                n = 'a'
            }
        }
    */

    shortcuts = this.get('shortcuts');

    path = '';
    name = aSignal.getSignalName();
    parts = name.split('__');

    len = parts.getSize();
    for (i = 0; i < len; i++) {
        part = parts.at(i);

        path = TP.isEmpty(path) ? part : path + '__' + part;
        dict = shortcuts.at(part);

        if (TP.notValid(dict)) {
            if (TP.notTrue(shouldBuild)) {
                return;
            }

            dict = TP.hc();
            subS = TP.hc();

            dict.atPut('shortcuts', subS);
            dict.atPut('name', path);
            dict.atPut('handlers', TP.ac());

            shortcuts.atPut(part, dict);
        }

        shortcuts = dict.at('shortcuts');
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('loadKeymap',
function() {

    /**
     * @name loadKeymap
     * @synopsis Loads the XML keyboard map for the receiving keyboard type.
     * @raise TP.sig.InvalidKeymap When the XML keyboard map file can't be
     *     loaded.
     * @todo
     */

    var req,

        fname,
        path,

        url,
        xml;

    req = TP.hc('async', false);

    //  Note that we expand the paths here first before creating a URI. In
    //  this way, all of the 'metadata' URIs are uniformly concrete URIs
    //  instead of TIBET URIs.

    //  the local file name is the type name
    fname = this.getName();

    //  look for a config parameter mapping the keyboard away from ~lib_dat
    path = TP.sys.cfg(fname + '.xml');
    if (!path) {
      path = TP.uriExpandPath('~lib_dat/' + fname + '.xml');
    }

    url = TP.uc(path);
    if (TP.notValid(xml = url.getNativeNode(req))) {
      return this.raise('TP.sig.InvalidKeymap', arguments);
    }

    this.$set('mapuri', url);

    //  cache the XML for speed in other lookups
    TP.core.Keyboard.$set('mapxml', xml);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('getCurrentKeyboard',
function() {

    /**
     * @name getCurrentKeyboard
     * @synopsis Returns the currently active keyboard instance used to perform
     *     all key-event related lookups and processing.
     * @returns {TP.core.Keyboard} The current keyboard instance.
     */

    return TP.core.Keyboard.$get('currentKeyboard');
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('get',
function(attributeName) {

    /**
     * @name get
     * @synopsis Returns the value for attributeName. TP.core.Keyboard subtypes
     *     look first on themselves and then look to the root TP.core.Keyboard
     *     type for responses to this method.
     * @param {String} attributeName The attribute name to look up.
     * @returns {Object} The attribute value.
     */

    var value;

    //  look locally first using the standard lookup mechanisms (note that
    //  we do *not* callNextMethod) here because of performance reasons.
    value = this.$get(attributeName);

    //  check the root TP.core.Keyboard type in case it's a 'shared'
    //  variable
    if (TP.notValid(value) && (this !== TP.core.Keyboard)) {
        value = TP.core.Keyboard.get(attributeName);
    }

    return value;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('invokeObservers',
function(singletonName, normalizedEvent, aSignal) {

    /**
     * @name invokeObservers
     * @synopsis Runs the event handlers for any registered observers.
     * @description Each native event type has a singleton TIBET signal instance
     *     registered with the device type. This singleton is acquired, updated,
     *     and then passed to each handler for processing. The normalizedEvent
     *     becomes the payload/native event for the signal and is thereby
     *     available to each handler for use.
     * @param {String} singletonName The attribute name used to acquire a
     *     singleton signal instance for the invocation.
     * @param {Event} normalizedEvent A normalized (augmented) native event
     *     object conforming to a set of common and W3-compliant methods.
     * @param {TP.sig.Signal} aSignal Optional signal to use rather than the
     *     singleton/event pair.
     * @returns {TP.sig.Signal} The signal that was actually triggered.
     * @todo
     */

    var targetElem,

        fname,
        elemType,

        signal,
        redirector,

        dict,

        signames,
        len,
        i,

        logInfo,

        handlers,

        handlersLen,
        j,

        handler,
        signame,

        matchedShortcutSegment,
        shortcutData,
        shortcutName,
        shortcutSig,
        shortcuts,
        
        shouldClearTimer,
        timer;

    if (!TP.sys.hasInitialized()) {
        return;
    }

    if (TP.isElement(targetElem =
                        TP.eventGetResolvedTarget(normalizedEvent))) {
        fname = 'handlePeer' + TP.escapeTypeName(
                                TP.DOM_SIGNAL_TYPE_MAP.at(
                                        TP.eventGetType(normalizedEvent)));

        elemType = TP.wrap(targetElem).getType();

        //  Message the type for the element that is 'responsible' for
        //  this event. It's native control sent this event and we need
        //  to let the type know about it.
        if (TP.canInvoke(elemType, fname)) {
            elemType[fname](targetElem, normalizedEvent);
        }

        //  If the native event was prevented, then we should just bail out
        //  here.
        //  NB: 'defaultPrevented' is a DOM Level 3 property, which seems to
        //  be well supported on TIBET's target browser environments.
        if (normalizedEvent.defaultPrevented === true) {
            return;
        }
    }

    //  when we're provided with a signal we don't need to build one.
    signal = aSignal;
    if (TP.notValid(signal)) {
        //  build up a true signal from our template instance
        if (TP.notValid(signal = this.get(singletonName))) {
            TP.ifWarn() ?
                TP.warn('Event singleton not found for: ' + singletonName,
                        TP.LOG,
                        arguments) : 0;
            return;
        }

        //  Make sure to recycle the signal instance to clear any previous
        //  state.
        signal.recycle();

        //  let the signal type manage updates on signal naming etc through
        //  the setEvent functions they can optionally implement.
        signal.setEvent(normalizedEvent);

        //  when we reuse singleton we need to initialize origin to target
        signal.set('origin', signal.get('target'));
    }

    //  capture the information we'll need to see about redirections
    redirector = this.REDIRECTOR;

    dict = this.get('observers');

    signames = signal.getSignalNames();

    matchedShortcutSegment = false;
    shouldClearTimer = false;

    len = signames.getSize();
    for (i = 0; i < len; i++) {

        signame = signames.at(i);

        //  Set the signal name to the currently processing signal name since
        //  key signals have a variety of signal names (virtual, Unicode, type
        //  names).
        signal.setSignalName(signame);

        if (TP.sys.shouldLogKeys() && /DOMKey/.test(signame)) {
            logInfo = TP.hc(
                'key: ', normalizedEvent.$$keyCode,
                'keyCode: ', TP.isValid(normalizedEvent.keyCode) ?
                                        normalizedEvent.keyCode : '',
                'charCode: ', TP.isValid(normalizedEvent.charCode) ?
                                        normalizedEvent.charCode : '',
                'unicode: ', TP.isValid(normalizedEvent.$unicodeCharCode) ?
                                        normalizedEvent.$unicodeCharCode : '',
                'which: ', TP.isValid(normalizedEvent.which) ?
                                        normalizedEvent.which : '',

                'shift: ', normalizedEvent.shiftKey,
                'alt: ', normalizedEvent.altKey,
                'ctrl: ', normalizedEvent.ctrlKey,
                'meta: ', normalizedEvent.metaKey,

                'keyname: ', this.getEventVirtualKey(normalizedEvent),
                'signame: ', signame,
                'special: ', TP.isValid(normalizedEvent.$special) ?
                                    normalizedEvent.$special : false
                );

            TP.sys.logKey(logInfo, null, arguments);
        }

        //  Look for keyboard shortcut. As we see each key signal we look in
        //  the current shortcut hash for that signal. If we find one we check
        //  for a non-hash value (indicating we're complete and the shortcut
        //  should fire) or another hash (indicating more keys to follow). A
        //  value of undefined means this isn't a keyboard shortcut sequence.
        if (TP.isValid(shortcutData = this.get('shortcutIndex').at(signame))) {
            /*
                shortcuts = {
                    a:
                    {
                        h = [...],
                        s =
                        {
                            b:
                            {
                                h = [...],
                                s =
                                {
                                    c:
                                    {
                                        h = [...],
                                        n = 'a__b__c'
                                    }
                                }
                                n = 'a__b'
                            }
                        }
                        n = 'a'
                    }
                }
            */

            //  Each shortcut ends in a hash with two optional keys, an array
            //  of handlers and a hash of child shortcuts. If we're at that end
            //  hash, that means we've 'satisfied' a sequence and it's time to
            //  fire it.
            if (TP.notEmpty(handlers = shortcutData.at('handlers'))) {

                shortcutName = shortcutData.at('name');
                handlersLen = handlers.getSize();

                if (handlersLen > 0) {
                    shortcutSig = signal.getType().construct(
                                                    signal.getPayload());
                    shortcutSig.setSignalName(shortcutName);
                    shortcutSig.setOrigin(signal.getOrigin());
                }

                for (j = 0; j < handlersLen; j++) {
                    if (shortcutSig.shouldStop()) {
                        break;
                    }

                    handler = handlers.at(j);

                    try {
                        TP.handle(handler, shortcutSig);
                    } catch (e) {
                        TP.raise(this, 'TP.sig.HandlerException',
                                    arguments, TP.ec(e));
                    }
                }

                shouldClearTimer = true;

                //  Reset to the top-most hash since we just fired a sequence
                this.set('shortcutIndex', this.get('shortcuts'));
            } else if (TP.notEmpty(shortcuts = shortcutData.at('shortcuts'))) {

                matchedShortcutSegment = true;

                TP.core.Keyboard.$set('shortcutsTimer',
                    setTimeout(
                        function() {

                            //  clear so press/up don't get confused and try to
                            //  process their timer-specific logic
                            TP.core.Keyboard.$set('shortcutsTimer', null);

                            //  Reset to the top-most hash because we couldn't
                            //  complete a shortcut in the allotted amount of
                            //  time.
                            this.set('shortcutIndex', this.get('shortcuts'));
                        }.bind(this),
                            TP.sys.cfg('keyboard.shortcut_cancel_delay')));

                //  If we're not at the end of the sequence migrate our hash
                //  reference "down" to the next level and mark the fact that we
                //  found a shortcut segment for this signal name.
                this.set('shortcutIndex', shortcuts);
            } else {
                shouldClearTimer = true;

                //  Reset to the top-most hash if we're at the end of a shortcut
                //  sequence (or didn't find one at all).
                this.set('shortcutIndex', this.get('shortcuts'));
            }
        } else if (i === len - 1 &&
                    /Up$/.test(signame) &&
                    this.get('shortcuts') !== this.get('shortcutIndex') &&
                    !matchedShortcutSegment) {

            //  If we didn't find shortcut data (but we were in the middle of
            //  trying to which means the current shortcut index is different
            //  that the overall shortcuts hash) and this is the last signal
            //  name we're processing and none of the other signal names found a
            //  shortcut segment, we reset to the 'top-level' hash. Note
            //  that we only reset to the top for Up events. Down and Press are
            //  ignored which avoids problems with modifier keys and
            //  intermediate events.

            //  if it's an up and it's a modifier-only, then don't reset
            if (/^(Shift|Alt|Ctrl)_Up/.test(normalizedEvent.$computedName)) {
                //  Reset to the top-most hash if we're at the end of a shortcut
                continue;
            }

            shouldClearTimer = true;

            this.set('shortcutIndex', this.get('shortcuts'));
        }

        if (shouldClearTimer) {
            //  We found handlers at the current shortcut level - cancel the
            //  'reset shortcuts timer'
            if (TP.isNumber(timer = TP.core.Keyboard.$get('shortcutsTimer'))) {
                clearTimeout(timer);
                TP.core.Keyboard.$set('shortcutsTimer', null);
            }
        }

        //  Process the handlers registered under the signal name.
        if (TP.notEmpty(handlers = dict.at(signame))) {
            handlersLen = handlers.getSize();
            for (j = 0; j < handlersLen; j++) {
                if (signal.shouldStop()) {
                    break;
                }

                handler = handlers.at(j);

                //  when we're using the redirector as the handler we need to
                //  push the original origin back into place, otherwise we set
                //  it to the receiver (since observe is for the device).
                if (handler !== redirector) {
                    signal.set('origin', this);
                }

                try {
                    TP.handle(handler, signal);
                } catch (e) {
                    TP.raise(this, 'TP.sig.HandlerException',
                                arguments, TP.ec(e));
                }
            }
        }
    }

    return signal;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('removeShortcutObserver',
function(aSignal, aHandler) {

    /**
     * @name removeShortcutObserver
     * @synopsis Removes a local signal observation for a "signal path", which
     *     is effectively a "gesture". Keyboard shortcuts are the primary
     *     example of signal paths.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @returns {Number} The number of handler's that were removed.
     */

    var sd,
        handlers;

    sd = this.getShortcutData(aSignal);
    if (TP.notValid(sd) || TP.notValid(handlers = sd.at('handlers'))) {
        return;
    }

    return handlers.remove(aHandler, TP.IDENTITY);
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('setCurrentKeyboard',
function(aKeyboard) {

    /**
     * @name setCurrentKeyboard
     * @synopsis Defines the currently active keyboard instance used to perform
     *     all key-event related lookups and processing.
     * @param {TP.core.Keyboard} aKeyboard The keyboard instance to use for all
     *     key-event related processing.
     * @returns {TP.core.Keyboard} The current keyboard instance.
     */

    TP.core.Keyboard.$set('currentKeyboard', aKeyboard);

    //  force the new keyboard's map to become the one we cache etc.
    aKeyboard.loadKeymap();

    return TP.core.Keyboard.$get('currentKeyboard');
});

//  ------------------------------------------------------------------------
//  EVENT HANDLING
//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('$$handleKeyEvent',
function(nativeEvent) {

    /**
     * @name $$handleKeyEvent
     * @synopsis Responds to notification of a native keyboard event. This is
     *     the primary entry point for all keyboard event handling.
     * @param {Event} nativeEvent The native event.
     */

    var ev,
        lastEvent,
        lastEventName,
        timer;

    if (!TP.sys.hasInitialized()) {
        return;
    }

    //  Don't come through this handler twice for the same Event
    if (nativeEvent.$captured) {
        return;
    }
    nativeEvent.$captured = true;

    //  normalize the event
    ev = TP.event(nativeEvent);

    switch (TP.eventGetType(ev)) {
        case 'keydown':

            //  suppress dups for IE...we manage repeat differently
            if (TP.boot.isUA('IE')) {
                lastEvent = TP.core.Keyboard.get('lastDown');
                if (TP.isEvent(lastEvent) &&
                    TP.eventIsDuplicate(lastEvent, ev)) {
                    return;
                }
            }

            //  Clear all history to avoid confusion in state.
            TP.core.Keyboard.$set('lastPress', null);
            TP.core.Keyboard.$set('lastUp', null);

            //  Capture the event into a variable that will keep a reference
            //  to the last time this event happened. This is used in a
            //  variety of ways in the $$handle* calls, and both the event
            //  and the slot may be altered during the course of that call.
            lastEventName = 'lastDown';
            TP.core.Keyboard.$set(lastEventName, ev);

            if (TP.isNumber(timer = TP.core.Keyboard.$get('downTimer'))) {
                clearTimeout(timer);
                TP.core.Keyboard.$set('downTimer', null);
            }

            TP.core.Keyboard.getCurrentKeyboard().$$handleKeyDown(ev);

            break;

        case 'keypress':

            //  suppress dups for IE...we manage repeat differently
            if (TP.boot.isUA('IE')) {
                lastEvent = TP.core.Keyboard.get('lastPress');
                if (TP.isEvent(lastEvent) &&
                    TP.eventIsDuplicate(lastEvent, ev)) {
                    return;
                }
            }

            //  Capture the event into a variable that will keep a reference
            //  to the last time this event happened. This is used in a
            //  variety of ways in the $$handle* calls, and both the event
            //  and the slot may be altered during the course of that call.
            lastEventName = 'lastPress';
            TP.core.Keyboard.$set(lastEventName, ev);

            TP.core.Keyboard.getCurrentKeyboard().$$handleKeyPress(ev);

            break;

        case 'keyup':

            //  suppress dups for IE...we manage repeat differently
            if (TP.boot.isUA('IE')) {
                lastEvent = TP.core.Keyboard.get('lastUp');
                if (TP.isEvent(lastEvent) &&
                    TP.eventIsDuplicate(lastEvent, ev)) {
                    return;
                }
            }

            //  Capture the event into a variable that will keep a reference
            //  to the last time this event happened. This is used in a
            //  variety of ways in the $$handle* calls, and both the event
            //  and the slot may be altered during the course of that call.
            lastEventName = 'lastUp';
            TP.core.Keyboard.$set(lastEventName, ev);

            TP.core.Keyboard.getCurrentKeyboard().$$handleKeyUp(ev);

            break;

        default:
            return;
    }

    //  If we're on IE, and the $$handle* call didn't reset the
    //  'lastEventName' slot to be something else (like null...), then we
    //  replace it with a copy of the event record. This is because IE
    //  pitches a fit if we try to keep a reference to Event objects around.
    if (TP.boot.isUA('IE') && TP.core.Keyboard.get(lastEventName) === ev) {
        TP.core.Keyboard.$set(lastEventName, ev.copy());
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('$$handleKeyDown',
function(normalizedEvent) {

    /**
     * @name $$handleKeyDown
     * @synopsis Responds to notifications that a keyup event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    this.$$updateModifierStates(normalizedEvent);

    this.handleKeyDown(normalizedEvent);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('handleKeyDown',
function(normalizedEvent) {

    /**
     * @name handleKeyDown
     * @synopsis A method which subtypes override to perform key handling
     *     specific to keydown events.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('$$handleKeyPress',
function(normalizedEvent) {

    /**
     * @name $$handleKeyPress
     * @synopsis Responds to notifications that a keyup event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    this.handleKeyPress(normalizedEvent);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('handleKeyPress',
function(normalizedEvent) {

    /**
     * @name handleKeyPress
     * @synopsis A method which subtypes override to perform key handling
     *     specific to keypress events.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('$$handleKeyUp',
function(normalizedEvent) {

    /**
     * @name $$handleKeyUp
     * @synopsis Responds to notifications that a keyup event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    this.$$updateModifierStates(normalizedEvent);

    this.handleKeyUp(normalizedEvent);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('handleKeyUp',
function(normalizedEvent) {

    /**
     * @name handleKeyUp
     * @synopsis A method which subtypes override to perform key handling
     *     specific to keyup events.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('$$updateModifierStates',
function(normalizedEvent) {

    /**
     * @name $$updateModifierStates
     * @synopsis Updates the modifier status based on the supplied Event.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    var key,
        dirty;

    dirty = false;

    key = TP.eventGetAltKey(normalizedEvent);
    if (this.isAltDown() !== key) {
        dirty = true;
        this.isAltDown(key);
    }

    key = TP.eventGetShiftKey(normalizedEvent);
    if (this.isShiftDown() !== key) {
        dirty = true;
        this.isShiftDown(key);
    }

    key = TP.eventGetCtrlKey(normalizedEvent);
    if (this.isCtrlDown() !== key) {
        dirty = true;
        this.isCtrlDown(key);
    }

    key = TP.eventGetMetaKey(normalizedEvent);
    if (this.isMetaDown() !== key) {
        dirty = true;
        this.isMetaDown(key);
    }

    if (dirty) {
        this.invokeObservers('modifierkeychange', normalizedEvent);
    }

    return;
});

//  ------------------------------------------------------------------------
//  KEY/STATE QUERIES
//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('computeFullSignalName',
function(normalizedEvent, keyName, shift) {

    /**
     * @name computeFullSignalName
     * @synopsis Returns the 'full' signal name for a particular event. This
     *     method takes the key name and adds a prefix of 'Shift_', 'Alt_',
     *     'Ctrl_' or 'Meta_' and a suffix of '_Down', '_Press', '_Up', all
     *     dependent on the event's modifier states and 'action' (i.e. down,
     *     press or up).
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @param {String} keyname The key name.
     * @param {Boolean} shift Whether or not the key was shifted. Note that we
     *     allow the caller to supply this rather than calculating it from the
     *     supplied event so that the caller can 'spoof' it.
     * @returns {String} The 'full' key event DOM signal name.
     */

    var signame;

    //  All key events get a suffix suitable to that event
    switch (TP.eventGetType(normalizedEvent)) {
        case 'keyup':

            signame = keyName + '_Up';
            break;

        case 'keydown':

            signame = keyName + '_Down';
            break;

        case 'keypress':

            signame = keyName + '_Press';
            break;
    }

    //  Modifier keys are prefixes which effectively start with optional
    //  Ctrl, Alt, or Meta followed by optional Shift state.
    if (shift && (keyName !== 'Shift')) {
        signame = 'Shift_' + signame;
    }

    if (TP.eventGetAltKey(normalizedEvent) && (keyName !== 'Alt')) {
        signame = 'Alt_' + signame;
    }

    if (TP.eventGetCtrlKey(normalizedEvent) && (keyName !== 'Control')) {
        signame = 'Ctrl_' + signame;
    }

    if (TP.eventGetMetaKey(normalizedEvent) && (keyName !== 'Meta')) {
        signame = 'Meta_' + signame;
    }

    return signame;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('getDOMSignalName',
function(normalizedEvent) {

    /**
     * @name getDOMSignalName
     * @synopsis Returns the DOM signal name for a particular event.
     * @description The returned signal name is based largely on the current
     *     keyboard's mapping for the particular event information including
     *     charCode, keyCode, and modifier key states. For example, a keyup
     *     event with the shift key active and a keycode of 13 on a US ASCII 101
     *     keyboard would return a signal name of DOM_Shift_Enter_Up.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {String} The key event DOM signal name.
     */

    return 'DOM_' + this.$getVirtualKeySignalName(normalizedEvent);
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('getEventVirtualKey',
function(anEvent) {

    /**
     * @name getEventVirtualKey
     * @synopsis Returns the current keyboard's virtual key name for the code
     *     provided. The shift and special values help refine the search when a
     *     code represents a special key and/or is augmented by use of the Shift
     *     key.
     * @param {Event|Number} eventOrKey The keycode or charcode to look up.
     * @returns {String} The virtual key name, or null when not found.
     * @todo
     */

    var ev,
        type,

        xml,

        key,
        shift,

        path,
        elems,
        elem,

        vk;

    if (TP.notValid(anEvent)) {
        this.raise('TP.sig.InvalidEvent', arguments);
        return;
    }

    ev = TP.isEvent(anEvent) ? anEvent : anEvent.get('event');
    type = TP.eventGetType(ev);

    if (!TP.regex.KEY_EVENT.test(type)) {
        return;
    }

    if (TP.notValid(xml = TP.core.Keyboard.get('mapxml'))) {
        return;
    }

    key = TP.eventGetKeyCode(ev);

    //  bit of a trick here to avoid a Shift_Shift in particular
    if (key !== TP.SHIFT_KEY) {
        shift = TP.eventGetShiftKey(ev);
    }

    //  if the event was 'shift'ed, then we have to query twice, once for the
    //  'shift'ed code and, if an entry wasn't found, query again for the
    //  un'shift'ed code.
    if (shift) {
        path = TP.join(
                '//*[@id="_', key, '_shifted"]',
                '[(@platform="', TP.$platform,
                    '" and @browser="', TP.$browser, '")',
                ' or (@browser="', TP.$browser, '")',
                ' or (@platform="', TP.$platform, '")',
                ' or .]');

        elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET);

        if (!TP.isElement(elem)) {

            path = TP.join(
                    '//*[@id="_', key, '"]',
                    '[(@platform="', TP.$platform,
                        '" and @browser="', TP.$browser, '")',
                    ' or (@browser="', TP.$browser, '")',
                    ' or (@platform="', TP.$platform, '")',
                    ' or .]');

            elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET);
        }
    } else {

        path = TP.join(
                '//*[@id="_', key, '"]',
                '[(@platform="', TP.$platform,
                    '" and @browser="', TP.$browser, '")',
                ' or (@browser="', TP.$browser, '")',
                ' or (@platform="', TP.$platform, '")',
                ' or .]');

        elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET);
    }

    //  If there was still no entry found, then see if we can derive it from the
    //  character code produced by the String type.
    if (TP.isEmpty(elems)) {
        if (TP.core.Keyboard.isPrintable(anEvent)) {
            vk = String.fromCharCode(key);
        }
    } else {

        //  If more than one element was returned, that means that we must have
        //  entries for specific browser, platform or both. Sort them so that
        //  entries with platform, then browser, then browser and platform
        //  (least to most specific) are towards the end of the list and use the
        //  last one.
        if (elems.getSize() > 1) {
            elems.sort(TP.KEYMAP_ELEMENT_SORT);
            elem = elems.last();
        } else {
            //  There was only one.
            elem = elems.first();
        }

        //  Now get the virtual key value from either the key or glyph
        //  attribute.
        vk = TP.ifEmpty(
                    TP.elementGetAttribute(elem, 'key'),
                    TP.elementGetAttribute(elem, 'glyph'));
    }

    //  No char was there? Guess we'll use the key code itself in string form
    if (TP.notValid(vk)) {
        vk = 'KeyCode' + (TP.isString(key) ? key : '');
    }

    return vk;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('$getVirtualKeySignalName',
function(normalizedEvent) {

    /**
     * @name $getVirtualKeySignalName
     * @synopsis Returns the 'raw key' signal name for a particular event. This
     *     will then be prepended by 'DOM_' by the getDOMSignalName() method to
     *     generate the proper 'full' signal name.
     * @description The returned signal name is based largely on the current
     *     keyboard's mapping for the particular event information including
     *     charCode, keyCode, and modifier key states. For example, a keyup
     *     event with the shift key active and a keycode of 13 on a US ASCII 101
     *     keyboard would return a signal name of Shift_Enter_Up.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {String} The key event DOM signal name.
     */

    var signame,

        shift,
        key,

        xml,

        vk,

        path,
        elems,
        elem;

    //  If we've already cached the name, then return it.
    if (TP.isString(signame = normalizedEvent.$computedName)) {
        return signame;
    }

    key = TP.eventGetKeyCode(normalizedEvent);

    if (key)    //  not null and not 0
    {
        if (TP.notValid(xml = TP.core.Keyboard.get('mapxml'))) {
            //  if no keymap is found we've got a real problem. our only
            //  potential option is to hope the key is a character code
            //  don't get string versions of control characters
            if (TP.core.Keyboard.isPrintable(normalizedEvent)) {
                vk = String.fromCharCode(key);
                normalizedEvent.$unicodeCharCode =
                    vk.asUnicodeLiteral().replace('\\u', 'U');
            }
        } else {
            //  bit of a trick here to avoid a Shift_Shift in particular
            if (key !== TP.SHIFT_KEY) {
                shift = TP.eventGetShiftKey(normalizedEvent);
            }

            //  if the event was 'shift'ed, then we have to query twice, once
            //  for the 'shift'ed code and, if an entry wasn't found, query
            //  again for the un'shift'ed code.
            if (shift) {
                path = TP.join(
                        '//*[@id="_', key, '_shifted"]',
                        '[(@platform="', TP.$platform,
                            '" and @browser="', TP.$browser, '")',
                        ' or (@browser="', TP.$browser, '")',
                        ' or (@platform="', TP.$platform, '")',
                        ' or .]');

                elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET);

                if (TP.isEmpty(elems)) {

                    path = TP.join(
                            '//*[@id="_', key, '"]',
                            '[(@platform="', TP.$platform,
                                '" and @browser="', TP.$browser, '")',
                            ' or (@browser="', TP.$browser, '")',
                            ' or (@platform="', TP.$platform, '")',
                            ' or .]');

                    elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET);
                }
            } else {

                path = TP.join(
                        '//*[@id="_', key, '"]',
                        '[(@platform="', TP.$platform,
                            '" and @browser="', TP.$browser, '")',
                        ' or (@browser="', TP.$browser, '")',
                        ' or (@platform="', TP.$platform, '")',
                        ' or .]');

                elems = TP.nodeEvaluateXPath(xml, path, TP.NODESET);
            }

            //  If there was still no entry found, then see if we can derive it
            //  from the character code produced by the String type.
            if (TP.isEmpty(elems)) {
                //  don't get string versions of control characters
                if (TP.core.Keyboard.isPrintable(normalizedEvent)) {
                    vk = String.fromCharCode(key);
                    normalizedEvent.$unicodeCharCode =
                        vk.asUnicodeLiteral().replace('\\u', 'U');
                }
            } else {

                //  If more than one element was returned, that means that we
                //  must have entries for specific browser, platform or both.
                //  Sort them so that entries with platform, then browser, then
                //  browser and platform (least to most specific) are towards
                //  the end of the list and use the last one.
                if (elems.getSize() > 1) {
                    elems.sort(TP.KEYMAP_ELEMENT_SORT);
                    elem = elems.last();
                } else {
                    //  There was only one.
                    elem = elems.first();
                }

                //  When we find a shifted value we make sure to not put
                //  'Shift_' onto the signal name... the vk name is all we
                //  want to see. In other words, we'll never generate
                //  'Shift_Asterisk'...
                if (shift && TP.elementGetAttribute(
                                    elem, 'id').endsWith('_shifted')) {
                    shift = false;
                }

                //  Otherwise, get it from either the key or glyph attribute.
                vk = TP.ifEmpty(
                        TP.elementGetAttribute(elem, 'key'),
                        TP.elementGetAttribute(elem, 'glyph'));

                normalizedEvent.$unicodeCharCode =
                        TP.elementGetAttribute(elem, 'char');
            }
        }
    }

    //  No char was there? Guess we'll use the key code itself in string form
    if (TP.notValid(vk)) {
        vk = 'KeyCode' + (TP.isString(key) ? key : '');
    }

    signame = this.computeFullSignalName(normalizedEvent, vk, shift);

    normalizedEvent.$computedName = signame;

    return signame;
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('isAltDown',
function(aFlag) {

    /**
     * @name isAltDown
     * @synopsis Returns true if the Alt key is currently pressed.
     * @param {Boolean} aFlag Set the 'isDown' state of the key to true or
     *     false.
     * @returns {Boolean} True if the Alt key is down.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('altDown', aFlag);
    }

    return this.$get('altDown');
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('isCtrlDown',
function(aFlag) {

    /**
     * @name isCtrlDown
     * @synopsis Returns true if the Ctrl key is currently pressed.
     * @param {Boolean} aFlag Set the 'isDown' state of the key to true or
     *     false.
     * @returns {Boolean} True if the Ctrl key is down.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('ctrlDown', aFlag);
    }

    return this.$get('ctrlDown');
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('isMetaDown',
function(aFlag) {

    /**
     * @name isMetaDown
     * @synopsis Returns true if the Meta key is currently pressed.
     * @returns {Boolean} True if the Meta key is down.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('metaDown', aFlag);
    }

    return this.$get('metaDown');
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('isPrintable',
function(anEvent) {

    /**
     * @name isPrintable
     * @synopsis Returns true if the event represents a character that should be
     *     printable given the current keyboard mapping.
     * @param {Event} anEvent A native key event.
     * @returns {Boolean} True if the event's keycode/charcode should produce a
     *     printable character given the current keyboard.
     */

    return this.getCurrentKeyboard().isPrintable(anEvent);
});

//  ------------------------------------------------------------------------

TP.core.Keyboard.Type.defineMethod('isShiftDown',
function(aFlag) {

    /**
     * @name isShiftDown
     * @synopsis Returns true if the Shift key is currently pressed.
     * @param {Boolean} aFlag Set the 'isDown' state of the key to true or
     *     false.
     * @returns {Boolean} True if the Shift key is down.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('shiftDown', aFlag);
    }

    return this.$get('shiftDown');
});

//  ========================================================================
//  TP.core.USAscii101Keyboard
//  ========================================================================

TP.core.Keyboard.defineSubtype('USAscii101Keyboard');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.USAscii101Keyboard.Type.defineMethod('handleKeyDown',
function(normalizedEvent) {

    /**
     * @name handleKeyDown
     * @synopsis Handles key down events for the TP.core.USAscii101Keyboard
     *     type.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    var key,
        lastDown;

    key = TP.eventGetKeyCode(normalizedEvent);

    if (TP.boot.isUA('GECKO') && TP.boot.isMac()) {
        //  hozed on some keys, they report 0 as keyCode. have to wait for
        //  press event...thankfully moz will produce one (for now)
        if (key === 0) {
            normalizedEvent.$notSignaled = true;

            return;
        }
    }

    //  arrow keys suck pretty much across the board. can't tell if it's an
    //  arrow or a %, &, (, or ' until the press event...but only Moz will
    //  provide a press event if it's actually an arrow. Also, home and $
    //  are confused. Cool huh?
    if (key >= 36 && key <= 40) {
        if (TP.boot.isUA('GECKO')) {
            //  wait for press to decide
            normalizedEvent.$notSignaled = true;

            return;
        } else {
            //  Won't get a press from an arrow on IE or Safari so we have
            //  to hack it a little differently. A non-special key will get
            //  an immediate press and can cancel the following timer,
            //  otherwise the up handler can do it, provided that the down
            //  doesn't signal if the key is simply held down for some time.
            //  The variable here is how long is the delay between down and
            //  press event notification so the timeout coordinates with
            //  press properly.
            lastDown = TP.core.Keyboard.get('lastDown');
            if (TP.notValid(lastDown)) {
                //  shouldn't happen, lastDown is set in root handler
                //  function before it invokes this routine
                return;
            }

            lastDown.$notSignaled = true;
            lastDown.$special = true;

            lastDown = TP.boot.isUA('IE') ? lastDown.copy() : lastDown;

            TP.core.Keyboard.$set('downTimer',
                setTimeout(
                    function() {

                        //  clear so press/up don't get confused and try to
                        //  process their timer-specific logic
                        TP.core.Keyboard.$set('downTimer', null);

                        //  if the timer doesn't get cancelled by a press or
                        //  an up then we can presume we got a down on a key
                        //  that won't get a press...meaning it must be
                        //  special and hence an arrow key or similarly
                        //  hozed up key event.
                        lastDown.$notSignaled = null;

                        TP.core.Keyboard.invokeObservers('keydown',
                                                            lastDown);
                    }, 10));

            return;
        }
    }

    this.invokeObservers('keydown', normalizedEvent);

    return;
});

//  ------------------------------------------------------------------------

TP.core.USAscii101Keyboard.Type.defineMethod('handleKeyPress',
function(normalizedEvent) {

    /**
     * @name handleKeyPress
     * @synopsis Handles key press events for the TP.core.USAscii101Keyboard
     *     type.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    var lastDown,
        special,
        lastKey,
        key,
        timer;

    if (TP.boot.isUA('GECKO')) {
        lastDown = TP.core.Keyboard.get('lastDown');

        special = normalizedEvent.which === 0;
        if (special) {
            if (TP.isEvent(lastDown) && lastDown.$notSignaled) {
                lastDown.$special = true;
                lastDown.$notSignaled = null;

                this.invokeObservers('keydown', lastDown);
            }

            //  suppress to match DOM Level 3 standard and IE/Safari
            TP.core.Keyboard.$set('lastPress', null);

            return;
        }

        //  press keys are often wrong...map to what was seen onkeydown
        //  unless that was 0
        if ((lastKey = TP.eventGetKeyCode(lastDown)) !== 0) {
            if (TP.isNumber(lastKey)) {
                normalizedEvent.$$keyCode = lastKey;
            }
        }

        key = TP.eventGetKeyCode(normalizedEvent);

        if (TP.isEvent(lastDown) && lastDown.$notSignaled) {
            lastDown.$notSignaled = null;
            lastDown.$special = null;
            lastDown.$$keyCode = key;

            this.invokeObservers('keydown', lastDown);
        }
    } else {
        //  if there's a down timer running then the key was in a range
        //  where we needed to wait for a press or up to tell what it was.
        //  clear the timer if we get a press since that means the key
        //  wasn't special on IE or Safari, just a normal key with an ascii
        //  code we can look up.
        if (TP.isNumber(timer = TP.core.Keyboard.$get('downTimer'))) {
            clearTimeout(timer);
            TP.core.Keyboard.$set('downTimer', null);

            lastDown = TP.core.Keyboard.get('lastDown');
            if (TP.isEvent(lastDown)) {
                lastDown.$notSignaled = null;
                lastDown.$special = null;

                this.invokeObservers('keydown', lastDown);
            }
        } else {
            //  no timer and we got a press, must be a valid key in a range
            //  where the down was already signaled. for consistency we
            //  could potentially bring the down key's data forward and we
            //  actually need to do that since some codes report incorrectly
            //  due to ascii offsets of 32 etc.
            lastDown = TP.core.Keyboard.get('lastDown');
            if (TP.isEvent(lastDown) &&
                ((lastKey = TP.eventGetKeyCode(lastDown)) !== 0)) {
                normalizedEvent.$$keyCode = lastKey;
            }
        }
    }

    this.invokeObservers('keypress', normalizedEvent);

    return;
});

//  ------------------------------------------------------------------------

TP.core.USAscii101Keyboard.Type.defineMethod('handleKeyUp',
function(normalizedEvent) {

    /**
     * @name handleKeyUp
     * @synopsis Handles key up events for the TP.core.USAscii101Keyboard type.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    var key,
        lastEvent,
        lastKey,
        timer;

    if (TP.boot.isUA('GECKO')) {
        lastEvent = TP.core.Keyboard.get('lastPress') ||
                    TP.core.Keyboard.get('lastDown');

        if (TP.isEvent(lastEvent)) {
            normalizedEvent.$special = lastEvent.$special;
        }

        key = TP.eventGetKeyCode(normalizedEvent);
        if (key === 0) {
            if (TP.isEvent(lastEvent) &&
                ((lastKey = TP.eventGetKeyCode(lastEvent)) !== 0)) {
                normalizedEvent.$$keyCode = lastKey;
            }
        }
    } else {
        //  if there's a down timer running then the key was in a range
        //  where we needed to wait for a press or up to tell what it was.
        //  if we got an up and the timer's still valid that means there was
        //  no press event, hence the key was special (an arrow key etc)
        if (TP.isNumber(timer = TP.core.Keyboard.$get('downTimer'))) {
            clearTimeout(timer);
            TP.core.Keyboard.$set('downTimer', null);

            //  unless we map over the value we'll likely report
            //  incorrectly...remember what goes down must come up ;)
            lastEvent = TP.core.Keyboard.get('lastDown');
            if (TP.isEvent(lastEvent)) {
                normalizedEvent.$$keyCode = lastEvent.$$keyCode;
                normalizedEvent.$special = lastEvent.$special;

                this.invokeObservers('keydown', lastEvent);
            }
        } else {
            //  no timer means key wasn't in the special range where we had
            //  to set a timer. should be a simple matter of ensuring we map
            //  over any knowledge that the key was special because we saw a
            //  press event etc.
            lastEvent = TP.core.Keyboard.get('lastPress') ||
                        TP.core.Keyboard.get('lastDown');
            if (TP.isEvent(lastEvent)) {
                normalizedEvent.$special = lastEvent.$special;
            }
        }
    }

    this.invokeObservers('keyup', normalizedEvent);

    return;
});

//  ------------------------------------------------------------------------

TP.core.USAscii101Keyboard.Type.defineMethod('isPrintable',
function(anEvent) {

    /**
     * @name isPrintable
     * @synopsis Returns true if the event represents a character that should be
     *     printable given the current keyboard mapping.
     * @param {Event} anEvent A native key event.
     * @returns {Boolean} True if the event's keycode/charcode should produce a
     *     printable character given the current keyboard.
     */

    var key;

    key = TP.eventGetKeyCode(anEvent);
    if ((key >= 32) && (key <= 127) && TP.notTrue(anEvent.$special)) {
        return true;
    }

    return false;
});

//  ========================================================================
//  TP.core.Mouse
//  ========================================================================

TP.core.Device.defineSubtype('Mouse');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineAttribute(
        'hoverFunc',
        function() {

            var lastMove,
                lastOver,

                hoverRepeat,
                targetElem,
                targetRepeat,
                func;

            //  clean up after ourselves.
            TP.core.Mouse.$set('hoverTimer', null);

            //  make sure we've got a last move to work from
            lastMove = TP.core.Mouse.$get('lastMove');
            if (lastMove === null) {
                return;
            }

            if (TP.core.Mouse.$$isDragging(lastMove)) {
                TP.eventSetType(lastMove, 'draghover');

                TP.core.Mouse.invokeObservers(
                        'draghover',
                        lastMove);
            } else {
                TP.eventSetType(lastMove, 'mousehover');

                TP.core.Mouse.invokeObservers(
                        'mousehover',
                        lastMove);
            }

            //  we use the 'lastOver' to obtain the repeat value, if it has
            //  one. We don't want to pick up repeat values from every
            //  element we go over, in case we're in drag mode.
            lastOver = TP.core.Mouse.$get('lastOver');

            hoverRepeat = TP.sys.cfg('mouse.hover_repeat');

            //  Get a resolved event target, given the event. This takes
            //  into account disabled elements and will look for a target
            //  element with the appropriate 'enabling attribute', if
            //  possible.
            if (TP.isElement(targetElem =
                            TP.eventGetResolvedTarget(lastOver))) {
                //  If the event target has an 'sig:hoverrepeat' attribute,
                //  try to convert it to a Number and if that's successful,
                //  set hoverRepeat to it.
                if (TP.isNumber(targetRepeat =
                                    TP.elementGetAttribute(
                                            targetElem,
                                            'sig:hoverrepeat',
                                            true).asNumber())) {
                    hoverRepeat = targetRepeat;
                }
            }

            func = function() {

                        var lastMove;

                        lastMove = TP.core.Mouse.$get('lastMove');
                        if (lastMove === null) {
                            return;
                        }

                        if (TP.core.Mouse.$$isDragging(lastMove)) {
                            TP.eventSetType(lastMove, 'draghover');

                            TP.core.Mouse.invokeObservers(
                                    'draghover',
                                    lastMove);
                        } else {
                            TP.eventSetType(lastMove, 'mousehover');

                            TP.core.Mouse.invokeObservers(
                                    'mousehover',
                                    lastMove);
                        }

                        //  reschedule the repeat timer
                        TP.core.Mouse.$set(
                            'hoverRepeatTimer',
                            setTimeout(
                                func,
                                hoverRepeat));
                    };

            //  set up the hover repeat timer
            TP.core.Mouse.$set(
                'hoverRepeatTimer',
                setTimeout(func,
                    hoverRepeat));
});

//  overall hash of observations made locally to a specific device
TP.core.Mouse.Type.defineAttribute('observers', TP.hc());

//  map of signals which we've placed redirectors for
TP.core.Mouse.Type.defineAttribute('redirections', TP.hc());

//  timers for click vs. dblclick and hover delay
TP.core.Mouse.Type.defineAttribute('clickTimer');
TP.core.Mouse.Type.defineAttribute('hoverTimer');
TP.core.Mouse.Type.defineAttribute('hoverRepeatTimer');

//  whether or not we've sent the 'dragdown' signal
TP.core.Mouse.Type.defineAttribute('$sentDragDown', false);

TP.core.Mouse.Type.defineAttribute('leftDown', false);
TP.core.Mouse.Type.defineAttribute('middleDown', false);
TP.core.Mouse.Type.defineAttribute('rightDown', false);

TP.core.Mouse.Type.defineAttribute('lastDown');
TP.core.Mouse.Type.defineAttribute('lastMove');
TP.core.Mouse.Type.defineAttribute('lastUp');

TP.core.Mouse.Type.defineAttribute('lastOver');
TP.core.Mouse.Type.defineAttribute('lastOut');

TP.core.Mouse.Type.defineAttribute('lastClick');
TP.core.Mouse.Type.defineAttribute('lastDblClick');
TP.core.Mouse.Type.defineAttribute('lastContextMenu');

TP.core.Mouse.Type.defineAttribute('lastMouseWheel');

//  encached copies of native event wrapper signals
TP.core.Mouse.Type.defineAttribute('mousedown');
TP.core.Mouse.Type.defineAttribute('mousemove');
TP.core.Mouse.Type.defineAttribute('mouseup');

TP.core.Mouse.Type.defineAttribute('mouseover');
TP.core.Mouse.Type.defineAttribute('mouseout');

TP.core.Mouse.Type.defineAttribute('click');
TP.core.Mouse.Type.defineAttribute('dblclick');
TP.core.Mouse.Type.defineAttribute('contextmenu');

TP.core.Mouse.Type.defineAttribute('mousewheel');

TP.core.Mouse.Type.defineAttribute('mousehover');

//  drag signals
TP.core.Mouse.Type.defineAttribute('dragdown');
TP.core.Mouse.Type.defineAttribute('dragmove');
TP.core.Mouse.Type.defineAttribute('dragup');

TP.core.Mouse.Type.defineAttribute('dragover');
TP.core.Mouse.Type.defineAttribute('dragout');

TP.core.Mouse.Type.defineAttribute('draghover');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Performs one-time setup for the type on startup/import.
     */

    //  construct a template instance for signals we care about
    this.$set('mousedown',
            TP.sys.require('TP.sig.DOMMouseDown').construct(null, true));
    this.$set('mousemove',
            TP.sys.require('TP.sig.DOMMouseMove').construct(null, true));
    this.$set('mouseup',
            TP.sys.require('TP.sig.DOMMouseUp').construct(null, true));

    this.$set('mouseover',
            TP.sys.require('TP.sig.DOMMouseOver').construct(null, true));
    this.$set('mouseout',
            TP.sys.require('TP.sig.DOMMouseOut').construct(null, true));

    this.$set('click',
            TP.sys.require('TP.sig.DOMClick').construct(null, true));
    this.$set('dblclick',
            TP.sys.require('TP.sig.DOMDblClick').construct(null, true));
    this.$set('contextmenu',
            TP.sys.require('TP.sig.DOMContextMenu').construct(null, true));

    this.$set('mousewheel',
            TP.sys.require('TP.sig.DOMMouseWheel').construct(null, true));

    this.$set('mousehover',
            TP.sys.require('TP.sig.DOMMouseHover').construct(null, true));

    //  drag signals
    this.$set('dragdown',
            TP.sys.require('TP.sig.DOMDragDown').construct(null, true));
    this.$set('dragmove',
            TP.sys.require('TP.sig.DOMDragMove').construct(null, true));
    this.$set('dragup',
            TP.sys.require('TP.sig.DOMDragUp').construct(null, true));

    this.$set('dragover',
            TP.sys.require('TP.sig.DOMDragOver').construct(null, true));
    this.$set('dragout',
            TP.sys.require('TP.sig.DOMDragOut').construct(null, true));

    this.$set('draghover',
            TP.sys.require('TP.sig.DOMDragHover').construct(null, true));

    return;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('invokeObservers',
function(singletonName, normalizedEvent, aSignal) {

    /**
     * @name invokeObservers
     * @synopsis Runs the event handlers for any registered observers.
     * @description Each native event type has a singleton TIBET signal instance
     *     registered with the device type. This singleton is acquired, updated,
     *     and then passed to each handler for processing. The normalizedEvent
     *     becomes the payload/native event for the signal and is thereby
     *     available to each handler for use.
     * @param {String} singletonName The attribute name used to acquire a
     *     singleton signal instance for the invocation.
     * @param {Event} normalizedEvent A normalized (augmented) native event
     *     object conforming to a set of common and W3-compliant methods.
     * @param {TP.sig.Signal} aSignal Optional signal to use rather than the
     *     singleton/event pair.
     * @returns {TP.sig.Signal} The signal that was actually triggered.
     * @todo
     */

    var targetElem,

        fname,
        elemType,

        signal,
        redirector,

        dict,

        handlers,

        len,
        i,
        handler,

        typename;

    if (!TP.sys.hasInitialized()) {
        return;
    }

    if (TP.isElement(targetElem =
                        TP.eventGetResolvedTarget(normalizedEvent))) {
        fname = 'handlePeer' + TP.escapeTypeName(
                                TP.DOM_SIGNAL_TYPE_MAP.at(
                                        TP.eventGetType(normalizedEvent)));

        elemType = TP.wrap(targetElem).getType();

        //  Message the type for the element that is 'responsible' for
        //  this event. It's native control sent this event and we need
        //  to let the type know about it.
        if (TP.canInvoke(elemType, fname)) {
            elemType[fname](targetElem, normalizedEvent);
        }

        //  If the native event was prevented, then we should just bail out
        //  here.
        //  NB: 'defaultPrevented' is a DOM Level 3 property, which seems to
        //  be well supported on TIBET's target browser environments.
        if (normalizedEvent.defaultPrevented === true) {
            return;
        }
    }

    //  when we're provided with a signal we don't need to build one.
    signal = aSignal;
    if (TP.notValid(signal)) {
        //  build up a true signal from our template instance
        if (TP.notValid(signal = this.get(singletonName))) {
            TP.ifWarn() ?
                TP.warn('Event singleton not found for: ' + singletonName,
                        TP.LOG,
                        arguments) : 0;

            return;
        }

        //  Make sure to recycle the signal instance to clear any previous
        //  state.
        signal.recycle();

        //  let the signal type manage updates on signal naming etc through
        //  the setEvent functions they can optionally implement.
        signal.setEvent(normalizedEvent);

        //  when we reuse singleton we need to initialize origin to target
        signal.set('origin', signal.get('target'));
    }

    //  capture the information we'll need to see about redirections
    redirector = this.REDIRECTOR;

    dict = this.get('observers');

    //  We process both the specific signal and the overall signal type so
    //  both kinds of observations will succeed.

    //  Process the handlers registered under the signal name.
    if (TP.notEmpty(handlers = dict.at(signal.getSignalName()))) {
        len = handlers.getSize();
        for (i = 0; i < len; i++) {
            if (signal.shouldStop()) {
                break;
            }

            handler = handlers.at(i);

            //  when we're using the redirector as the handler we need to
            //  push the original origin back into place, otherwise we set
            //  it to the receiver (since observe is for the device).
            if (handler !== redirector) {
                signal.set('origin', this);
            }

            try {
                TP.handle(handler, signal);
            } catch (e) {
                TP.raise(this, 'TP.sig.HandlerException',
                            arguments, TP.ec(e));
            }
        }
    }

    //  If the signal name wasn't the same as the signal's signal name then
    //  we go ahead and process the handlers registered under the type name,
    //  because its a spoofed signal.

    typename = signal.getName();

    if (signal.getSignalName() !== typename) {
        if (TP.notEmpty(handlers = dict.at(typename))) {
            //  Reset the signal name to the type name because we need to
            //  signal to observers of the type name.
            signal.setSignalName(typename);

            len = handlers.getSize();
            for (i = 0; i < len; i++) {
                if (signal.shouldStop()) {
                    break;
                }

                handler = handlers.at(i);

                //  when we're using the redirector as the handler we need
                //  to push the original origin back into place, otherwise
                //  we set it to the receiver (since observe is for the
                //  device).
                if (handler !== redirector) {
                    signal.set('origin', this);
                }

                try {
                    TP.handle(handler, signal);
                } catch (e) {
                    TP.raise(this, 'TP.sig.HandlerException',
                                arguments, TP.ec(e));
                }
            }
        }
    }

    return signal;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleClick',
function(normalizedEvent) {

    /**
     * @name $$handleClick
     * @synopsis Responds to notifications from the native event system that a
     *     click event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    var lastDown,

        clickDelay,
        targetElem,
        targetDelay,

        thisRef,
        theEvent;

    if (TP.isNumber(TP.core.Mouse.$$clickTimer)) {
        return;
    }

    lastDown = this.get('lastDown');

    //  if we can't compute a distance from the last mousedown then we
    //  assume this is a valid click event
    if (TP.notValid(lastDown)) {
        this.invokeObservers('click', normalizedEvent);

        return;
    }

    //  make sure that we're not dragging...
    if (TP.core.Mouse.$$isDragging(normalizedEvent)) {
        return;
    }

    //  The clickDelay is used when a piece of UI has been authored in such
    //  a way that a real distinction wants to be made between 'click' and
    //  'double click' (rather than 'double click' just being 'more click').
    //  If another click happens within the clickDelay time, the double
    //  click handler cancels the timeout and no 'click' handlers are fired.

    //  Initially set the clickDelay to the system configured click delay.
    //  This is usually set to 0 such that there is no delay and has the
    //  effect that 'double click' is just 'more click'.
    clickDelay = TP.sys.cfg('mouse.click_delay');

    //  Get a resolved event target, given the event. This takes into
    //  account disabled elements and will look for a target element
    //  with the appropriate 'enabling attribute', if possible.
    if (TP.isElement(targetElem = TP.eventGetResolvedTarget(normalizedEvent))) {
        //  If the event target has an 'sig:clickdelay' attribute, try to
        //  convert it to a Number and if that's successful, set clickDelay
        //  to it.
        if (TP.isNumber(targetDelay =
                            TP.elementGetAttribute(
                                            targetElem,
                                            'sig:clickdelay',
                                            true).asNumber())) {
            clickDelay = targetDelay;
        }
    }

    //  use a timer that can be cancelled by dblclick events so we don't
    //  cause event-level confusion. the semantics should be maintained by
    //  the application however that dblclick is "more click"
    thisRef = this;
    theEvent = TP.boot.isUA('IE') ?
                        normalizedEvent.copy() :
                        normalizedEvent;

    TP.core.Mouse.$$clickTimer = setTimeout(
        function() {

            thisRef.invokeObservers('click', theEvent);

            TP.core.Mouse.$$clickTimer = undefined;
        }, clickDelay);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleContextMenu',
function(normalizedEvent) {

    /**
     * @name $$handleContextMenu
     * @synopsis Responds to notifications from the native event system that a
     *     context menu event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    var signal;

    signal = this.invokeObservers('contextmenu', normalizedEvent);
    if (TP.isKindOf(signal, 'TP.sig.Signal')) {
        if (signal.shouldPrevent()) {
            normalizedEvent.preventDefault();
        }

        if (signal.shouldStop()) {
            normalizedEvent.stopPropagation();
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleDblClick',
function(normalizedEvent) {

    /**
     * @name $$handleDblClick
     * @synopsis Responds to notifications from the native event system that a
     *     dblclick event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    //  clear any click timer...double-click overrides click at the raw
    //  event level
    if (TP.isNumber(TP.core.Mouse.$$clickTimer)) {
        clearTimeout(TP.core.Mouse.$$clickTimer);
        TP.core.Mouse.$$clickTimer = undefined;
    }

    this.invokeObservers('dblclick', normalizedEvent);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseEvent',
function(nativeEvent) {

    /**
     * @name handleMouseEvent
     * @synopsis Responds to notification of a native mouse event.
     * @param {Event} nativeEvent The native event.
     */

    var ev,
        lastEventName;

    //  Don't come through this handler twice for the same Event
    if (nativeEvent.$captured) {
        return;
    }
    nativeEvent.$captured = true;

    //  normalize the event
    ev = TP.event(nativeEvent);

    //  we'll switch on type here so we can fine-tune each event type's
    //  logic as needed

    //  Note here that for every one of these cases we capture the event
    //  into a variable that will keep a reference to the last time this
    //  event happened. This is used in a variety of ways in the
    //  $$handle* calls, and both the event and the slot may be altered
    //  during the course of that call.
    switch (TP.eventGetType(ev)) {
        case 'mousedown':

            lastEventName = 'lastDown';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseDown(ev);
            break;

        case 'mousemove':

            lastEventName = 'lastMove';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseMove(ev);
            break;

        case 'mouseup':

            lastEventName = 'lastUp';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseUp(ev);
            break;

        case 'mouseover':

            lastEventName = 'lastOver';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseOver(ev);
            break;

        case 'mouseout':

            lastEventName = 'lastOut';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseOut(ev);
            break;

        case 'click':

            lastEventName = 'lastClick';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleClick(ev);
            break;

        case 'dblclick':

            lastEventName = 'lastDblClick';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleDblClick(ev);
            break;

        case 'contextmenu':

            lastEventName = 'lastContextMenu';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleContextMenu(ev);
            break;

        case 'mousewheel':
        case 'DOMMouseScroll':

            //  NOTE the translation for Moz vs. IE in the signal names via
            //  fallthrough on the cases above

            lastEventName = 'lastMouseWheel';
            TP.core.Mouse.$set(lastEventName, ev);

            TP.core.Mouse.$$handleMouseWheel(ev);
            break;

        default:
            return;
    }

    //  If we're on IE, and the $$handle* call didn't reset the
    //  'lastEventName' slot to be something else (like null...), then we
    //  replace it with a copy of the event record. This is because IE
    //  pitches a fit if we try to keep a reference to Event objects around.
    if (TP.boot.isUA('IE') && TP.core.Mouse.get(lastEventName) === ev) {
        TP.core.Mouse.$set(lastEventName, ev.copy());
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseDown',
function(normalizedEvent) {

    /**
     * @name $$handleMouseDown
     * @synopsis Responds to notifications from the native event system that a
     *     mouse down event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    //  Update button state(s)
    this.$$updateButtonStates(normalizedEvent);

    //  'dragdown' isn't triggered in this way (because of further tolerance
    //  computations that need to be done), only 'mousedown'.
    this.invokeObservers('mousedown', normalizedEvent);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseMove',
function(normalizedEvent) {

    /**
     * @name $$handleMouseMove
     * @synopsis Responds to notifications from the native event system that a
     *     mouse move event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    var dragDownEvent;

    //  TODO:   verify whether this is still required on target browsers
    TP.core.Keyboard.getCurrentKeyboard().$$updateModifierStates(
                                                        normalizedEvent);

    if (this.$$isDragging(normalizedEvent)) {
        if (TP.notTrue(this.$get('$sentDragDown'))) {
            //  Need to 'copy and retask' the 'last down' event, so that the
            //  correct targeting is performed and so that the proper kind
            //  of signal type, etc. is selected. We can do this by copying
            //  the 'last down' event and setting its 'event type'.
            dragDownEvent = this.get('lastDown').copy();
            TP.eventSetType(dragDownEvent, 'dragdown');

            this.invokeObservers('dragdown', dragDownEvent);
            this.$set('$sentDragDown', true);
        }

        TP.eventSetType(normalizedEvent, 'dragmove');

        this.invokeObservers('dragmove', normalizedEvent);
    } else {
        this.invokeObservers('mousemove', normalizedEvent);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseWheel',
function(normalizedEvent) {

    /**
     * @name $$handleMouseWheel
     * @synopsis Responds to notifications from the native event system that a
     *     mouse wheel event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    this.invokeObservers('mousewheel', normalizedEvent);

    return;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseUp',
function(normalizedEvent) {

    /**
     * @name $$handleMouseUp
     * @synopsis Responds to notifications from the native event system that a
     *     mouse up event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    var wasDragging;

    //  Note how we do this before we update the button state.
    wasDragging = this.$$isDragging(normalizedEvent);

    //  Update button state(s) - the user needs to know which button went up
    //  in their handler.
    this.$$updateButtonStates(normalizedEvent);

    if (wasDragging) {
        TP.eventSetType(normalizedEvent, 'dragup');

        this.invokeObservers('dragup', normalizedEvent);
        this.$set('$sentDragDown', false);
    } else {
        this.invokeObservers('mouseup', normalizedEvent);
    }

    try {
        clearTimeout(this.$get('hoverTimer'));
        clearTimeout(this.$get('hoverRepeatTimer'));
    } catch (e) {
        //  TODO: Warn that we couldn't clear the hover timeout.
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseOver',
function(normalizedEvent) {

    /**
     * @name $$handleMouseOver
     * @synopsis Responds to notifications from the native event system that a
     *     mouse over event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    var targetElem,

        hoverDelay,
        targetDelay;

    //  Get a resolved event target, given the event. This takes into
    //  account disabled elements and will look for a target element
    //  with the appropriate 'enabling attribute', if possible.

    //  TODO: remove this, replace with "wake up mr. css processor?"
    if (TP.isElement(targetElem = TP.eventGetResolvedTarget(normalizedEvent))) {
        TP.elementSetAttribute(targetElem, 'pclass:hover', 'true', true);
    }

    if (this.$$isDragging(normalizedEvent)) {
        TP.eventSetType(normalizedEvent, 'dragover');

        this.invokeObservers('dragover', normalizedEvent);
    } else {
        this.invokeObservers('mouseover', normalizedEvent);
    }

    hoverDelay = TP.sys.cfg('mouse.hover_delay');

    //  Get a resolved event target, given the event. This takes into
    //  account disabled elements and will look for a target element
    //  with the appropriate 'enabling attribute', if possible.
    if (TP.isElement(targetElem)) {
        //  If the event target has an 'sig:hoverdelay' attribute, try
        //  to convert it to a Number and if that's successful, set
        //  hoverDelay to it.
        if (TP.isNumber(targetDelay =
                            TP.elementGetAttribute(
                                            targetElem,
                                            'sig:hoverdelay',
                                            true).asNumber())) {
            hoverDelay = targetDelay;
        }
    }

    TP.core.Mouse.$set('hoverTimer',
                    setTimeout(this.$get('hoverFunc'), hoverDelay));

    return;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$handleMouseOut',
function(normalizedEvent) {

    /**
     * @name $$handleMouseOut
     * @synopsis Responds to notifications from the native event system that a
     *     mouse over event has occurred.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    var targetElem;

    //  Get a resolved event target, given the event. This takes into
    //  account disabled elements and will look for a target element
    //  with the appropriate 'enabling attribute', if possible.

    //  TODO: remove this, replace with "wake up mr. css processor?"
    if (TP.isElement(targetElem = TP.eventGetResolvedTarget(normalizedEvent))) {
        TP.elementRemoveAttribute(targetElem, 'pclass:hover', true);
    }

    if (this.$$isDragging(normalizedEvent)) {
        TP.eventSetType(normalizedEvent, 'dragout');

        this.invokeObservers('dragout', normalizedEvent);
    } else {
        this.invokeObservers('mouseout', normalizedEvent);
    }

    try {
        clearTimeout(this.$get('hoverTimer'));
        clearTimeout(this.$get('hoverRepeatTimer'));
    } catch (e) {
        //  TODO: Warn that we couldn't clear the hover timeout.
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$isDragging',
function(normalizedEvent) {

    /**
     * @name $$isDragging
     * @synopsis Returns true if the mouse is currently in a 'dragging' mode.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     * @returns {Boolean} True if dragging, false otherwise.
     */

    var lastDown,
        distance,

        dragDistance,
        dragDelay,

        targetElem,

        targetDistance,
        targetDelay,

        elapsedTime;

    //  If we've sent a 'drag down', then we're in the middle of dragging...
    //  short stop it here.
    if (TP.isTrue(this.$get('$sentDragDown'))) {
        return true;
    }

    if (this.$get('leftDown') ||
        this.$get('rightDown') ||
        this.$get('middleDown')) {
        lastDown = this.get('lastDown');
        distance = TP.computeDistance(lastDown, normalizedEvent);

        //  Initially, set the drag pixel distance to the value from the
        //  TP.sys.cfg() variable
        dragDistance = TP.sys.cfg('mouse.drag_distance');

        //  Initially, set the drag time delay to the value from the
        //  TP.sys.cfg() variable
        dragDelay = TP.sys.cfg('mouse.drag_delay');

        //  Get a resolved event target, given the event. This takes into
        //  account disabled elements and will look for a target element
        //  with the appropriate 'enabling attribute', if possible.
        if (TP.isElement(targetElem = TP.eventGetResolvedTarget(
                                                        normalizedEvent))) {
            //  If the event target has an 'sig:dragdistance' attribute, try
            //  to convert it to a Number and if that's successful, set
            //  dragDistance to it.
            if (TP.isNumber(targetDistance =
                                TP.elementGetAttribute(
                                            targetElem,
                                            'sig:dragdistance',
                                            true).asNumber())) {
                dragDistance = targetDistance;
            }

            //  If the event target has an 'sig:dragdelay' attribute, try
            //  to convert it to a Number and if that's successful, set
            //  dragDelay to it.
            if (TP.isNumber(targetDelay =
                                TP.elementGetAttribute(
                                            targetElem,
                                            'sig:dragdelay',
                                            true).asNumber())) {
                dragDelay = targetDelay;
            }
        }

        elapsedTime = TP.eventGetTime(normalizedEvent) -
                        TP.eventGetTime(lastDown);

        return (distance >= dragDistance && elapsedTime >= dragDelay);
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.Mouse.Type.defineMethod('$$updateButtonStates',
function(normalizedEvent) {

    /**
     * @name $$updateButtonStates
     * @synopsis Updates the button status based on the supplied Event.
     * @param {Event} normalizedEvent A normalized (W3 compatible) Event object.
     */

    var button,
        value;

    button = TP.button(normalizedEvent);

    value = (normalizedEvent.type === 'mousedown') ? true : false;

    switch (button) {
        case TP.LEFT:

            this.$set('leftDown', value);
            break;

        case TP.MIDDLE:

            this.$set('middleDown', value);
            break;

        case TP.RIGHT:

            this.$set('rightDown', value);
            break;

        default:
            break;
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
