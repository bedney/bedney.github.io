//  ========================================================================
/*
NAME:   TP.xmpp.PubsubSubscribe.js
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
 * @type {TP.xmpp.PubsubSubscribe}
 * @synopsis A wrapper for the PubSub subscribe node type.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.defineSubtype('PubsubSubscribe');

TP.xmpp.PubsubSubscribe.set('template',
        TP.join('<pubsub xmlns="', TP.xmpp.XMLNS.PUBSUB, '">',
        '<subscribe node=""/>', '</pubsub>'));

//  For subtypes of TP.xmpp.Pubsub, we register ourself using an XPath
TP.xmpp.Pubsub.registerPubsubType(TP.xmpp.XMLNS.PUBSUB,
        './$def:subscribe', TP.xmpp.PubsubSubscribe);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.PubsubSubscribe.Inst.defineMethod('setNodeID',
function(anID) {

    /**
     * @name setNodeID
     * @synopsis Sets the node ID that the receiver is subscribing to.
     * @param {String} anID The node ID that is being subscribed to.
     * @returns {TP.xmpp.PubsubSubscribe} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('subscribe', true);
    TP.elementSetAttribute(elem, 'node', anID);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.PubsubSubscribe.Inst.defineMethod('setSubscriberJID',
function(aJID) {

    /**
     * @name setSubscriberJID
     * @synopsis Sets the subscriber JID that is making the subscription.
     * @param {TP.xmpp.JID} aJID The subscriber JID that is making the
     *     subscription.
     * @returns {TP.xmpp.PubsubSubscribe} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('subscribe', true);
    TP.elementSetAttribute(elem, 'jid', aJID.get('bareJID'));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
