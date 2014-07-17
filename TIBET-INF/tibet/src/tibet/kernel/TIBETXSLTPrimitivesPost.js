//  ========================================================================
/*
NAME:   TIBETXSLTPrimitivesPost.js
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
 * @To support efficient DOM manipulations for various functions we leverage the
 *     XSLT support in the modern browsers. Both IE and Mozilla provide
 *     operationswhich allow the loading and processing of XSLT style sheets.
 *     The TIBETkernel includes XSLT style sheets supporting common DOM
 *     operations/transforms.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.definePrimitive('uriTransformFile',
function(styleUrl, inputUrl, paramHash) {

    /**
     * @name uriTransformFile
     * @synopsis Loads the two URLs and transforms the input using the style
     *     sheet provided.
     * @param {String} styleUrl The URL of the style sheet.
     * @param {String} inputUrl The URL of the input data file.
     * @param {TP.lang.Hash} paramHash A hash of optional parameters to be
     *     passed to the style sheet. A key of 'xmlns:fixup' set to true will
     *     repair xmlns attributes.
     * @raises TP.sig.XSLTException, TP.sig.InvalidNode, TP.sig.InvalidURI,
     *     URINotFound
     * @returns {Document} A document object containing the results.
     * @todo
     */

    var url1,
        node1,

        url2,
        node2;

    if (TP.notValid(url1 = TP.uc(styleUrl))) {
        this.raise('TP.sig.InvalidURI', arguments, styleUrl);

        return;
    }

    node1 = url1.getNativeNode(TP.hc('async', false));

    if (TP.notValid(url2 = TP.uc(inputUrl))) {
        this.raise('TP.sig.InvalidURI', arguments, inputUrl);

        return;
    }

    node2 = url2.getNativeNode(TP.hc('async', false));

    return TP.documentTransformFile(node1, node2, paramHash);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriTransformNode',
function(styleUrl, inputNode, paramHash) {

    /**
     * @name uriTransformNode
     * @synopsis Loads the style sheet URL provided and applies the resulting
     *     style to the input node.
     * @param {String} styleUrl The URL of the style sheet.
     * @param {Node} inputNode The input data element.
     * @param {TP.lang.Hash} paramHash A hash of optional parameters to be
     *     passed to the style sheet. A key of 'xmlns:fixup' set to true will
     *     repair xmlns attributes.
     * @raises TP.sig.XSLTException, TP.sig.InvalidNode, TP.sig.InvalidURI,
     *     URINotFound
     * @returns {Document} A document object containing the results.
     * @todo
     */

    var url1,
        node1;

    if (TP.notValid(url1 = TP.uc(styleUrl))) {
        this.raise('TP.sig.InvalidURI', arguments, styleUrl);

        return;
    }

    node1 = url1.getNativeNode(TP.hc('async', false));

    return TP.documentTransformNode(node1, inputNode, paramHash);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentTransformFile',
function(styleNode, inputUrl, paramHash) {

    /**
     * @name documentTransformFile
     * @synopsis Loads the input URL and transforms the data using the style
     *     sheet node provided.
     * @param {Node} styleNode The XSLT style document or fragment.
     * @param {String} inputUrl The URL of the input data file.
     * @param {TP.lang.Hash} paramHash A hash of optional parameters to be
     *     passed to the style sheet. A key of 'xmlns:fixup' set to true will
     *     repair xmlns attributes.
     * @raises TP.sig.XSLTException, TP.sig.InvalidNode, TP.sig.InvalidURI,
     *     URINotFound
     * @returns {Document} A document object containing the results.
     * @todo
     */

    var url2,
        node2;

    if (TP.notValid(url2 = TP.uc(inputUrl))) {
        this.raise('TP.sig.InvalidURI', arguments, inputUrl);
        return;
    }

    node2 = url2.getNativeNode(TP.hc('async', false));

    return TP.documentTransformNode(styleNode, node2, paramHash);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
