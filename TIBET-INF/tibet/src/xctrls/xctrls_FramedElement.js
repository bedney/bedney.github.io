//  ========================================================================
/*
NAME:   xctrls_FramedElement.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.2, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.1
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
 * @type {TP.xctrls.FramedElement}
 * @synopsis A common supertype for various DHTML controls that require a
 *     'frame' to wrap around them.
 */

//  ------------------------------------------------------------------------

TP.xctrls.Element.defineSubtype('FramedElement');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  A URI to the 'frame file' - the file that will be loaded into the iframe
//  that this type builds to hold the custom control.
TP.xctrls.FramedElement.Type.defineAttribute('frameFileURI');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TSH Phase Support
//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Type.defineMethod('tshAwakenDOM',
function(aRequest) {

    /**
     * @name tshAwakenDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Number} The TP.CONTINUE flag, telling the system to not descend
     *     into the children of this element.
     */

    var elem,
        elemTPNode,

        theID,

        frameNode,

        stubHref,
        stubURI;

    //  Make sure to 'call up', since 'xctrls:Element' types do processing
    //  for this step.
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('cmdNode'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Obtain the (or compute a unique) ID for the produced element.
    theID = TP.lid(elem, true);

    //  Build an iframe element to contain our custom element.
    frameNode = TP.elem(
                    TP.join('<iframe xmlns="', TP.w3.Xmlns.XHTML, '"',
                            ' id="', theID, '_frame"',
                            ' style="position: relative; border: none;',
                            ' width: 100%; height: 100%"></iframe>'));

    TP.nodeAppendChild(elem, frameNode, false);

    //  Get a handle to a TP.core.Node representing an instance of this
    //  element type wrapped around elem. Note that this will both ensure a
    //  unique 'id' for the element and register it.
    elemTPNode = TP.tpnode(elem);

    if (TP.notEmpty(stubHref = TP.elementGetAttribute(elem, 'stubHref'))) {
        stubURI = TP.uc(stubHref);
    } else {
        stubURI = this.get('frameFileURI');
    }

    //  Begin the iframe load sequence
    elemTPNode.startIFrameLoad(stubURI);

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------
//  TSH Execution Content
//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @name cmdRunContent
     * @synopsis Invoked by the TIBET Shell when the tag is being "run" as part
     *     of a pipe or command sequence. For a UI element like an HTML element
     *     this effectively means to render itself onto the standard output
     *     stream.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest The request/param hash.
     */

    var elem;

    //  Make sure that we have a node to work from.
    if (TP.notValid(elem = aRequest.at('cmdNode'))) {
        return;
    }

    aRequest.atPut('cmdAsIs', true);
    aRequest.atPut('cmdBox', false);

    aRequest.atPut('cmdMinHeight', 200);

    aRequest.complete(elem);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Inst.defineAttribute('tpIFrame');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Inst.defineMethod('init',
function(aNode, aURI) {

    /**
     * @name init
     * @synopsis Returns a newly initialized instance.
     * @param {Node} aNode A native node.
     * @param {TP.core.URI|String} aURI An optional URI from which the Node
     *     received its content.
     * @returns {TP.xctrls.FramedElement} A new instance.
     * @todo
     */

    var iFrame;

    this.callNextMethod();

    //  Grab a TP.core.ElementNode reference to the iframe that we built.
    iFrame = this.getDocument().getElementById(
                            this.getAttribute('id') + '_frame');

    if (TP.isKindOf(iFrame, 'TP.core.ElementNode')) {
        this.set('tpIFrame', iFrame);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Inst.defineMethod('configure',
function() {

    /**
     * @name configure
     * @synopsis Configure the custom element as part of the startup process.
     *     This is called from the iframe's 'onload' hook and provides a
     *     mechanism for further processing after the content in the iframe has
     *     been completely loaded and initialized.
     * @returns {TP.xctrls.FramedElement} The receiver.
     * @signals TP.sig.DOMReady
     * @todo
     */

    //  Signal that we're ready
    this.signal('TP.sig.DOMReady');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Inst.defineMethod('getNativeContentDocument',
function() {

    /**
     * @name getNativeContentDocument
     * @synopsis Returns the content document (that is the contained 'document')
     *     of the receiver in a TP.core.Document wrapper.
     * @returns {Document} The Document object contained by the receiver.
     */

    return this.get('tpIFrame').getNativeContentDocument();
});

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Inst.defineMethod('getNativeContentWindow',
function() {

    /**
     * @name getNativeContentWindow
     * @synopsis Returns the content window (that is the 'contained window') of
     *     the receiver.
     * @returns {Window} The Window object contained by the receiver.
     */

    return this.get('tpIFrame').getNativeContentWindow();
});

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.Inst.defineMethod('startIFrameLoad',
function(stubURI) {

    /**
     * @name startIFrameLoad
     * @synopsis Begins the iframe loading of the receiver. This method loads
     *     the content from the supplied URI into the iframe constructed by this
     *     type and sets up a callback handler that will call this type's
     *     'configure' method when the content from the iframe is all loaded and
     *     initialized.
     * @param {TP.core.URI} stubURI The URI to load the 'stub' HTML from.
     * @returns {TP.xctrls.FramedElement} The receiver.
     */

    var tpIFrame,

        natIFrameWin;

    tpIFrame = this.get('tpIFrame');

    //  Set up the 'frameLoad' Function to call our 'configure' method
    //  indicating that iframe is completely loaded and ready to go. The
    //  'frameLoad' function should be invoked by logic in the iframe's
    //  'onload' machinery when everything is complete in there.
    tpIFrame.getNativeNode().frameLoad = function() {

        this.configure();

        tpIFrame.getNativeNode().tpObj = this;
    }.bind(this);

    if (TP.notEmpty(stubURI)) {
        natIFrameWin = tpIFrame.getNativeContentWindow();
        natIFrameWin.location = stubURI.getLocation();
    } else {
        //  TODO: Log an error.
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
