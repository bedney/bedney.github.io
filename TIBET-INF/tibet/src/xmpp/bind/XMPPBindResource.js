//  ========================================================================
/*
NAME:   TP.xmpp.BindResource.js
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
 * @type {TP.xmpp.BindResource}
 * @synopsis A wrapper for the XMPP resource binding element
 */

//  ------------------------------------------------------------------------

TP.xmpp.Payload.defineSubtype('BindResource');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.BindResource.set('namespace', TP.xmpp.XMLNS.BIND);

TP.xmpp.BindResource.set('tagname', 'bind');

TP.xmpp.BindResource.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.BindResource.Inst.defineMethod('addResource',
function(resourceName) {

    /**
     * @name addResource
     * @synopsis Adds a resource node to the receiver.
     * @param {String} resourceName A resource name.
     * @raises TP.sig.InvalidResourceName
     * @returns {TP.xmpp.BindResource} The receiver.
     */

    var resourceNode;

    if (TP.isEmpty(resourceName)) {
        return this.raise('TP.sig.InvalidResourceName', arguments);
    }

    //  Make a node in the 'resource binding' namespace with a tag name of
    //  'resource'.
    resourceNode = TP.documentCreateElement(this.getNativeDocument(),
                                            'resource',
                                            TP.xmpp.XMLNS.BIND);

    TP.nodeAppendChild(
                resourceNode,
                this.getNativeDocument().createTextNode(resourceName));

    TP.nodeAppendChild(this.getNativeNode(), resourceNode);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
