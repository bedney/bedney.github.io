//  ========================================================================
/*
NAME:   TP.xmpp.Node.js
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
 * @type {TP.xmpp.Node}
 * @synopsis The main supertype for XMPP nodes. There are various subtypes of
 *     this type that are specialized for their particular content formats,
 *     making it easy to interact with message, presence, and iq nodes and their
 *     children.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('xmpp:Node');

//  can't construct concrete instances of this
TP.xmpp.Node.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the namespace which represents instances of this type
TP.xmpp.Node.Type.defineAttribute('namespace', TP.xmpp.XMLNS.CLIENT);

//  the node's tag name. combined with the namespace this provides the
//  information necessary to acquire nodes from the scheme's hashes
TP.xmpp.Node.Type.defineAttribute('tagname', null);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xmpp.Node.Type.defineMethod('constructNativeNode',
function() {

    /**
     * @name constructNativeNode
     * @synopsis Returns a node suitable for use as an instance of the receiver.
     * @returns {TP.xmpp.Node} A new native node, cloned from the receiver's
     *     template.
     */

    var tagName,
        namespaceURI,

        template,

        nodeType,

        templateNS,

        elem;

    tagName = this.get('tagname');
    namespaceURI = this.get('namespace');

    //  check to see if the receiving type has a template. If not try to
    //  look up a registered type and get its template.
    if (TP.isEmpty(template = this.get('template'))) {
        if (!TP.isType(nodeType = TP.xmpp.XMLNS.getNodeType(
                                                    tagName, namespaceURI))) {
            //  TODO: Raise an exception
            return null;
        }

        //  see if the node has a pre-built or existing template.
        template = nodeType.get('template');
    }

    //  if no template is found, presume a simple container tag and build a
    //  'simple template'.
    if (TP.isEmpty(template)) {
        //  default to the root document namespace, always jabber:client
        templateNS = TP.ifInvalid(namespaceURI, TP.xmpp.XMLNS.CLIENT);
        template = TP.join('<', tagName, ' xmlns="', templateNS, '"/>');

        //  cache it on the node type
        nodeType.set('template', template);
    }

    //  create an Element node from the template.
    elem = TP.elementFromString(template);

    return elem;
});

//  ------------------------------------------------------------------------

TP.xmpp.Node.Type.defineMethod('getConcreteType',
function(aNode) {

    /**
     * @name getConcreteType
     * @synopsis Returns the subtype to use for the node provided.
     * @param {Node} aNode The native node to wrap.
     * @raises TP.sig.InvalidNode
     * @returns {TP.lang.RootObject.<TP.xmpp.Node>} A TP.xmpp.Node subtype type
     *     object.
     */

    var stanzaType,
        nodeType,

        tagName,
        namespaceURI;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode',
                            arguments,
                            'No node provided.');
    }

    //  if the node has a type attribute we can use that as a shortcut
    if (TP.notEmpty(stanzaType = TP.elementGetAttribute(aNode, 'type'))) {
        nodeType = TP.xmpp.XMLNS.getStanzaType(stanzaType);
    }

    //  couldn't successfully obtain a type? Then its not a stanza.
    if (!TP.isType(nodeType)) {
        //  Grab the local name and namespace URI
        tagName = TP.elementGetLocalName(aNode);    //  iq, presence,
                                                    //  message, etc.
        namespaceURI = TP.nodeGetNSURI(aNode);      //  xmlns = ?
        if (TP.isEmpty(namespaceURI)) {
            namespaceURI = TP.xmpp.XMLNS.CLIENT;
        }

        //  look up the node type based on the tag name and namespace URI
        nodeType = TP.xmpp.XMLNS.getNodeType(tagName, namespaceURI);

        if (!TP.isType(nodeType)) {
            //  Couldn't determine a concrete type at this level. Just
            //  return the generic 'XML Element' concrete type.
            return TP.core.XMLElementNode;
        }

        //  if the node type is abstract, ask it to further resolve to a
        //  concrete type.
        if (nodeType.isAbstract()) {
            return nodeType.getConcreteType(aNode);
        }
    }

    return nodeType;
});

//  ------------------------------------------------------------------------

TP.xmpp.Node.Type.defineMethod('register',
function() {

    /**
     * @name register
     * @synopsis Registers the type's information, particularly the tag name,
     *     template, and namespace information which drives the lookup processes
     *     for getConcreteType().
     */

    var tagName,
        namespaceURI;

    tagName = this.get('tagname');
    namespaceURI = this.get('namespace');

    if (TP.isString(tagName) && TP.isString(namespaceURI)) {
        TP.xmpp.XMLNS.defineNodeType(tagName, this, namespaceURI);
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.Node.Inst.defineMethod('getAttribute',
function(attributeName) {

    /**
     * @name getAttribute
     * @synopsis Returns the value of the named attribute. If the attribute
     *     doesn't exist an empty string is returned.
     * @param {String} attributeName The attribute to retrieve.
     * @returns {String} 
     */

    var natNode;

    //  NOTE this is fragile!
    if (TP.isNode(natNode = this.getNativeNode())) {
        return TP.elementGetAttribute(natNode, attributeName);
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.xmpp.Node.Inst.defineMethod('getErrorElement',
function() {

    /**
     * @name getErrorElement
     * @synopsis Returns either the native node of the receiver (if it is an
     *     'error' element) or the descendant that is an error element.
     * @returns {TP.core.ElementNode} The error element.
     */

    var errorTPDescendant;

    errorTPDescendant = this.getElementsByTagName('error').first();
    if (TP.isValid(errorTPDescendant)) {
        return errorTPDescendant;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.xmpp.Node.Inst.defineMethod('getNamespaceURI',
function() {

    /**
     * @name getNamespaceURI
     * @synopsis Returns the receiver's namespace. This is based on the value of
     *     the native's node namespace if present, otherwise it returns the
     *     namespace mapped for the receiver's type.
     * @returns {String} 
     */

    var namespaceURI;

    if (TP.notValid(namespaceURI = TP.nodeGetNSURI(this.getNativeNode()))) {
        return this.getType().get('namespace');
    }

    return namespaceURI;
});

//  ------------------------------------------------------------------------

TP.xmpp.Node.Inst.defineMethod('getNamedDescendant',
function(aName, createIfAbsent) {

    /**
     * @name getNamedDescendant
     * @synopsis Returns the descendant Element (unwrapped) with the name
     *     provided. This is a useful utility method for accessing packet
     *     content.
     * @param {String} aName The tag name of the descendant to retrieve.
     * @param {Boolean} createIfAbsent Whether or not to create the descendant
     *     element if its not present.
     * @raises TP.sig.XMPPNodeCorruption
     * @returns {Element} The DOM Element node representing the named
     *     descendant.
     * @todo
     */

    var natElem,

        tpNodes,
        elem,
        flag;

    flag = TP.ifInvalid(createIfAbsent, false);
    tpNodes = this.getElementsByTagName(aName);

    if (TP.isEmpty(tpNodes) && flag) {
        elem = TP.node(
                '<' + aName + ' xmlns="' + this.get('namespace') + '"/>');

        if (TP.isElement(elem)) {
            if (TP.isElement(natElem = this.getNativeNode())) {
                //  Note the reassignment here since we're returning 'elem'.
                elem = TP.nodeAppendChild(natElem, elem);
            } else {
                return this.raise('TP.sig.XMPPNodeCorruption',
                                    arguments,
                                    elem);
            }
        }
    } else {
        elem = TP.unwrap(tpNodes.first());
    }

    return elem;
});

//  ------------------------------------------------------------------------

TP.xmpp.Node.Inst.defineMethod('getSignalName',
function(aStanza) {

    /**
     * @name getSignalName
     * @synopsis Returns the signal name to use when signaling arrival of
     *     packets of this type. The default is XMPP*Input where the asterisk is
     *     replaced by the current tag/type string, for example
     *     XMPPMessageInput.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {String} 
     * @todo
     */

    var signame,
        tagname,
        typename;

    tagname = this.getTagName();
    typename = this.get('tagType');
    signame = 'TP.sig.XMPP';

    if (TP.isString(tagname)) {
        signame += tagname.asStartUpper();

        if (TP.isString(typename)) {
            typename.asStartUpper();
        }
    } else {
        signame += 'Custom';
    }

    signame += 'Input';

    //  make sure we're dealing with a valid subtype
    if (!TP.isType(TP.sys.getTypeByName(signame))) {
        TP.sig.XMPPInput.defineSubtype(signame);
    }

    return signame;
});

//  ------------------------------------------------------------------------

TP.xmpp.Node.Inst.defineMethod('getTagName',
function() {

    /**
     * @name getTagName
     * @synopsis Returns the tag's nodeName.
     * @returns {String} 
     */

    var natNode;

    if (TP.isNode(natNode = this.getNativeNode())) {
        return natNode.nodeName;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.Node.Inst.defineMethod('getTagType',
function() {

    /**
     * @name getTagType
     * @synopsis Returns the value of any 'type' attribute on the receiver.
     *     Examples are 'get','set','normal','chat', etc.
     * @returns {String} 
     */

    var natNode;

    if (TP.isNode(natNode = this.getNativeNode())) {
        return TP.elementGetAttribute(natNode, 'type');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.Node.Inst.defineMethod('isError',
function() {

    /**
     * @name isError
     * @synopsis Returns true if the receiver contains an error packet, or is
     *     otherwise of type 'error'.
     * @returns {Boolean} 
     */

    var errorTPDescendant;

    if (this.getTagName() === 'error') {
        return true;
    }

    errorTPDescendant = this.getElementsByTagName('error').first();
    if (TP.isValid(errorTPDescendant)) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.xmpp.Node.Inst.defineMethod('isSignal',
function() {

    /**
     * @name isSignal
     * @synopsis Returns true if the receiver represents a TIBET Signal in
     *     encoded form.
     * @returns {Boolean} 
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.xmpp.Node.Inst.defineMethod('setAttribute',
function(attributeName, attributeValue) {

    /**
     * @name setAttribute
     * @synopsis Sets the value of the named attribute on the receiver. This is
     *     a wrapper for the standard DOM setAttribute call.
     * @param {String} attributeName The attribute name to set.
     * @param {Object} attributeValue The value to set.
     * @todo
     */

    var natNode;

    //  NOTE this is fragile!
    if (TP.isNode(natNode = this.getNativeNode())) {
        return TP.elementSetAttribute(natNode, attributeName, attributeValue,
                                        true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.Node.Inst.defineMethod('setTagType',
function(aTagType) {

    /**
     * @name setTagType
     * @synopsis Sets the value of any 'type' attribute on the receiver.
     *     Examples are 'get', 'set', 'normal', 'chat', etc.
     * @param {String} aTagType The tag type to use for the receiver.
     * @returns {String} 
     */

    var natNode;

    if (TP.isNode(natNode = this.getNativeNode())) {
        return TP.elementSetAttribute(natNode, 'type', aTagType);
    }

    return;
});

//  ------------------------------------------------------------------------
//  Choreography Support
//  ------------------------------------------------------------------------

/*
The methods in this section are here to assist with conversational models
where certain packet types require specific responses.
*/

//  ------------------------------------------------------------------------

TP.xmpp.Node.Inst.defineMethod('handleArrival',
function(aSignal) {

    /**
     * @name handleArrival
     * @synopsis Responds to inbound arrival of a new packet of the receiver's
     *     type. For most packet types this requires no action but certain
     *     packets such as subscription requests require a response.
     * @param {TP.sig.Signal} aSignal The original inbound signal which
     *     contained the receiver.
     */

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
