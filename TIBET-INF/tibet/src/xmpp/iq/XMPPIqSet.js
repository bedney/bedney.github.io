//  ========================================================================
/*
NAME:   TP.xmpp.IqSet.js
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
 * @type {TP.xmpp.IqSet}
 * @synopsis An Iq 'type="set"' wrapper.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Iq.defineSubtype('IqSet');

//  register as the proper type to use when the stanza is a 'set'
TP.xmpp.XMLNS.defineStanzaType('set', TP.xmpp.IqSet);

TP.xmpp.IqSet.set('template', '<iq type="set"></iq>');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.IqSet.Inst.defineMethod('expectsResponse',
function() {

    /**
     * @name expectsResponse
     * @synopsis A combined setter/getter for the 'response expected' flag. This
     *     flag defines whether the receiver will attempt to observe its message
     *     ID for result signals.
     * @param {Boolean} aFlag The new value for the flag, if used as a setter.
     * @returns {Boolean} The current flag value, after optional set.
     * @todo
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.xmpp.IqSet.Inst.defineMethod('getSignalName',
function(aStanza) {

    /**
     * @name getSignalName
     * @synopsis Returns the signal name to use when signaling arrival of
     *     packets of this type. The default is XMPP*Input where the asterisk is
     *     replaced by the current tag/type string, for example
     *     TP.sig.XMPPMessageInput.
     * @description Since this TP.xmpp.Node type *is* a stanza, 'aStanza' will
     *     be null. This method should 'pass along' the receiver to any nested
     *     getSignalName() calls as the stanza.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {String} 
     * @todo
     */

    if (this.isSignal()) {
        return 'TP.sig.XMPPSignalInput';
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xmpp.IqSet.Inst.defineMethod('isSignal',
function() {

    /**
     * @name isSignal
     * @synopsis Returns true if the receiver represents a TIBET Signal in
     *     encoded form.
     * @returns {Boolean} 
     */

    var query;

    if (TP.notValid(query =
                    this.getPayload('query', TP.xmpp.XMLNS.TIBET_SIGNAL))) {
        return false;
    }

    if (TP.isValid(query.at(0))) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
