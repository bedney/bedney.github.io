//  ========================================================================
/*
NAME:   TIBETDOMPrimitivesBase.js
AUTH:   Scott Shattuck (ss), William J. Edney (wje)
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
@file           TIBETDOMPrimitivesBase.js
@abstract       DOM primitives (manipulations specific to - or commonly
                associated with - non-visible DOM elements).
*/

//  ------------------------------------------------------------------------
//  ELEMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('elementComputeXMLBaseFrom',
function(anElement, expandVirtuals) {

    /**
     * @name elementComputeXMLBaseFrom
     * @synopsis Computes the XML Base path from anElement out to the root
     *     element of the element's owner document.
     * @description XML Base entries are cumulative. Suppose elementA is a
     *     parent of anElement and has an base entry of 'foo/bar/'. elementB is
     *     a parent of elementA and has an XML Base entry of '/baz'. The XML
     *     Base path for anElement, then, is computed to be '/baz/foo/bar/'.
     *     Note that, once an entry that has a colon (':') is found, traversal
     *     is halted (as a 'scheme' for the URI has been found) and the base is
     *     computed from there, as that designates the beginning of an absolute
     *     path entry.
     * @param {Element} anElement The Element to begin the computation of the
     *     XML Base path from.
     * @param {Boolean} expandVirtuals Whether or not we should 'expand'
     *     'virtual URIs' in XML Base entries that we encounter along the way
     *     when computing the XML Base for the supplied Element. This defaults
     *     to true.
     * @raises TP.sig.InvalidElement
     * @returns {String} The XML Base path as computed from anElement up the
     *     document hierarchy.
     * @todo
     */

    var elem,

        shouldExpand,

        base,
        expandedBase,

        computedBase;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elem = anElement;
    shouldExpand = TP.ifInvalid(expandVirtuals, true);

    base = TP.ifEmpty(TP.elementGetAttribute(elem, 'xml:base', true), '');

    //  Make sure the 'xml:base' is expanded and if its not, set the
    //  attribute's value back to the fully expanded value.
    expandedBase = TP.uriExpandPath(base);
    if ((base !== expandedBase) && shouldExpand) {
        TP.elementSetAttributeInNS(elem, 'xml:base', expandedBase,
                                    TP.w3.Xmlns.XML);
    }

    if (TP.notEmpty(expandedBase) && TP.uriIsAbsolute(expandedBase)) {
        return expandedBase;
    }

    //  The initial value of the computed base is the expanded version of
    //  our starting 'xml:base'. Now we'll traverse the tree and add from
    //  there.
    computedBase = expandedBase;

    //  Traverse up the element's parent chain
    while (TP.isElement(elem = elem.parentNode)) {
        if (TP.notEmpty(base = TP.elementGetAttribute(elem,
                                                        'xml:base',
                                                        true))) {
            //  Make sure the 'xml:base' is expanded and if its not, set the
            //  attribute's value back to the fully expanded value.
            expandedBase = TP.uriExpandPath(base);
            if ((base !== expandedBase) && shouldExpand) {
                TP.elementSetAttributeInNS(elem,
                                            'xml:base',
                                            expandedBase,
                                            TP.w3.Xmlns.XML);
            }

            computedBase = TP.uriJoinPaths(expandedBase, computedBase);

            if (TP.uriIsAbsolute(computedBase)) {
                return computedBase;
            }
        }
    }

    return computedBase;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetURIController',
function(anElement) {

    /**
     * @name elementGetURIController
     * @synopsis Returns the URI controller that is acting as the main
     *     controller for the document containing the supplied element.
     * @description This method looks for a 'tibet:src' attribute on the
     *     document element of the document of the supplied element. If it can
     *     find one, it uses that to look up a URI controller that matches that
     *     URI.
     * @param {Element} anElement The element node to retrieve the URI
     *     controller for.
     * @returns {TP.core.URIController}
     * @raise TP.sig.InvalidElement Raised when an invalid element is provided
     *     to the method.
     * @todo
     */

    var doc,
        docElem,

        tibetSrc,
        ctrlTypeName;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isDocument(doc = TP.nodeGetDocument(anElement))) {
        if (TP.isElement(docElem = doc.documentElement)) {
            if (TP.notEmpty(tibetSrc = TP.elementGetAttribute(
                                    docElem, 'tibet:src', true))) {
                //  NB: This might be empty and that's ok, because the
                //  "get('controller')" call will default the type.
                ctrlTypeName = TP.elementGetAttribute(
                                    docElem, 'tibet:uricontroller', true);

                return TP.uc(tibetSrc).get('controller', ctrlTypeName);
            }
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementResolveXMLBase',
function(anElement, uriAttrNames, aPrefix, aSuffix) {

    /**
     * @name elementResolveXMLBase
     * @synopsis Loops over the supplied list of attribute names and resolves
     *     their values on the supplied element with respect to XML Base. If the
     *     URI is not absolute and needs an XML Base value, this is obtained and
     *     the attribute value is rewritten with that value..
     * @param {Element} anElement The element to update any URI attributes of.
     * @param {Array} uriAttrNames The list of attribute names that should be
     *     considered for XML Base processing.
     * @param {String} aPrefix An optional prefix that should be stripped before
     *     computing the full URI and prepended back onto the result value.
     * @param {String} aSuffix An optional suffix that should be stripped before
     *     computing the full URI and appended back onto the result value.
     * @raise TP.sig.InvalidElement Raised when an invalid element is provided
     *     to the method.
     * @raise TP.sig.InvalidParameter Raised when a null value is supplied for
     *     the uriAttrNames parameter.
     * @todo
     */

    var computedBase,

        len,
        i,

        thePrefix,
        theSuffix,

        baseVal,
        basePath;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    computedBase = null;

    len = uriAttrNames.getSize();
    for (i = 0; i < len; i++) {
        //  If there is no value for the attribute in question on the
        //  element, just continue on to the next one.
        if (TP.isEmpty(baseVal = TP.elementGetAttribute(
                                                anElement,
                                                uriAttrNames.at(i),
                                                true))) {
            continue;
        }

        // <a href="#">...</a> should not be rewritten.
        if (baseVal === '#' && uriAttrNames.at(i) === 'href') {
            return;
        }

        thePrefix = '';
        theSuffix = '';

        //  Strip the prefix, if there is one.
        if (baseVal.startsWith(aPrefix)) {
            baseVal = baseVal.slice(aPrefix.getSize());

            //  Grab it to use for rebuilding the value later.
            thePrefix = aPrefix;
        }

        //  Strip the suffix, if there is one.
        if (baseVal.endsWith(aSuffix)) {
            //  Note the computation of the negative index here - we're
            //  slicing from the end.
            baseVal = baseVal.slice(0, aSuffix.getSize() * -1);

            //  Grab it to use for rebuilding the value later.
            theSuffix = aSuffix;
        }

        //  NB: We don't bother to test to make sure baseVal is a URI here
        //  since it could be just 'foo.xml' at this point (which won't pass
        //  our TP.isURI() test). So we just compute the base and join the
        //  paths together.

        //  Expand the 'baseVal' path, converting any virtual constructs. If
        //  it isn't an absolute path, go ahead and compute the XML base
        //  value up the tree.
        baseVal = TP.uriResolveVirtualPath(baseVal);

        if (!TP.uriIsAbsolute(baseVal)) {
            //  If we haven't yet computed an XML Base for this element,
            //  compute one now.
            if (TP.notValid(computedBase)) {
                computedBase = TP.elementComputeXMLBaseFrom(anElement);
            }

            //  Compute the base path using the XML Base as computed from
            //  the element and the value of 'baseVal'. Note here how we
            //  pass 'false' to the TP.uriResolvePaths() call, forcing it to
            //  recognize that computedBase and baseVal are directories, not
            //  URIs to paths.
            basePath = TP.uriResolvePaths(computedBase, baseVal, false);
        } else {
            //  Otherwise, it was an absolute path, so just use it.
            basePath = baseVal;
        }

        //  If a basePath could not be computed, put an error message into
        //  the attribute value.
        if (TP.notValid(basePath)) {
            //  Note here how we prepend/append the prefix/suffix. The above
            //  mechanism might have set them - otherwise, they're empty.
            TP.elementSetAttribute(
                        anElement,
                        uriAttrNames.at(i),
                        'Couldn\'t compute base for: ' +
                            thePrefix + baseVal + theSuffix);
        } else {
            //  Note here how we prepend/append the prefix/suffix. The above
            //  mechanism might have set them - otherwise, they're empty.
            TP.elementSetAttribute(
                        anElement,
                        uriAttrNames.at(i),
                        thePrefix + basePath + theSuffix);
        }
    }

    return;
});

//  ------------------------------------------------------------------------
//  NODE PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeComparePosition',
function(aNode, otherNode, aPosition) {

    /**
     * @name nodeComparePosition
     * @synopsis Returns one of 5 values that can be used to determine the
     *     position of otherNode relative to aNode. Note that this comparison is
     *     *always* made from otherNode to aNode.
     * @description The aPosition parameter of this method has the following
     *     behavior, according to the defined 'TP' constants: TP.SAME_NODE ->
     *     aNode and otherNode are the same Node TP.PRECEDING_NODE -> otherNode
     *     precedes aNode in the document TP.FOLLOWING_NODE -> otherNode follows
     *     aNode in the document TP.CONTAINS_NODE -> otherNode contains aNode in
     *     the document TP.CONTAINED_BY_NODE -> otherNode is contained by aNode
     *     in the document
     * @param {Node} aNode The node to check to see if aChild is contained
     *     within it.
     * @param {Node} aChild The node to check to see if it is contained within
     *     aNode.
     * @param {Number} aPosition One of the following constants: TP.SAME_NODE
     *     TP.PRECEDING_NODE TP.FOLLOWING_NODE TP.CONTAINS_NODE
     *     TP.CONTAINED_BY_NODE.
     * @example Test to see if the first child of the document element of an XML
     *     document is followed by the second child of the document element:
     *     <code>
     *          xmlDoc = TP.documentFromString(
     *          '<foo><bar/><baz/></foo>');
     *          <samp>[object XMLDocument]</samp>
     *          TP.nodeComparePosition(
     *          xmlDoc.documentElement.childNodes[0],
     *          xmlDoc.documentElement.childNodes[1],
     *          TP.FOLLOWING_NODE);
     *          <samp>true</samp>
     *     </code>
     * @example Test to see if the body element of an HTML document is preceded
     *     by the head element:
     *     <code>
     *          TP.nodeComparePosition(
     *          TP.documentGetBody(document),
     *          document.documentElement.childNodes[0],
     *          TP.PRECEDING_NODE);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not otherNode is positioned relative to
     *     aNode according to the supplied position.
     * @raise TP.sig.InvalidNode Raised when either node is invalid as provided
     *     to the method.
     * @raise TP.sig.InvalidParameter Raised when an invalid position is
     *     provided to the method.
     * @todo
     */

    var position;

    //  In W3C-compliant browsers, this leverages compareDocumentPosition(),
    //  which is built-in for both HTML and XML documents. On IE, it
    //  leverages that call for XML documents and '.sourceIndex' for HTML
    //  documents.

    //  NB: This function originally from John Resig, under an MIT license.
    position =
        aNode.compareDocumentPosition ?
            aNode.compareDocumentPosition(otherNode) :
            aNode.contains ?
                (aNode !== otherNode && aNode.contains(otherNode) && 16) +
                (aNode !== otherNode && otherNode.contains(aNode) && 8) +
                (aNode.sourceIndex >= 0 && otherNode.sourceIndex >= 0 ?
                    (aNode.sourceIndex < otherNode.sourceIndex && 4) +
                    (aNode.sourceIndex > otherNode.sourceIndex && 2) :
                    1) + 0 :
                    0;

    /* jshint bitwise:false */
    return !!(position & aPosition);
    /* jshint bitwise:true */
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
