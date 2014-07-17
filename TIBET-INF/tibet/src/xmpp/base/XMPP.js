//  ========================================================================
/*
NAME:   TP.xmpp.XMLNS.js
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
 * @type {XMPP}
 * @synopsis A top-level type containing data specific to the overall XMPP
 *     protocol such as namespaces, node descriptions, etc. This type is used
 *     primarily as a lookup point. Note that several global constants specific
 *     to the XMPP protocol are defined here.
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('xmpp:XMLNS');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  SASL authentication types, these keys are used by the connection's auth
//  call
TP.xmpp.XMLNS.Type.defineConstant('DIGEST', 'DIGEST-MD5');
TP.xmpp.XMLNS.Type.defineConstant('PLAINTEXT', 'PLAIN');

//  namespace constants, these are used by various construction methods
TP.xmpp.XMLNS.Type.defineConstant('CLIENT', 'jabber:client');
TP.xmpp.XMLNS.Type.defineConstant('SERVER', 'jabber:server');
TP.xmpp.XMLNS.Type.defineConstant('DIALBACK', 'jabber:server:dialback');
TP.xmpp.XMLNS.Type.defineConstant('VCARD', 'vcard-temp');
TP.xmpp.XMLNS.Type.defineConstant('XHTML', 'html');

TP.xmpp.XMLNS.Type.defineConstant('IQ_AGENT', 'jabber:iq:agent');
TP.xmpp.XMLNS.Type.defineConstant('IQ_AGENTS', 'jabber:iq:agents');
TP.xmpp.XMLNS.Type.defineConstant('IQ_AUTH', 'jabber:iq:auth');
TP.xmpp.XMLNS.Type.defineConstant('IQ_AUTOUPDATE', 'jabber:iq:autoupdate');
TP.xmpp.XMLNS.Type.defineConstant('IQ_BROWSE', 'jabber:iq:browse');
TP.xmpp.XMLNS.Type.defineConstant('IQ_CONFERENCE', 'jabber:iq:conference');
TP.xmpp.XMLNS.Type.defineConstant('IQ_GATEWAY', 'jabber:iq:gateway');
TP.xmpp.XMLNS.Type.defineConstant('IQ_LAST', 'jabber:iq:last');
TP.xmpp.XMLNS.Type.defineConstant('IQ_OOB', 'jabber:iq:oob');
TP.xmpp.XMLNS.Type.defineConstant('IQ_PASS', 'jabber:iq:pass');
TP.xmpp.XMLNS.Type.defineConstant('IQ_PRIVATE', 'jabber:iq:private');
TP.xmpp.XMLNS.Type.defineConstant('IQ_REGISTER', 'jabber:iq:register');
TP.xmpp.XMLNS.Type.defineConstant('IQ_ROSTER', 'jabber:iq:roster');
TP.xmpp.XMLNS.Type.defineConstant('IQ_RPC', 'jabber:iq:rpc');
TP.xmpp.XMLNS.Type.defineConstant('IQ_SEARCH', 'jabber:iq:search');
TP.xmpp.XMLNS.Type.defineConstant('IQ_TIME', 'jabber:iq:time');
TP.xmpp.XMLNS.Type.defineConstant('IQ_VERSION', 'jabber:iq:version');

TP.xmpp.XMLNS.Type.defineConstant('X_AUTOUPDATE', 'jabber:x:autoupdate');
TP.xmpp.XMLNS.Type.defineConstant('X_CONFERENCE', 'jabber:x:conference');
TP.xmpp.XMLNS.Type.defineConstant('X_DATA', 'jabber:x:data');
TP.xmpp.XMLNS.Type.defineConstant('X_DELAY', 'jabber:x:delay');
TP.xmpp.XMLNS.Type.defineConstant('X_ENCRYPTED', 'jabber:x:encrypted');
TP.xmpp.XMLNS.Type.defineConstant('X_ENVELOPE', 'jabber:x:envelope');
TP.xmpp.XMLNS.Type.defineConstant('X_EVENT', 'jabber:x:event');
TP.xmpp.XMLNS.Type.defineConstant('X_EXPIRE', 'jabber:x:expire');
TP.xmpp.XMLNS.Type.defineConstant('X_OOB', 'jabber:x:oob');
TP.xmpp.XMLNS.Type.defineConstant('X_ROSTER', 'jabber:x:roster');
TP.xmpp.XMLNS.Type.defineConstant('X_SIGNED', 'jabber:x:signed');
TP.xmpp.XMLNS.Type.defineConstant('X_SXPM', 'jabber:x:sxpm');

//  BOSH namespace
TP.xmpp.XMLNS.Type.defineConstant('XMPP_BOSH',
                                'urn:xmpp:xbosh');

//  XMPP stream namespace
TP.xmpp.XMLNS.Type.defineConstant('STREAM',
                                'http://etherx.jabber.org/streams');

//  SASL namespace
TP.xmpp.XMLNS.Type.defineConstant('SASL',
                                'urn:ietf:params:xml:ns:xmpp-sasl');

//  XMPP bind namespace
TP.xmpp.XMLNS.Type.defineConstant('BIND',
                                'urn:ietf:params:xml:ns:xmpp-bind');

//  XMPP session namespace
TP.xmpp.XMLNS.Type.defineConstant('SESSION',
                                'urn:ietf:params:xml:ns:xmpp-session');

//  XMPP streams namespace
TP.xmpp.XMLNS.Type.defineConstant('STREAMS',
                                'urn:ietf:params:xml:ns:xmpp-streams');

//  XMPP stanzas namespace
TP.xmpp.XMLNS.Type.defineConstant('STANZAS',
                                'urn:ietf:params:xml:ns:xmpp-stanzas');

//  XEP-77 - In-Band Registration elements
TP.xmpp.XMLNS.Type.defineConstant('IQ_REGERROR',
                                'jabber:iq:register:error');
TP.xmpp.XMLNS.Type.defineConstant('PARAMS',
                                'urn:ietf:params:xml:ns:xmpp-stanzas');

//  XEP-115 - Entity Capabilities
TP.xmpp.XMLNS.Type.defineConstant('CAPS',
                                'http://jabber.org/protocol/caps');

//  XEP-60 - PubSub

//  XMPP pubsub namespace
TP.xmpp.XMLNS.Type.defineConstant('PUBSUB',
                                'http://jabber.org/protocol/pubsub');

//  XMPP pubsub error namespace
TP.xmpp.XMLNS.Type.defineConstant('PUBSUB_ERROR',
                                'http://jabber.org/protocol/pubsub#errors');

//  XMPP pubsub event namespace
TP.xmpp.XMLNS.Type.defineConstant('PUBSUB_EVENT',
                                'http://jabber.org/protocol/pubsub#event');

//  XMPP pubsub owner namespace
TP.xmpp.XMLNS.Type.defineConstant('PUBSUB_OWNER',
                                'http://jabber.org/protocol/pubsub#owner');


//  XMPP pubsub subscribe authorization namespace
TP.xmpp.XMLNS.Type.defineConstant(
        'PUBSUB_SUBSCRIBE_AUTHORIZATION',
            'http://jabber.org/protocol/pubsub#subscribe_authorization');

//  XMPP pubsub subscribe options namespace
TP.xmpp.XMLNS.Type.defineConstant(
        'PUBSUB_SUBSCRIBE_OPTIONS',
            'http://jabber.org/protocol/pubsub#subscribe_options');

//  XMPP pubsub node config namespace
TP.xmpp.XMLNS.Type.defineConstant(
        'PUBSUB_NODE_CONFIG',
            'http://jabber.org/protocol/pubsub#node_config');

//  XMPP pubsub metadata namespace
TP.xmpp.XMLNS.Type.defineConstant(
        'PUBSUB_META_DATA',
            'http://jabber.org/protocol/pubsub#meta-data');

//  XMPP pubsub publish options namespace
TP.xmpp.XMLNS.Type.defineConstant(
        'PUBSUB_PUBLISH_OPTIONS',
            'http://jabber.org/protocol/pubsub#publish-options');


//  XEP-124 - HTTP BIND (BOSH)

//  HTTP bind namespace
TP.xmpp.XMLNS.Type.defineConstant('HTTP_BIND',
                                'http://jabber.org/protocol/httpbind');

//  support for transporting TP.sig.Signal instances
TP.xmpp.XMLNS.Type.defineConstant('TIBET_SIGNAL', TP.w3.Xmlns.SIGNALS);

//  presence constants
TP.xmpp.XMLNS.Type.defineConstant('ONLINE', 'online');
TP.xmpp.XMLNS.Type.defineConstant('AWAY', 'away');
TP.xmpp.XMLNS.Type.defineConstant('CHAT', 'chat');
TP.xmpp.XMLNS.Type.defineConstant('DO_NOT_DISTURB', 'dnd');
TP.xmpp.XMLNS.Type.defineConstant('EXTENDED_AWAY', 'xa');

//  transport constants
TP.xmpp.XMLNS.Type.defineConstant('BINDING', 'binding');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  type registry to support TP.core.Node.getConcreteType() lookups
TP.xmpp.XMLNS.Type.defineAttribute('$nodetypes', TP.hc());

//  type registry to support constructStanza() lookups
TP.xmpp.XMLNS.Type.defineAttribute('$stanzatypes', TP.hc());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xmpp.XMLNS.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Performs one-time setup for the type on startup/import.
     */

    var xmppInfo,
        xmlnsInfo;

    xmppInfo = TP.hc('uri', '',
                    'mimetype', '',
                    'prefix', '',
                    'rootElement', '',
                    'defaultNodeType', 'TP.xmpp.Node');

    xmlnsInfo = TP.w3.Xmlns.get('info');

    xmlnsInfo.atPut(TP.xmpp.XMLNS.CLIENT,
                    xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.CLIENT));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.SERVER,
                    xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.SERVER));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.DIALBACK,
                    xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.DIALBACK));

    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_AGENT,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_AGENT));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_AGENTS,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_AGENTS));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_AUTH,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_AUTH));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_AUTOUPDATE,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_AUTOUPDATE));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_BROWSE,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_BROWSE));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_CONFERENCE,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_CONFERENCE));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_GATEWAY,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_GATEWAY));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_LAST,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_LAST));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_OOB,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_OOB));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_PASS,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_PASS));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_PRIVATE,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_PRIVATE));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_REGISTER,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_REGISTER));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_ROSTER,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_ROSTER));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_RPC,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_RPC));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_SEARCH,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_SEARCH));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_TIME,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_TIME));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_VERSION,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_VERSION));

    xmlnsInfo.atPut(TP.xmpp.XMLNS.X_AUTOUPDATE,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.X_AUTOUPDATE));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.X_CONFERENCE,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.X_CONFERENCE));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.X_DATA,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.X_DATA));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.X_DELAY,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.X_DELAY));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.X_ENCRYPTED,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.X_ENCRYPTED));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.X_ENVELOPE,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.X_ENVELOPE));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.X_EVENT,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.X_EVENT));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.X_EXPIRE,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.X_EXPIRE));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.X_OOB,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.X_OOB));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.X_ROSTER,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.X_ROSTER));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.X_SIGNED,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.X_SIGNED));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.X_SXPM,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.X_SXPM));

    xmlnsInfo.atPut(TP.xmpp.XMLNS.XMPP_BOSH,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.XMPP_BOSH));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.STREAM,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.STREAM));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.SASL,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.SASL));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.BIND,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.BIND));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.SESSION,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.SESSION));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.STREAMS,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.STREAMS));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.STANZAS,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.STANZAS));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.IQ_REGERROR,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.IQ_REGERROR));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.PARAMS,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.PARAMS));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.CAPS,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.CAPS));

    xmlnsInfo.atPut(TP.xmpp.XMLNS.PUBSUB,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.PUBSUB));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.PUBSUB_ERROR,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.PUBSUB_ERROR));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.PUBSUB_EVENT,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.PUBSUB_EVENT));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.PUBSUB_OWNER,
                xmppInfo.copy().atPut('uri', TP.xmpp.XMLNS.PUBSUB_OWNER));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.PUBSUB_SUBSCRIBE_AUTHORIZATION,
                    xmppInfo.copy().atPut(
                    'uri',
                    TP.xmpp.XMLNS.PUBSUB_SUBSCRIBE_AUTHORIZATION));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.PUBSUB_SUBSCRIBE_OPTIONS,
                    xmppInfo.copy().atPut(
                    'uri',
                    TP.xmpp.XMLNS.PUBSUB_SUBSCRIBE_OPTIONS));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.PUBSUB_NODE_CONFIG,
                    xmppInfo.copy().atPut(
                    'uri',
                    TP.xmpp.XMLNS.PUBSUB_NODE_CONFIG));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.PUBSUB_META_DATA,
                    xmppInfo.copy().atPut(
                    'uri',
                    TP.xmpp.XMLNS.PUBSUB_META_DATA));
    xmlnsInfo.atPut(TP.xmpp.XMLNS.PUBSUB_PUBLISH_OPTIONS,
                    xmppInfo.copy().atPut(
                    'uri',
                    TP.xmpp.XMLNS.PUBSUB_PUBLISH_OPTIONS));

    xmlnsInfo.atPut(TP.xmpp.XMLNS.TIBET_SIGNAL,
                    xmppInfo.copy().atPut(
                    'uri',
                    TP.xmpp.XMLNS.TIBET_SIGNAL));

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.XMLNS.Type.defineMethod('defineStanzaType',
function(tagType, aType) {

    /**
     * @name defineStanzaType
     * @synopsis Defines the type for a particular stanza type attribute value.
     *     This mapping is used when attempting to construct stanzas based
     *     purely on type strings such as 'get' or 'available'.
     * @param {String} tagType The tag type for the stanza type.
     * @param {TP.xmpp.Node} aType A node type used for stanzas of the type
     *     provided.
     * @todo
     */

    this.get('$stanzatypes').atPut(tagType, aType);

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.XMLNS.Type.defineMethod('defineNodeType',
function(aTagName, aType, aNamespace) {

    /**
     * @name defineNodeType
     * @synopsis Defines a particular node type to use when creating new
     *     wrappers for primitive nodes. Typically used by the
     *     TP.xmpp.Node.getConcreteType() call to determine which type of
     *     instance to construct.
     * @param {String} aTagName The tag name to be mapped.
     * @param {TP.lang.RootObject.<TP.xmpp.Node>} The TP.xmpp.Node subtype type
     *     object to map.
     * @param {String} aNamespace The namespace to qualify the tag name by.
     *     Default is TP.xmpp.XMLNS.CLIENT.
     * @raises TP.sig.InvalidType
     * @todo
     */

    var nodeTypeNamespace,
        name,

        nsHash;

    if (!TP.isType(aType)) {
        return this.raise('TP.sig.InvalidType', arguments, aType);
    }

    //  default to the root document namespace, always jabber:client
    nodeTypeNamespace = TP.ifInvalid(aNamespace, TP.xmpp.XMLNS.CLIENT);
    name = aTagName;

    nsHash = this.get('$nodetypes').at(nodeTypeNamespace);
    if (TP.notValid(nsHash)) {
        nsHash = TP.hc();
        this.get('$nodetypes').atPut(nodeTypeNamespace, nsHash);
    }

    nsHash.atPut(name, aType);

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.XMLNS.Type.defineMethod('getErrorString',
function(aCode) {

    /**
     * @name getErrorString
     * @synopsis Returns the common error string for the code provided.
     * @param {Number} aCode The numeric error code to look up.
     * @returns {String} 
     */

    if (TP.notValid(aCode)) {
        return null;
    }

    return this.get('errors').at(aCode.asNumber());
});

//  ------------------------------------------------------------------------

TP.xmpp.XMLNS.Type.defineMethod('getStanzaType',
function(tagType) {

    /**
     * @name getStanzaType
     * @synopsis Returns the stanza type for the tag type attribute value
     *     provided. This is typically a string such as 'get', 'set',
     *     'available', etc.
     * @param {String} tagType The tag type for the stanza type.
     * @returns {Type} 
     */

    return this.get('$stanzatypes').at(tagType);
});

//  ------------------------------------------------------------------------

TP.xmpp.XMLNS.Type.defineMethod('getNodeType',
function(aTagName, aNamespace) {

    /**
     * @name getNodeType
     * @synopsis Returns the XMPP node type used for the specified tag/namespace
     *     pair.
     * @param {String} aTagName The tag name to be looked up.
     * @param {String} aNamespace The namespace to qualify the tag name by.
     *     Default is TP.xmpp.XMLNS.CLIENT.
     * @returns {Type} 
     * @todo
     */

    var nodeTypeNamespace,
        nsHash,
        type;

    //  default to the root document namespace, always jabber:client
    nodeTypeNamespace = TP.ifInvalid(aNamespace, TP.xmpp.XMLNS.CLIENT);

    nsHash = this.get('$nodetypes').at(nodeTypeNamespace);
    if (TP.isValid(nsHash)) {
        type = nsHash.at(aTagName);
        if (TP.isType(type)) {
            return type;
        }
    }

    return null;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
