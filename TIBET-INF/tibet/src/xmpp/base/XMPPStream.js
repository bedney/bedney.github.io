//  ========================================================================
/*
NAME:   TP.xmpp.Stream.js
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
 * @type {TP.xmpp.Stream}
 * @synopsis A valid stream of XMPP content. In XMPP terms the streams between
 *     two XMPP entities don't close until the connection does, and each carries
 *     half of a conversation that takes place between the two entities. There
 *     are two subtypes specific to input and output processing which are used
 *     in conjunction with the TP.xmpp.Connection type to manage client-server
 *     communication.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Packet.defineSubtype('Stream');

TP.xmpp.Stream.Type.defineAttribute('namespace', TP.xmpp.XMLNS.STREAM);
TP.xmpp.Stream.Type.defineAttribute('tagname', 'stream');

TP.xmpp.Stream.Type.defineAttribute(
    'template',
    TP.join('<stream:stream xmlns="', TP.xmpp.XMLNS.CLIENT, '"',
            ' xmlns:stream="', TP.xmpp.XMLNS.STREAM, '"',
            ' version="1.0">',  //  version="1.0" means XMPP 1.0
                                //  compliance we'll add the 'xml:lang'
                                //  in the element initialize
            // get around mozilla, it wants to rewrite our xml
            '<!-- TIBET(tm) Active Client Messaging -->',
            '</stream:stream>'));

TP.xmpp.Stream.register();

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xmpp.Stream.Type.defineMethod('getClosingTag',
function() {

    /**
     * @name getClosingTag
     * @synopsis Returns the closing tag content for a stream.
     * @returns {String} 
     */

    var str;

    str = TP.nodeAsString(this.get('template'));

    return str.slice(str.lastIndexOf('<'));
});

//  ------------------------------------------------------------------------

TP.xmpp.Stream.Type.defineMethod('getOpeningTag',
function() {

    /**
     * @name getOpeningTag
     * @synopsis Returns the stream's opening tag content.
     * @returns {String} 
     */

    var str;

    str = TP.nodeAsString(this.get('template'));

    return str.slice(0, str.indexOf('>') + 1);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  flag for current stream open/closed state
TP.xmpp.Stream.Inst.defineAttribute('open', false);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.Stream.Inst.defineMethod('init',
function(aNode, aConnection) {

    /**
     * @name init
     * @synopsis Initializes a new instance of the receiver.
     * @param {A} aNode native node, or null to use the type's default template.
     * @param {TP.xmpp.Connection} aConnection The stream's connection. This is
     *     a required parameter.
     * @raises TP.sig.InvalidXMPPConnection
     * @returns {TP.xmpp.Stream} A new instance.
     * @todo
     */

    var natNode;

    //  note we pass aNode but not just arguments, to avoid having the
    //  connection used as if it were a URI
    this.callNextMethod(aNode);

    //  the top-level call may not be able to clone the node type properly,
    //  in which case we're not really initialized
    if (TP.notValid(natNode = this.getNativeNode())) {
        return;
    }

    //  Add an XML lang attribute and namespace for the XML namespace as per
    //  the XMPP 1.0 spec. Need to do this here rather than in the template
    //  initialization code since the target language won't have been set
    //  yet when the template is registered.
    TP.elementSetAttributeInNS(natNode,
                                'xml:lang',
                                TP.sys.getTargetLanguage(),
                                TP.w3.Xmlns.XML);

    TP.elementAddNamespace(natNode, 'xml', TP.w3.Xmlns.XML);

    if (TP.notValid(aConnection)) {
        return this.raise('TP.sig.InvalidXMPPConnection', arguments);
    }

    this.set('connection', aConnection);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Stream.Inst.defineMethod('getClosingTag',
function() {

    /**
     * @name getClosingTag
     * @synopsis Returns the closing tag text for the receiver.
     * @returns {String} 
     */

    var str;

    //  NB: We pass false to the asString() here to avoid getting an XML
    //  declaration on the front of the representation.
    str = this.asString(false);

    return str.slice(str.lastIndexOf('<'));
});

//  ------------------------------------------------------------------------

TP.xmpp.Stream.Inst.defineMethod('getLastPacket',
function() {

    /**
     * @name getLastPacket
     * @synopsis Returns the last node written to the stream.
     * @returns {Node} DOM Node.
     */

    return this.getNativeNode().lastChild;
});

//  ------------------------------------------------------------------------

TP.xmpp.Stream.Inst.defineMethod('getOpeningTag',
function() {

    /**
     * @name getOpeningTag
     * @synopsis Returns the opening tag content for the receiver.
     * @returns {String} 
     */

    var str;

    //  NB: We pass false to the asString() here to avoid getting an XML
    //  declaration on the front of the representation.
    str = this.asString(false);

    return str.slice(0, str.indexOf('>') + 1);
});

//  ------------------------------------------------------------------------

TP.xmpp.Stream.Inst.defineMethod('getStream',
function() {

    /**
     * @name getStream
     * @synopsis Returns the native node containing the stream content.
     * @returns {Node} DOM Node.
     */

    return this.getNativeNode();
});

//  ------------------------------------------------------------------------

TP.xmpp.Stream.Inst.defineMethod('getVersion',
function() {

    /**
     * @name getVersion
     * @synopsis Reserved for future. Returns the version implementation string
     *     for the receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.xmpp.Stream.Inst.defineMethod('isOpen',
function(aFlag) {

    /**
     * @name isOpen
     * @synopsis Combined setter/getter for the receiver's open status. Returns
     *     true if the receiving connection is open.
     * @param {Boolean} aFlag A new value to set for the open status.
     * @returns {Boolean} 
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('open', aFlag, false);
    }

    return TP.isTrue(this.$get('open'));
});

//  ------------------------------------------------------------------------

TP.xmpp.Stream.Inst.defineMethod('setVersion',
function(aString) {

    /**
     * @name setVersion
     * @synopsis Reserved for future. Sets the implementation version for the
     *     receiver.
     * @param {String} aString An XMPP implementation version.
     * @returns {TP.xmpp.Stream} The receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
