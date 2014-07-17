//  ========================================================================
/*
NAME:   TIBETCSSPrimitivesBase.js
AUTH:   William J. Edney (wje), Scott Shattuck (ss)
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

        Portions Copyright (C), 1999 Netscape Communications Corp.
*/
//  ========================================================================

/*
*/

/* JSHint checking */

/* global CSSRule:true
*/

//  ------------------------------------------------------------------------
//  SPECIAL CSS 'TP' FUNCTIONS
//  ------------------------------------------------------------------------

/*
The functions here provide attribute get/set support that's sensitive to the
TIBET CSS processor and it's requirements.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetAttribute',
function(anElement, attributeName, checkAttrNSURI) {

    /**
     * @name elementGetAttribute
     * @synopsis Returns the value of the attribute provided.
     * @description See discussion in main DOM primitives file.
     * @param {Element} anElement The element to retrieve the attribute value
     *     from.
     * @param {String} attributeName The attribute to find.
     * @param {Boolean} checkAttrNSURI True will cause this method to be more
     *     rigorous in its checks for prefixed attributes, looking via URI
     *     rather than just prefix. Default is false (to keep things faster).
     * @returns {String} The attribute value, if found.
     * @raise TP.sig.InvalidElement Raised when an invalid element is provided
     *     to the method.
     * @raise TP.sig.InvalidName Raised when the supplied attribute name is
     *     empty.
     * @todo
     */

    var pclassName,
        val,
        attr;

    //  start by seeing if the value is found under normal circumstances.
    //  NOTE that the implication of this is that attributes whose names
    //  match those of pseudo-class names don't have to have the pclass:
    //  prefix, but that they'll be treated as if they did
    val = TP.$elementGetAttribute(anElement, attributeName, checkAttrNSURI);
    if (TP.notEmpty(val)) {
        return val;
    }

    //  IE sometimes returns weird values as the result of attribute
    //  queries, especially around VML elements. The native getAttribute
    //  call returns an Object which has no enumerable properties, but does
    //  seem to have a 'value' slot, which contains a String representation.
    //  We try for that here.
    try {
        //  Note that this returns 'null' if this attribute is retrieved
        //  via getAttributeNode() above, which is why it fails that test.
        if (TP.isString(attr = anElement.getAttribute(attributeName)) &&
            (TP.isString(attr.value))) {
            return attr.value;
        }
    } catch (e) {
    }

    //  We only do this check if its not an XML document...
    if (!TP.isXMLDocument(TP.nodeGetDocument(anElement))) {
        //  If the attribute name matches one of our 'special' pclass
        //  attributes that are stand ins for pseudo-classes, put a
        //  'pclass:' on front of it and try again
        if (TP.regex.PCLASS_CHANGE.test(attributeName)) {
            pclassName = 'pclass:' + attributeName;

            if (!TP.elementHasAttribute(anElement, pclassName, true)) {
                return '';
            }

            val = TP.$elementGetAttribute(anElement, pclassName);
            if (TP.notEmpty(val)) {
                return val;
            }

            try {
                val = anElement.getAttribute(pclassName);
                if (TP.isString(attr =
                                anElement.getAttribute(attributeName)) &&
                    (TP.isString(attr.value))) {
                    return attr.value;
                }
            } catch (e) {
            }
        }
    }

    //  always return empty string for consistency when missing
    return TP.notValid(val) ? '' : val;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetAttribute',
function(anElement, attributeName, attributeValue, checkAttrNSURI) {

    /**
     * @name elementSetAttribute
     * @synopsis Sets the value of the attribute provided.
     * @description See discussion in main DOM primitives file.
     * @param {Element} anElement The element to set the attribute on.
     * @param {String} attributeName The attribute to set.
     * @param {String} attributeValue The attribute value.
     * @param {Boolean} checkAttrNSURI True will cause this method to be more
     *     rigorous in its checks for prefixed attributes, and will use calls to
     *     actually set the attribute into that namespace. Default is false (to
     *     keep things faster).
     * @raise TP.sig.InvalidElement Raised when an invalid element is provided
     *     to the method.
     * @raise TP.sig.InvalidName Raised when the supplied attribute name is
     *     empty.
     * @todo
     */

    var theAttrName,
        oldValue,
        changeHash,
        cssType;

    //  We only do this check if its not an XML document.
    if (TP.isHTMLNode(anElement)) {
        //  If the attribute name matches one of our 'special' pclass
        //  attributes that are stand ins for pseudo-classes, put a
        //  'pclass:' on front of it.
        if (TP.regex.PCLASS_CHANGE.test(attributeName)) {
            theAttrName = 'pclass:' + attributeName;
        } else {
            theAttrName = attributeName;
        }

        if (TP.isType(cssType = TP.sys.getTypeByName('css:sheet'))) {
            oldValue = anElement.getAttribute(theAttrName);

            if (oldValue === attributeValue) {
                return;
            }

            changeHash = TP.hc(
                'targetElement', anElement,
                'attribute', theAttrName,
                'oldValue', oldValue,
                'newValue', attributeValue,
                'operation', TP.notEmpty(oldValue) ? TP.UPDATE : TP.CREATE);

            //  Notify the type that we 'will' change the attribute.
            cssType.willChangeAttribute(changeHash);

            //  Call the common, private routine to actually set the
            //  attribute value.
            TP.$elementSetAttribute(anElement, theAttrName, attributeValue,
                                    false);

            //  Notify the type that we 'did' change the attribute.
            cssType.didChangeAttribute(changeHash);
        } else {
            //  Call the common, private routine to actually set the
            //  attribute value.
            TP.$elementSetAttribute(anElement, theAttrName, attributeValue,
                                    false);
        }

        //  Flush any pending CSS changes.
        TP.$elementCSSFlush(anElement);
    } else {
        //  Call the common, private routine to actually set the attribute
        //  value.
        TP.$elementSetAttribute(anElement, attributeName, attributeValue,
                                    checkAttrNSURI);
    }

    //  We only do expression reevaluation if its not an XML document and if
    //  its been processed by the CSS processor.

    return;
});

//  ------------------------------------------------------------------------
//  DOCUMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('documentAddCSSElement',
function(targetDoc, cssHref, inlineRuleText) {

    /**
     * @name documentAddCSSElement
     * @synopsis Adds the appropriate CSS element to the document based on
     *     whether the inlineRuleText parameter is 'true' or not. If it is, the
     *     style text will be retrieved from the cssHref and will be 'inlined'
     *     with an HTML 'style' element in the head of the document.
     * @param {Document} targetDoc The document to which the new element should
     *     be added.
     * @param {String} cssHref The href to use on the newly added CSS element.
     * @param {Boolean} inlineRuleText Whether or not the rule text should be
     *     'inlined' into the document. Defaults to false.
     * @raises TP.sig.InvalidDocument
     * @returns {HTMLElement} The new link or style element that was added.
     * @todo
     */

    var targetHead,

        cssText,

        newNativeElem;

    if (!TP.isDocument(targetDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  Make sure that the target document has a valid 'head' element or
    //  we're going nowhere.
    targetHead = TP.documentEnsureHeadElement(targetDoc);

    if (TP.isTrue(inlineRuleText)) {
        //  If inlineRuleText is true, then we load the style rule text
        //  synchronously, if its not empty, we use that style text to add
        //  under a 'style' element.

        cssText = TP.uc(cssHref).getResourceText(TP.hc('async', false));

        newNativeElem = TP.documentAddStyleElement(targetDoc, cssText);
    } else {
        newNativeElem = TP.documentAddLinkElement(targetDoc, cssHref);
    }

    return newNativeElem;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentAddLinkElement',
function(targetDoc, linkHref, beforeNode) {

    /**
     * @name documentAddLinkElement
     * @synopsis Adds a 'link' element to the target document with the provided
     *     href as the link's href.
     * @param {Document} targetDoc The document to which the new link element
     *     should be added.
     * @param {String} linkHref The href to use on the newly added 'link'
     *     element.
     * @param {Node} beforeNode Optional 'insertion point'.
     * @raises TP.sig.InvalidDocument
     * @returns {HTMLElement} The new link element that was added.
     * @todo
     */

    var targetHead,
        newLinkElement,

        before;

    if (!TP.isDocument(targetDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  Make sure that the target document has a valid 'head' element or
    //  we're going nowhere.
    targetHead = TP.documentEnsureHeadElement(targetDoc);

    //  Create a new 'link' element.
    newLinkElement = TP.documentCreateElement(targetDoc,
                                                'link',
                                                TP.w3.Xmlns.XHTML);

    TP.elementSetAttribute(newLinkElement, 'type', TP.CSS_TEXT_ENCODED);
    TP.elementSetAttribute(newLinkElement, 'rel', 'stylesheet');

    before = TP.ifInvalid(beforeNode, null);

    //  We don't have to worry about reassignment of newLinkElement to the
    //  return value of this method since we know we created it in
    //  targetDoc.
    TP.nodeInsertBefore(targetHead, newLinkElement, before, false);

    //  Set the new link element's href to linkHref. This loads the style
    //  sheet rules asynchronously.
    TP.elementSetAttribute(newLinkElement, 'href', linkHref);

    return newLinkElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentAddStyleElement',
function(targetDoc, styleText, beforeNode) {

    /**
     * @name documentAddStyleElement
     * @synopsis Adds a 'style' element to the target document with the
     *     optionally provided styleText as the rule text.
     * @param {Document} targetDoc The document to which the new style element
     *     should be added.
     * @param {String} styleText The optional rule text to use in the newly
     *     created style element.
     * @param {Node} beforeNode Optional 'insertion point'.
     * @raises TP.sig.InvalidDocument
     * @returns {HTMLElement} The new style element that was added.
     * @todo
     */

    var targetHead,
        newStyleElement,

        before;

    if (!TP.isDocument(targetDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  Make sure that the target document has a valid 'head' element or
    //  we're going nowhere.
    targetHead = TP.documentEnsureHeadElement(targetDoc);

    //  Create a new 'style' element
    newStyleElement = TP.documentCreateElement(targetDoc, 'style',
                                                TP.w3.Xmlns.XHTML);

    TP.elementSetAttribute(newStyleElement, 'type', TP.CSS_TEXT_ENCODED);

    //  Got to do this *before* we try to set the text content of the style
    //  element.

    before = TP.ifInvalid(beforeNode, null);

    //  We don't have to worry about reassignment of newStyleElement to the
    //  return value of this method since we know we created it in
    //  targetDoc.
    TP.nodeInsertBefore(targetHead, newStyleElement, before, false);

    if (TP.isString(styleText)) {
        //  Set the content of the style element to the new style text.
        TP.styleElementSetContent(newStyleElement, styleText);
    }

    return newStyleElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentCopyCSSElements',
function(cssElements, targetDoc) {

    /**
     * @name documentCopyCSSElements
     * @synopsis Copies style information from the 'link' and 'style' elements
     *     supplied in the element array and creates new 'link' and 'style'
     *     elements with that information in the target document.
     * @param {Array} cssElements The Array of 'style' and 'link' elements that
     *     will have their style information copied and used in the target
     *     document.
     * @param {Document} targetDoc The document whose style nodes should be
     *     updated.
     * @raises TP.sig.InvalidDocument,TP.sig.InvalidArray
     * @todo
     */

    var i,
        aCSSElement,

        localName;

    if (!TP.isDocument(targetDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    if (!TP.isArray(cssElements)) {
        return TP.raise(this, 'TP.sig.InvalidArray', arguments);
    }

    for (i = 0; i < cssElements.getSize(); i++) {
        aCSSElement = cssElements.at(i);

        localName = TP.elementGetLocalName(aCSSElement).toLowerCase();

        if (localName === 'link') {
            TP.documentCopyCSSLinkElement(aCSSElement, targetDoc);
        } else if (localName === 'style') {
            TP.documentCopyCSSStyleElement(aCSSElement, targetDoc);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentCopyCSSLinkElement',
function(anElement, targetDoc, inlineRuleText, onlyIfAbsent) {

    /**
     * @name documentCopyCSSLinkElement
     * @synopsis Copies style information from the supplied 'link' element and
     *     creates a new 'link' element with that information in the target
     *     document. NB: The caller *must* supply a 'link' element here, with a
     *     'rel' attribute of 'stylesheet', or an TP.sig.InvalidElement
     *     exception will be thrown.
     * @param {HTMLElement} anElement The 'link' element that should be copied
     *     into the target document.
     * @param {Document} targetDoc The document to which the CSS text should be
     *     added.
     * @param {Boolean} inlineRuleText Whether or not the rule text should be
     *     'inlined' into the document. Defaults to false.
     * @param {Boolean} onlyIfAbsent Whether or not the style element/link
     *     should be added only if it doesn't already exist. Defaults to false.
     * @raises TP.sig.InvalidDocument,TP.sig.InvalidElement
     * @todo
     */

    var shouldOnlyIfAbsent,

        linkHref,

        targetHead,

        existingLinkElements,
        i,

        sourceDirectory,

        cssText,

        newNativeElem,

        destWindow;

    if (!TP.isDocument(targetDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if ((TP.elementGetLocalName(anElement).toLowerCase() !== 'link') ||
        (TP.elementGetAttribute(anElement, 'rel') !== 'stylesheet')) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    shouldOnlyIfAbsent = TP.ifInvalid(onlyIfAbsent, false);

    linkHref = TP.elementGetAttribute(anElement, 'href');
    targetHead = targetDoc.getElementsByTagName('head')[0];

    //  If shouldOnlyIfAbsent is true, then we need to make sure that the
    //  target document doesn't already have a 'link' element with an 'href'
    //  equal to linkHref.
    if (TP.isElement(targetHead) && shouldOnlyIfAbsent) {
        existingLinkElements = TP.nodeGetElementsByTagName(targetHead,
                                                            'link');

        for (i = 0; i < existingLinkElements.getSize(); i++) {
            if ((existingLinkElements.at(i).rel === 'stylesheet') &&
                (TP.elementGetAttribute(
                        existingLinkElements.at(i), 'href') === linkHref)) {
                return existingLinkElements.at(i);
            }
        }
    }

    //  Grab the 'source directory' of the text. To do this, we go back to
    //  the document *of the original style element*, grab its location and
    //  then get the collection (i.e. 'directory') URL of that path.
    sourceDirectory = TP.uriCollectionPath(
                            TP.documentGetLocation(
                                TP.nodeGetDocument(anElement)));

    //  If we're processing CSS and the element hasn't been marked as
    //  'opaque', then we go ahead and add the content of the 'link' as a
    //  'style' element. This is so that we get the benefit of loading the
    //  stylesheet from the href in a 'synchronous manner'. We then process
    //  the new style element that we just added.
    //  NOTE: Due to the way the processing machinery works, there's no
    //  shortcut here... because of pathing considerations, etc. we need to
    //  have added a native 'style' element first.
    if (TP.sys.shouldProcessCSS() &&
        !TP.elementHasAttribute(anElement, 'tibet:opaque', true) &&
        !TP.elementHasAttribute(anElement, 'dontprocess')) {
        cssText = TP.uc(linkHref).getResourceText(TP.hc('async', false));

        newNativeElem = TP.documentAddStyleElement(targetDoc, cssText);

        //  Grab the 'destination window' - that is, the window that we're
        //  processing the style in.
        destWindow = TP.nodeGetWindow(targetDoc);

        //  Go ahead and process it as a 'style' element.
        TP.$windowProcessCSSStyleElement(destWindow, newNativeElem,
                                            sourceDirectory);

        return;
    } else if (TP.isTrue(inlineRuleText)) {
        //  If inlineRuleText is true, then we load the style rule text
        //  synchronously, if its not empty, we use that style text to add
        //  under a 'style' element.

        cssText = TP.uc(linkHref).getResourceText(TP.hc('async', false));

        newNativeElem = TP.documentAddStyleElement(targetDoc, cssText);
    } else {
        newNativeElem = TP.documentAddLinkElement(
                                targetDoc,
                                TP.uriJoinPaths(sourceDirectory, linkHref));
    }

    return newNativeElem;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentCopyCSSStyleElement',
function(anElement, targetDoc) {

    /**
     * @name documentCopyCSSStyleElement
     * @synopsis Copies style information from the supplied 'style' element and
     *     creates a new 'style' element with that information in the target
     *     document. NB: The caller *must* supply a 'style' element here, or an
     *     'TP.sig.InvalidElement' exception will be thrown.
     * @param {HTMLElement} anElement The 'style' element that should be copied
     *     into the target document.
     * @param {Document} targetDoc The document to which the CSS text should be
     *     added.
     * @raises TP.sig.InvalidDocument,TP.sig.InvalidElement
     * @returns {HTMLElement|null} The newly added 'style' element if the style
     *     was *not* processed by the CSS processor or null if it was.
     * @todo
     */

    var cssText,

        newNativeElem,

        destWindow,
        sourceDirectory;

    if (!TP.isDocument(targetDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.elementGetLocalName(anElement).toLowerCase() !== 'style') {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    cssText = TP.styleElementGetContent(anElement);

    newNativeElem = TP.documentAddStyleElement(targetDoc, cssText);

    //  If we're processing CSS and the element hasn't been marked as
    //  'opaque', then we go ahead and process the new style element that we
    //  just added.
    //  NOTE: Due to the way the processing machinery works, there's no
    //  shortcut here... because of pathing considerations, etc. we need to
    //  have added a native 'style' element like we just did above.
    if (TP.sys.shouldProcessCSS() &&
        !TP.elementHasAttribute(anElement, 'tibet:opaque', true) &&
        !TP.elementHasAttribute(anElement, 'dontprocess')) {
        //  Grab the 'destination window' - that is, the window that we're
        //  processing the style in.
        destWindow = TP.nodeGetWindow(targetDoc);

        //  Grab the 'source directory' of the text. To do this, we go back
        //  to the document *of the original style element*, grab its
        //  location and then get the collection (i.e. 'directory') URL of
        //  that path.
        sourceDirectory = TP.uriCollectionPath(
                                TP.documentGetLocation(
                                    TP.nodeGetDocument(anElement)));

        //  Go ahead and process it.
        TP.$windowProcessCSSStyleElement(destWindow, newNativeElem,
                                            sourceDirectory);
    } else {
        return newNativeElem;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetNativeCSSElements',
function(aDocument) {

    /**
     * @name documentGetNativeCSSElements
     * @synopsis Returns the supplied document's style sheet elements, if any.
     *     Note that this returns both 'style' elements and 'link' elements that
     *     have a 'rel' attribute with a value of 'stylesheet'. If the document
     *     has no head element or style elements, this method returns an empty
     *     Array.
     * @param {Document} aDocument The document to use.
     * @raises TP.sig.InvalidDocument
     * @returns {Array} An Array of either the 'link' or 'style' elements in the
     *     supplied document.
     * @todo
     */

    var targetHead,

        headElems,

        linkElems,
        res;

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  Make sure that the source document has a valid 'head' element or
    //  we're going nowhere.
    headElems = TP.nodeGetElementsByTagName(aDocument, 'head');
    if (!TP.isElement(targetHead = headElems.at(0))) {
        return TP.ac();
    }

    linkElems = TP.nodeGetElementsByTagName(targetHead, 'link');

    //  Select 'link' elements that are 'stylesheet' links.
    res = linkElems.select(
        function(aLinkElement) {

            if ((TP.elementGetAttribute(aLinkElement, 'rel') ===
                                                    'stylesheet') &&
                (TP.elementGetAttribute(aLinkElement, 'type') ===
                                                    TP.CSS_TEXT_ENCODED)) {
                return true;
            }

            return false;
        });

    //  Add all 'style' elements to the result array.
    res.addAll(TP.nodeGetElementsByTagName(targetHead, 'style'));

    return res;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetNativeStyleRules',
function(aDocument) {

    /**
     * @name documentGetNativeStyleRules
     * @synopsis Returns all of the CSS style rules for the supplied document.
     *     Because this routine uses the TP.styleSheetGetStyleRules() function,
     *     it will also return any rules found in embedded @import statements in
     *     CSS.
     * @param {HTMLDocument} aDocument The document to retrieve all style rules
     *     for.
     * @raises TP.sig.InvalidDocument
     * @returns {Array} The list of CSS rules for the supplied document.
     * @todo
     */

    var allSheets,
        allRules,

        i;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  Grab all of the style sheets in the document, whether they
    //  were linked in or defined in the head of the document.
    allSheets = aDocument.styleSheets;

    allRules = TP.ac();

    //  Loop over the sheets, grabbing each one's rules and adding them all
    //  to our overall collection.
    for (i = 0; i < allSheets.length; i++) {
        allRules.addAll(TP.styleSheetGetStyleRules(allSheets[i]));
    }

    return allRules;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetStyleRules',
function(aDocument) {

    /**
     * @name documentGetStyleRules
     * @synopsis Returns all of the CSS style rules for the supplied document.
     * @description If the TP.sys.shouldProcessCSS() flag is 'true' (the
     *     default) this call will return an Array of TP.lang.Hashes that
     *     represent all of the rules in this document. If it is false, this
     *     method will return the result of calling
     *     TP.documentGetNativeStyleRules() and the result will be an Array of
     *     native 'rule' objects for this browser.
     * @param {HTMLDocument} aDocument The document to retrieve all style rules
     *     for.
     * @raises TP.sig.InvalidDocument
     * @returns {Array} An Array of either TP.lang.Hashes or native browser
     *     'rule' objects representing the CSS rules for the supplied document.
     * @todo
     */

    return TP.documentGetNativeStyleRules(aDocument);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$documentRefreshAppliedRulesCaches',
function(aDocument) {

    /**
     * @name $documentRefreshAppliedRulesCaches
     * @synopsis Refreshes all style rules for every element in the document.
     *     The end result of running this function is that every element in the
     *     document will have a '.appliedRules' property that contains an Array
     *     of CSS style rules that apply to it.
     * @description As this function iterates over every CSS rule in the
     *     document, querying the document for matching elements and then adding
     *     to that element's '.appliedRules' property with that rule. Therefore,
     *     this can be a time consuming process. A 50 rule document with 50
     *     elements takes about 500ms on a 2.2Ghz Pentium 4 class machine.
     * @param {HTMLDocument} aDocument The document to refresh all of the
     *     elements of.
     * @raises TP.sig.InvalidDocument
     */

    var docRules,

        i,
        aRule,

        elementsMatchingRule,

        j,
        matchingElement;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  For some reason, some CSS selector queries can return the document
    //  object. Go ahead and put an 'appliedRules' Array there.
    aDocument.appliedRules = TP.ac();

    //  Grab all of the document's CSS rules.
    docRules = TP.documentGetNativeStyleRules(aDocument);

    //  Iterate over them, querying the document for any elements that
    //  match the selector text of the rule. Then, iterate over those
    //  elements and add the rule to its 'appliedRules' Array.
    for (i = 0; i < docRules.getSize(); i++) {
        aRule = docRules.at(i);

        elementsMatchingRule = TP.nodeEvaluateCSS(null, aRule.selectorText);

        for (j = 0; j < elementsMatchingRule.getSize(); j++) {
            matchingElement = elementsMatchingRule.at(j);

            if (TP.notValid(matchingElement.appliedRules)) {
                matchingElement.appliedRules = TP.ac();
            }

            matchingElement.appliedRules.push(aRule);
        }
    }

    return;
});

//  ------------------------------------------------------------------------
//  ELEMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetComputedStyleObj',
function(anElement) {

    /**
     * @name elementGetComputedStyleObj
     * @synopsis Returns the computed (resolved) style of the element. The
     *     result of intersecting the various inputs on style which affect the
     *     element in question.
     * @param {Element} anElement The element to inspect.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidDocument
     * @returns {Object} An object whose getPropertyValue function can be used
     *     to get individual style data values.
     */

    var doc;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!TP.isDocument(doc = TP.nodeGetDocument(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    return TP.nodeGetWindow(doc).getComputedStyle(anElement, null);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetPixelValue',
function(anElement, aValue, targetProperty, wantsTransformed) {

    /**
     * @name elementGetPixelValue
     * @synopsis A handy routine that returns pixel values regardless of what
     *     the CSS units were. This means that web developers can mix and match
     *     measurement units in their style sheets. it is not uncommon to
     *     express something like padding in "em" units while border thickness
     *     is most often expressed in pixels.
     * @param {HTMLElement} anElement The element to use to compute the pixel
     *     value from.
     * @param {String} aValue The size value to convert into pixels.
     * @param {String} targetProperty The name of the property being converted.
     *     This is only required if a percentage value is given, but is desired
     *     to produce the most accurate results.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidString
     * @returns {Number} The number of pixels that the supplied value will be in
     *     pixels for the supplied Element. Note that this routine can also
     *     return NaN, if it cannot compute a numeric value.
     * @todo
     */

    var parentElem,

        results,
        numericPart,
        unitPart,
        pixelsPerPoint;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isEmpty(aValue)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    //  If it's just a pixel value, then we can do a simple parse here and
    //  return.
    if (TP.regex.CSS_PIXEL.test(aValue)) {
        if (TP.isNaN(results = parseFloat(aValue))) {
            return 0;
        }

        return TP.isTrue(wantsTransformed) ?
                 TP.elementTransformCSSPixelValue(
                                        anElement,
                                        results,
                                        targetProperty) :
                 results;
    }

    //  If the value is not expressed using 'unit length' (i.e. it is a
    //  keyword such as 'inherit', 'initial', 'none', etc.), then we try to
    //  'do the right thing', based on a property name if one was supplied.
    if (!TP.regex.CSS_UNIT.test(aValue)) {
        switch (aValue) {
            case    'inherit':

                //  We inherited the property - return whatever our *parent
                //  node* ('inherit' *always* refers to the parent node) has
                //  as a value for this property.
                if (TP.isElement(parentElem = anElement.parentNode)) {
                    return TP.elementGetPixelValue(parentElem,
                                                    aValue,
                                                    targetProperty,
                                                    wantsTransformed);
                }

            break;

            case    'initial':
                //  TODO: This is a CSS3 value - what to do here?
                return NaN;

            case    'normal':
                //  TODO: Not sure what to do here
                return NaN;

            case    'thin':
            case    'medium':
            case    'thick':

                //  Could be border values... check further
                if (/border.*?Width/.test(targetProperty)) {
                    switch (aValue) {
                        case    'thin':
                            results = 2;
                        break;

                        case    'medium':
                            results = 4;
                        break;

                        case    'thick':
                            results = 6;
                        break;
                    }

                    return TP.isTrue(wantsTransformed) ?
                             TP.elementTransformCSSPixelValue(
                                                    anElement,
                                                    results,
                                                    targetProperty) :
                             results;
                }

                return NaN;

                //  Otherwise, return NaN
            /* jshint -W086 */
            case    'auto':
            case    'none':
            default:
                return NaN;
            /* jshint +W086 */
        }

        return;
    }

    //  If the value is expressed using a 'non-relative' unit measurement
    //  (i.e. not '%', 'em' or 'ex'), then we can try to convert it just
    //  using the 'pixelsPerPoint' computation.
    if (TP.regex.CSS_NON_RELATIVE_UNIT.test(aValue)) {
        results = TP.regex.CSS_NON_RELATIVE_UNIT.exec(aValue);
        numericPart = parseFloat(results.at(2));
        unitPart = results.at(3);

        //  Grab the number of 'pixels per point'.
        pixelsPerPoint = TP.getPixelsPerPoint();

        //  Based on the units expressed, return the proper number of
        //  pixels.
        switch (unitPart) {
            case    'pt':

                results = pixelsPerPoint * numericPart;

            break;

            case    'in':

                results = pixelsPerPoint * numericPart * 72;

            break;

            case    'pc':

                results = pixelsPerPoint * numericPart * 12;

            break;

            case    'mm':

                results = pixelsPerPoint * (numericPart / (7.2 / 2.54));

            break;

            case    'cm':

                results = pixelsPerPoint * (numericPart / (72 / 2.54));

            break;

            default:
            break;
        }

        return TP.isTrue(wantsTransformed) ?
                 TP.elementTransformCSSPixelValue(
                                        anElement,
                                        results,
                                        targetProperty) :
                 results;
    }

    //  If it's a percentage value and we've been supplied with a target
    //  property, then we can determine the pixel value by calling a routine
    //  that, based on the property name, will return the correct number of
    //  pixels.
    if (TP.regex.PERCENTAGE.test(aValue)) {
        if (TP.notValid(targetProperty)) {
            TP.ifError() ?
                TP.error('Percentage computation needs target property',
                            TP.CSS_LOG, arguments) : 0;

            return 0;
        }

        return TP.elementGetNumericValueFromPercentage(anElement,
                                                        targetProperty,
                                                        aValue,
                                                        wantsTransformed);
    }

    return TP.elementConvertUnitLengthToPixels(anElement,
                                                aValue,
                                                targetProperty,
                                                wantsTransformed);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetPseudoInlineStyleObj',
function(anElement) {

    /**
     * @name elementGetPseudoInlineStyleObj
     * @synopsis Returns a 'pseudo inline' style object. This is really the
     *     style object from a created CSS rule, since non-(X)HTML elements
     *     don't support the inline '.style' property / the 'style' attribute.
     * @param {HTMLElement} anElement The element to use to compute the pixel
     *     value from.
     * @raises TP.sig.InvalidElement
     * @returns {Object} The inline CSS style object of the supplied element.
     */

    var newSheet,

        styleElem,
        styleSheet,
        sheetRules,

        indexNum,
        rule,

        elemID,
        selectorText,

        i;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  Initially set the flag to say that we haven't created a new sheet.
    newSheet = false;

    //  Try to obtain the style element and its sheet - if its not
    //  available, create one and grab its sheet
    if (!TP.isElement(styleElem =
                        TP.nodeGetElementById(TP.nodeGetDocument(anElement),
                                                'pseudo_inline_rules'))) {
        if (!TP.isElement(styleElem =
                TP.documentAddStyleElement(TP.nodeGetDocument(anElement)))) {
            //  TODO: Raise an exception and return
        }

        //  Uniquely identify the 'pseudo inline style element'
        TP.elementSetAttribute(styleElem, 'id', 'pseudo_inline_rules');

        //  We did create a new sheet
        newSheet = true;
    }

    //  Grab the style sheet object and its rules.

    styleSheet = TP.cssElementGetStyleSheet(styleElem);

    //  Getting the rules is different between W3C-compliant browsers and
    //  IE.
    sheetRules = styleSheet.cssRules ?
                    styleSheet.cssRules :
                    styleSheet.rules;

    //  If the supplied element has a style rule index number, then it
    //  must've been assigned that before
    if (TP.isNumber(indexNum = anElement._pseudoInlineRuleIndex)) {
        //  See if we can locate a rule at that index and make sure its a
        //  'style rule' (i.e. not an AT_RULE or something).
        if (TP.isValid(rule = sheetRules[indexNum]) &&
                rule.type === CSSRule.STYLE_RULE) {
            //  Return the style object associated with the rule.
            return rule.style;
        }
    }

    //  Make sure the element has an 'id' attribute and pass true to force
    //  assignment if its not there.
    elemID = TP.lid(anElement, true);

    //  We also use a second attribute to force more specificity.
    TP.elementSetAttribute(anElement, 'pseudoinline', elemID);

    //  Compute the selector text
    selectorText = '*[id="' + elemID + '"][pseudoinline="' + elemID + '"]';

    //  If we didn't create a new sheet, then maybe we just lost the rule
    //  somewhere in the existing sheet...

    if (!newSheet) {
        //  We didn't create a new sheet - look for a style rule matching
        for (i = 0; i < sheetRules.length; i++) {
            //  If we find a rule that's both a style rule and where the
            //  selector matches, then shove its index onto the element and
            //  return the style object associated with the rule.
            if (sheetRules[i].type === sheetRules[i].STYLE_RULE &&
                sheetRules[i].selectorText === selectorText) {
                rule = sheetRules[i];
                anElement._pseudoInlineRuleIndex = i;

                return rule.style;
            }
        }
    }

    //  Create a new rule and add it to the end of the stylesheet.
    TP.styleSheetInsertRule(styleSheet, selectorText, '');

    sheetRules = styleSheet.cssRules ?
                    styleSheet.cssRules :
                    styleSheet.rules;

    //  The element's rule index will be the last rule's index
    anElement._pseudoInlineRuleIndex = sheetRules.length - 1;

    //  Return the style object associated with the new rule.
    return sheetRules[sheetRules.length - 1].style;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementTransformCSSPixelValue',
function(anElement, pixelValue, aPropertyName) {

    /**
     * @name elementTransformCSSPixelValue
     * @synopsis Transforms a pixel value from the given value to a value that
     *     takes into account any CSS transformations that have been applied to
     *     the element.
     * @param {HTMLElement} anElement The element to transform the pixel value
     *     against.
     * @param {Number} pixelValue The pixel value to transform.
     * @param {String} aPropertyName The name of the property that the pixel
     *     value came from. This name needs to have one of the following words
     *     in it in order for the value to convert properly: "top", "right",
     *     "bottom", "left".
     * @raises TP.sig.InvalidElement,TP.sig.InvalidNumber,
     *         TP.sig.InvalidParameter
     * @returns {Number} The transformed pixel value.
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!TP.isNumber(pixelValue)) {
        return TP.raise(this, 'TP.sig.InvalidNumber', arguments);
    }

    if (!TP.isString(aPropertyName)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    //  If the property name is either a *[t|T]op* or *[b|B]ottom*, then we're
    //  converting the Y value
    if (/(top|bottom)/i.test(aPropertyName)) {
        return TP.elementLocalToGlobalXY(anElement, 0, pixelValue).last();
    } else if (/(left|right)/i.test(aPropertyName)) {
        //  Otherwise, if the property name is either a *[l|L]eft* or
        //  *[r|R]ight*, then we're converting the X value
        return TP.elementLocalToGlobalXY(anElement, pixelValue, 0).first();
    } else {
        return pixelValue;
    }
});

//  ------------------------------------------------------------------------
//  STYLE PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('styleElementGetContent',
function(anElement) {

    /**
     * @name styleElementGetContent
     * @synopsis Returns the all of the CSS text under anElement, which should
     *     be a 'style' element. NB: The caller *must* supply a 'style' element
     *     here, or an 'TP.sig.InvalidElement' exception will be thrown.
     * @param {Element} anElement The 'style' element to retrieve the CSS text
     *     for.
     * @raises TP.sig.InvalidElement
     * @returns {String} The CSS text under anElement.
     */

    if (!TP.isElement(anElement) ||
        (TP.elementGetLocalName(anElement).toLowerCase() !== 'style')) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.notValid(anElement.firstChild)) {
        return '';
    }

    return anElement.firstChild.nodeValue;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleElementSetContent',
function(anElement, styleText) {

    /**
     * @name styleElementSetContent
     * @synopsis Sets the all of the CSS text under anElement, which should be a
     *     'style' element. NB: The caller *must* supply a 'style' element here,
     *     or an 'TP.sig.InvalidElement' exception will be thrown.
     * @param {Element} anElement The 'style' element to set the CSS text for.
     * @param {String} styleText The CSS text to use as the rule text for the
     *     style element.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    var styleTextNode;

    if (!TP.isElement(anElement) ||
        (TP.elementGetLocalName(anElement).toLowerCase() !== 'style')) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  If there's no valid text node under the style element, create one
    //  with the content.
    if (TP.notValid(styleTextNode = anElement.firstChild)) {
        TP.nodeAppendChild(
            anElement,
            TP.nodeGetDocument(anElement).createTextNode(styleText),
            false);
    } else {
        styleTextNode.nodeValue = styleText;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleRuleGetStyleSheet',
function(aStyleRule) {

    /**
     * @name styleRuleGetStyleSheet
     * @synopsis Returns the native style sheet object associated with the
     *     supplied style rule.
     * @param {CSSStyleRule} aStyleRule The style rule to retrieve the
     *     stylesheet of.
     * @raises TP.sig.InvalidParameter
     * @returns {CSSStyleSheet} The stylesheet object containing the rule.
     */

    if (TP.notValid(aStyleRule)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    //  The DOM standard is to just return the parentStyleSheet property of
    //  the rule.

    return aStyleRule.parentStyleSheet;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleSheetGetStyleRules',
function(aStylesheet, expandImports) {

    /**
     * @name styleSheetGetStyleRules
     * @synopsis Retrieves the rules from the supplied stylesheet. Note that
     *     this function also recursively descends through CSS @import
     *     statements to retrieve any imported style rules.
     * @param {CSSStyleSheet} aStylesheet The style sheet to retrieve the rules
     *     from.
     * @param {Boolean} expandImports Whether or not @import statements should
     *     be recursively 'expanded' and the rules gathered from them from. This
     *     defaults to true.
     * @raises TP.sig.InvalidParameter
     * @returns {Array} A list of CSSStyleRule objects in the supplied
     *     CSSStyleSheet, including those that may have been imported using an.
     *     @import statement.
     * @todo
     */

    var resultRules,
        sheetRules,

        shouldExpand,

        i;

    if (TP.notValid(aStylesheet)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    shouldExpand = TP.ifInvalid(expandImports, true);

    resultRules = TP.ac();

    //  Grab the rules from the sheet.
    sheetRules = aStylesheet.cssRules;

    //  Loop over each rule in the sheet and add the rule to our result
    //  Array.
    for (i = 0; i < sheetRules.length; i++) {
        //  If the rule is an '@import' rule, call this function recursively
        //  on the rule's 'stylesheet' property (which will be the actual
        //  stylesheet object of the stylesheet being imported) and add all
        //  of the rules found there to our result array.
        if (shouldExpand && sheetRules[i].type === sheetRules[i].IMPORT_RULE) {
            resultRules.addAll(
                TP.styleSheetGetStyleRules(sheetRules[i].styleSheet));
        } else {
            resultRules.push(sheetRules[i]);
        }
    }

    return resultRules;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleSheetGetStyleRulesMatching',
function(aStylesheet, selectorText) {

    /**
     * @name styleSheetGetStyleRulesMatching
     * @synopsis Retrieves the rules from the supplied stylesheet whose selector
     *     matches the supplied selector text. Note that this function also
     *     recursively descends through CSS @import statements to retrieve any
     *     imported style rules.
     * @param {CSSStyleSheet} aStylesheet The style sheet to retrieve the rules
     *     from.
     * @param {String} selectorText The text of the selector to match.
     * @raises TP.sig.InvalidParameter,TP.sig.InvalidString
     * @returns {Array} A list of CSS rules in the supplied style sheet,
     *     including those that may have been imported using an. @import
     *     statement, whose selector match the supplied selector text.
     * @todo
     */

    var resultRules,
        sheetRules,

        i;

    if (TP.notValid(aStylesheet)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    if (TP.isEmpty(selectorText)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    resultRules = TP.ac();

    //  Grab the rules from the sheet.
    sheetRules = aStylesheet.cssRules;

    //  Loop over each rule in the sheet and add the rule to our result
    //  Array.
    for (i = 0; i < sheetRules.length; i++) {
        //  If the rule is an '@import' rule, call this function recursively
        //  on the rule's 'stylesheet' property (which will be the actual
        //  stylesheet object of the stylesheet being imported) and add all
        //  of the rules found there to our result array.
        if (sheetRules[i].type === sheetRules[i].IMPORT_RULE) {
            resultRules.addAll(
                    TP.styleSheetGetStyleRulesMatching(
                                    sheetRules[i].styleSheet,
                                    selectorText));
        } else if (sheetRules[i].selectorText === selectorText) {
            resultRules.push(sheetRules[i]);
        }
    }

    return resultRules;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleSheetInsertRule',
function(aStylesheet, selectorText, ruleText, ruleIndex) {

    /**
     * @name styleSheetInsertRule
     * @synopsis Inserts a rule into the stylesheet specified at the specified
     *     rule index. Note that the rule text should *not* have the leading and
     *     trailing brackets.
     * @param {CSSStyleSheet} aStylesheet The style sheet to add the rule to.
     * @param {String} selectorText The CSS selectorText to use when applying
     *     the rule.
     * @param {String} ruleText The style text of the rule.
     * @param {Number} ruleIndex The index to insert the style rule at. If not
     *     supplied, the rule will be inserted at the end.
     * @raises TP.sig.InvalidParameter,TP.sig.InvalidString
     * @returns {Number} The index of the newly created rule within the
     *     stylesheet element's rule set. This is important in case the rule
     *     needs to be deleted later. If the index was supplied to this method,
     *     this value will be the same as that supplied.
     * @todo
     */

    var theRuleText,

        newRuleIndex;

    if (TP.notValid(aStylesheet)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    //  NB: We allow empty rule text
    if (TP.isEmpty(selectorText)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    theRuleText = TP.ifInvalid(ruleText, '');

    newRuleIndex = TP.ifInvalid(ruleIndex, aStylesheet.cssRules.length);

    aStylesheet.insertRule(TP.join(selectorText, '{', theRuleText, '}'),
                            newRuleIndex);

    return newRuleIndex;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleSheetRemoveRule',
function(aStylesheet, ruleIndex) {

    /**
     * @name styleSheetRemoveRule
     * @synopsis Removes the stylesheet rule at the rule index of the stylesheet
     *     element specified.
     * @param {CSSStyleSheet} aStylesheet The style sheet to remove the rule
     *     from.
     * @param {Number} ruleIndex The index of the rule within the stylesheet to
     *     remove.
     * @raises TP.sig.InvalidParameter
     * @todo
     */

    if (TP.notValid(aStylesheet)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    //  The W3C standard is 'deleteRule'.
    aStylesheet.deleteRule(ruleIndex);

    return;
});

//  ------------------------------------------------------------------------
//  ELEMENT-LEVEL FUNCTIONS
//  ------------------------------------------------------------------------

TP.definePrimitive('cssElementGetStyleSheet',
function(anElement) {

    /**
     * @name cssElementGetStyleSheet
     * @synopsis Returns the CSS style sheet object belonging to anElement,
     *     which must be either a 'link' or a 'style' element. NB: The caller
     *     *must* supply a 'link' or 'style' element here, or an
     *     'TP.sig.InvalidElement' exception will be thrown.
     * @param {Element} anElement The element to retrieve the CSS style sheet
     *     object for.
     * @raises TP.sig.InvalidElement
     * @returns {CSSStyleSheet} The style sheet object.
     */

    var localName;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    localName = TP.elementGetLocalName(anElement).toLowerCase();

    if ((localName !== 'link') && (localName !== 'style')) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    return anElement.sheet;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
