//  ========================================================================
/*
NAME:   TIBETDevicePrimitivesPost.js
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

/*
Common device (keyboard, mouse, etc) support routines that can be loaded
once all browser-specific device features have been included.
*/

//  ------------------------------------------------------------------------
//  EVENT NAME UTILITIES
//  ------------------------------------------------------------------------

TP.definePrimitive('eventNameNativeValue',
function(eventName) {

    /**
     * @name eventNameNativeValue
     * @synopsis Returns the name of the native event that maps to the TIBET
     *     event name provided.
     * @param {String} eventName An event name such as F12_Up or
     *     TP.sig.DOMKeyPress.
     * @raises TP.sig.InvalidString
     * @returns {String} The name of the native event.
     */

    var name,
        type;

    if (TP.isEmpty(eventName)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    //  Key events in particular will change their names for easier
    //  observation. For that reason we decompose them from the string.
    if (TP.regex.KEY_EVENT.test(eventName)) {
        if (TP.regex.PRESS_END.test(eventName)) {
            name = 'keypress';
        } else if (TP.regex.DOWN_END.test(eventName)) {
            name = 'keydown';
        } else if (TP.regex.UP_END.test(eventName)) {
            name = 'keyup';
        }
    } else if (TP.isType(type = eventName.asType())) {
        //  Mouse events along with most other native browser event wrappers
        //  can respond best at the type wrapper level.
        name = type.NATIVE_NAME;
    }

    return name;
});

//  ------------------------------------------------------------------------
//  MOUSE EVENT PROPERTIES
//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetPropertyKeys',
function(anEvent) {

    /**
     * @name eventGetPropertyKeys
     * @synopsis Returns an Array containing all of the 'key names' of the
     *     supplied Event object.
     * @param {Event} anEvent The event object to return the property keys
     *     for.
     * @returns {Array} The Array of property keys.
     */

    var type;

    type = TP.eventGetType(anEvent);

    switch (type) {
        //  HTML Events
        case 'change':
        case 'reset':
        case 'submit':

            return TP.DOM_EVENT_PROPERTIES;

        //  UI Events
        case 'abort':
        case 'blur':
        case 'change':
        case 'error':
        case 'focus':
        case 'load':
        case 'reset':
        case 'resize':
        case 'scroll':
        case 'select':
        case 'submit':
        case 'unload':

            return TP.DOM_UI_EVENT_PROPERTIES;

        //  Focus Events
        case 'blur':
        case 'focus':
        case 'focusin':
        case 'focusout':

            return TP.DOM_FOCUS_EVENT_PROPERTIES;

        //  Key Events
        case 'keydown':
        case 'keypress':
        case 'keyup':

            return TP.DOM_KEY_EVENT_PROPERTIES;

        //  Mouse Events
        case 'click':
        case 'dblclick':
        case 'mousedown':
        case 'mouseenter':
        case 'mouseleave':
        case 'mousemove':
        case 'mouseout':
        case 'mouseover':
        case 'mouseup':

            return TP.DOM_MOUSE_EVENT_PROPERTIES;

        //  Old Mouse Wheel Events
        case 'DOMMouseScroll':
        case 'mousewheel':

        //  W3C Wheel Events
        case 'wheel':

            return TP.DOM_WHEEL_EVENT_PROPERTIES;

        //  Mutation Events
        case 'DOMAttrModified':
        case 'DOMNodeInserted':
        case 'DOMNodeRemoved':
        case 'DOMCharacterDataModified':
        case 'DOMNodeInsertedIntoDocument':
        case 'DOMNodeRemovedFromDocument':
        case 'DOMSubtreeModified':

            return TP.DOM_MUTATION_EVENT_PROPERTIES;

        default:

            return TP.DOM_EVENT_PROPERTIES;
    }

    return;
});

//  ------------------------------------------------------------------------
//  COMMON EVENT PROPERTIES
//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetTarget',
function(anEvent) {

    /**
     * @name eventGetTarget
     * @synopsis Returns the object targeted by the event.
     * @param {Event} anEvent The native event.
     * @returns {Object} The targeted object, usually an element node.
     */

    var evt;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    return TP.ifInvalid(evt.$$target, evt.target);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetTargetDocument',
function(anEvent) {

    /**
     * @name eventGetTargetDocument
     * @synopsis Returns the document targeted by the event (if the target is an
     *     element).
     * @param {Event} anEvent The native event.
     * @returns {Document} The document of the targeted element.
     */

    var target;

    if (TP.isElement(target = TP.eventGetTarget(anEvent))) {
        return TP.nodeGetDocument(target);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetTime',
function(anEvent) {

    /**
     * @name eventGetTime
     * @synopsis Returns the event time (the time the event was created in
     *     milliseconds).
     * @param {Event} anEvent The native event.
     * @returns {Number} The creation time for the event (in milliseconds since
     *     1970-01-01T00:00:00).
     */

    var evt,
        timeVal;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    timeVal = TP.ifInvalid(evt.$$timestamp, evt.timeStamp);

    if (TP.isNumber(timeVal)) {
        return timeVal;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetType',
function(anEvent) {

    /**
     * @name eventGetType
     * @synopsis Returns the event type (keydown, mouseover, etc) for the event.
     * @param {Event} anEvent The native event.
     * @returns {String} The standard event type name for the event.
     */

    var evt;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    return TP.ifInvalid(evt.$$type, evt.type);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetWindow',
function(anEvent) {

    /**
     * @name eventGetWindow
     * @synopsis Returns the window object targeted by the event.
     * @param {Event} anEvent The native event.
     * @returns {Window} The native window the event targeted.
     */

    var evt;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    return TP.ifInvalid(evt.$$view, evt.view);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventResolveTarget',
function(anEvent) {

    /**
     * @name eventResolveTarget
     * @synopsis Returns a 'proper target' for the supplied Event object.
     *     discussion This method takes a number of factors into account when
     *     computing the target element for the supplied Event: - Whether the
     *     native target is a Document - Whether the native target or any of its
     *     ancestors are disabled. - Whether the native target or any of its
     *     ancestors have a 'tibet:captures' attribute that allows them to
     *     capture a particular signal and therefore designates them as the
     *     'proper target'.
     * @param {Event} anEvent The event to resolve the target of.
     * @raises TP.sig.InvalidEvent
     * @returns {The} proper target for the supplied Event object.
     */

    var target,
        element,
        signal,
        ancestor,
        attr;

    if (!TP.isEvent(anEvent)) {
        return TP.raise(this, 'TP.sig.InvalidEvent', arguments);
    }

    target = TP.eventGetTarget(anEvent);

    //  Sometimes IE will return a target that is not a Node. Can't go any
    //  further if that happens.
    if (!TP.isNode(target)) {
        return null;
    }

    //  If the event target is a Document node, then just return that, since
    //  no traversal makes sense.
    if (target.nodeType === Node.DOCUMENT_NODE) {
        return target;
    } else if (TP.isTextNode(target)) {
        //  text nodes aren't useful targets but some browsers like to
        //  report them as the target/srcElement (even when they're not
        //  really an element). We adjust for that here.
        target = TP.ifInvalid(target.parentNode, target);
    }

    //  we'll search for capturing on the TIBET name for the event
    signal = TP.DOM_SIGNAL_TYPE_MAP.at(TP.eventGetType(anEvent));
    if (TP.notValid(signal)) {
        return target;
    }

    //  Starting at the target, traverse up the parent chain to the
    //  Document node (or the nearest DocumentFragment node).
    ancestor = target;

    while (ancestor &&
            (ancestor.nodeType !== Node.DOCUMENT_NODE) &&
            (ancestor.nodeType !== Node.DOCUMENT_FRAGMENT_NODE)) {
        //  Make sure to skip over Node.TEXT_NODE nodes.
        if (!TP.isElement(ancestor)) {
            ancestor = ancestor.parentNode;
            continue;
        }

        //  If the element at this level is 'disabled', then nothing we do
        //  here matters, so we bail out returning null.
        if (TP.elementHasAttribute(ancestor, 'tibet:disabled', true)) {
            return null;
        }

        //  unless we found a capturing container we keep searching until we
        //  run out of options or run into a disabled element.
        if (TP.notValid(element)) {
            if (TP.elementHasAttribute(ancestor, 'tibet:captures', true)) {
                attr = TP.elementGetAttribute(ancestor,
                                                'tibet:captures',
                                                true);
                if (attr.indexOf(signal) !== TP.NOT_FOUND) {
                    //  set element to the ancestor, but NOTE NO BREAK here
                    //  so the iteration will continue up the tree until
                    //  we're sure we're not under a disabled element.
                    element = ancestor;
                }
            }
        }

        //  Notice how we do *not* break out of this loop so that if any
        //  parent is disabled, we will still return null
        ancestor = ancestor.parentNode;
    }

    //  If we couldn't find a return element, then go ahead and return the
    //  'original' (unless it was a Node.TEXT_NODE) event target, since we
    //  couldn't find any elements that had the attribute we were searching
    //  for. This allows a nice defaulting behavior when we're in a page
    //  (or DOM section) that's not using the 'tibet:captures' attribute and
    //  doesn't care.
    return element || target;
});

//  ------------------------------------------------------------------------
//  KEYBOARD EVENT PROPERTIES
//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetAltKey',
function(anEvent) {

    /**
     * @name eventGetAltKey
     * @synopsis Returns true if the event included the Alt key or has had the
     *     Alt key simulated.
     * @param {Event} anEvent The native event.
     * @returns {Boolean} True if the event included the Alt key.
     */

    var evt;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    return TP.ifInvalid(evt.$$altKey, evt.altKey);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetKeyCode',
function(anEvent) {

    /**
     * @name eventGetKeyCode
     * @synopsis Returns the key code for the event after ensuring that it has
     *     been adjusted for cross-browser issues (generally, TIBET normalizes
     *     to the key code sent on 'key down').
     * @description In general, you should not use key codes, but instead use
     *     the 'getEventVirtualKey()' method of the TP.core.Keyboard type and
     *     test the result of that method against one of the key identifier
     *     names defined by the W3C (i.e. 'Enter' or 'Spacebar').
     * @param {Event} anEvent The native event.
     * @returns {Number} The key code for the event.
     */

    var evt;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we ONLY report the '$$' property - it's adjusted by TIBET
    //  to account for cross-browser issues.
    return evt.$$keyCode;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetCtrlKey',
function(anEvent) {

    /**
     * @name eventGetCtrlKey
     * @synopsis Returns true if the event included the Ctrl key or has had the
     *     Ctrl key simulated.
     * @param {Event} anEvent The native event.
     * @returns {Boolean} True if the event included the Ctrl key.
     */

    var evt;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    return TP.ifInvalid(evt.$$ctrlKey, evt.ctrlKey);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetMetaKey',
function(anEvent) {

    /**
     * @name eventGetMetaKey
     * @synopsis Returns true if the event included the Meta key or has had the
     *     Meta key simulated.
     * @param {Event} anEvent The native event.
     * @returns {Boolean} True if the event included the Meta key.
     */

    var evt;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    return TP.ifInvalid(evt.$$metaKey, evt.metaKey);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetShiftKey',
function(anEvent) {

    /**
     * @name eventGetShiftKey
     * @synopsis Returns true if the event included the Shift key or has had the
     *     Shift key simulated.
     * @param {Event} anEvent The native event.
     * @returns {Boolean} True if the event included the Shift key.
     */

    var evt;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    return TP.ifInvalid(evt.$$shiftKey, evt.shiftKey);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetUnicodeCharCode',
function(anEvent) {

    /**
     * @name eventGetUnicodeCharCode
     * @synopsis Returns the Unicode character code for the supplied event.
     * @description In general, you should not use Unicode character codes, but
     *     instead use the 'getEventVirtualKey()' method of the TP.core.Keyboard
     *     type and test the result of that method against one of the key
     *     identifier names defined by the W3C (i.e. 'Enter' or 'Spacebar').
     *     However, there are times when the W3C hasn't defined a virtual key
     *     name, so the Unicode character code can be useful. Note that this
     *     method will report these in the following format: 'U0062' (i.e. the
     *     'b' key).
     * @param {Event} anEvent The native event.
     * @returns {String} The Unicode character code for the event.
     */

    var evt,
        retVal;

    evt = TP.eventNormalize(anEvent);

    //  If the Unicode character value hasn't been populated by the
    //  TP.core.Keyboard type, then try to derive it by converting the key code.
    if (TP.notValid(retVal = evt.$unicodeCharCode)) {
        if (!TP.isString(retVal = String.fromCharCode(
                                            TP.eventGetKeyCode(evt)))) {
            return null;
        }

        //  Get the code as a 'Unicode literal' and replace the '\u' with 'U'.
        retVal = retVal.asUnicodeLiteral().replace('\\u', 'U');
    }

    return retVal;
});

//  ------------------------------------------------------------------------
//  MOUSE EVENT PROPERTIES
//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetButton',
function(anEvent) {

    /**
     * @name eventGetButton
     * @synopsis Returns the button code for the supplied event, which is one of
     *     the following constants: TP.LEFT, TP.MIDDLE, or TP.RIGHT.
     * @param {Event} anEvent The event object to extract the button code from.
     * @returns {String} The button code extracted from the supplied Event
     *     object.
     */

    var evt,
        button;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    button = TP.ifInvalid(evt.$$button, evt.button);

    switch (button) {
        case 0:
            if (!TP.boot.isUA('IE')) {
                return TP.LEFT;
            }

            break;

        case 1:
            if (TP.boot.isUA('IE')) {
                return TP.LEFT;
            } else {
                return TP.MIDDLE;
            }

            break;

        case 2:
            return TP.RIGHT;

        case 4:
            if (TP.boot.isUA('IE')) {
                return TP.MIDDLE;
            }
            break;

        default:
            break;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetClientXY',
function(anEvent) {

    /**
     * @name eventGetClientXY
     * @synopsis Returns the window X,Y coordinate pair for the event.
     * @param {Event} anEvent The native event.
     * @returns {Array} An array of (window X, window Y).
     * @todo
     */

    var evt,
        coord;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    coord = TP.ac(TP.ifInvalid(evt.$$clientX, evt.clientX),
                    TP.ifInvalid(evt.$$clientY, evt.clientY));

    return coord;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetOffsetXY',
function(anEvent) {

    /**
     * @name eventGetOffsetXY
     * @synopsis Returns the containing element X,Y coordinate pair for the
     *     event.
     * @param {Event} anEvent The native event.
     * @returns {Array} An array of (containing element X, containing element
     *     Y).
     * @todo
     */

    var evt,
        coord;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    coord = TP.ac(TP.ifInvalid(evt.$$offsetX, evt.offsetX),
                    TP.ifInvalid(evt.$$offsetY, evt.offsetY));

    return coord;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetPageXY',
function(anEvent) {

    /**
     * @name eventGetPageXY
     * @synopsis Returns the document X,Y coordinate pair for the event. This
     *     allows all events to be tracked relative to a common origin.
     * @param {Event} anEvent The native event.
     * @returns {Array} An array of (document X, document Y).
     * @todo
     */

    var evt,
        coord;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    coord = TP.ac(TP.ifInvalid(evt.$$pageX, evt.pageX),
                    TP.ifInvalid(evt.$$pageY, evt.pageY));

    return coord;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetRelatedTarget',
function(anEvent) {

    /**
     * @name eventGetRelatedTarget
     * @synopsis Returns the 'related target', the last element the event was
     *     over. NOTE that this is typically only relevant for the mouse events
     *     mouseover and mouseout.
     * @param {Event} anEvent The native event to query.
     * @returns {Element} The last element the mouse was over.
     */

    var evt;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    return TP.ifInvalid(evt.$$relatedTarget, evt.relatedTarget);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetResolvedTarget',
function(anEvent) {

    /**
     * @name eventGetResolvedTarget
     * @synopsis Returns the 'resolved target', the element that was resolved
     *     using the 'resolvedTarget' getter instrumented onto Event.prototype
     *     in the hook file. That getter method uses TP.eventResolveTarget().
     *     See that method for more information.
     * @param {Event} anEvent The native event to query.
     * @returns {Element} The 'resolved target' of the event.
     */

    var evt;

    evt = TP.eventNormalize(anEvent);

    //  Note that we don't have a '$$' property for this property
    return TP.ifInvalid(evt.resolvedTarget);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetWheelDelta',
function(anEvent) {

    /**
     * @name eventGetWheelDelta
     * @synopsis Returns the wheel delta value from the event provided. The
     *     event should have been either a DOMMouseScroll or mousewheel event
     *     depending on the platform in question.
     * @param {Event} anEvent The native mouse event.
     * @returns {Number} The delta. Positive is down, negative is up.
     */

    var evt;

    evt = TP.eventNormalize(anEvent);

    //  Note here how we give the '$$' property precedence.
    return TP.ifInvalid(evt.$$wheelDelta, evt.wheelDelta);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventSetType',
function(anEvent, aType) {

    /**
     * @name eventSetType
     * @synopsis Sets the 'event type'. This allows the underlying event type to
     *     be set to one of TIBET's 'fake event' types.
     * @param {Event} anEvent The native event.
     * @param {String} aType An event type.
     * @todo
     */

    var evt;

    evt = TP.eventNormalize(anEvent);
    evt.$$type = aType;

    return;
});

//  ------------------------------------------------------------------------
//  EVENT TESTING
//  ------------------------------------------------------------------------

TP.definePrimitive('eventIsDuplicate',
function(eventOne, eventTwo) {

    /**
     * @name eventIsDuplicate
     * @synopsis Returns true if the two events appear to be duplicates. This
     *     test takes into account not only the native event slots but any slots
     *     which TIBET may have placed on the event.
     * @param {Event} eventOne The first event to compare.
     * @param {Event} eventTwo The second event to compare.
     * @returns {Boolean} True when the events have common property values.
     * @todo
     */

    var type,
        evOne,
        evTwo,

        list,
        len,
        i,
        key;

    //  need real events to compare, otherwise presume false
    if (TP.notValid(eventOne) || TP.notValid(eventTwo)) {
        return false;
    }

    //  allow for signals wrapping events to be passed here as well
    evOne = TP.isEvent(eventOne) ? eventOne : eventOne.get('event');
    evTwo = TP.isEvent(eventTwo) ? eventTwo : eventTwo.get('event');

    //  still need two event objects to compare, if not presume false
    if (!TP.isEvent(evOne) || !TP.isEvent(evTwo)) {
        return false;
    }

    //  event types obviously have to match so that's a good first test
    type = evOne.type;
    if (type !== evTwo.type) {
        return false;
    }

    //  what we compare next depends on the nature of the event and what
    //  data is relevant
    switch (type) {
        case 'keypress':
        case 'keydown':
        case 'keyup':
            return evOne.keyCode === evTwo.keyCode &&
                    evOne.charCode === evTwo.charCode &&
                    evOne.which === evTwo.which &&
                    evOne.shiftKey === evTwo.shiftKey &&
                    evOne.ctrlKey === evTwo.ctrlKey &&
                    evOne.altKey === evTwo.altKey &&
                    evOne.metaKey === evTwo.metaKey;

        default:

            //  first confirm standard properties match up
            list = TP.eventGetPropertyKeys(evOne);

            len = list.getSize();

            for (i = 0; i < len; i++) {
                key = list[i];
                if (evOne[key] !== evTwo[key]) {
                    return false;
                }
            }

            //  make sure any TIBET property overrides also match
            list = TP.TIBET_EVENT_PROPERTIES;
            len = list.getSize();

            for (i = 0; i < len; i++) {
                key = list[i];
                if (evOne[key] !== evTwo[key]) {
                    return false;
                }
            }

            return true;
    }
});

//  ------------------------------------------------------------------------
//  EVENT DISPATCHING
//  ------------------------------------------------------------------------

/*
Support routines around DOM events and the extensions TIBET makes to handle
keyboard events more effectively.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('dispatch',
function(anOrigin, aSignal, anElement, anEventOrHash, aPolicy,
isCancelable, isBubbling        ) {

    /**
     * @name dispatch
     * @synopsis Signals an event, typically one originating from a UI or DOM
     *     element.
     * @param {Object|String} anOrigin An origin or ID to signal from. Often
     *     null in the UI which means the context or event data will be used to
     *     acquire an ID to signal from.
     * @param {String|TP.sig.Signal} aSignal The signal or signal name to
     *     signal, again often null so it defaults to the signal type matching
     *     the event name.
     * @param {Element} anElement Usually set to 'this' in an on* method to
     *     provide the originating context object.
     * @param {Event|TP.lang.Hash} anEventOrHash The native Event object or
     *     other signal args in a hash.
     * @param {Object} aPolicy A standard signal policy name or definition.
     *     Defaults to TP.INHERITANCE_FIRING unless the signal has a default
     *     firing policy.
     * @param {Boolean} isCancelable Optional boolean for whether the signal is
     *     cancelable.
     * @param {Boolean} isBubbling Optional flag for whether this signal should
     *     bubble.
     * @returns {TP.sig.Signal} The signal instance used.
     * @todo
     */

    var argsOrEvent,

        localID,
        globalID,

        origin,

        signame,
        typename,

        policy,
        type,
        defaultType,
        context,

        thrownSignal;

    TP.debug('break.signal_dispatch');

    //  copy of the args we can manipulate as needed
    argsOrEvent = anEventOrHash;

    //  origin can be provided or null, in which case we look to see if we
    //  got an element that can provide the origin data
    if (TP.isEmpty(anOrigin)) {
        if (TP.isElement(anElement)) {
            localID = TP.lid(anElement, true);
            globalID = TP.gid(anElement);
        }
    } else if (TP.isElement(anOrigin)) {
        //  we'll force IDs onto elements when they don't have them
        localID = TP.lid(anOrigin, true);
        globalID = TP.gid(anOrigin);
    } else if (!TP.isString(anOrigin)) {
        localID = TP.lid(anOrigin);
        globalID = TP.gid(anOrigin);
    } else {
        if (TP.regex.ELEMENT_ID.test(anOrigin)) {
            localID = anOrigin.slice(anOrigin.lastIndexOf('#') + 1);
        } else {
            localID = anOrigin;
        }

        globalID = anOrigin;
    }

    //  for tibet purposes we always want to use fullname origins to ensure
    //  proper lookups that can cross frame references
    origin = globalID;

    //  the signal can be provided as a String or as a TP.sig.Signal or can
    //  be null, in which case we default to the UI signal name which maps
    //  to the event type provided
    if (TP.notValid(aSignal) && TP.isEvent(argsOrEvent)) {
        //  not provided - use the native event to look up a signal name
        signame = TP.DOM_SIGNAL_TYPE_MAP.at(argsOrEvent.type);
    } else if (TP.isString(aSignal)) {
        //  it's a String - if it's a real signal type, make sure its the
        //  'full signal name'. Otherwise, if its a spoofed signal, leave it
        //  alone
        if (TP.notEmpty(typename = TP.expandSignalName(aSignal)) &&
            TP.isType(TP.sys.require(typename))) {
            signame = typename;
        } else {
            signame = aSignal;
        }
    } else if (TP.isKindOf(aSignal, TP.sig.Signal)) {
        //  it's a TP.sig.Signal
        signame = aSignal.getSignalName();
    } else {
        //  Couldn't compute a name
        //  TODO: Raise an exception?
        return null;
    }

    //  default the policy based on some simple checks
    if (TP.notValid(policy = aPolicy)) {
        if (TP.isString(signame)) {
            if (TP.isType(type = TP.sys.getTypeByName(signame))) {
                policy = type.getDefaultPolicy();
            } else {
                //  semantic events tend to be more focused and we treat
                //  those as inheritance-based signals
                policy = TP.INHERITANCE_FIRING;
            }
        } else {
            //  no signame, so origins are what is interesting
            policy = TP.DOM_FIRING;
        }
    }

    //  try to make sure we use the right dispatch context
    if (TP.isElement(anElement)) {
        context = TP.nodeGetWindow(anElement);
    }

    if (TP.notValid(context)) {
        context = TP.ifInvalid(
                        TP.sys.getWindowById(TP.sys.getUICanvasName()),
                        window);
    }

    //  If its a native event we ensure that we handle any low-level UI
    //  hooks. To do this we take our computed data to this point and use it
    //  with the low-level TP.boot.$$dispatch() call
    if (TP.isEvent(argsOrEvent)) {
        context.TP.boot.$$dispatch(anOrigin, signame, anElement,
                                    anEventOrHash, aPolicy, false);
    }

    //  If we're going to be doing DOM firing we need to get the origin
    //  converted into an origin set for the DOM "V". we'll also want to
    //  ensure we tell the notification system to use TP.sig.DOMSignal so we
    //  get proper capture/bubble resolution.
    if ((policy === TP.DOM_FIRING) && TP.isElement(anElement)) {
        //  The return value of TP.elementGetEventIds() is configured to
        //  return an origin set.
        origin = TP.elementGetEventIds(anElement);

        defaultType = 'TP.sig.DOMSignal';
    }

    //  next we try to configure the argument data as much as possible to
    //  pass data about the event along
    if (TP.notValid(argsOrEvent)) {
        argsOrEvent = TP.hc();
    }

    //  place the current event data where it can be found on either the
    //  args or event, depending on what we got handed (or we created).
    if (TP.canInvoke(argsOrEvent, 'atPut')) {
        argsOrEvent.atPut('elementGlobalID', globalID);
        argsOrEvent.atPut('elementLocalID', localID);
        argsOrEvent.atPut('tibetTarget', anElement);

        //  Use the 'TIBET shadow version' of the W3C compliant property
        //  here.
        argsOrEvent.atPut('$$view', context);
    } else {
        //  if not a collection, we can still place slots on in some cases,
        //  but we have to trap any exceptions here
        try {
            argsOrEvent.elementGlobalID = globalID;
            argsOrEvent.elementLocalID = localID;
            argsOrEvent.tibetTarget = anElement;

            //  Use the 'TIBET shadow version' of the W3C compliant property
            //  here.
            argsOrEvent.$$view = context;
        } catch (e) {
        }
    }

    //  dispatch the signal and hold on to the returned signal instance so
    //  we can manage our return value properly

    //  Note that if the supplied signal was a TP.sig.Signal, we pass that
    //  along here - otherwise we pass the signal name we computed earlier.
    thrownSignal = TP.signal(
                    origin,
                    TP.isKindOf(aSignal, TP.sig.Signal) ? aSignal : signame,
                    arguments,
                    argsOrEvent,
                    policy,
                    defaultType,
                    isCancelable,
                    isBubbling);

    return thrownSignal;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$dispatchEventToTIBET',
function(nativeEvt) {

    /**
     * @name $dispatchEventToTIBET
     * @synopsis The handler that all elements instrumented to fire events are
     *     instrumented with. NOTE that you typically don't need to arm
     *     elements, TIBET handles most things automatically.
     * @description This handler performs the following steps: 1) Processes the
     *     native event data into an object hash, registering it under commonly
     *     known keys that TIBET is expecting. 2) Computes the parent ID array
     *     for the element, if it isn't already available on the element and
     *     caches its value on the element for future use. 3) Computes the
     *     absolute path ID array for the element, if it isn't already available
     *     on the element and caches its value on the element for future use. 4)
     *     Calls the TIBET signaling framework, using the UISignal name that was
     *     mapped to the native event name, a null context, the TP.DOM_FIRING
     *     policy (to get DOM Level 2-like capturing / bubbling behavior), and
     *     the object hash containing the information extracted from the native
     *     event.
     * @param {The} nativeEvt 'native' event that just got fired from the
     *     browser.
     * @raises TP.sig.InvalidEvent
     */

    //  used for defining the event name and default supertype,
    //  particularly for DOM keyboard events
    var eventName,
        eventSuper,

        evtInfo,

        sourceElement,
        sourceWindow,

        currentElement,
        localID,
        globalID,

        fullTargetArray,

        thrownSignal,
        firingPolicy;

    if (!TP.isEvent(nativeEvt)) {
        return TP.raise(this, 'TP.sig.InvalidEvent', arguments);
    }

    //  Get the native event's target
    sourceElement = nativeEvt.target;

    //  Get the source element's window
    sourceWindow = TP.nodeGetWindow(sourceElement);

    //  define the base event name we'll be signaling. this will be
    //  something like DOMKeyPress etc.
    eventName = TP.DOM_SIGNAL_TYPE_MAP.at(nativeEvt.type);

    //  key and mouse events are routed directly to their respective device
    //  objects in the rare occasions when this handler is triggered.
    if (nativeEvt.type.indexOf('key') === 0) {
        return TP.sys.getTypeByName('TP.core.Keyboard').$$handleKeyEvent(
                                                                nativeEvt);
    } else if (nativeEvt.type.indexOf('mouse') === 0) {
        return TP.sys.getTypeByName('TP.core.Mouse').$$handleMouseEvent(
                                                                nativeEvt);
    }

    //  cancel the native browser event handling here, because TIBET is
    //  going to do all bubbling/capturing from here
    TP.eventStopPropagation(nativeEvt);

    //  If the nodeType of the source element is a Node.TEXT_NODE node, then
    //  it won't have an id and its parent should be treated as an opaque
    //  node. Therefore, if it has a parent node, set the source element to
    //  be that.
    if (TP.isTextNode(sourceElement)) {
        if (TP.notValid(sourceElement = sourceElement.parentNode)) {
            sourceElement = sourceWindow.document;
        }
    }

    //  Get the element that we're currently processing event handlers for.
    currentElement = nativeEvt.currentTarget;

    //  If the sourceElement doesn't have an id and its not the document,
    //  then we use the current element as the source element. E.g. Assume
    //  that a 'tr' has been instrumented for 'mousedown' events, but a
    //  mousedown has occurred in a 'td' (which does not have an id). The
    //  sourceElement is the 'td'. The event has bubbled up to the 'tr'
    //  (which does have an id). The currentElement is the 'tr'. Since the
    //  'td' doesn't have an id, we can't use it as the origin of the
    //  signal. Therefore, we treat the 'tr' as an 'opaque node' and signal
    //  as if the event came from the 'tr'.
    if (TP.isEmpty(sourceElement.id) &&
        (sourceElement !== sourceWindow.document)) {
        sourceElement = currentElement;
    }

    if (TP.boot.isUA('IE')) {
        //  If the object that has the handler (the 'this' object) is
        //  window's document and the source of the event is not the
        //  document's body, then that means it was a bubbled event. If it's
        //  not one of the events that we install on all elements, then that
        //  means that this handler is one on the document that was not
        //  meant to be a catch all (it was placed as an individual handler
        //  on document) and IE automatically bubbled the event here. In any
        //  case, we don't want it.
        if ((currentElement === sourceWindow.document) &&
            (sourceElement !== TP.documentGetBody(sourceWindow.document)) &&
            (!sourceWindow.$$allElementEvents.containsString(
                                TP.DOM_SIGNAL_TYPE_MAP.at(nativeEvt.type)))) {
            return;
        }
    }

    //  Looks like we're going to signal it so we need names
    localID = TP.lid(sourceElement, true);
    globalID = TP.gid(sourceElement, true);

    evtInfo = TP.eventNormalize(nativeEvt);

    try {
        evtInfo.elementGlobalID = globalID;
        evtInfo.elementLocalID = localID;
        evtInfo.tibetTarget = sourceElement;
    } catch (e) {
    }

    //  If we have a valid firing policy, use that policy to fire the signal
    if ((TP.isValid(firingPolicy = sourceElement.firingPolicy)) &&
        (firingPolicy !== TP.DOM_FIRING)) {
        TP.ifTrace(TP.sys.shouldLogSignals()) ?
            TP.trace('Sending ' + eventName +
                        ' to TIBET with supertype ' + eventSuper,
                        TP.SIGNAL_LOG, arguments) : 0;

        //  Its not TP.DOM_FIRING, so we send the globalID only
        thrownSignal = TP.signal(globalID,
                                    eventName,
                                    null,
                                    evtInfo,
                                    sourceElement.firingPolicy,
                                    eventSuper);
    } else {
        TP.ifTrace(TP.sys.shouldLogSignals()) ?
            TP.trace('Sending ' + eventName +
                        ' to TIBET with supertype ' + eventSuper,
                        TP.SIGNAL_LOG, arguments) : 0;

        //  It is TP.DOM_FIRING, so we send the list of IDs
        fullTargetArray = TP.elementGetEventIds(sourceElement);

        thrownSignal = TP.signal(fullTargetArray,
                                    eventName,
                                    null,
                                    evtInfo,
                                    TP.DOM_FIRING,
                                    eventSuper);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$handleFocus',
function(anEvent) {

    /**
     * @name $$handleFocus
     * @synopsis Document-level focus handler, installed by tibet_hook and
     *     leveraged by IE event wrapper code to ensure capture semantics are
     *     preserved even on IE.
     * @param {Event} anEvent The native event object.
     */

    return TP.$$handleNonKeyOrMouseEvent(anEvent);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$handleBlur',
function(anEvent) {

    /**
     * @name $$handleBlur
     * @synopsis Document-level blur handler, installed by tibet_hook and
     *     leveraged by IE event wrapper code to ensure capture semantics are
     *     preserved even on IE.
     * @param {Event} anEvent The native event object.
     */

    return TP.$$handleNonKeyOrMouseEvent(anEvent);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$handleChange',
function(anEvent) {

    /**
     * @name $$handleChange
     * @synopsis Document-level change handler, installed by tibet_hook and
     *     leveraged by IE event wrapper code to ensure capture semantics are
     *     preserved even on IE.
     * @param {Event} anEvent The native event object.
     */

    return TP.$$handleNonKeyOrMouseEvent(anEvent);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$handleCut',
function(anEvent) {

    /**
     * @name $$handleCut
     * @synopsis Document-level cut handler, installed by tibet_hook and
     *     leveraged by IE event wrapper code to ensure capture semantics are
     *     preserved even on IE.
     * @param {Event} anEvent The native event object.
     */

    return TP.$$handleNonKeyOrMouseEvent(anEvent);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$handleCopy',
function(anEvent) {

    /**
     * @name $$handleCopy
     * @synopsis Document-level copy handler, installed by tibet_hook and
     *     leveraged by IE event wrapper code to ensure capture semantics are
     *     preserved even on IE.
     * @param {Event} anEvent The native event object.
     */

    return TP.$$handleNonKeyOrMouseEvent(anEvent);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$handlePaste',
function(anEvent) {

    /**
     * @name $$handlePaste
     * @synopsis Document-level paste handler, installed by tibet_hook and
     *     leveraged by IE event wrapper code to ensure capture semantics are
     *     preserved even on IE.
     * @param {Event} anEvent The native event object.
     */

    return TP.$$handleNonKeyOrMouseEvent(anEvent);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$handleNonKeyOrMouseEvent',
function(anEvent) {

    /**
     * @name $$handleNonKeyOrMouseEvent
     * @synopsis Handles a 'non keyboard or mouse' native event by signaling it
     *     both along the responder chain for UI* signals and dispatching it
     *     along the DOM 'V' for DOM* signals.
     * @param {Event} anEvent The native event object.
     */

    var targetElem,

        fname,
        elemType;

    if (anEvent.$captured) {
        return;
    }
    anEvent.$captured = true;

    //  Get a resolved event target, given the event. This takes into
    //  account disabled elements and will look for a target element
    //  with the appropriate 'enabling attribute', if possible.
    if (TP.isElement(targetElem = TP.eventGetResolvedTarget(anEvent))) {
        fname = 'handlePeer' + TP.escapeTypeName(
                                TP.DOM_SIGNAL_TYPE_MAP.at(
                                        TP.eventGetType(anEvent)));

        elemType = TP.wrap(targetElem).getType();

        //  Message the type for the element that is 'responsible' for this
        //  event. It's native control sent this event and we need to let
        //  the type know about it.
        if (TP.canInvoke(elemType, fname)) {
            elemType[fname](targetElem, anEvent);
        }

        //  If the native event was prevented, then we should just bail out
        //  here.
        //  NB: 'defaultPrevented' is a DOM Level 3 property, which seems to
        //  be well supported on TIBET's target browser environments.
        if (anEvent.defaultPrevented === true) {
            return;
        }

        //  Dispatch the signal
        TP.dispatch(
                null,   //  'V' will be computed from targetElem
                TP.DOM_SIGNAL_TYPE_MAP.at(TP.eventGetType(anEvent)),
                targetElem,
                anEvent,
                TP.DOM_FIRING);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetEventIds',
function(anElement, invalidateIdCache) {

    /**
     * @name elementGetEventIds
     * @synopsis Returns the event ids (signal origins used to signal DOM
     *     events) for anElement. The event ids are computed by walking up the
     *     DOM tree, appending each element's global ID to the list of event
     *     ids. A global ID is the dot-separated name of the element from
     *     top-most parent down.
     * @param {Element} anElement The Element node to get the event ids for.
     * @param {Boolean} invalidateIdCache Whether or not to invalidate any
     *     'cached' ids that were computed previously.
     * @raises TP.sig.InvalidElement
     * @returns {Array} An array containing the event ids of the element.
     * @todo
     */

    var eventIdArray,

        theElement,
        elementDoc,

        localID,

        elementWin;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.notValid(eventIdArray = anElement.eventIds) ||
            TP.isTrue(invalidateIdCache)) {
        eventIdArray = TP.ac();

        //  NB: The first element in the array will be the element itself.
        theElement = anElement;

        elementDoc = TP.nodeGetDocument(theElement);

        //  Traverse up our parent chain
        while (TP.isElement(theElement)) {
            //  without an ID we can't have been a target or observer so we
            //  can't be part of the DOM tree that matters
            if ((theElement !== elementDoc) &&
                TP.isEmpty(TP.elementGetAttribute(theElement, 'id'))) {
                theElement = theElement.parentNode;
                continue;
            }

            localID = TP.lid(theElement);

            //  The local ID must not be null or the empty string, in
            //  order to be part of a valid event id path for this element.
            //  A blank name in the array will do us no good.
            if (TP.notEmpty(localID)) {
                //  Add the element's ID by registering it's full
                //  name.
                eventIdArray.push(TP.gid(theElement));
            }

            if ((theElement === elementDoc) &&
                (TP.isWindow(elementWin = TP.nodeGetWindow(elementDoc)))) {
                //  If the window is an iframe's window, then set theElement
                //  to be that iframe element, effectively 'jumping out of
                //  the window', so to speak :-).
                if (TP.isIFrameWindow(elementWin)) {
                    eventIdArray.push(TP.gid(elementWin));
                    theElement = elementWin.frameElement;
                    elementDoc = TP.nodeGetDocument(theElement);

                    //  Continue so that we process the frame element and
                    //  don't skip it below.
                    continue;
                } else {
                    break;
                }
            }

            //  Get the parent node for the element and loop again.
            theElement = theElement.parentNode;
        }

        //  The looping will have terminated at a 'document' node.
        //  See if that document has a window and if it does, append
        //  its global ID to the end of the event ids.
        elementWin = TP.nodeGetWindow(elementDoc);
        if (TP.isElement(elementWin)) {
            eventIdArray.push(TP.gid(elementWin));
        }

        //  We built this from the inside-out, but the TP.DOM_FIRING policy
        //  in the notification system likes to see it from the outside-in
        //  (because it will process 'capturing' event handlers first), so
        //  we reverse it here (once, before we cache it).
        eventIdArray.reverse();

        //  Make sure to configure it as an origin set.
        eventIdArray.isOriginSet(true);

        //  Cache the eventIdArray on anElement
        anElement.eventIds = eventIdArray;
    }

    return eventIdArray;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowArmListeners',
function(aWindow, aDocumentNode) {

    /**
     * @name windowArmListeners
     * @synopsis Arms all the elements associated with listener elements in the
     *     node provided. Note that we only need to arm listeners that have 'UI'
     *     signal types.
     * @param {Window} aWindow The window that should do the arming.
     * @param {XMLDocument} aDocumentNode The node containing listener elements.
     * @raises TP.sig.InvalidWindow,TP.sig.InvalidDocument
     * @returns {Number} The count of listeners armed.
     * @todo
     */

    var listeners,
        listener,
        i,
        origins,
        count,
        origin;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (!TP.isDocument(aDocumentNode)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  NB: We only get listeners from the document that have an
    //  'event' attribute whose value starts with 'UI'. This is
    //  because we only need to arm listeners for UISignals. Many
    //  other listeners may be in the document that have signal
    //  names that are non-native 'fake' events (i.e. they don't
    //  really exist in the browser, but are used by TIBET).
    listeners = TP.nodeEvaluateXPath(
                aDocumentNode,
                '//tibet_listener[starts-with(@event, "UI")]',
                TP.NODESET);

    count = 0;
    for (i = 0; i < listeners.length; i++) {
        listener = listeners[i];

        TP.windowArmNode(
                    aWindow,
                    TP.elementGetAttribute(listener, 'local_origin'),
                    TP.elementGetAttribute(listener, 'event'));
        count++;

        origin = TP.elementGetAttribute(listener, 'origin');
        if (TP.isString(origin)) {
            origins = origin.split('.');
            TP.windowArmNode(
                        aWindow,
                        origins[origins.length - 1],
                        TP.elementGetAttribute(listener, 'event'));
            count++;
        }
    }

    return count;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowArmNode',
function(aWindow, aNodeOrList, eventNames, aHandler, aPolicy) {

    /**
     * @name windowArmNode
     * @synopsis Arm the node, or list of nodes, so they will fire the events
     *     specified in the supplied set of event names.
     * @param {Window} aWindow The window that should do the arming.
     * @param {Node|String} aNodeOrList The node or list of nodes to arm with
     *     the event(s) specified. This can also be the TP.ANY constant,
     *     indicating that the event is to be observed coming from any node.
     * @param {String|Array} eventNames The names or types of the events to arm
     *     the element with.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler to be used instead of sending the event into the TIBET
     *     signaling system.
     * @param {Function} aPolicy An (optional) parameter that defines the
     *     "firing" policy.
     * @raises TP.sig.InvalidWindow,TP.sig.InvalidParameter
     * @todo
     */

    var i,
        len,
        it,
        element,
        elementNameArray,
        eventNameArray;

    TP.debug('break.signal_arm');

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (TP.notValid(aNodeOrList) || TP.isEmpty(eventNames)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    //  event name should be a string or array of strings...
    if (TP.isString(eventNames)) {
        eventNameArray = eventNames.split(' ');
    } else if (TP.isCollection(eventNames)) {
        eventNameArray = eventNames;
    } else {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments,
            'Event specification not a string or collection.');
    }

    //  Next, we have to make sure that the contents of our array
    //  of event names are indeed Strings. This call allows the
    //  caller to pass in a type or array of types. If the event
    //  aren't Strings, we convert them to the type names they
    //  represent.
    len = eventNameArray.getSize();
    for (i = 0; i < len; i++) {
        it = eventNameArray.at(i);

        if (!TP.isString(it)) {
            eventNameArray.atPut(i, it.getSignalName());
        }
    }

    //  wildcarded - we'll do them all
    if (aNodeOrList === TP.ANY) {
        TP.windowArmEvents(aWindow, eventNameArray, aHandler);
    } else if (TP.isDocument(aNodeOrList)) {
        TP.$windowArmNodeForEvents(aWindow,
                                    aNodeOrList,
                                    eventNameArray,
                                    aHandler,
                                    aPolicy);

        //  Nothing else to do. Bail out early.
        return;
    } else if (TP.isElement(aNodeOrList)) {
        TP.elementSetAttribute(aNodeOrList,
                                'tibet:armed',
                                'true',
                                true);
        TP.$windowArmNodeForEvents(aWindow,
                                    aNodeOrList,
                                    eventNameArray,
                                    aHandler,
                                    aPolicy);

        //  Nothing else to do. Bail out early.
        return;
    } else if (TP.isString(aNodeOrList)) {
        elementNameArray = aNodeOrList.split(' ');
    } else {
        //  should be a collection
        elementNameArray = aNodeOrList;
    }

    if (TP.isArray(elementNameArray)) {
        //  just in case it's a nodelist or other primitive array we'll
        //  iterate the old-fashioned way here
        for (i = 0; i < elementNameArray.length; i++) {
            element = TP.nodeGetElementById(aWindow.document,
                                            elementNameArray[i]);
            if (TP.isElement(element)) {
                TP.elementSetAttribute(element,
                                        'tibet:armed',
                                        'true',
                                        true);
                TP.$windowArmNodeForEvents(aWindow,
                                            element,
                                            eventNameArray,
                                            aHandler,
                                            aPolicy);
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$windowArmNodeForEvents',
function(aWindow, aNode, eventNameArray, aHandler, aPolicy) {

    /**
     * @name $windowArmNodeForEvents
     * @synopsis Arms the node to fire the events named in eventNameArray.
     * @param {Window} aWindow The window to process.
     * @param {Node} aNode The node to arm.
     * @param {Array} eventNameArray The array of event names to instrument
     *     aNode to fire.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler to be used instead of sending the event into the TIBET
     *     signaling system.
     * @param {Function} aPolicy An (optional) parameter that defines the
     *     "firing" policy.
     * @raises TP.sig.InvalidWindow,TP.sig.InvalidNode,TP.sig.InvalidArray
     * @todo
     */

    var targetElement,

        i,
        i2,
        len,
        len2,

        elementDoc,
        elementWin,
        elementLocalID,

        foundElements,
        moreElements,

        thePolicy,
        theHandler,

        wrapperHandler,

        element,
        eventName,
        nativeEventName;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
    }

    if (TP.isEmpty(eventNameArray)) {
        return TP.raise(this, 'TP.sig.InvalidArray', arguments);
    }

    if (TP.isDocument(aNode)) {
        targetElement = aNode.documentElement;
        elementDoc = aNode;
    } else {
        targetElement = aNode;
        elementDoc = TP.nodeGetDocument(aNode);
    }

    //  Grab the element's window and ID, forcing ID creation as needed
    elementWin = TP.nodeGetWindow(elementDoc);
    elementLocalID = TP.lid(targetElement, true);

    //  If the element is not a window and its not a document, then check to
    //  see if there are any more elements with the same name (as might be
    //  the case with radio buttons) and go ahead and grab them all.
    //  Otherwise, just add the element to the 'foundElements' array by
    //  itself.
    if (TP.notEmpty(moreElements = TP.nodeGetDescendantElementsByIdOrName(
                                                elementDoc,
                                                elementLocalID))) {
        foundElements = moreElements;
    } else {
        foundElements = TP.ac();
        foundElements.push(targetElement);
    }

    //  NB: The default for firing policies is TP.DOM_FIRING
    thePolicy = TP.ifInvalid(aPolicy, TP.DOM_FIRING);

    theHandler = TP.ifInvalid(aHandler, TP.$dispatchEventToTIBET);

    len = foundElements.getSize();
    for (i = 0; i < len; i++) {
        element = foundElements.at(i);

        len2 = eventNameArray.getSize();
        for (i2 = 0; i2 < len2; i2++) {
            eventName = eventNameArray.at(i2);
            nativeEventName = TP.eventNameNativeValue(eventName);

            //  Build a wrapper handle that will do some nice W3C
            //  translations for us.
            wrapperHandler =
                    function(anEvent) {

                        var evt;

                        evt = TP.eventNormalize(anEvent, aNode);

                        return theHandler(evt);
                    };
            theHandler.$$wrapper = wrapperHandler;

            if (TP.boot.isUA('IE')) {
                element.attachEvent('on' + nativeEventName,
                                    wrapperHandler);
            } else {
                element.addEventListener(nativeEventName,
                                            theHandler,
                                            false);
            }

            element.firingPolicy = thePolicy;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowDisarmNode',
function(aWindow, aNodeOrList, eventNames, aHandler) {

    /**
     * @name windowDisarmNode
     * @synopsis Disarm element anElement from firing the events specified in
     *     the supplied array.
     * @param {Window} aWindow The window whose nodes should be disarmed.
     * @param {Node|String} aNodeOrList The node or list to disarm with the
     *     event(s) specified. This can also be the TP.ANY constant, indicating
     *     that the event is to be ignored coming from any node.
     * @param {String|Array} eventNames The names or types of the events to
     *     disarm the element from.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler that was used instead of sending the event into the TIBET
     *     signaling system.
     * @raises TP.sig.InvalidWindow,TP.sig.InvalidParameter
     * @todo
     */

    var i,
        it,
        element,
        elementNameArray,
        eventNameArray;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (TP.notValid(aNodeOrList) || TP.isEmpty(eventNames)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    //  event name should be a string or array of strings...
    if (TP.isString(eventNames)) {
        eventNameArray = eventNames.split(' ');
    } else if (TP.isCollection(eventNames)) {
        eventNameArray = eventNames;
    } else {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments,
            'Event specification not a string or collection.');
    }

    //  Next, we have to make sure that the contents of our array
    //  of event names are indeed Strings. This call allows the
    //  caller to pass in a type or array of types. If the elements
    //  aren't Strings, we convert them to the type names they
    //  represent.
    for (i = 0; i < eventNameArray.getSize(); i++) {
        it = eventNameArray.at(i);

        if (!TP.isString(it)) {
            eventNameArray.atPut(i, it.getSignalName());
        }
    }

    //  wildcarded - we'll do them all
    if (aNodeOrList === TP.ANY) {
        TP.windowDisarmEvents(aWindow, eventNameArray, aHandler);

        //  Nothing else to do. Bail out early.
        return;
    } else if (TP.isNode(aNodeOrList)) {
        TP.$windowDisarmNodeForEvents(aWindow,
                                        aNodeOrList,
                                        eventNameArray,
                                        aHandler);

        //  Nothing else to do. Bail out early.
        return;
    } else if (TP.isString(aNodeOrList)) {
        elementNameArray = aNodeOrList.split(' ');
    } else {
        //  should be a collection
        elementNameArray = aNodeOrList;
    }

    //  just in case it's a nodelist or other primitive array we'll iterate
    //  the old-fashioned way here
    for (i = 0; i < elementNameArray.length; i++) {
        element = TP.nodeGetElementById(aWindow.document,
                                        elementNameArray[i]);
        if (TP.isElement(element)) {
            TP.$windowDisarmNodeForEvents(aWindow,
                                            element,
                                            eventNameArray,
                                            aHandler);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$windowDisarmNodeForEvents',
function(aWindow, aNode, eventNameArray, aHandler) {

    /**
     * @name $windowDisarmNodeForEvents
     * @synopsis Disarms the node so it will no longer fire the events named in
     *     eventNameArray.
     * @param {Window} aWindow The window to process.
     * @param {Node} aNode A document or element to disarm.
     * @param {Array} eventNameArray The array of event names to disarm.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler that was used instead of sending the event into the TIBET
     *     signaling system.
     * @raises TP.sig.InvalidWindow,TP.sig.InvalidNode,TP.sig.InvalidArray
     * @todo
     */

    var i,
        i2,
        len,
        len2,

        elementDoc,
        elementWin,
        elementLocalID,

        theHandler,

        foundElements,
        moreElements,

        element,
        eventName,
        nativeEventName;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
    }

    if (TP.isEmpty(eventNameArray)) {
        return TP.raise(this, 'TP.sig.InvalidArray', arguments);
    }

    //  Grab the element's window and its name.
    elementDoc = TP.nodeGetDocument(aNode);
    elementWin = TP.nodeGetWindow(elementDoc);
    elementLocalID = TP.lid(aNode);

    theHandler = TP.ifInvalid(aHandler, TP.$dispatchEventToTIBET);

    //  If the element is not a window and its not a document, then check to
    //  see if there are any more elements with the same name (as might be
    //  the case with radio buttons) and go ahead and grab them all.
    //  Otherwise, just add the element to the 'foundElements' array by
    //  itself.
    if (!TP.isWindow(aNode) &&
        !TP.isHTMLDocument(aNode) &&
        !TP.isXHTMLDocument(aNode) &&
        TP.notEmpty(moreElements = TP.nodeGetDescendantElementsByIdOrName(
                                                elementDoc,
                                                elementLocalID))) {
        //  typically only a radio button group sharing 'name'
        foundElements = moreElements;
    } else {
        foundElements = TP.ac();
        foundElements.push(aNode);
    }

    len = foundElements.getSize();
    for (i = 0; i < len; i++) {
        element = foundElements.at(i);

        len2 = eventNameArray.getSize();
        for (i2 = 0; i2 < len2; i2++) {
            eventName = eventNameArray.at(i2);
            nativeEventName = TP.eventNameNativeValue(eventName);

            if (TP.isValid(theHandler.$$wrapper)) {
                theHandler = theHandler.$$wrapper;
            }

            if (TP.boot.isUA('IE')) {
                element.detachEvent('on' + nativeEventName,
                                    theHandler);
            } else {
                element.removeEventListener(nativeEventName,
                                            theHandler,
                                            false);
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
