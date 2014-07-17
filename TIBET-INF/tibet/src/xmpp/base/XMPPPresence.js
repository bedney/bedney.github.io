//  ========================================================================
/*
NAME:   TP.xmpp.Presence.js
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
 * @type {TP.xmpp.Presence}
 * @synopsis A presence element wrapper. This node type provides convenience
 *     methods for working with XMPP presence elements.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.defineSubtype('Presence');

TP.xmpp.Presence.set('tagname', 'presence');

TP.xmpp.Presence.set('stanzaTypes',
        TP.ac('available', 'unavailable', 'subscribe', 'subscribed',
        'unsubscribe', 'unsubscribed', 'probe', 'error'));

TP.xmpp.Presence.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.Presence.Inst.defineMethod('constructResponse',
function() {

    /**
     * @name constructResponse
     * @synopsis Creates an appropriate response object based on the current
     *     packet. For presence packets the response defaults to an affirmative
     *     response for subscribe and unsubscribe messages. Other presence
     *     packets have no valid response so this method returns null in those
     *     cases.
     * @returns {TP.xmpp.Stanza} 
     * @todo
     */

    var msgID,
        inst;

    if (this.getAttribute('type') === 'subscribe') {
        inst = TP.xmpp.Presence.construct(null, 'subscribed').set(
                                                        'to',
                                                        this.get('from'));
    } else if (this.getAttribute('type') === 'unsubscribe') {
        inst = TP.xmpp.Presence.construct(null, 'unsubscribed').set(
                                                        'to',
                                                        this.get('from'));
    } else {
        //  no proper 'response' for other presence packet types
        return;
    }

    inst.set('from', this.get('to'));

    if (TP.isString(msgID = this.get('msgID')) && (msgID !== '')) {
        inst.set('msgID', msgID);
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.xmpp.Presence.Inst.defineMethod('getDefaultType',
function() {

    /**
     * @name getDefaultType
     * @synopsis Returns the default stanza type for the receiver.
     * @returns {String} 
     * @todo
     */

    return 'available';
});

//  ------------------------------------------------------------------------

TP.xmpp.Presence.Inst.defineMethod('getPriority',
function() {

    /**
     * @name getPriority
     * @synopsis Returns the packet priority of the receiver.
     * @returns {String} 
     */

    return this.getChildTextContent('priority');
});

//  ------------------------------------------------------------------------

TP.xmpp.Presence.Inst.defineMethod('getShow',
function() {

    /**
     * @name getShow
     * @synopsis Returns the text value of the receiver's show attribute.
     * @returns {String} 
     */

    return this.getChildTextContent('show');
});

//  ------------------------------------------------------------------------

TP.xmpp.Presence.Inst.defineMethod('getSignalOrigin',
function(aStanza) {

    /**
     * @name getSignalOrigin
     * @synopsis Returns the signal origin to use when signaling arrival of
     *     packets of this type. Presence stanzas signal presence change signal
     *     from the corresponding JID.
     * @description Since this TP.xmpp.Node type *is* a stanza, 'aStanza' will
     *     be null. This method should 'pass along' the receiver to any nested
     *     getSignalOrigin() calls as the stanza. This method should return
     *     TP.NONE if it does not want the XMPP connection to send a signal on
     *     the receiver's behalf.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {Object|String|Array} The origin(s) to use when signaling.
     */

    return TP.jid(this.get('from'));
});

//  ------------------------------------------------------------------------

TP.xmpp.Presence.Inst.defineMethod('getStatus',
function() {

    /**
     * @name getStatus
     * @synopsis Returns the text status of the receiver.
     * @returns {String} 
     */

    return this.getChildTextContent('status');
});

//  ------------------------------------------------------------------------

TP.xmpp.Presence.Inst.defineMethod('setStanzaType',
function(aStanzaType) {

    /**
     * @name setStanzaType
     * @synopsis Sets the receiver's stanza type attribute. The type must be
     *     mapped in the type's stanzaTypes array to be valid.
     * @param {String} aStanzaType The stanza type string to set.
     * @raises TP.sig.InvalidXMPPStanzaType
     * @returns {TP.xmpp.Stanza} The receiver.
     */

    //  In XMPP 1.0, there really isn't a type of 'available' and setting
    //  the 'type' attribute to that value is illegal and will cause any
    //  presence announcing our availability to be ignored.
    if (aStanzaType === 'available') {
        return this;
    }

    //  Otherwise, call up to our supertype.
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xmpp.Presence.Inst.defineMethod('setPriority',
function(aString) {

    /**
     * @name setPriority
     * @synopsis Sets the message priority of the receiver.
     * @param {String} aString The message priority.
     * @returns {TP.xmpp.Presence} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('priority', true);
    TP.nodeSetTextContent(elem, aString);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Presence.Inst.defineMethod('setShow',
function(aString) {

    /**
     * @name setShow
     * @synopsis Sets the text to show as the presence notice.
     * @param {String} aString The string to show as our presence note.
     * @returns {TP.xmpp.Presence} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('show', true);
    TP.nodeSetTextContent(elem, aString);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Presence.Inst.defineMethod('setStatus',
function(aString) {

    /**
     * @name setStatus
     * @synopsis Sets the presence status text.
     * @param {String} aString The status text to set.
     * @returns {TP.xmpp.Presence} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('status', true);
    TP.nodeSetTextContent(elem, aString);

    return this;
});

//  ------------------------------------------------------------------------
//  Choreography Support
//  ------------------------------------------------------------------------

/*
The methods in this section are here to assist with conversational models
where certain packet types require specific responses.
*/

//  ------------------------------------------------------------------------

TP.xmpp.Presence.Inst.defineMethod('handleArrival',
function(aSignal) {

    /**
     * @name handleArrival
     * @synopsis Responds to inbound arrival of a new packet of the receiver's
     *     type. For most packet types this requires no action but certain
     *     packets such as subscription requests require a response.
     * @param {TP.sig.Signal} aSignal The original inbound signal which
     *     contained the receiver.
     */

    var typ,
        msg,
        uir;

    typ = this.getAttribute('type');
    if (typ === 'subscribe') {
        //  have to ask the user...
        uir = TP.sig.UserInputRequest.construct(
            TP.hc('query',
                    this.get('from') +
                        ' would like to subscribe to your presence. Allow?',
                    'default', 'yes',
                    'async', true
                ));

        //  have to observe input signal to be able to respond
        //uir.observe(null, 'TP.sig.UserInput');

        uir.defineMethod('handleUserInput',
            function(aSignal) {

                var res,
                    msg,
                    responder;

                //  turn off our observation to avoid leaking, note that
                //  this relies on a closure around the uir symbol
                uir.ignore(null, 'TP.sig.UserInput');

                if (TP.isValid(responder =
                        aSignal.getRequest().get('responder'))) {
                    aSignal.getRequestID().signal(
                                        'TP.sig.RequestCompleted');
                }

                res = aSignal.getResult();

                if (TP.isValid(res) && res.getSize() > 0) {
                    if (res.toLowerCase().startsWith('y')) {
                        msg = this.constructResponse();
                        msg.set(
                            'from',
                            this.get('connection').get('jid').asString());
                        this.get('connection').send(msg);
                    } else {
                        msg = this.constructResponse();
                        TP.elementSetAttribute(msg, 'type', 'unsubscribed');
                        msg.set(
                            'from',
                            this.get('connection').get('jid').asString());
                        this.get('connection').send(msg);
                    }
                }
            }.bind(this));

        uir.fire(TP.byOID('yak'));
    } else if (typ === 'unsubscribe') {
        //  response is to send back an ack
        msg = this.constructResponse();

        this.get('connection').send(msg);
    } else if (typ === 'subscribed') {
        TP.sig.UserOutputRequest.construct(TP.hc(
        'output',
            'You\'ve been successfully subscribed to: ' + this.get('from')
        )).fire(TP.byOID('yak'));
    } else if (typ === 'unsubscribed') {
        //  User's been unsubscribed or rejected for subscription.
        //  TODO: Need a flag to tell the difference.

        TP.sig.UserOutputRequest.construct(TP.hc(
        'output',
            'You\'ve been successfully unsubscribed ' +
            '(or your subscription request has been denied) from : ' +
                                                        this.get('from')
        )).fire(TP.byOID('yak'));
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
