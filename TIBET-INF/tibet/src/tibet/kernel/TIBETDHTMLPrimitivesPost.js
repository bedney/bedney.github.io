//  ========================================================================
/*
NAME:   TIBETDHTMLPrimitivesPost.js
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
Common routines associated with "Dynamic HTML" or DHTML -- aka AJAX GUI.
These cover features like animation, drag-and-drop, on-the-fly css, runtime
DOM manipulation, etc.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('computeCommonSizes',
function() {

    /**
     * @name computeCommonSizes
     * @synopsis Computes a number of 'system-wide' global numbers used for
     *     DHTML computations, such as the font metrics for a certain set of
     *     font heights and the scrollbar width.
     */

    var measuringDiv,

        docStyleObj,

        oldFontSize,
        keys,
        len,
        i,
        key,
        styleObj,

        scrollingDiv,
        testingDiv;

    //  Inspired by Morris John's emResized measurer.

    //  If the font heights haven't been computed yet, do so now.
    if (TP.notValid(TP.FONT_HEIGHTS)) {
        //  We start with a hash that has a value of 0 for each of
        //  the different sizes of fonts that we're going to compute.
        TP.FONT_HEIGHTS =
                TP.hc('1em', 0,
                        '1ex', 0,
                        '100%', 0,
                        '12pt', 0,
                        '16px', 0,
                        'xx-small', 0,
                        'x-small', 0,
                        'small', 0,
                        'medium', 0,
                        'large', 0,
                        'x-large', 0,
                        'xx-large', 0);

        //  Create a 'div' that we will use for measuring the fonts.
        measuringDiv = document.createElement('div');
        TP.elementSetStyle(
            measuringDiv,
            'position: absolute; top: 0px; left: -100px; ' +
            'width: 30px; height: 1000em; ' +
            'border: 0px; margin: 0px; padding: 0px; outline: 0px; ' +
            'line-height: 1; overflow: hidden;');

        //  Need to append it somewhere real in order to obtain a real
        //  measurement.

        //  We don't have to worry about reassignment of measuringDiv to the
        //  return value of this method since we know we created it in this
        //  document.
        TP.nodeAppendChild(TP.documentGetBody(document), measuringDiv, false);

        //  On IE, we need to make sure that the document element has a font
        //  size. This won't normally cause problems since the 'html'
        //  element in html documents don't have a font size assigned (or
        //  used).
        if (TP.boot.isUA('IE')) {
            docStyleObj = TP.elementGetStyleObj(document.documentElement);
            oldFontSize = docStyleObj.fontSize;
            docStyleObj.fontSize = '100%';
        }

        //  Loop over all of the keys of the hash
        keys = TP.keys(TP.FONT_HEIGHTS);
        len = keys.getSize();

        styleObj = TP.elementGetStyleObj(measuringDiv);

        for (i = 0; i < len; i++) {
            key = keys[i];

            //  Set the font size of the div to the value of the key.
            styleObj.fontSize = key;

            //  Put the number of pixels computed as the value of that
            //  key in the hash
            TP.FONT_HEIGHTS.atPut(key,
                        Math.round(measuringDiv.offsetHeight * 12 / 16) *
                                (16 / 12) / 1000);
        }

        //  Make sure and remove the measuring div from where we stuck it.
        TP.nodeDetach(measuringDiv);

        //  If we're in IE, we need to put the document element's font size
        //  back to what it was.
        if (TP.boot.isUA('IE')) {
            //  docStyleObj is set above in the first 'if we're in IE'
            //  code.
            docStyleObj.fontSize = oldFontSize;
        }
    }

    //  Inspired by Morris John's scrollbar measurer.

    //  The value for the scroller width is cached once per application run
    //  in the 'TP.SCROLLER_WIDTH' variable. Check to see if this
    //  computation has already been done.
    if (TP.notValid(TP.SCROLLER_WIDTH)) {
        //  Create a 'div' that will scroll. This is where we will take our
        //  measurements.
        scrollingDiv = document.createElement('div');
        TP.elementSetStyle(
                scrollingDiv,
                'position: absolute; top: -300px; left: 0px; ' +
                'width: 100px; height: 100px; overflow: scroll;');

        //  Create a child that we will append to it that will cause it to
        //  scroll.
        testingDiv = document.createElement('div');
        TP.elementSetStyle(
                testingDiv,
                'width: 400px; height: 400px;');

        //  We don't have to worry about reassignment of testingDiv to the
        //  return value of this method since we know we created it in this
        //  document.
        TP.nodeAppendChild(scrollingDiv, testingDiv, false);

        //  We don't have to worry about reassignment of scrollingDiv to the
        //  return value of this method since we know we created it in this
        //  document.
        TP.nodeAppendChild(TP.documentGetBody(document), scrollingDiv, false);

        //  The scroller width is the difference between the offset width
        //  and the client width.
        TP.SCROLLER_WIDTH = scrollingDiv.offsetWidth -
                                    scrollingDiv.clientWidth;

        //  Make sure and remove the measuring div from where we stuck it.
        TP.nodeDetach(scrollingDiv);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getPixelsPerPoint',
function() {

    /**
     * @name getPixelsPerPoint
     * @synopsis Returns the number of 'pixels per point' (i.e. the number of
     *     'px' in a 'pt') in the currently executing browser environment.
     * @returns {Number} The number of pixels per point.
     */

    var fontMeasurement;

    if (TP.notValid(fontMeasurement = TP.FONT_HEIGHTS.at('12pt'))) {
        return 0;
    }

    return fontMeasurement / 12;
});

//  ------------------------------------------------------------------------
//  DOCUMENT PRIMITIVES
//  ------------------------------------------------------------------------

/*
There's a bit of a fine line between whether these are "DOM primitives" or
"DHTML primitives" in some cases, but the overall idea here is that if a
function is more about runtime manipulation of a visible DOM we tend toward
thinking of it as a DHTML primitive.

The functions in this section handle things like runtime CSS manipulation
and movement/alteration of runtime DOM properties on documents.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('documentEnsureHeadElement',
function(aDocument) {

    /**
     * @name documentEnsureHeadElement
     * @synopsis Ensures that a 'head' element is present in the supplied
     *     Document. If it isn't, it creates one and appends it to the
     *     Document's documentElement.
     * @param {Document} aDocument The document to create the 'head' element in.
     * @raises TP.sig.InvalidDocument
     * @returns {HTMLElement} The head element that existed or was created in
     *     the supplied document.
     */

    var headElement;

    //  Note that sometimes we use this in XML documents (i.e. content
    //  processing) so we just check for TP.isDocument() here, not
    //  TP.isHTMLDocument().
    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    headElement = TP.nodeGetFirstElementByTagName(aDocument, 'head');
    if (TP.notValid(headElement)) {
        headElement = TP.documentCreateElement(
                                aDocument,
                                'head',
                                TP.w3.Xmlns.XHTML);

        TP.nodeInsertBefore(aDocument.documentElement,
                            headElement,
                            aDocument.documentElement.firstChild,
                            false);
    }

    return headElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentFocusAutofocusedElement',
function(aDocument) {

    /**
     * @name documentFocusAutofocusedElement
     * @synopsis Focuses the element in the supplied document that contains the
     *     HTML5 'autofocus' attribute (which would be the first one to focus
     *     when the document first loads).
     * @param {Document} aDocument The document to focus the autofocused element
     *     in.
     * @raises TP.sig.InvalidDocument
     */

    var autofocusedElem;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    if (TP.isElement(autofocusedElem =
                        TP.byCSS('*[autofocus]', aDocument).first())) {
        //  Focus it 'the TIBET way' (so that proper highlighting, etc.
        //  takes effect)
        TP.wrap(autofocusedElem).focus();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetAllIFrames',
function(aDocument) {

    /**
     * @name documentGetAllIFrames
     * @synopsis Returns all of the iframes nested in aDocument. This function
     *     recursively descends into iframes in aDocument and retrieves any
     *     embedded iframes in it.
     * @param {Document} aDocument The document to begin searching for iframes.
     * @raises TP.sig.InvalidDocument
     * @returns {Array} The list of nested iframes.
     * @todo
     */

    var allIFrames,

        iFrameChildren,
        objectChildren,

        index;

    if (!TP.isHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    allIFrames = TP.ac();

    iFrameChildren = TP.nodeGetElementsByTagName(aDocument, 'iframe');

    //  Grab all of the 'object' elements in the DOM, but then select out
    //  only those that have a 'contentDocument' object - those will be the
    //  XHTML iframes.
    objectChildren = TP.nodeGetElementsByTagName(aDocument, 'object');
    objectChildren = objectChildren.select(
                        function(anObjElem) {

                            return TP.isDocument(anObjElem.contentDocument);
                        });
    iFrameChildren = iFrameChildren.concat(objectChildren);

    //  Loop over any iframe children found and concatenate the
    //  iframe itself and the results of recursively calling this
    //  function.
    for (index = 0; index < iFrameChildren.length; index++) {
        allIFrames.addAll(
                        TP.documentGetAllIFrames(
                            TP.elementGetIFrameDocument(
                                        iFrameChildren[index])));
    }

    return allIFrames;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetBody',
function(aDocument) {

    /**
     * @name documentGetBody
     * @synopsis Returns the enclosing document's body element.
     * @param {Document} aDocument The document to use.
     * @raises TP.sig.InvalidDocument
     * @returns {String} The document's body element.
     */

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    if (TP.isHTMLDocument(aDocument)) {
        return aDocument.body;
    }

    return TP.nodeGetFirstElementByTagName(aDocument, 'body');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetBodyContent',
function(aDocument) {

    /**
     * @name documentGetBodyContent
     * @synopsis Returns the enclosing document's body in text form. This is
     *     used when creating a static application version so that the packaged
     *     file's body matches that of the config file itself.
     * @param {Document} aDocument The document to use.
     * @raises TP.sig.InvalidDocument
     * @returns {String} The document's body text.
     */

    var bodyElement;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    bodyElement = TP.nodeGetFirstElementByTagName(aDocument, 'body');
    if (TP.isElement(bodyElement)) {
        return bodyElement.innerHTML;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetHead',
function(aDocument) {

    /**
     * @name documentGetHead
     * @synopsis Returns the enclosing document's head element.
     * @param {Document} aDocument The document to use.
     * @raises TP.sig.InvalidDocument
     * @returns {String} The document's head element.
     */

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    return TP.nodeGetFirstElementByTagName(aDocument, 'head');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetHeadContent',
function(aDocument) {

    /**
     * @name documentGetHeadContent
     * @synopsis Returns the enclosing document's head in text form. This is
     *     used when creating a static, inlined boot configuration page for
     *     stripping/zipping.
     * @param {Document} aDocument The document to use.
     * @raises TP.sig.InvalidDocument
     * @returns {String} The document's head text.
     */

    var headElement;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    headElement = TP.nodeGetFirstElementByTagName(aDocument, 'head');
    if (TP.isElement(headElement)) {
        return headElement.innerHTML;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetFocusedElement',
function(aDocument) {

    /**
     * @name documentGetFocusedElement
     * @synopsis Returns the supplied document's currently focused (i.e.
     *     'active') element. If no element is currently focused, this will
     *     return the 'body' element, as per the HTML5 specification.
     * @param {Document} aDocument The document to query.
     * @raises TP.sig.InvalidDocument
     * @returns {Element} The currently focused element.
     */

    var activeElement;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  Some browsers (i.e. Webkit) don't support '.activeElement' for XHTML
    //  documents. See https://bugs.webkit.org/show_bug.cgi?id=63922

    //  Therefore, we try to query for the first element that would
    //  have the TIBET 'pclass:focus' pseudo-class on it and use that.
    //  Otherwise, we do what the HTML5 standard says and return the 'body'
    //  element.
    //  In properly functioning browsers, the built-in routine already returns
    //  the 'body' if there is no focused element.

    if (!TP.isElement(activeElement = aDocument.activeElement)) {
        //  Note how we pass 'true' as the third argument here to auto-collapse
        //  the returned Array into the first item
        if (!TP.isElement(activeElement = TP.byCSS('*[pclass|focus]',
                                                     aDocument,
                                                     true))) {
            activeElement = TP.documentGetBody(aDocument);
        }
    }

    return activeElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetLinkFileNames',
function(aDocument) {

    /**
     * @name documentGetLinkFileNames
     * @synopsis Returns an array of any link (<a href="") files referenced in
     *     the document.
     * @param {Document} aDocument The document to search.
     * @returns {Array}
     */

    var arr,
        list,
        len,
        i,
        name;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    list = TP.nodeGetElementsByTagName(aDocument, 'a');
    len = list.getSize();

    arr = TP.ac();

    for (i = 0; i < len; i++) {
        name = TP.elementGetAttribute(list[i], 'href');

        if (TP.notEmpty(name) && !TP.regex.JS_SCHEME.test(name)) {
            arr.push(name);
        }
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetTitleContent',
function(aDocument) {

    /**
     * @name documentGetTitleContent
     * @synopsis Returns the supplied document's 'title' content. This is the
     *     text content of the 'title' element in the document's 'head' element.
     * @param {Document} aDocument The document to obtain the title content of.
     * @returns {String} The document's title content.
     */

    var titleElem;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    if (TP.isElement(titleElem =
                        aDocument.getElementsByTagName('title')[0])) {
        return titleElem.text;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetLocation',
function(aDocument, trimFile) {

    /**
     * @name documentGetLocation
     * @synopsis Returns the supplied document's location, optionally minus the
     *     document name itself. If there is no window associated with the
     *     supplied document and it has no internal data such as a tibet:src or
     *     xml:base value this method returns the empty String (''). NOTE also
     *     that the response to this call is not encoded (escaped with %20 for
     *     space etc).
     * @param {Document} aDocument The document to use.
     * @param {Boolean} trimFile True will cause any file reference to be
     *     trimmed, returning only a directory. Default is false.
     * @raises TP.sig.InvalidDocument
     * @returns {String} The document's location.
     * @todo
     */

    var doc,
        win,
        ndx,
        trim,
        loc,
        htmlBase;

    //  by default we return the full path to the file
    trim = TP.ifInvalid(trimFile, false);

    //  make sure we're really dealing with a document
    if (!TP.isDocument(doc = aDocument)) {
        doc = TP.nodeGetDocument(aDocument);
        if (TP.notValid(doc)) {
            return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
        }
    }

    //  empty document? no location
    if (TP.notValid(doc.documentElement)) {
        return '';
    }

    //  first choice is always the tibet:src value since we try to keep this
    //  accurate relative to the original source file name
    if (TP.notEmpty(loc = TP.elementGetAttribute(doc.documentElement,
                                                    'tibet:src',
                                                    true))) {
        //  we need to expand these since they're often virtual paths
        loc = TP.uriExpandPath(loc);
    } else if (TP.notTrue(trim) &&
                TP.notEmpty(loc = TP.elementGetAttribute(
                                        doc.documentElement,
                                        'xml:base',
                                        true))) {
        //  we need to expand these since they're often virtual paths
        loc = TP.uriExpandPath(loc);
    } else if (TP.notTrue(trim) &&
                TP.notEmpty(htmlBase = doc.getElementsByTagName('base')[0])) {
        //  this won't be a virtual path
        loc = TP.elementGetAttribute(htmlBase, 'href');
    }

    if (TP.isEmpty(loc)) {
        //  If there is no valid window, return the empty string.
        if (TP.notValid(win = TP.nodeGetWindow(doc))) {
            return '';
        }

        loc = win.location.toString();
    }

    //  watch out for Moz et. al. and the empty location "file://[/]"
    if ((loc === 'file:///') || (loc === 'file://')) {
        return '';
    }

    if (trim) {
        ndx = loc.lastIndexOf('/');
        if (ndx !== TP.NOT_FOUND) {
            loc = loc.slice(0, loc.lastIndexOf('/'));
        }
    }

    //  remove any leading tibet:/// and any trailing '#document' since
    //  those aren't part of the true location
    loc = loc.strip(/^tibet:\/\/\//).strip(/#document$/);

    //  keep format consistent so regardless of the value's format (encoded
    //  or not) we return it in decoded form minus any floating anchor it
    //  may have acquired
    return decodeURI(loc).chop('#');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetPixelsForFontSize',
function(aDocument, aFontSize) {

    /**
     * @name documentGetPixelsForFontSize
     * @synopsis Returns the number of pixels for a particular font size in the
     *     supplied document.
     * @param {Document} aDocument The document to use to compute the font
     *     metrics.
     * @param {String} aFontSize The font size to use to compute the pixels. For
     *     instance, '1em' or '9pt'.
     * @raises TP.sig.InvalidDocument
     * @returns {Number} The number of pixels the supplied font size takes up in
     *     the supplied document.
     * @todo
     */

    var numPixels,

        docStyleObj,
        oldFontSize,

        measuringDiv;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  Derived from the dojotoolkit.org font metric measurer, which is
    //  derived from Morris John's emResized measurer.

    numPixels = 0;

    if (TP.notValid(TP.FONT_HEIGHTS)) {
        TP.FONT_HEIGHTS = TP.hc();
    }

    //  The value for the document's font sizes are cached once per
    //  application run in the 'TP.FONT_HEIGHTS' variable. Check to see if
    //  this computation has already been done.
    if (TP.notValid(numPixels = TP.FONT_HEIGHTS.at(aFontSize))) {
        //  We need to adjust the font size in IE
        if (TP.boot.isUA('IE')) {
            docStyleObj = TP.elementGetStyleObj(aDocument.documentElement);
            oldFontSize = docStyleObj.fontSize;
            docStyleObj.fontSize = '100%';
        }

        //  Create a 'div' that will be used to do the measuring.
        measuringDiv = aDocument.createElement('div');
        TP.elementSetStyle(
                measuringDiv,
                'position: absolute; top 0px; left: -100px; ' +
                'width: 30px; height: 1000em; border: 0px; margin: 0px; ' +
                'padding: 0px; outline: 0px; line-height: 1; ' +
                'overflow: hidden;');

        //  Need to append it somewhere real in order to obtain a real
        //  measurement.

        //  We don't have to worry about reassignment of measuringDiv to the
        //  return value of this method since we know we created it in
        //  aDocument.
        TP.nodeAppendChild(TP.documentGetBody(aDocument), measuringDiv, false);

        //  Take the measurement
        TP.elementGetStyleObj(measuringDiv).fontSize = aFontSize;
        numPixels =
            Math.round(measuringDiv.offsetHeight * 12 / 16) * 16 / 12 / 1000;

        //  Make sure and remove the measuring div from where we stuck it.
        TP.nodeDetach(measuringDiv);

        //  Cache the result so that we don't have to do this again for this
        //  font size
        TP.FONT_HEIGHTS.atPut(aFontSize, numPixels);

        //  If we're in IE, we need to put the document element's font size
        //  back to what it was.
        if (TP.boot.isUA('IE')) {
            //  docStyleObj is set above in the first 'if we're in IE' code.
            docStyleObj.fontSize = oldFontSize;
        }
    }

    return numPixels;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetScriptFileNames',
function(aDocument) {

    /**
     * @name documentGetScriptFileNames
     * @synopsis Returns an array of any JavaScript files referenced in the
     *     document.
     * @param {Document} aDocument The document to search.
     * @raises TP.sig.InvalidDocument
     * @returns {Array}
     */

    var arr,
        list,
        len,
        i,
        name;

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    list = TP.nodeGetElementsByTagName(aDocument, 'script');
    len = list.getSize();

    arr = TP.ac();

    for (i = 0; i < len; i++) {
        name = TP.elementGetAttribute(list[i], 'src') ||
                TP.elementGetAttribute(list[i], 'source');

        if (TP.notEmpty(name)) {
            arr.push(name);
        }
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentGetScriptNodes',
function(aDocument) {

    /**
     * @name documentGetScriptNodes
     * @synopsis Returns the enclosing document's script nodes, if any.
     * @param {Document} aDocument The document to use.
     * @raises TP.sig.InvalidDocument
     * @returns {Array}
     */

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    return TP.nodeGetElementsByTagName(aDocument, 'script');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentRewriteSpecialHacks',
function(theContent) {

    /**
     * @name documentRewriteSpecialHacks
     * @synopsis Rewrites any 'style' content in the head (either 'link'
     *     elements or content within a 'style' element) that was placed there
     *     to work around Mozilla bugs.
     * @description Even though this function rewrites content because of
     *     Mozilla bugs, it needs to exist across all platforms since content
     *     generated on Mozilla may be saved in cache files and used on other
     *     browsers.
     * @param {String} aContent The content to rewrite the style rules in.
     * @raises TP.sig.InvalidString
     * @returns {String}
     */

    var content;

    if (TP.isEmpty(theContent)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    content = theContent;

    //  update namespaced attributes with their proper prefixes.
    content = content.replace(/_colon_/g, ':');

    //  we had to escape HTML style elements and HTML link elements pointing
    //  to stylesheets and CSS imports to avoid problems with the content
    //  processing system under Mozilla, so we need to unescape those
    //  constructs here
    content = TP.$unescapeCSSConstructs(content);

    return content;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentScrollBy',
function(aDocument, deltaX, deltaY) {

    /**
     * @name documentScrollBy
     * @synopsis Scrolls the document by the deltaX and deltaY amounts provided.
     * @param {Document} aDocument The document to scroll.
     * @param {Number} deltaX The X amount to scroll the document by.
     * @param {Number} deltaY The Y amount to scroll the document by.
     * @raises TP.sig.InvalidDocument
     * @todo
     */

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    TP.nodeGetWindow(aDocument).scrollBy(deltaX, deltaY);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentScrollTo',
function(aDocument, x, y) {

    /**
     * @name documentScrollTo
     * @synopsis Scrolls the document to the X and Y coordinates provided.
     * @param {Document} aDocument The document to scroll.
     * @param {Number} x The X coordinate to scroll the document to.
     * @param {Number} y The Y coordinate to scroll the document to.
     * @raises TP.sig.InvalidDocument
     * @todo
     */

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    TP.nodeGetWindow(aDocument).scrollTo(x, y);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentSetLocation',
function(aDocument, aURIStr, force) {

    /**
     * @name documentSetLocation
     * @synopsis Sets the document's location. This is done by stamping the
     *     document's 'root element' with a 'tibet:src' attribute.
     * @param {Document} aDocument The document to use.
     * @param {String} aURIStr The URL string to use as the document's location.
     * @param {Boolean} force If true, this method will ignore any existing
     *     value for 'tibet:src' (or 'xml:base') and stamp in the supplied URI
     *     value for 'tibet:src'.
     * @raises TP.sig.InvalidDocument
     * @returns {String} The document's location.
     * @todo
     */

    var doc,
        url,
        node;

    //  make sure we're really dealing with a document
    if (!TP.isDocument(doc = aDocument)) {
        doc = TP.nodeGetDocument(aDocument);
        if (TP.notValid(doc)) {
            return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
        }
    }

    url = aURIStr;
    if (TP.notValid(url)) {
        return;
    }

    node = doc.documentElement;
    if (TP.notValid(node)) {
        return;
    }

    //  If its already got either a 'tibet:src' or 'xml:base', bail out
    //  here.
    if ((TP.elementHasAttribute(node, 'tibet:src', true) ||
            TP.elementHasAttribute(node, 'xml:base', true)) &&
            TP.notTrue(force)) {
        return;
    }

    TP.elementSetAttributeInNS(node, 'tibet:src', url, TP.w3.Xmlns.TIBET);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('documentSetTitleContent',
function(aDocument, titleText) {

    /**
     * @name documentSetTitleContent
     * @synopsis Sets the supplied document's 'title' content.
     * @param {Document} aDocument The document to set the title content of.
     * @param {String} titleText The value to use as the title content.
     * @raises TP.sig.InvalidDocument,TP.sig.InvalidString
     * @todo
     */

    var theTitle,

        headElem,
        titleElem;

    if (!TP.isHTMLDocument(aDocument) && !TP.isXHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  NB: We do allow titleText to be ''. So, if title text is not a
    //  String, we set it to ''.
    if (!TP.isString(theTitle = titleText)) {
        theTitle = '';
    }

    //  Make sure that the document has a valid 'head' element or we're
    //  going nowhere.
    headElem = TP.documentEnsureHeadElement(aDocument);

    titleElem = TP.nodeGetFirstElementByTagName(aDocument, 'title');
    if (TP.notValid(titleElem)) {
        titleElem = TP.documentCreateElement(
                                aDocument,
                                'title',
                                TP.w3.Xmlns.XHTML);

        TP.nodeAppendChild(headElem, titleElem, false);
    }

    titleElem.text = theTitle;

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlDocumentAddContent',
function(aDocument, theContent, loadedFunction, shouldAwake) {

    /**
     * @name htmlDocumentAddContent
     * @synopsis Adds content from theContent onto the end of the child content
     *     of the document element of the supplied document.
     * @param {Document} aDocument The document to receive the content.
     * @param {Node|String} theContent The object to use as the source of the
     *     content.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just inserted.
     * @raises TP.sig.InvalidDocument
     * @returns {Node} The first node of the content that was just inserted.
     * @todo
     */

    var bodyElem;

    if (!TP.isHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    if (TP.isElement(bodyElem = TP.documentGetBody(aDocument))) {
        return TP.htmlElementAddContent(bodyElem.
                                        theContent,
                                        loadedFunction,
                                        shouldAwake);
    } else {
        return TP.htmlElementAddContent(aDocument.documentElement,
                                        theContent,
                                        loadedFunction,
                                        shouldAwake);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlDocumentInsertContent',
function(aDocument, theContent, aPositionOrPath, loadedFunction, shouldAwake) {

    /**
     * @name htmlDocumentInsertContent
     * @synopsis Inserts content from theContent into/around the document
     *     element of the supplied document based on the position given. The
     *     position should indicate whether the content should become the
     *     previous sibling, next sibling, first child or last child.
     * @param {Document} aDocument The document to receive the content.
     * @param {Node|String} theContent The object to use as the source of the
     *     content.
     * @param {String} aPositionOrPath The position to place the content
     *     relative to the document's documentElement or a path to evaluate to
     *     get to a node at that position. This should be one of four values:
     *     TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END, TP.AFTER_END or the
     *     path to evaluate. Default is TP.BEFORE_END.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just inserted.
     * @raises TP.sig.InvalidDocument
     * @returns {Node} The first node of the content that was just inserted.
     * @todo
     */

    if (!TP.isHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    return TP.htmlElementInsertContent(aDocument.documentElement,
                                        theContent,
                                        aPositionOrPath,
                                        loadedFunction,
                                        shouldAwake);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlDocumentSetContent',
function(aDocument, theContent, loadedFunction, shouldAwake) {

    /**
     * @name htmlDocumentSetContent
     * @synopsis Sets the content of the supplied document, replacing the
     *     document's documentElement with the resulting content if valid.
     * @description Content sent to a document must be suitable for replacing
     *     the entire content of the document, i.e. it becomes the source of the
     *     new documentElement. This implies that the content must be able to
     *     provide a valid node containing a single root element of the same
     *     document type (XML vs HTML). NOTE: Content set via this mechanism is
     *     *always* awakened via the TP.$$processDocumentLoaded() method that
     *     gets called when the document is loaded.
     * @param {Document} aDocument The document to receive the content.
     * @param {Node|String} theContent The object to use as the source of the
     *     content.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just inserted.
     * @returns {Node} The first node of the content that was just inserted. In
     *     this case, the documentElement.
     * @todo
     */

    var awakenContent,

        content,
        nodeContent,
        strContent,

        headElem,
        baseElem,
        baseVal,

        str,
        win;

    TP.debug('break.html_content');

    if (!TP.isHTMLDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    awakenContent = TP.ifInvalid(shouldAwake, TP.nodeHasWindow(aDocument));

    //  unwrap any TP.core.Node wrapper we may have received
    content = TP.unwrap(theContent);

    //  If the content is an (X)HTML node, then we just make sure its an
    //  Element, and not a Document. It will be turned into a String after
    //  node manipulations later.
    if (TP.isHTMLNode(content) || TP.isXHTMLNode(content)) {
        if (TP.isDocument(content)) {
            nodeContent = content.documentElement;
        } else {
            nodeContent = content;
        }

        strContent = null;
    } else {
        //  Otherwise, its an XML node or a String - in either case, we get
        //  the HTML String representation and use that.
        strContent = TP.htmlstr(content);
        nodeContent = null;
    }

    //  If we have node content, then we use it - since parsing, in general,
    //  is where the performance problems are.
    if (TP.isNode(nodeContent)) {
        //  Make sure that we have a 'base' tag so that relative file
        //  references in the content will be resolved properly.

        //  If we can find a 'head' element, see if we can find an existing
        //  'base' element.
        if (TP.isElement(
                headElem =
                TP.nodeGetFirstElementChildByTagName(nodeContent, 'head'))) {
            //  See if we have both a 'base' element and a valid value for
            //  an 'xml:base' attribute on the document element.
            baseElem = nodeContent.getElementsByTagName('base')[0];
            baseVal = TP.elementGetAttribute(
                        TP.nodeGetDocument(nodeContent).documentElement,
                        'xml:base',
                        true);
        } else {
            //  Couldn't find a 'head' element, so we create one in the
            //  XHTML namespace and append it to the document element.
            headElem = TP.documentCreateElement(
                                    TP.nodeGetDocument(nodeContent),
                                    'head',
                                    TP.w3.Xmlns.XHTML);

            TP.nodeAppendChild(
                TP.nodeGetDocument(nodeContent).documentElement,
                headElem,
                false);

            baseElem = null;
            baseVal = '';
        }

        //  If there is no valid 'base' element but there is a valid value
        //  for 'xml:base', then go ahead and make a 'base' element and set
        //  its 'href' to that value.
        if (TP.notValid(baseElem) && TP.notEmpty(baseVal)) {
            //  Make sure that the base value has a trailing slash
            if (baseVal.last() !== '/') {
                baseVal += '/';
            }

            baseElem = TP.documentCreateElement(
                            TP.nodeGetDocument(nodeContent),
                            'base',
                            TP.w3.Xmlns.XHTML);

            TP.elementSetAttribute(baseElem, 'href', baseVal);

            //  If the head element has child nodes, then we want to insert
            //  our newly minted 'base' element as the first child (to get
            //  proper resolution for elements with relative paths later in
            //  the head content).

            //  NB: If the headElem doesn't have a 'firstChild', this is the
            //  same as append()ing a child.
            TP.nodeInsertBefore(headElem,
                                baseElem,
                                headElem.firstChild,
                                false);
        }

        str = TP.htmlstr(content);
    } else if (TP.isString(strContent)) {
        //  We already made sure that the String is HTML above.
        str = strContent;
    }

    if (TP.boot.isUA('IE')) {
        //  IE doesn't do a good job of handling '&apos;' - but it can
        //  handle the numeric version.
        str = str.replace(/&apos;/g, '&#39;');
    }

    str = TP.documentRewriteSpecialHacks(str);

    //  Grab the native window for instrumentation
    win = TP.nodeGetWindow(aDocument);

    //  make sure we try to force strict HTML (IE standards mode)
    if (!/<!DOCTYPE/.test(str)) {
        str = TP.w3.DocType.HTML_401_STRICT.asString() + '\n' + str;
    }

    //  On Mozilla and Safari we have to call the
    //  TP.$$processDocumentUnloaded() manually since altering the DOM won't
    //  cause a true unload signal to be fired - you have to alter the
    //  location to have that happen
    if (TP.boot.isUA('GECKO') || TP.boot.isUA('WEBKIT')) {
        try {
            aDocument.open(TP.HTML_TEXT_ENCODED, 'replace');
            aDocument.write('');

            //  Note here how we pass false so that this call will not try
            //  to check to see if the window is or will close, which we
            //  know it won't here.
            TP.$$processDocumentUnloaded(win, false);
        } catch (e) {
        } finally {
            aDocument.close();
        }
    }

    /*
    if (TP.sys.shouldProcessCSS()) {
        //  Because browsers, in general, like to take control of their
        //  style content 'early' and muck with it, we capture the content
        //  of 'style' elements here and strip them out the document. These
        //  will get processed just like link elements do when the
        //  TP.$$processDocumentLoaded() is called.
        theStyleChunks = TP.ac();
        TP.regex.STYLE_CAPTURE.lastIndex = 0;
        str = str.replace(
                TP.regex.STYLE_CAPTURE,
                function(wholeMatch, styleBody) {

                    theStyleChunks.push(styleBody);

                    return '';
                });
    };
    */

    //  Go ahead and register an 'onload' function that will call the proper
    //  machinery to set up the document from a CSS perspective and call a
    //  passed in 'loaded' function, if one is available.
    if (TP.isCallable(loadedFunction)) {
        TP.core.Window.registerOnloadFunction(win, loadedFunction);
    }

    //  Set the flag that tells the TP.$$processDocumentLoaded() function
    //  whether it should awaken the content that is about to be written.
    TP.core.Window.setWindowInfo(TP.gid(win), 'shouldAwake', awakenContent);

    //  Open, write the computed String content, and then close the
    //  document. This triggers the TIBET machinery to call the onload
    //  function above.

    try {
        TP.core.Window.$$isDocumentWriting = true;
        aDocument.open(TP.HTML_TEXT_ENCODED, 'replace');

        if (TP.boot.isUA('WEBKIT')) {
            //  Loop over and clear all 'global variable references' for
            //  consistency between browsers. Mozilla tends to clear any
            //  user-placed global slots, as does IE, but Safari tends not
            //  to.
            TP.keys(TP.sys.$globals).perform(
                    function(aKey) {

                        win[aKey] = null;
                    });
        }

        //  If a reference to the 'tibet_hook' file wasn't in the content
        //  that we're writing, then we need to install our own load/unload
        //  hooks.
        if (!/tibet_hook/.test(str)) {
            //  Reset handlers. they get cleared on open/write
            TP.core.Window.installLoadUnloadHooks(win);

            //  Note we set this slot *after* the document opens. This is
            //  put here so that the manual 'onload' handler that we wrote
            //  above can find the TIBET window reference.
            win.$$tibet = window;
        }

        aDocument.write(str);

        /*
        if (TP.sys.shouldProcessCSS()) {
            //  Make sure to assign the style chunks to a window variable
            //  *after the document is opened* (when the browser machinery
            //  clears all variables on the window) but *before the
            //  document.close() is called* (when the 'onload' machinery is
            //  called and the CSS processor is expecting to have these
            //  entries to process).
            win.$globalStyleCaptures = theStyleChunks;
        };
        */
    } catch (e) {
    } finally {
        aDocument.close();
    }

    //  Return the document's documentElement
    return aDocument.documentElement;
});

//  ------------------------------------------------------------------------
//  ELEMENT PRIMITIVES
//  ------------------------------------------------------------------------

/*
As with documents, there's a fine line around DOM vs. DHTML functionality
for certain operations on elements, but these are the ones we feel are more
about runtime DHTML manipulation than "plain ol' DOM manipulation".
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('elementAddClass',
function(anElement, className) {

    /**
     * @name elementAddClass
     * @synopsis Adds a CSS class name to the element if it is not already
     *     present.
     * @param {Element} anElement The element to add the CSS class to.
     * @param {String} className The CSS class name to add.
     * @raises TP.sig.InvalidElement
     * @returns {Element} The element the supplied class was added to.
     * @todo
     */

    var existingClass;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isEmpty(className)) {
        return;
    }

    if (TP.elementHasClass(anElement, className)) {
        return anElement;
    }

    //  If the native 'classList' property is available, use that.
    if (TP.isValid(anElement.classList)) {
        return anElement.classList.add(className);
    }

    if (TP.notEmpty(existingClass = TP.elementGetClass(anElement))) {
        TP.elementSetAttribute(anElement,
                                'class',
                                existingClass + ' ' + className);
    } else {
        TP.elementSetAttribute(anElement, 'class', className);
    }

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementComputeBoxSizeOfMarkup',
function(anElement, markup, boxType, wantsTransformed) {

    /**
     * @name elementComputeSizeOfMarkup
     * @synopsis Returns an Array of width and height of the element as if it
     *     contained the supplied markup. For now, this markup is limited to
     *     (X)HTML markup.
     * @param {Element} anElement The element to obtain the size of, given the
     *     supplied markup string.
     * @param {String} markup The String of markup to populate the element with
     *     in order to determine its size.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the width and height for. This can one of the following
     *     values: TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If
     *     this parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidString
     * @returns {Array} The [width, height] pair computed when the content of
     *     the element is set to the supplied markup.
     * @todo
     */

    var theBoxType,

        anElementClone,

        width,
        height;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isEmpty(markup)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    //  Default the box type to TP.BORDER_BOX
    theBoxType = TP.ifInvalid(boxType, TP.BORDER_BOX);

    //  Clone the element in preparation for setting its content and
    //  appending it.
    anElementClone = TP.nodeCloneNode(anElement);

    //  Set it and append it.
    TP.elementSetInnerContent(anElementClone, markup);

    //  We don't have to worry about reassignment of anElementClone to the
    //  return value of this method since we know we created it by cloning
    //  anElement.
    TP.nodeAppendChild(anElement.parentNode, anElementClone, false);

    //  Grab the width and height of the clone. Since its now a 'sibling' to
    //  the supplied element, and has its tag name and all of its
    //  attributes, its style should be exactly the same (at least for width
    //  and height - don't care about X and Y offsets).
    width = TP.elementGetWidth(anElementClone, theBoxType, wantsTransformed);
    height = TP.elementGetHeight(anElementClone, theBoxType, wantsTransformed);

    //  Remove the clone since we no longer need it.
    TP.nodeDetach(anElementClone);

    //  Return the width and height.
    return TP.ac(width, height);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementComputeCornerUsing',
function(anElement, pointX, pointY, insetTop, insetRight, insetBottom,
insetLeft) {

    /**
     * @name elementComputeCornersUsing
     * @synopsis Computes a 'corner' that a particular point is in, given a set
     *     of offsets.
     * @description Given the point and the offsets, this method will return one
     *     of the following values: TP.TOP TP.RIGHT TP.BOTTOM TP.LEFT
     *     TP.TOP_LEFT TP.TOP_RIGHT TP.BOTTOM_LEFT TP.BOTTOM_RIGHT
     * @param {Element} anElement The element to compute the corner for.
     * @param {Number} pointX The X coordinate of the point used in testing.
     * @param {Number} pointY The Y coordinate of the point used in testing.
     * @param {Number} insetTop The top offset from the edge 'in' towards the
     *     center of the supplied Element.
     * @param {Number} insetRight The right offset from the edge 'in' towards
     *     the center of the supplied Element.
     * @param {Number} insetBottom The bottom offset from the edge 'in' towards
     *     the center of the supplied Element.
     * @param {Number} insetLeft The left offset from the edge 'in' towards the
     *     center of the supplied Element.
     * @raises TP.sig.InvalidElement
     * @returns {String}
     * @todo
     */

    var elemCoords,

        boxTop,
        boxRight,
        boxBottom,
        boxLeft,

        xSide,
        ySide;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elemCoords = TP.elementGetBorderBox(anElement);

    boxLeft = elemCoords.at('left');
    boxTop = elemCoords.at('top');
    boxRight = boxLeft + elemCoords.at('width');
    boxBottom = boxTop + elemCoords.at('height');

    //  Outside the box? Forget it.
    if ((pointX < boxLeft) ||
        (pointX > boxRight) ||
        (pointY < boxTop) ||
        (pointY > boxBottom)) {
        return null;
    }

    xSide = null;
    ySide = null;

    if (pointX > boxLeft && pointX < (boxLeft + insetLeft)) {
        xSide = 'LEFT';
    } else if (pointX > (boxRight - insetRight) && pointX < boxRight) {
        xSide = 'RIGHT';
    }

    if (pointY > boxTop && pointY < (boxTop + insetTop)) {
        ySide = 'TOP';
    } else if (pointY > (boxBottom - insetBottom) && pointY < boxBottom) {
        ySide = 'BOTTOM';
    }

    if (TP.isString(xSide) && TP.notValid(ySide)) {
        return TP[xSide];
    }

    if (TP.isString(ySide) && TP.notValid(xSide)) {
        return TP[ySide];
    }

    if (TP.isString(xSide) && TP.isString(ySide)) {
        return TP[ySide + '_' + xSide];
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementComputeOnScreenXY',
function(anElement, preferredX, preferredY, offsetX, offsetY, preferredCorners) {

    /**
     * @name elementComputeOnScreenXY
     * @synopsis Returns an Array of data that includes X and Y values for the
     *     supplied Element that are guaranteed to keep the element 'on-screen'.
     * @description This method takes the supplied preferred X and Y for the
     *     element and, using the element to compute a width and height for the
     *     element, computes an X and Y that keeps the element on screen. This
     *     method also accepts an X and Y offset to 'pad' around the supplied
     *     element in the computation and an Array of 'corners' that will be
     *     tested in turn in the attempt to place the element.
     * @param {HTMLElement} anElement The element to compute the on-screen X and
     *     Y for.
     * @param {Number} preferredX The preferred X that the caller would like to
     *     place the supplied element at.
     * @param {Number} preferredY The preferred Y that the caller would like to
     *     place the supplied element at.
     * @param {Number} offsetX The X offset in pixels to use as a 'padding'.
     *     This defaults to 0.
     * @param {Number} offsetY The Y offset in pixels to use as a 'padding'.
     *     This defaults to 0.
     * @param {Array} preferredCorners An Array of 'corners' to use to test.
     *     This should be one of: TP.TOP_LEFT TP.BOTTOM_LEFT TP.TOP_RIGHT
     *     TP.BOTTOM_RIGHT.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidNumber
     * @returns {Array} An Array of the following return values: [on-screen X,
     *     on-screen Y, corner used, distanceComputation].
     * @todo
     */

    var desiredOffsetX,
        desiredOffsetY,

        thePreferredCorners,

        elemDoc,

        viewableWidth,
        viewableHeight,

        scrollOffsetX,
        scrollOffsetY,

        styleObj,
        oldDisplayValue,

        elementBoxWidth,
        elementBoxHeight,

        bestX,
        bestY,
        bestCorner,
        bestDistance,

        successfulMatch,
        i,
        len,
        corner,
        initialX,
        initialY,

        finalX,
        finalY,
        theDistance;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!TP.isNumber(preferredX) || !TP.isNumber(preferredY)) {
        return TP.raise(this, 'TP.sig.InvalidNumber', arguments);
    }

    //  The offsets default to 0.
    desiredOffsetX = TP.ifInvalid(offsetX, 0);
    desiredOffsetY = TP.ifInvalid(offsetY, 0);

    //  The corner used for computation defaults to TP.TOP_LEFT
    thePreferredCorners = TP.ifInvalid(preferredCorners,
                                    TP.ac(TP.TOP_LEFT));

    elemDoc = TP.nodeGetDocument(anElement);

    //  Grab the viewable area of the document.
    viewableWidth = TP.documentGetViewableWidth(elemDoc);
    viewableHeight = TP.documentGetViewableHeight(elemDoc);

    //  Grab how much the document may have scrolled.
    scrollOffsetX = TP.documentGetScrollX(elemDoc);
    scrollOffsetY = TP.documentGetScrollY(elemDoc);

    //  Grab the border box width and height of the element, but first make
    //  sure to turn off any non-default 'display' setting that would cause
    //  the element to have different dimensions than it normally would
    //  have.

    styleObj = TP.elementGetStyleObj(anElement);

    //  Note here how we go after any manually set 'display' style - we're
    //  not interested in the computed style here.
    oldDisplayValue = styleObj.display;
    styleObj.display = '';

    //  Capture the element's TP.BORDER_BOX width and height
    elementBoxWidth = TP.elementGetWidth(anElement, TP.BORDER_BOX);
    elementBoxHeight = TP.elementGetHeight(anElement, TP.BORDER_BOX);

    //  Set the old display value back.
    styleObj.display = oldDisplayValue;

    //  Initialize the tracking values.
    bestX = -1;
    bestY = -1;
    bestCorner = null;
    bestDistance = Infinity;

    //  Loop over the preferred corners.
    len = thePreferredCorners.length;
    for (i = 0; i < len; i++) {
        corner = thePreferredCorners[i];

        successfulMatch = true;

        //  Compute the initial X to try, based on the current
        //  corner that we're testing.
        if ((corner === TP.TOP_LEFT) || (corner === TP.BOTTOM_LEFT)) {
            initialX = preferredX + desiredOffsetX;
        } else {
            initialX = preferredX -
                        elementBoxWidth -
                        desiredOffsetX;
        }

        //  Compute the initial Y to try, based on the current
        //  corner that we're testing.
        if ((corner === TP.TOP_LEFT) || (corner === TP.TOP_RIGHT)) {
            initialY = preferredY + desiredOffsetY;
        } else {
            initialY = preferredY -
                        elementBoxHeight -
                        desiredOffsetY;
        }

        //  If the initial X was less than 0, then clamp it to 0 and
        //  set our successful match flag to false.
        if (initialX < 0) {
            initialX = 0;
            successfulMatch = false;
        }

        //  If the initial Y was less than 0, then clamp it to 0 and
        //  set our successful match flag to false.
        if (initialY < 0) {
            initialY = 0;
            successfulMatch = false;
        }

        //  Add the element box's width to the initial X value to
        //  produced a final computational value that we'll try
        //  below.
        finalX = initialX + elementBoxWidth;

        //  If that value is greater than the viewable width of the
        //  document, then set it to be the viewable width of the
        //  document minus the element box's width and set our
        //  successful match flag to false.
        if (finalX > viewableWidth) {
            finalX = viewableWidth - elementBoxWidth;
            successfulMatch = false;
        } else {
            //  Otherwise, set it to the initial value that we were
            //  going to try.
            finalX = initialX;
        }

        //  Max this value against any sort of supplied X offset
        //  plus any X offset produced from the document having
        //  scrolled.
        finalX = finalX.max(desiredOffsetX) + scrollOffsetX;

        //  Add the element box's height to the initial Y value to
        //  produced a final computational value that we'll try
        //  below.
        finalY = initialY + elementBoxHeight;

        //  If that value is greater than the viewable height of the
        //  document, then set it to be the viewable height of the
        //  document minus the element box's height and set our
        //  successful match flag to false.
        if (finalY > viewableHeight) {
            finalY = viewableHeight - elementBoxHeight;
            successfulMatch = false;
        } else {
            //  Otherwise, set it to the initial value that we were
            //  going to try.
            finalY = initialY;
        }

        //  Max this value against any sort of supplied Y offset
        //  plus any Y offset produced from the document having
        //  scrolled.
        finalY = finalY.max(desiredOffsetY) + scrollOffsetY;

        //  If we had a successful match, then we can just exit
        //  right here by setting our tracking values and breaking
        //  from the loop.
        if (successfulMatch) {
            bestX = finalX;
            bestY = finalY;

            bestDistance = 0;

            bestCorner = corner;

            break;
        }

        //  Otherwise, recompute a distance and check to see if its
        //  less than the current best distance. If so, set our
        //  tracking values and loop again.
        theDistance =
                (finalX - initialX - scrollOffsetX).pow(2) +
                (finalY - initialY - scrollOffsetY).pow(2);
        if (bestDistance > theDistance) {
            bestX = finalX;
            bestY = finalY;

            bestDistance = theDistance;

            bestCorner = corner;
        }
    }

    //  Return an Array of the best computed X, the best computed Y and the
    //  corner used to compute them.
    return TP.ac(bestX, bestY, bestCorner, bestDistance);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementContainsPoint',
function(anElement, x, y) {

    /**
     * @name elementContainsPoint
     * @synopsis Returns true or false depending on whether the given x and y
     *     falls inside of the element.
     * @description Note that the coordinates should be given in 'document'
     *     coordinates.
     * @param {HTMLElement} anElement The element to test the x and y against.
     * @param {Number} x The X coordinate to test.
     * @param {Number} y The Y coordinate to test.
     * @raises TP.sig.InvalidElement, TP.sig.InvalidNumber
     * @returns {Boolean} Whether or not the x and y coordinates fall inside of
     *     the element.
     * @todo
     */

    var elemCoords;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!TP.isNumber(x) || !TP.isNumber(y)) {
        return TP.raise(this, 'TP.sig.InvalidNumber', arguments);
    }

    //  We must obtain the coordinates of the element as they are relative
    //  to the document. These are returned: left, top, width, height.
    elemCoords = TP.elementGetBorderBox(anElement);

    //  If the X and Y fall within the coordinates of the element, then
    //  return true.
    if ((x >= elemCoords.at('left')) &&
        (y >= elemCoords.at('top')) &&
        (x <= elemCoords.at('left') + anElement.offsetWidth) &&
        (y <= elemCoords.at('top') + anElement.offsetHeight)) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementDefaultDisplay',
function(anElement) {

    /**
     * @name elementDefaultDisplay
     * @synopsis Sets the element back to the 'default' display value. This
     *     includes clearing any specific inline style setting for the CSS
     *     display property.
     * @param {HTMLElement} anElement The element to default the display of.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    var displayValue,
        theTagName;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  Since the author might have used a non-default value for the
    //  'display' property, we clear it of any local value and then check to
    //  see if its still 'none'. If so, we use TIBET's built-in map to get
    //  the proper 'display' value for the element.

    TP.elementGetStyleObj(anElement).display = '';

    displayValue = TP.elementGetComputedStyleObj(anElement).display;
    if (displayValue === 'none') {
        //  The default for XHTML is lower case, so make sure that the
        //  tag name is in that form.
        theTagName = TP.elementGetLocalName(anElement).toLowerCase();

        //  Get the display value for that particular tag name, but only
        //  if that tag is a usually a 'non-inline' element.
        displayValue = TP.XHTML_10_NONINLINE_ELEMENTS.at(theTagName);

        //  If there was a valid value for the display property, that
        //  means that the tag is normally a non-inline element, so
        //  set its display property to that value, otherwise, set its
        //  display property to 'inline'.
        if (TP.isString(displayValue)) {
            TP.elementGetStyleObj(anElement).display = displayValue;
        } else {
            TP.elementGetStyleObj(anElement).display = 'inline';
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetBorderBox',
function(anElement, wantsTransformed) {

    /**
     * @name elementGetBorderBox
     * @synopsis Returns the 'border box' of the supplied element. This can
     *     be a tortuous and error-prone process on some browsers, so this
     *     method provides a cross-platform way of obtaining it.
     * @param {HTMLElement} anElement The element to use to compute the
     *     border box from.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {TP.lang.Hash} A hash containing the border box at: 'left',
     *     'top', 'width', 'height'.
     */

    var elementDoc,

        useBCR,

        offsetAncestor,

        borderVals,

        offsetX,
        offsetY,
        offsetWidth,
        offsetHeight,

        elementBox;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elementDoc = TP.nodeGetDocument(anElement);

    //  We can use the Bounding Client Rect if:
    //      a) the caller has specified that it wants transformed coordinates
    //      OR
    //      b) the element is not transformed (because BCR is a faster way to
    //      obtain box coordinates than iterating through the offset ancestor
    //      hierarchy).
    //  In other words, only if the caller has expressly said it doesn't want
    //  transformed coordinates and the element is transformed do we use offset
    //  ancestor iteration.
    useBCR = TP.isTrue(wantsTransformed) ||
                !TP.elementIsTransformed(anElement);

    if (!useBCR) {

        offsetX = anElement.offsetLeft;
        offsetY = anElement.offsetTop;

        offsetAncestor = TP.elementGetOffsetParent(anElement);
        while (TP.isElement(offsetAncestor)) {

            borderVals = TP.elementGetStyleValuesInPixels(
                            offsetAncestor,
                            TP.ac('borderTopWidth', 'borderLeftWidth'));

            offsetX += offsetAncestor.offsetLeft +
                         borderVals.at('borderLeftWidth');
            offsetY += offsetAncestor.offsetTop +
                         borderVals.at('borderTopWidth');

            if ((offsetAncestor !== elementDoc.body) &&
                (offsetAncestor !== elementDoc.documentElement)) {
                    offsetX -= offsetAncestor.scrollLeft;
                    offsetY -= offsetAncestor.scrollTop;
            }

            offsetAncestor = TP.elementGetOffsetParent(offsetAncestor);
        }

        offsetWidth = anElement.offsetWidth;
        offsetHeight = anElement.offsetHeight;
    } else {
        elementBox = anElement.getBoundingClientRect();

        //  Mozilla's getBoundingClientRect() method hands back float
        //  values - in case Trident/Webkit's do the same thing, we
        //  round these to integers.
        offsetX = elementBox.left.round();
        offsetY = elementBox.top.round();
        offsetWidth = elementBox.width.round();
        offsetHeight = elementBox.height.round();

        //  Make sure to compute in the scrollX / scrollY from the
        //  document element.
        offsetX += TP.documentGetScrollX(elementDoc);
        offsetY += TP.documentGetScrollY(elementDoc);
    }

    return TP.hc('left', offsetX,
                    'top', offsetY,
                    'width', offsetWidth,
                    'height', offsetHeight);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetFirstEnabledWith',
function(anElement, anAttrName, anAttrValue) {

    /**
     * @name elementGetFirstEnabledWith
     * @synopsis Starting at the supplied element, this method works its way up
     *     the ancestor chain to an element that doesn't have a 'disabled'
     *     attribute on it and has the supplied attribute name (and possible
     *     attribute value) present on it. If any element in the chain is
     *     'disabled', this routine returns null.
     * @param {HTMLElement} anElement The element to begin searching for the
     *     ancestor.
     * @param {String} anAttrName The name of the attribute to look for on the
     *     ancestor.
     * @param {String} anAttrName The name of the attribute to look for on the
     *     ancestor.
     * @returns {HTMLElement}
     * @todo
     */

    var theElement,
        retElement,

        hasAttrValue;

    theElement = anElement;
    retElement = null;

    hasAttrValue = TP.notEmpty(anAttrValue);

    //  Starting at the supplied element, traverse up the parent chain to
    //  the Document node.
    while ((theElement.nodeType !== Node.DOCUMENT_NODE) &&
            (theElement.nodeType !== Node.DOCUMENT_FRAGMENT_NODE)) {
        //  If the element at this level is 'disabled', then nothing we do
        //  here matters, so we bail out.
        if (TP.elementHasAttribute(theElement, 'disabled')) {
            retElement = null;
            break;
        }

        //  If the return element hasn't already been set and the element at
        //  this level has the supplied attribute, then set the element at
        //  this level to be the return element.
        if (TP.notValid(retElement)) {
            if (hasAttrValue &&
                (TP.elementGetAttribute(theElement, anAttrName, true) ===
                                                        anAttrValue)) {
                retElement = theElement;
            } else if (TP.elementHasAttribute(theElement, anAttrName, true)) {
                retElement = theElement;
            }

            //  Notice how we do *not* break here, so that if any parent
            //  above us is disabled, we will still return 'null'.
        }

        theElement = theElement.parentNode;
    }

    return retElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$elementGetBusyLayer',
function(anElement) {

    /**
     * @name $elementGetBusyLayer
     * @synopsis Returns a busy layer for the supplied element. This allows the
     *     element to show a busy message along with a spinning icon when
     *     performing time-consuming operations. This element may be reused
     *     across invocations for a particular element.
     * @param {HTMLElement} anElement The element to build the busy element for.
     * @returns {HTMLElement} The busy element itself.
     */

    var busyElement,
        busyBackgroundElement,
        busyControlImageElement,
        busyMessageElement;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments,
                                                            anElement);
    }

    if (TP.isElement(busyElement = anElement.busyElement)) {
        return busyElement;
    }

    //  Create a new 'div' element and set the 'busyFor' attribute on it.
    //  This allows users to override the default styling provided by TIBET
    //  so that they can customize their own busy element look and feel.
    busyElement = anElement.ownerDocument.createElement('div');
    TP.elementSetAttribute(busyElement,
                            'busyFor',
                            TP.elementGetAttribute(anElement, 'id'));

    //  Create a 'busy background' element. This is a private element that
    //  provides a common background for the busy element, but is not the
    //  container of the busy image and message elements. In this way, we
    //  can apply such things as a translucent background without having
    //  these settings applied to them.
    busyBackgroundElement = anElement.ownerDocument.createElement('div');
    TP.elementSetClass(busyBackgroundElement, 'background');
    TP.elementSetStyle(
                    busyBackgroundElement,
                    'position: absolute; left: 0px; top: 0px;' +
                    ' width: 100%; height: 100%');

    TP.nodeAppendChild(busyElement, busyBackgroundElement, false);

    //  Create a 'busy control' element that will have the busy image set as
    //  its background-image.
    busyControlImageElement = anElement.ownerDocument.createElement('div');
    TP.elementSetClass(busyControlImageElement, 'controlImage');
    TP.nodeAppendChild(busyElement, busyControlImageElement, false);

    //  Create a 'busy message' element that will display the busy message
    //  and which can be set during busy operation to other messages.
    busyMessageElement = anElement.ownerDocument.createElement('span');
    TP.nodeAppendChild(busyElement, busyMessageElement, false);

    //  Append a text node with a single whitespace character to the busy
    //  message. This forces IE to actually create the text node value.
    TP.nodeAppendChild(busyMessageElement,
                        anElement.ownerDocument.createTextNode(' '),
                        false);

    //  Append the busy element *to the body* so that it doesn't get
    //  clipped by any other elements.
    TP.nodeAppendChild(TP.documentGetBody(anElement.ownerDocument),
                        busyElement,
                        false);

    //  Set up the busy element into the document. This applies all of the
    //  necessary CSS selectors to style the busy element.
    TP.elementInitializeCSS(busyElement);
    TP.elementActivateCSS(busyElement);

    //  Cache the busy element, the busy control image element and the busy
    //  message element as slots on the element they were created for for
    //  much faster display next time.
    anElement.busyElement = busyElement;
    anElement.busyMessageElement = busyMessageElement;
    anElement.busyControlImageElement = busyControlImageElement;

    return busyElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetClass',
function(anElement) {

    /**
     * @name elementGetClass
     * @synopsis Returns the element's CSS class name(s) as a String.
     * @param {Element} anElement The element to retrieve the CSS class name
     *     for.
     * @raises TP.sig.InvalidElement
     * @returns {String} The CSS class name of the supplied element.
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isSVGNode(anElement)) {
        return anElement.className.baseVal;
    }

    return anElement.className;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetClipRect',
function(anElement) {

    /**
     * @name elementGetClipRect
     * @synopsis Returns the element's clipping rectangle.
     * @description The clipping rectangle is assumed to be in pixels (something
     *     like 'rect(10px 10px 10px 10px)'). If the clipping rectangle is not a
     *     '4 valued' value, null is returned. Each individual value is
     *     processed and turned from its current value into pixels (i.e. the
     *     value might be '4em' - this is converted into pixels). If the value
     *     is 'auto', a null is placed into that position in the Array.
     * @param {HTMLElement} anElement The element to extract the clipping
     *     rectangle from.
     * @raises TP.sig.InvalidElement
     * @returns {Array} An Array of Numbers containing the element's clipping
     *     rectangle *expressed in number of pixels*. The numbers are arranged
     *     in the following order: top, right, bottom, left.
     * @todo
     */

    var clipString,
        clipRectArray,

        i,
        entry;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    clipString = TP.elementGetComputedStyleObj(anElement).clip;

    clipRectArray = null;

    //  Extract the clipping rectangle from the String using a RegExp and
    //  put it into clipRectArray
    clipRectArray = TP.regex.CSS_CLIP_RECT.exec(clipString);

    if (TP.isArray(clipRectArray)) {
        //  Since the entire results will be the first element, with the
        //  individually grouped results after it, (as it always is with a
        //  RegExp 'exec') get rid of that first element so that the
        //  individual clip entries are at 0, 1, 2, 3.
        clipRectArray.shift();

        //  Loop over each item. It could either be 'auto' or a number
        //  followed by a unit. The entry could have a comma at the end, so
        //  we trim that.
        for (i = 0; i < clipRectArray.getSize(); i++) {
            entry = clipRectArray.at(i);
            entry = entry.strip(/,$/);

            if (entry === 'auto') {
                entry = null;
            } else if (!TP.isNaN(parseInt(entry, 10))) {
                //  The array is top, left, bottom, right - vertical values
                //  are at even positions, horizontal values are at odd
                //  ones.
                if (i.isEven()) {
                    entry = TP.elementGetPixelValue(anElement,
                                                    entry,
                                                    'height');
                } else {
                    entry = TP.elementGetPixelValue(anElement,
                                                    entry,
                                                    'width');
                }
            }

            clipRectArray.atPut(i, entry);
        }
    }

    return clipRectArray;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetContentHeight',
function(anElement, wantsTransformed) {

    /**
     * @name elementGetContentHeight
     * @synopsis Returns the element's content height. This is equivalent to the
     *     height of the element if the element's height was set to 'auto' -
     *     that is, if the element was 'shrink-wrapping' its content.
     * @param {HTMLElement} anElement The element to extract the content height
     *     from.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Number} The element's content height in pixels.
     */

    var theHeight;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if ((theHeight = anElement.scrollHeight) === 0) {
        theHeight =
            TP.elementGetBorderBox(anElement, wantsTransformed).at('height');
    }

    return theHeight;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetContentWidth',
function(anElement, wantsTransformed) {

    /**
     * @name elementGetContentWidth
     * @synopsis Returns the element's content width. This is equivalent to the
     *     width of the element if the element's width was set to 'auto' - that
     *     is, if the element was 'shrink-wrapping' its content.
     * @param {HTMLElement} anElement The element to extract the content width
     *     from.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Number} The element's content width in pixels.
     */

    var theWidth;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if ((theWidth = anElement.scrollWidth) === 0) {
        theWidth =
            TP.elementGetBorderBox(anElement, wantsTransformed).at('width');
    }

    return theWidth;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetEffectiveBackgroundColor',
function(anElement) {

    /**
     * @name elementGetEffectiveBackgroundColor
     * @synopsis Obtains the effective background color from the element,
     *     ignoring a value of transparent. This method will traverse the
     *     supplied element's ancestor chain, looking for the first
     *     non-transparent element.
     * @param {HTMLElement} anElement The element to obtain the effective
     *     background color for.
     * @raises TP.sig.InvalidElement
     * @returns {String} The element's effective background color.
     */

    var elementColor;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  First, check to see if our computed color is transparent
    if ((elementColor =
            TP.elementGetComputedStyleObj(anElement).backgroundColor) !==
                                                            'transparent') {
        return elementColor;
    }

    //  Iterate upward through the ancestor chain, looking for the first
    //  non-transparent element and capture its color.

    elementColor = null;

    TP.nodeDetectAncestor(
        anElement,
        function(aParentElement) {

            var computedStyle;

            computedStyle = TP.elementGetComputedStyleObj(aParentElement);

            //  If we found one that was not transparent, we can stop now.
            if ((elementColor = computedStyle.backgroundColor) !==
                                                        'transparent') {
                return true;
            }

            return false;
        });

    //  If we didn't get a valid value for the color, or it was
    //  'transparent', that means that every parent element was
    //  transparent, including the 'body' element.
    if (TP.notValid(elementColor) || elementColor === 'transparent') {
        elementColor = 'white';
    }

    return elementColor;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetGlobalBox',
function(anElement, boxType, wantsTransformed) {

    /**
     * @name elementGetGlobalBox
     * @synopsis Returns the element's 'box' of coordinates expressed as
     *     'global' coordinates. This is the value of the element's page box,
     *     plus any offset of the document window (which normally occurs if the
     *     element is hosted inside of an iframe). Therefore, this is the
     *     element's box relative to the top-level window it is hosted in.
     * @param {HTMLElement} anElement The element to extract the box from.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the box from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidWindow
     * @returns {TP.lang.Hash} A hash containing the box at: 'left', 'top',
     *     'width', 'height'.
     * @todo
     */

    var elemWin,
        winFrameElem,
        frameOffsetXAndY,

        box;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!TP.isWindow(elemWin = TP.nodeGetWindow(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (TP.isElement(winFrameElem = elemWin.frameElement)) {
        //  Note here that we pass 'top' as the first argument since we
        //  really just want the offset of winFrameElem from the top (which
        //  will be 0,0 offset from itself).
        frameOffsetXAndY = TP.windowComputeWindowOffsets(
                            top,
                            TP.elementGetIFrameWindow(winFrameElem));
    } else {
        frameOffsetXAndY = TP.ac(0, 0);
    }

    box = TP.elementGetPageBox(anElement, boxType, null, wantsTransformed);
    box.atPut('left', box.at('left') + frameOffsetXAndY.first());
    box.atPut('top', box.at('top') + frameOffsetXAndY.last());

    return box;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetGlobalX',
function(anElement, boxType, ancestor, wantsTransformed) {

    /**
     * @name elementGetGlobalX
     * @synopsis Gets the element's global X coordinate. This is the value of
     *     the element's page X coordinate, plus any offset of the document
     *     window (which normally occurs if the element is hosted inside of an
     *     iframe). Therefore, this is the element's X coordinate relative to
     *     the top-level window it is hosted in.
     * @param {HTMLElement} anElement The element to get the X coordinate of.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the coordinate from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {HTMLElement} ancestor An optional ancestor of the supplied
     *     element. If this element is supplied, the result value will be
     *     computed relative to this ancestor.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidWindow
     * @returns {Number} The global X coordinate of the element in pixels.
     * @todo
     */

    var elemWin,
        winFrameElem,
        frameOffsetX,

        position,

        ancestorPosition;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!TP.isWindow(elemWin = TP.nodeGetWindow(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (TP.isElement(winFrameElem = elemWin.frameElement)) {
        //  Note here that we pass 'top' as the first argument since we
        //  really just want the offset of winFrameElem from the top (which
        //  will be 0,0 offset from itself).
        frameOffsetX = TP.windowComputeWindowOffsets(
                        top,
                        TP.elementGetIFrameWindow(winFrameElem)).first();
    } else {
        frameOffsetX = 0;
    }

    position = TP.elementGetPageX(anElement, boxType, null, wantsTransformed) +
                     frameOffsetX;

    if (TP.isElement(ancestor) && TP.nodeContainsNode(ancestor, anElement)) {
        if (TP.isNumber(ancestorPosition =
                        TP.elementGetGlobalX(ancestor, boxType))) {
            return position - ancestorPosition;
        }
    }

    return position;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetGlobalY',
function(anElement, boxType, ancestor, wantsTransformed) {

    /**
     * @name elementGetGlobalY
     * @synopsis Gets the element's global Y coordinate. This is the value of
     *     the element's page Y coordinate, plus any offset of the document
     *     window (which normally occurs if the element is hosted inside of an
     *     iframe). Therefore, this is the element's Y coordinate relative to
     *     the top-level window it is hosted in.
     * @param {HTMLElement} anElement The element to get the Y coordinate of.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the coordinate from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {HTMLElement} ancestor An optional ancestor of the supplied
     *     element. If this element is supplied, the result value will be
     *     computed relative to this ancestor.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidWindow
     * @returns {Number} The global Y coordinate of the element in pixels.
     * @todo
     */

    var elemWin,
        winFrameElem,
        frameOffsetY,

        position,

        ancestorPosition;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!TP.isWindow(elemWin = TP.nodeGetWindow(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (TP.isElement(winFrameElem = elemWin.frameElement)) {
        //  Note here that we pass 'top' as the first argument since we
        //  really just want the offset of winFrameElem from the top (which
        //  will be 0,0 offset from itself).
        frameOffsetY = TP.windowComputeWindowOffsets(
                        top,
                        TP.elementGetIFrameWindow(winFrameElem)).last();
    } else {
        frameOffsetY = 0;
    }

    position = TP.elementGetPageY(anElement, boxType, null, wantsTransformed) +
                     frameOffsetY;

    if (TP.isElement(ancestor) && TP.nodeContainsNode(ancestor, anElement)) {
        if (TP.isNumber(ancestorPosition =
                        TP.elementGetGlobalY(ancestor, boxType))) {
            return position - ancestorPosition;
        }
    }

    return position;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetGlobalXY',
function(anElement, boxType, ancestor, wantsTransformed) {

    /**
     * @name elementGetGlobalXY
     * @synopsis Gets the element's global X and Y coordinates. This is the
     *     value of the element's page X and Y coordinates, plus any offset of
     *     the document window (which normally occurs if the element is hosted
     *     inside of an iframe). Therefore, this is the element's X and Y
     *     coordinates relative to the top-level window it is hosted in.
     * @param {HTMLElement} anElement The element to get the X and Y coordinates
     *     of.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the coordinates from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {HTMLElement} ancestor An optional ancestor of the supplied
     *     element. If this element is supplied, the result value will be
     *     computed relative to this ancestor.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidWindow
     * @returns {Number} The global X and Y coordinates of the element in
     *     pixels.
     * @todo
     */

    var elemWin,
        winFrameElem,
        frameOffsetXAndY,

        position,

        ancestorPosition;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!TP.isWindow(elemWin = TP.nodeGetWindow(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (TP.isElement(winFrameElem = elemWin.frameElement)) {
        //  Note here that we pass 'top' as the first argument since we
        //  really just want the offset of winFrameElem from the top (which
        //  will be 0,0 offset from itself).
        frameOffsetXAndY = TP.windowComputeWindowOffsets(
                            top,
                            TP.elementGetIFrameWindow(winFrameElem));
    } else {
        frameOffsetXAndY = TP.ac(0, 0);
    }

    position = TP.elementGetPageXY(anElement, boxType, null, wantsTransformed);

    position = TP.ac(frameOffsetXAndY.first() + position.first(),
                        frameOffsetXAndY.last() + position.last());

    if (TP.isElement(ancestor) && TP.nodeContainsNode(ancestor, anElement)) {
        if (TP.isArray(ancestorPosition =
                        TP.elementGetGlobalXY(ancestor, boxType, null,
                                                 wantsTransformed))) {
            return TP.ac(position.first() - ancestorPosition.first(),
                            position.last() - ancestorPosition.last());
        }
    }

    return position;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetHeight',
function(anElement, boxType, wantsTransformed) {

    /**
     * @name elementGetHeight
     * @synopsis Returns the element's height.
     * @param {HTMLElement} anElement The element to extract the height from.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the height from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Number} The element's height in pixels.
     * @todo
     */

    var heightVal,

        returnedBoxType;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  Note that offsetHeight returns our equivalent of TP.BORDER_BOX
    heightVal =
        TP.elementGetBorderBox(anElement, wantsTransformed).at('height');

    returnedBoxType = TP.ifInvalid(boxType, TP.BORDER_BOX);

    //  So now, the returned value is the TP.BORDER_BOX. If the caller
    //  supplied other box types to return, add those values.

    switch (returnedBoxType) {
        case    TP.CONTENT_BOX:

                //  TP.CONTENT_BOX means we subtract both the border and the
                //  padding from both ends.
                heightVal -=
                    (TP.elementGetPaddingInPixels(anElement,
                                                  TP.TOP,
                                                  wantsTransformed) +
                        TP.elementGetBorderInPixels(anElement,
                                                     TP.TOP,
                                                     wantsTransformed));

                heightVal -=
                    (TP.elementGetPaddingInPixels(anElement,
                                                  TP.BOTTOM,
                                                  wantsTransformed) +
                        TP.elementGetBorderInPixels(anElement,
                                                     TP.BOTTOM,
                                                     wantsTransformed));

                break;

        case    TP.PADDING_BOX:

                //  TP.PADDING_BOX means we add the border from both ends.
                heightVal -= TP.elementGetBorderInPixels(anElement,
                                                            TP.TOP,
                                                            wantsTransformed);
                heightVal -= TP.elementGetBorderInPixels(anElement,
                                                            TP.BOTTOM,
                                                            wantsTransformed);

                break;

        case    TP.BORDER_BOX:

                //  TP.BORDER_BOX means we do nothing

                break;

        case    TP.MARGIN_BOX:

                //  TP.MARGIN_BOX means we add the margin from both ends.
                heightVal += TP.elementGetMarginInPixels(anElement,
                                                            TP.TOP,
                                                            wantsTransformed);
                heightVal += TP.elementGetMarginInPixels(anElement,
                                                            TP.BOTTOM,
                                                            wantsTransformed);
                break;
    }

    return heightVal;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetInnerContent',
function(anElement) {

    /**
     * @name elementGetInnerContent
     * @synopsis Gets the 'inner content' of anElement.
     * @description This method gets the 'inner content' of anElement which
     *     means that just the contents of the element, not including its start
     *     and end tags, will be returned.
     * @param {HTMLElement} anElement The element to get the 'inner content' of.
     * @raises TP.sig.InvalidElement
     * @returns {String} The 'inner content' of anElement.
     */

    var str;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isHTMLNode(anElement)) {
        return anElement.innerHTML;
    }

    str = TP.nodeAsString(anElement, false, false);

    return str.slice(str.indexOf('>') + 1, str.lastIndexOf('<'));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetOffsetFromContainer',
function(anElement, wantsTransformed) {

    /**
     * @name elementGetOffsetFromContainer
     * @synopsis Returns an Array containing the X and Y of the total amount
     *     that the supplied Element is offset from the top, left corner of *its
     *     nearest positioned parent element*. This may or may not be the
     *     element's direct parentNode.
     * @param {HTMLElement} anElement The element to compute the offset from.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Array} An ordered pair containing the X amount in the first
     *     position and the Y amount in the second position.
     * @todo
     */

    var elemDoc,

        positionedAncestor;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elemDoc = TP.nodeGetDocument(anElement);

    positionedAncestor = TP.elementGetOffsetParent(anElement);

    if (TP.isElement(positionedAncestor) &&
        TP.nodeContainsNode(positionedAncestor, anElement)) {
        return TP.elementGetPageXY(anElement,
                                    TP.BORDER_BOX,
                                    positionedAncestor,
                                    wantsTransformed);
    } else {
        return TP.ac(0, 0);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetPageBox',
function(anElement, boxType, ancestor, wantsTransformed) {

    /**
     * @name elementGetPageBox
     * @synopsis Returns the element's 'box' of coordinates relative to the
     *     page.
     * @param {HTMLElement} anElement The element to extract the box from.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the box from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {HTMLElement} ancestor An optional ancestor of the supplied
     *     element. If this element is supplied, the result value will be
     *     computed relative to this ancestor.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {TP.lang.Hash} A hash containing the box at: 'left', 'top',
     *     'width', 'height'.
     * @todo
     */

    var elemBox,

        returnedBoxType,

        offsets,

        ancestorBox;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elemBox = TP.elementGetBorderBox(anElement, wantsTransformed);

    returnedBoxType = TP.ifInvalid(boxType, TP.BORDER_BOX);

    //  So now, the returned value is the TP.BORDER_BOX. If the caller
    //  supplied other box types to return, add those values.

    switch (returnedBoxType) {
        case    TP.CONTENT_BOX:

                //  TP.CONTENT_BOX means we inset both the border and the
                //  padding from all sides

                offsets = TP.elementGetStyleValuesInPixels(
                            anElement,
                            TP.ac('borderTopWidth', 'borderBottomWidth',
                                    'borderLeftWidth', 'borderRightWidth',
                                    'paddingTop', 'paddingBottom',
                                    'paddingLeft', 'paddingRight'),
                            wantsTransformed);

                elemBox.atPut('top',
                    elemBox.at('top') +
                        (offsets.at('borderTopWidth') +
                            offsets.at('paddingTop')));

                elemBox.atPut('right',
                    elemBox.at('right') -
                        (offsets.at('borderRightWidth') +
                            offsets.at('paddingRight')));

                elemBox.atPut('bottom',
                    elemBox.at('bottom') -
                        (offsets.at('borderBottomWidth') +
                            offsets.at('paddingBottom')));

                elemBox.atPut('left',
                    elemBox.at('left') +
                        (offsets.at('borderLeftWidth') +
                            offsets.at('paddingLeft')));

                elemBox.atPut('height',
                    elemBox.at('height') -
                        (offsets.at('borderBottomWidth') +
                            offsets.at('paddingBottom')));

                elemBox.atPut('width',
                    elemBox.at('width') -
                        (offsets.at('borderLeftWidth') +
                            offsets.at('paddingLeft')));

                break;

        case    TP.PADDING_BOX:

                //  TP.PADDING_BOX means we inset the border from all
                //  sides.
                offsets = TP.elementGetStyleValuesInPixels(
                            anElement,
                            TP.ac('borderTopWidth', 'borderBottomWidth',
                                    'borderLeftWidth', 'borderRightWidth'),
                            wantsTransformed);

                elemBox.atPut('top',
                    elemBox.at('top') + offsets.at('borderTopWidth'));

                elemBox.atPut('right',
                    elemBox.at('right') - offsets.at('borderRightWidth'));

                elemBox.atPut('bottom',
                    elemBox.at('bottom') - offsets.at('borderBottomWidth'));

                elemBox.atPut('left',
                    elemBox.at('left') + offsets.at('borderLeftWidth'));

                elemBox.atPut('height',
                    elemBox.at('height') - offsets.at('borderBottomWidth'));

                elemBox.atPut('width',
                    elemBox.at('width') - offsets.at('borderLeftWidth'));

                break;

        case    TP.BORDER_BOX:

                //  TP.BORDER_BOX means we do nothing

                break;

        case    TP.MARGIN_BOX:

                //  TP.MARGIN_BOX means we outset the margin from both ends.
                offsets = TP.elementGetStyleValuesInPixels(
                                anElement,
                                TP.ac('marginTop', 'marginWidth',
                                        'marginLeft', 'marginRight'),
                                wantsTransformed);

                elemBox.atPut('top',
                    elemBox.at('top') - offsets.at('marginTop'));

                elemBox.atPut('right',
                    elemBox.at('right') + offsets.at('marginRight'));

                elemBox.atPut('bottom',
                    elemBox.at('bottom') + offsets.at('marginBottom'));

                elemBox.atPut('left',
                    elemBox.at('left') - offsets.at('marginLeft'));

                elemBox.atPut('height',
                    elemBox.at('height') + offsets.at('marginBottom'));

                elemBox.atPut('width',
                    elemBox.at('width') + offsets.at('marginLeft'));

                break;
    }

    if (TP.isElement(ancestor) && TP.nodeContainsNode(ancestor, anElement)) {
        if (TP.isNumber(ancestorBox =
                        TP.elementGetPageBox(ancestor, boxType, null,
                                                wantsTransformed))) {
            return TP.hc(
                'top', elemBox.at('top') - ancestorBox.at('top'),
                'right', elemBox.at('right') - ancestorBox.at('right'),
                'bottom', elemBox.at('bottom') - ancestorBox.at('bottom'),
                'left', elemBox.at('left') - ancestorBox.at('left'),
                'width', elemBox.at('width'),
                'height', elemBox.at('height'));
        }
    }

    return elemBox;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetPageX',
function(anElement, boxType, ancestor, wantsTransformed) {

    /**
     * @name elementGetPageX
     * @synopsis Gets the element's page X coordinate.
     * @param {HTMLElement} anElement The element to get the X coordinate of.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the coordinate from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {HTMLElement} ancestor An optional ancestor of the supplied
     *     element. If this element is supplied, the result value will be
     *     computed relative to this ancestor.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Number} The page X coordinate of the element in pixels.
     * @todo
     */

    var elemDoc,

        position,

        returnedBoxType,

        ancestorPosition;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elemDoc = TP.nodeGetDocument(anElement);

    //  This call automatically takes scrolling, both the document and the
    //  'offset chain' scrolling offsets, into account.
    position = TP.elementGetBorderBox(anElement, wantsTransformed).at('left');

    returnedBoxType = TP.ifInvalid(boxType, TP.BORDER_BOX);

    //  So now, the returned value is the TP.BORDER_BOX. If the caller
    //  supplied other box types to return, add those values.

    switch (returnedBoxType) {
        case    TP.CONTENT_BOX:

                //  TP.CONTENT_BOX means we can have to add the border and
                //  the padding
                position += TP.elementGetBorderInPixels(anElement,
                                                            wantsTransformed,
                                                            TP.LEFT);
                position += TP.elementGetPaddingInPixels(anElement,
                                                            wantsTransformed,
                                                            TP.LEFT);
                break;

        case    TP.PADDING_BOX:

                //  TP.PADDING_BOX means we have to add the border

                position += TP.elementGetBorderInPixels(anElement,
                                                            wantsTransformed,
                                                            TP.LEFT);
                break;

        case    TP.BORDER_BOX:

                //  TP.BORDER_BOX means we do nothing.

                break;

        case    TP.MARGIN_BOX:

                //  TP.MARGIN_BOX means we subtract the margin off of the
                //  total
                position -= TP.elementGetMarginInPixels(anElement,
                                                        wantsTransformed,
                                                        TP.LEFT);
                break;
    }

    if (TP.isElement(ancestor) && TP.nodeContainsNode(ancestor, anElement)) {
        if (TP.isNumber(ancestorPosition =
                TP.elementGetPageX(ancestor, boxType, null,
                                     wantsTransformed))) {
            return position - ancestorPosition;
        }
    }

    return position;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetPageY',
function(anElement, boxType, ancestor, wantsTransformed) {

    /**
     * @name elementGetPageY
     * @synopsis Gets the element's page Y coordinate.
     * @param {HTMLElement} anElement The element to get the Y coordinate of.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the coordinate from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {HTMLElement} ancestor An optional ancestor of the supplied
     *     element. If this element is supplied, the result value will be
     *     computed relative to this ancestor.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Number} The page Y coordinate of the element in pixels.
     * @todo
     */

    var elemDoc,

        position,

        returnedBoxType,

        ancestorPosition;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elemDoc = TP.nodeGetDocument(anElement);

    //  This call automatically takes scrolling, both the document and the
    //  'offset chain' scrolling offsets, into account.
    position = TP.elementGetBorderBox(anElement, wantsTransformed).at('top');

    returnedBoxType = TP.ifInvalid(boxType, TP.BORDER_BOX);

    //  So now, the returned value is the TP.BORDER_BOX. If the caller
    //  supplied other box types to return, add those values.

    switch (returnedBoxType) {
        case    TP.CONTENT_BOX:

                //  TP.CONTENT_BOX means we can have to add the border and
                //  the padding
                position += TP.elementGetBorderInPixels(anElement,
                                                        wantsTransformed,
                                                        TP.TOP);
                position += TP.elementGetPaddingInPixels(anElement,
                                                        wantsTransformed,
                                                        TP.TOP);
                break;

        case    TP.PADDING_BOX:

                //  TP.PADDING_BOX means we have to add the border

                position += TP.elementGetBorderInPixels(anElement,
                                                        wantsTransformed,
                                                        TP.TOP);
                break;

        case    TP.BORDER_BOX:

                //  TP.BORDER_BOX means we do nothing.

                break;

        case    TP.MARGIN_BOX:

                //  TP.MARGIN_BOX means we subtract the margin off of the
                //  total
                position -= TP.elementGetMarginInPixels(anElement,
                                                        wantsTransformed,
                                                        TP.TOP);
                break;
    }

    if (TP.isElement(ancestor) && TP.nodeContainsNode(ancestor, anElement)) {
        if (TP.isNumber(ancestorPosition =
                TP.elementGetPageY(ancestor, boxType, null,
                                    wantsTransformed))) {
            return position - ancestorPosition;
        }
    }

    return position;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetPageXY',
function(anElement, boxType, ancestor, wantsTransformed) {

    /**
     * @name elementGetPageXY
     * @synopsis Gets the element's page X and Y coordinates.
     * @param {HTMLElement} anElement The element to get the X and Y coordinates
     *     of.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the coordinates from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {HTMLElement} ancestor An optional ancestor of the supplied
     *     element. If this element is supplied, the result value will be
     *     computed relative to this ancestor.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Array} The page X and Y coordinates of the element in pixels.
     * @todo
     */

    var elemDoc,

        positions,
        xPosition,
        yPosition,

        returnedBoxType,

        ancestorPosition;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elemDoc = TP.nodeGetDocument(anElement);

    //  This call automatically takes scrolling, both the document and the
    //  'offset chain' scrolling offsets, into account.
    positions = TP.elementGetBorderBox(anElement, wantsTransformed);
    xPosition = positions.at('left');
    yPosition = positions.at('top');

    returnedBoxType = TP.ifInvalid(boxType, TP.BORDER_BOX);

    //  So now, the returned value is the TP.BORDER_BOX. If the caller
    //  supplied other box types to return, add those values.

    switch (returnedBoxType) {
        case    TP.CONTENT_BOX:

                //  TP.CONTENT_BOX means we can have to add the border and
                //  the padding
                xPosition += TP.elementGetBorderInPixels(anElement,
                                                            TP.LEFT,
                                                            wantsTransformed);
                xPosition += TP.elementGetPaddingInPixels(anElement,
                                                            TP.LEFT,
                                                            wantsTransformed);
                yPosition += TP.elementGetBorderInPixels(anElement,
                                                            TP.TOP,
                                                            wantsTransformed);
                yPosition += TP.elementGetPaddingInPixels(anElement,
                                                            TP.TOP,
                                                            wantsTransformed);
                break;

        case    TP.PADDING_BOX:

                //  TP.PADDING_BOX means we have to add the border

                xPosition += TP.elementGetBorderInPixels(anElement,
                                                            TP.LEFT,
                                                            wantsTransformed);
                yPosition += TP.elementGetBorderInPixels(anElement,
                                                            TP.TOP,
                                                            wantsTransformed);
                break;

        case    TP.BORDER_BOX:

                //  TP.BORDER_BOX means we do nothing.

                break;

        case    TP.MARGIN_BOX:

                //  TP.MARGIN_BOX means we subtract the margin off of the
                //  total
                xPosition -= TP.elementGetMarginInPixels(anElement,
                                                            TP.LEFT,
                                                            wantsTransformed);
                yPosition -= TP.elementGetMarginInPixels(anElement,
                                                            TP.TOP,
                                                            wantsTransformed);
                break;
    }

    if (TP.isElement(ancestor) && TP.nodeContainsNode(ancestor, anElement)) {
        if (TP.isArray(ancestorPosition =
                TP.elementGetPageXY(ancestor, boxType, null,
                                     wantsTransformed))) {
            return TP.ac(xPosition - ancestorPosition.first(),
                            yPosition - ancestorPosition.last());
        }
    }

    return TP.ac(xPosition, yPosition);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetOffsetBox',
function(anElement, boxType, wantsTransformed) {

    /**
     * @name elementGetOffsetBox
     * @synopsis Returns the element's 'box' of coordinates expressed as
     *     'offset' coordinates. This is the value of the element's page box,
     *     minus any offset of the element's offset parent. Therefore, this is
     *     the element's box relative to its offset parent.
     * @param {HTMLElement} anElement The element to extract the box from.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the box from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidWindow
     * @returns {TP.lang.Hash} A hash containing the box at: 'left', 'top',
     *     'width', 'height'.
     * @todo
     */

    var offsetAncestor,
        offsetXAndY,

        box;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isElement(offsetAncestor = TP.elementGetOffsetParent(anElement))) {
        offsetXAndY = TP.elementGetPageXY(offsetAncestor, boxType, null,
                                             wantsTransformed);
    }

    box = TP.elementGetPageBox(anElement, boxType, null, wantsTransformed);
    box.atPut('left', box.at('left') - offsetXAndY.first());
    box.atPut('top', box.at('top') - offsetXAndY.last());

    return box;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetOffsetX',
function(anElement, boxType, wantsTransformed) {

    /**
     * @name elementGetOffsetX
     * @synopsis Gets the element's offset X coordinate.
     * @param {HTMLElement} anElement The element to get the X coordinate of.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the coordinate from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Number} The offset X coordinate of the element in pixels.
     * @todo
     */

    var offsetAncestor;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  Make sure that the offsetAncestor is an Element (it may be the
    //  Document, in which case there is no offset anyway).
    if (TP.isElement(offsetAncestor = TP.elementGetOffsetParent(anElement))) {
        return TP.elementGetPageX(anElement, boxType, offsetAncestor,
                                     wantsTransformed);
    }

    return TP.elementGetPageX(anElement, boxType, null, wantsTransformed);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetOffsetY',
function(anElement, boxType, wantsTransformed) {

    /**
     * @name elementGetOffsetY
     * @synopsis Gets the element's offset Y coordinate.
     * @param {HTMLElement} anElement The element to get the Y coordinate of.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the coordinate from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Number} The offset Y coordinate of the element in pixels.
     * @todo
     */

    var offsetAncestor;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  Make sure that the offsetAncestor is an Element (it may be the
    //  Document, in which case there is no offset anyway).
    if (TP.isElement(offsetAncestor = TP.elementGetOffsetParent(anElement))) {
        return TP.elementGetPageY(anElement, boxType, offsetAncestor,
                                     wantsTransformed);
    }

    return TP.elementGetPageY(anElement, boxType, null, wantsTransformed);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetOffsetXY',
function(anElement, boxType, wantsTransformed) {

    /**
     * @name elementGetOffsetXY
     * @synopsis Gets the element's offset X and Y coordinates.
     * @param {HTMLElement} anElement The element to get the X and Y coordinates
     *     of.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the coordinates from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Array} The offset X and Y coordinates of the element in pixels.
     * @todo
     */

    var offsetAncestor;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  Make sure that the offsetAncestor is an Element (it may be the
    //  Document, in which case there is no offset anyway).
    if (TP.isElement(offsetAncestor = TP.elementGetOffsetParent(anElement))) {
        return TP.elementGetPageXY(anElement, boxType, offsetAncestor,
                                     wantsTransformed);
    }

    return TP.elementGetPageXY(anElement, boxType, null, wantsTransformed);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetScrollOffsetFromAncestor',
function(anElement, anAncestor, wantsTransformed) {

    /**
     * @name elementGetScrollOffsetFromAncestor
     * @synopsis Returns an Array containing the X and Y of the total amount
     *     that the supplied Element is scrolled from the top, left corner of
     *     the supplied ancestor. If the ancestor isn't supplied, it defaults to
     *     the supplied element's document.
     * @param {HTMLElement} anElement The element to compute the scroll offset
     *     from.
     * @param {HTMLElement} anAncestor The ancestor element to use as the
     *     'outermost' element to compute the scroll offset from. This is an
     *     optional parameter that defaults to the document.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Array} An ordered pair containing the X amount in the first
     *     position and the Y amount in the second position.
     * @todo
     */

    var stopAncestor,

        vals,

        totalLeft,
        totalTop,

        ancestor;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    stopAncestor = TP.ifInvalid(anAncestor, TP.nodeGetDocument(anElement));

    if (TP.isTrue(wantsTransformed)) {
        vals = TP.elementLocalToGlobalXY(anElement,
                                            anElement.scrollLeft || 0,
                                            anElement.scrollTop || 0);

        totalLeft = vals.first();
        totalTop = vals.last();
    } else {
        totalLeft = anElement.scrollLeft || 0;
        totalTop = anElement.scrollTop || 0;
    }

    ancestor = anElement.parentNode;
    while (TP.isElement(ancestor) && (ancestor !== stopAncestor)) {

        if (TP.isTrue(wantsTransformed)) {
            vals = TP.elementLocalToGlobalXY(ancestor,
                                                ancestor.scrollLeft || 0,
                                                ancestor.scrollTop || 0);

            totalLeft += vals.first();
            totalTop += vals.last();
        } else {
            totalLeft += ancestor.scrollLeft || 0;
            totalTop += ancestor.scrollTop || 0;
        }

        ancestor = ancestor.parentNode;
    }

    return TP.ac(totalLeft, totalTop);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetScrollOffsetFromContainer',
function(anElement, wantsTransformed) {

    /**
     * @name elementGetScrollOffsetFromContainer
     * @synopsis Returns an Array containing the X and Y of the total amount
     *     that the supplied Element is scrolled from the top, left corner of
     *     *its nearest positioned parent element*. This may or may not be the
     *     element's direct parentNode.
     * @param {HTMLElement} anElement The element to compute the scroll offset
     *     from.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Array} An ordered pair containing the X amount in the first
     *     position and the Y amount in the second position.
     * @todo
     */

    var elemDoc,

        positionedAncestor,

        computedStyle;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elemDoc = TP.nodeGetDocument(anElement);

    positionedAncestor = TP.elementGetOffsetParent(anElement);
    while (TP.isElement(positionedAncestor)) {
        //  Test to see if the positioned parent is either the document's
        //  'body' element or is positioned itself. If so, we bail out here.

        if (positionedAncestor === TP.documentGetBody(elemDoc)) {
            break;
        }

        computedStyle = TP.elementGetComputedStyleObj(positionedAncestor);
        if ((computedStyle.position === 'absolute') ||
            (computedStyle.position === 'relative')) {
            break;
        }

        positionedAncestor = TP.elementGetOffsetParent(positionedAncestor);
    }

    //  The positioned ancestor could be a Document if the assignment
    //  happened and then the loop test failed.
    positionedAncestor = TP.isDocument(positionedAncestor) ?
                            positionedAncestor.documentElement :
                            positionedAncestor;

    return TP.elementGetScrollOffsetFromAncestor(anElement,
                                                    positionedAncestor,
                                                    wantsTransformed);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetScrollXY',
function(anElement, wantsTransformed) {

    /**
     * @name elementGetScrollXY
     * @synopsis Returns an Array containing the X and Y scroll offsets for the
     *     element provided.
     * @param {HTMLElement} anElement The element to get scroll offsets for.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Array} The X and Y offset in pixels.
     */

    var vals;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isTrue(wantsTransformed)) {
        vals = TP.elementLocalToGlobalXY(anElement,
                                            anElement.scrollLeft,
                                            anElement.scrollTop);
    } else {
        vals = TP.ac(anElement.scrollLeft, anElement.scrollTop);
    }

    return vals;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetSideClosestTo',
function(anElement, xCoord, yCoord) {

    /**
     * @name elementGetSideClosestTo
     * @synopsis Returns the horizontal and vertical 'side' of the element
     *     closest to the point given.
     * @param {HTMLElement} anElement The element to get the 'closest side' of.
     * @param {Number} xCoord The X coordinate, expressed in document-level
     *     coordinates.
     * @param {Number} yCoord The Y coordinate, expressed in document-level
     *     coordinates.
     * @raises TP.sig.InvalidElement
     * @returns {Array} Two of the following four values: First position:
     *     TP.RIGHT or TP.LEFT First position: TP.TOP or TP.BOTTOM.
     * @todo
     */

    var pageXY,

        elementWidth,
        elementHeight,

        elementCenterX,
        elementCenterY,

        horizontalSide,
        verticalSide;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  Get the TP.CONTENT_BOX origin of the supplied Element
    pageXY = TP.elementGetPageXY(anElement, TP.CONTENT_BOX);

    //  Get the width of the TP.BORDER_BOX
    elementWidth = TP.elementGetWidth(anElement, TP.BORDER_BOX);

    //  Get the height of the TP.BORDER_BOX
    elementHeight = TP.elementGetHeight(anElement, TP.BORDER_BOX);

    //  Compute the center of the element
    elementCenterX = pageXY.first() + (elementWidth / 2);
    elementCenterY = pageXY.last() + (elementHeight / 2);

    //  If the supplied X coordinate is less than the center, then its on
    //  the left side, otherwise the right side.
    if (xCoord < elementCenterX) {
        horizontalSide = TP.LEFT;
    } else {
        horizontalSide = TP.RIGHT;
    }

    //  If the supplied Y coordinate is less than the center, then its on
    //  the top side, otherwise the bottom side.
    if (yCoord < elementCenterY) {
        verticalSide = TP.TOP;
    } else {
        verticalSide = TP.BOTTOM;
    }

    return TP.ac(horizontalSide, verticalSide);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetWidth',
function(anElement, boxType, wantsTransformed) {

    /**
     * @name elementGetWidth
     * @synopsis Returns the element's width.
     * @param {HTMLElement} anElement The element to extract the width from.
     * @param {String} boxType A TIBET constant that determines the 'box' to
     *     compute the width from. This can one of the following values:
     *     TP.CONTENT_BOX TP.PADDING_BOX TP.BORDER_BOX TP.MARGIN_BOX If this
     *     parameter is not supplied, it defaults to TP.BORDER_BOX.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @raises TP.sig.InvalidElement
     * @returns {Number} The element's width in pixels.
     * @todo
     */

    var widthVal,

        returnedBoxType;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    widthVal = TP.elementGetBorderBox(anElement, wantsTransformed).at('width');

    returnedBoxType = TP.ifInvalid(boxType, TP.BORDER_BOX);

    //  So now, the returned value is the TP.BORDER_BOX. If the caller
    //  supplied other box types to return, add those values.

    switch (returnedBoxType) {
        case    TP.CONTENT_BOX:

                //  TP.CONTENT_BOX means we subtract both the border and the
                //  padding from both ends.
                widthVal -=
                    (TP.elementGetPaddingInPixels(anElement,
                                                  TP.LEFT,
                                                  wantsTransformed) +
                        TP.elementGetBorderInPixels(anElement,
                                                     TP.LEFT,
                                                     wantsTransformed));

                widthVal -=
                    (TP.elementGetPaddingInPixels(anElement,
                                                  TP.RIGHT,
                                                  wantsTransformed) +
                        TP.elementGetBorderInPixels(anElement,
                                                     TP.RIGHT,
                                                     wantsTransformed));

                break;

        case    TP.PADDING_BOX:

                //  TP.PADDING_BOX means we subtract the border from both
                //  ends.
                widthVal -= TP.elementGetBorderInPixels(anElement,
                                                        TP.LEFT,
                                                        wantsTransformed);
                widthVal -= TP.elementGetBorderInPixels(anElement,
                                                        TP.RIGHT,
                                                        wantsTransformed);

                break;

        case    TP.BORDER_BOX:

                //  TP.BORDER_BOX means we do nothing

                break;

        case    TP.MARGIN_BOX:

                //  TP.MARGIN_BOX means we add the margin from both ends.
                widthVal += TP.elementGetMarginInPixels(anElement,
                                                        TP.LEFT,
                                                        wantsTransformed);
                widthVal += TP.elementGetMarginInPixels(anElement,
                                                        TP.RIGHT,
                                                        wantsTransformed);
                break;
    }

    return widthVal;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementHasClass',
function(anElement, className) {

    /**
     * @name elementHasClass
     * @synopsis Returns true if the element has the CSS class name specified.
     * @param {Element} anElement The element to test.
     * @param {String} className The CSS class name to test for.
     * @raises TP.sig.InvalidElement
     * @returns {Boolean} Whether or not the element has the supplied CSS class.
     * @todo
     */

    var re;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  If the native 'classList' property is available, use that.
    if (TP.isValid(anElement.classList)) {
        return anElement.classList.contains(className);
    }

    //  NOTE: The RegExp here makes sure that the className is either first,
    //  last or is surrounded by one character of whitespace.
    re = TP.rc('(^|\\s)' + className + '(\\s|$)');

    return re.test(TP.elementGetClass(anElement));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementHasFocus',
function(anElement) {

    /**
     * @name elementHasFocus
     * @synopsis Returns true if the element is the currently focused element in
     *     its document.
     * @param {Element} anElement The element to test.
     * @raises TP.sig.InvalidElement
     * @returns {Boolean} Whether or not the element has the focus in its
     *     document.
     */

    return (TP.documentGetFocusedElement(
                            TP.nodeGetDocument(anElement)) === anElement);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementHide',
function(anElement, preserveSpace) {

    /**
     * @name elementHide
     * @synopsis Hides the element. If the preserveSpace parameter is true, this
     *     method adjusts the CSS 'visibility' property of the supplied element.
     *     Otherwise, it adjusts the 'display'.
     * @param {HTMLElement} anElement The element to hide.
     * @param {Boolean} preserveSpace Whether or not to 'preserve the space'
     *     taken up by the element in its document.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isTrue(preserveSpace)) {
        TP.elementGetStyleObj(anElement).visibility = 'hidden';
    } else {
        TP.elementGetStyleObj(anElement).display = 'none';
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementHideBusyMessage',
function(anElement) {

    /**
     * @name elementHideBusyMessage
     * @synopsis Hides the busy message for the supplied element.
     * @param {HTMLElement} anElement The element to hide the busy element for.
     * @returns {HTMLElement} The busy element itself.
     */

    var busyElement;

    //  We only do this if there is actually a busy element for the supplied
    //  element.
    if (TP.isElement(busyElement = anElement.busyElement)) {
        TP.elementGetStyleObj(busyElement).display = 'none';

        //  Make sure and detach the resizing event handlers since they'll
        //  be reattached when the busy element is shown.
        if (TP.boot.isUA('IE')) {
            anElement.ownerDocument.parentWindow.detachEvent(
                'onresize',
                busyElement.busyResizeFunction);
        } else {
            anElement.ownerDocument.defaultView.removeEventListener(
                'resize',
                busyElement.busyResizeFunction,
                false);
        }

        busyElement.busyResizeFunction = null;
    }

    //  reset the overflow so scrollbars return to their old config
    if (anElement.oldOverflow) {
        TP.elementGetStyleObj(anElement).overflow = anElement.oldOverflow;
    }

    return busyElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementIsDisplayed',
function(anElement) {

    /**
     * @name elementIsDisplayed
     * @synopsis Returns whether or not anElement is displayed to the user. This
     *     is dependent not only on its 'display' setting, but on the display
     *     settings of its parents.
     * @param {HTMLElement} anElement The element to determine the display of.
     * @raises TP.sig.InvalidElement
     * @returns {Boolean} Whether or not anElement is displayed.
     */

    var elemComputedDisplay;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elemComputedDisplay = TP.elementGetComputedStyleObj(anElement).display;

    //  If the display is computed to be 'none', then we're definitely not
    //  displayed.
    if (elemComputedDisplay === 'none') {
        return false;
    }

    //  Otherwise, if we don't have a parentNode or our parentNode is the
    //  document, then we must be displayed, so we return true.
    if (TP.notValid(anElement.parentNode) ||
        TP.isDocument(anElement.parentNode)) {
        return true;
    }

    //  We had a parent node, so we defer to it and walk the tree.
    return TP.elementIsDisplayed(anElement.parentNode);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementIsVisible',
function(anElement) {

    /**
     * @name elementIsVisible
     * @synopsis Returns whether or not anElement is visible to the user. This
     *     is dependent not only on its 'visibility' setting, but on the
     *     visibility settings of its parents.
     * @param {HTMLElement} anElement The element to determine the visibility
     *     of.
     * @raises TP.sig.InvalidElement
     * @returns {Boolean} Whether or not anElement is visible.
     */

    var elemComputedVisibility;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elemComputedVisibility =
                TP.elementGetComputedStyleObj(anElement).visibility;

    //  If the display is computed to be 'hidden', then we're definitely not
    //  visible.
    if (elemComputedVisibility === 'hidden') {
        return false;
    }

    //  Otherwise, if we don't have a parentNode or our parentNode is the
    //  document, then we must be visible, so we return true.
    if (TP.notValid(anElement.parentNode) ||
        TP.isDocument(anElement.parentNode)) {
        return true;
    }

    //  We had a parent node, so we defer to it and walk the tree.
    return TP.elementIsVisible(anElement.parentNode);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementMakeAbsolute',
function(anElement) {

    /**
     * @name elementMakeAbsolute
     * @synopsis Makes the supplied element 'absolutely positioned' at its
     *     current location in its document.
     * @param {HTMLElement} anElement The element to make absolute.
     * @raises TP.sig.InvalidElement
     */

    var pageXY;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  If the element is already absolute, just bail out here.
    if (TP.elementGetComputedStyleObj(anElement).position === 'absolute') {
        return;
    }

    pageXY = TP.elementGetPageXY(anElement);

    TP.elementGetStyleObj(anElement).position = 'absolute';

    TP.elementGetStyleObj(anElement).left = pageXY.at(0) + 'px';
    TP.elementGetStyleObj(anElement).top = pageXY.at(1) + 'px';

    TP.elementGetStyleObj(anElement).width = anElement.clientWidth + 'px';
    TP.elementGetStyleObj(anElement).height = anElement.clientHeight + 'px';

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementMakePositioned',
function(anElement) {

    /**
     * @name elementMakePositioned
     * @synopsis Makes the supplied element 'positioned' (relatively) at its
     *     current location in its document. If the element was already
     *     positioned, this method just returns.
     * @param {HTMLElement} anElement The element to make positioned.
     * @raises TP.sig.InvalidElement
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!/absolute|relative/i.test(
                        TP.elementGetComputedStyleObj(anElement).position)) {
        TP.elementMakeRelative(anElement);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementMakeRelative',
function(anElement) {

    /**
     * @name elementMakeRelative
     * @synopsis Makes the supplied element 'relatively positioned' at its
     *     current location in its document.
     * @param {HTMLElement} anElement The element to make relative.
     * @raises TP.sig.InvalidElement
     */

    var styleObj,
        leftInPixels,
        topInPixels;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    //  If the element is already relative, just bail out here.
    if (TP.elementGetComputedStyleObj(anElement).position === 'relative') {
        return;
    }

    //  Otherwise, check the style property's left and top for any
    //  'element-level' values. Note that we're not going after the computed
    //  style here - we're only interested if the instance-level style
    //  object has left or top values on it.

    styleObj = TP.elementGetStyleObj(anElement);

    if (TP.notEmpty(styleObj.left)) {
        //  Make sure to get the 'left' in pixels in case it was specified
        //  in some other CSS unit.
        leftInPixels = TP.elementGetPixelValue(anElement,
                                                styleObj.left,
                                                'left');
    } else {
        leftInPixels = 0;
    }

    if (TP.notEmpty(styleObj.top)) {
        //  Make sure to get the 'top' in pixels in case it was specified
        //  in some other CSS unit.
        topInPixels = TP.elementGetPixelValue(anElement,
                                                styleObj.top,
                                                'top');
    } else {
        topInPixels = 0;
    }

    styleObj.position = 'relative';

    styleObj.left = leftInPixels + 'px';
    styleObj.top = topInPixels + 'px';

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementMoveBy',
function(anElement, deltaX, deltaY) {

    /**
     * @name elementMoveBy
     * @synopsis Moves the element by the deltaX and deltaY amounts provided.
     * @description deltaX and deltaY are assumed to be Numbers of pixels to
     *     move the element by. Also note that if the supplied element is not
     *     positioned either absolute or relative, this method does nothing.
     * @param {HTMLElement} anElement The element to move.
     * @param {Number} deltaX The X amount to move the element by.
     * @param {Number} deltaY The Y amount to move the element by.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    var pageXY,

        styleObj;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!/absolute|relative/i.test(
                        TP.elementGetComputedStyleObj(anElement).position)) {
        return;
    }

    pageXY = TP.elementGetPageXY(anElement);

    styleObj = TP.elementGetStyleObj(anElement);

    styleObj.left = (pageXY.first() + deltaX) + 'px';
    styleObj.top = (pageXY.last() + deltaY) + 'px';

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementMoveTo',
function(anElement, x, y) {

    /**
     * @name elementMoveTo
     * @synopsis Moves the element to the X and Y coordinates provided.
     * @description If a Number is supplied to x or y a default unit of 'px' is
     *     assumed.
     * @param {HTMLElement} anElement The element to move.
     * @param {Number|String} x The X coordinate to move the element to.
     * @param {Number|String} y The Y coordinate to move the element to.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    var styleObj;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    styleObj = TP.elementGetStyleObj(anElement);

    if (TP.isNumber(x)) {
        styleObj.left = x + 'px';
    } else {
        styleObj.left = x;
    }

    if (TP.isNumber(y)) {
        styleObj.top = y + 'px';
    } else {
        styleObj.top = y;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementOrderOver',
function(anElement, anotherElement) {

    /**
     * @name elementOrderOver
     * @synopsis Places the element over the other element.
     * @param {HTMLElement} anElement The element to move 'up' in the Z order.
     * @param {HTMLElement} anotherElement The element to move anElement over.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    var otherZ;

    if (!TP.isElement(anElement) || !TP.isElement(anotherElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    otherZ = parseInt(TP.elementGetComputedStyleObj(anotherElement).zIndex,
                        10);

    TP.elementGetStyleObj(anElement).zIndex = otherZ + 1;

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementOrderUnder',
function(anElement, anotherElement) {

    /**
     * @name elementOrderUnder
     * @synopsis Places the element under the other element.
     * @param {HTMLElement} anElement The element to move 'down' in the Z order.
     * @param {HTMLElement} anotherElement The element to move anElement under.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    var otherZ;

    if (!TP.isElement(anElement) || !TP.isElement(anotherElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    otherZ = parseInt(TP.elementGetComputedStyleObj(anotherElement).zIndex,
                        10);

    TP.elementGetStyleObj(anElement).zIndex = otherZ - 1;

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementPlaceNearElement',
function(anElement, anotherElement, offsetX, offsetY, measuringBoxType, preferredCorners) {

    /**
     * @name elementPlaceNearElement
     * @synopsis Places the element near the other element, making sure to keep
     *     it on screen. Note that for this method to take effect on the
     *     element, the element should be 'positioned' in some fashion - this
     *     method does *not* position the element.
     * @param {HTMLElement} anElement The element to place near the other
     *     supplied element.
     * @param {HTMLElement} anotherElement The element to place the first
     *     supplied element near.
     * @param {Number} offsetX The X offset in pixels to use as a 'padding'.
     *     This defaults to 0.
     * @param {Number} offsetY The Y offset in pixels to use as a 'padding'.
     *     This defaults to 0.
     * @param {String} measuringBoxType A TIBET constant that determines the
     *     'box' (of anotherElement) to compute the coordinate from. This can
     *     one of the following values: TP.CONTENT_BOX TP.PADDING_BOX
     *     TP.BORDER_BOX TP.MARGIN_BOX If this parameter is not supplied, it
     *     defaults to TP.BORDER_BOX.
     * @param {Array} preferredCorners An Array of 'corners' to use to test.
     *     This should be one of: TP.TOP_LEFT TP.BOTTOM_LEFT TP.TOP_RIGHT
     *     TP.BOTTOM_RIGHT.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    var theMeasuringBoxType,
        thePreferredCorners,

        anotherElemStyleObj,
        oldDisplayValue,

        elementBoxX,
        elementBoxY,
        elementBoxWidth,
        elementBoxHeight,

        bestDistance,

        onScreenComputeData,

        preferredX,
        preferredY,

        computedDistance,

        i,
        len,
        corner,

        styleObj;

    if (!TP.isElement(anElement) || !TP.isElement(anotherElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    theMeasuringBoxType = TP.ifInvalid(measuringBoxType, TP.BORDER_BOX);

    //  The corners used for computation defaults to:
    //      TP.TOP_LEFT, TP.BOTTOM_LEFT, TP.BOTTOM_LEFT, TP.TOP_LEFT
    thePreferredCorners = TP.ifInvalid(
        preferredCorners,
        TP.ac(TP.TOP_LEFT, TP.BOTTOM_LEFT, TP.BOTTOM_LEFT, TP.TOP_LEFT));

    //  Grab the border box width and height of the element, but first make
    //  sure to turn off any non-default 'display' setting that would cause
    //  the element to have different dimensions than it normally would
    //  have.

    //  Note here how we go after any manually set 'display' style - we're
    //  not interested in the computed style here.
    anotherElemStyleObj = TP.elementGetStyleObj(anotherElement);
    oldDisplayValue = anotherElemStyleObj.display;
    anotherElemStyleObj.display = '';

    //  Capture the element's X, Y, width and height according to the
    //  measuring box that was either supplied or defaulted.
    elementBoxX = TP.elementGetPageX(anotherElement,
                                            theMeasuringBoxType);
    elementBoxY = TP.elementGetPageY(anotherElement,
                                            theMeasuringBoxType);

    elementBoxWidth = TP.elementGetWidth(anotherElement,
                                            theMeasuringBoxType);
    elementBoxHeight = TP.elementGetHeight(anotherElement,
                                            theMeasuringBoxType);

    //  Set the old display value back.
    TP.elementGetStyleObj(anElement).display = oldDisplayValue;

    //  Initialize the tracking values.
    bestDistance = Infinity;

    onScreenComputeData = null;

    //  Loop over the preferred corners.
    len = thePreferredCorners.length;
    for (i = 0; i < len; i++) {
        corner = thePreferredCorners[i];

        //  Compute the preferred X to try, based on the current
        //  corner that we're testing.
        if ((corner === TP.TOP_LEFT) || (corner === TP.BOTTOM_LEFT)) {
            preferredX = elementBoxX;
        } else {
            preferredX = elementBoxX + elementBoxWidth;
        }

        //  Compute the preferred Y to try, based on the current
        //  corner that we're testing.
        if ((corner === TP.TOP_LEFT) || (corner === TP.TOP_RIGHT)) {
            preferredY = elementBoxY;
        } else {
            preferredY = elementBoxY + elementBoxHeight;
        }

        //  Compute an on-screen X and Y for the supplied Element,
        //  given the preferred X and Y, the X and Y offset and the
        //  current corner.
        onScreenComputeData = TP.elementComputeOnScreenXY(
                                anElement,
                                preferredX, preferredY,
                                offsetX, offsetY,
                                TP.ac(corner));

        //  There was a computed distance which we use to see 'how
        //  good' of a match we got.
        computedDistance = onScreenComputeData.at(3);

        if (computedDistance === 0) {
            //  Got a perfect match.
            break;
        }

        //  Lesser numbers are better. If the current best distance
        //  is greater than the just computed one, then set the best
        //  distance to be that.
        if (bestDistance > computedDistance) {
            bestDistance = computedDistance;
        }
    }

    if (TP.isArray(onScreenComputeData)) {
        styleObj = TP.elementGetStyleObj(anElement);

        styleObj.left = onScreenComputeData.first() + 'px';
        styleObj.top = onScreenComputeData.last() + 'px';
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementRemoveAttributeValue',
function(anElement, attrName, attrValue) {

    /**
     * @name elementRemoveAttributeValue
     * @synopsis Removes one or more occurrences of the attribute value from the
     *     supplied element.
     * @param {Element} anElement The element to remove the attribute value
     *     from.
     * @param {String} attrName The name of the attribute to remove the value
     *     from.
     * @param {String} attrValue The value to remove from the attribute's value.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidString, i
     *     TP.sig.InvalidParameter
     * @returns {Element} The element.
     * @todo
     */

    var existingWholeValue,

        valMatcher;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isEmpty(attrName)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    //  Note here how we just check to make sure the attribute value is
    //  'valid', because it might not necessarily be a String (might be a
    //  Boolean, Number, etc.)
    if (TP.notValid(attrValue)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    if (TP.notEmpty(existingWholeValue = TP.elementGetAttribute(anElement,
                                                                attrName,
                                                                true))) {
        //  We construct a global RegExp where there could be a space and
        //  then the value we want to strip and then where there could be
        //  another space. This allows use to strip all occurrences of
        //  attrValue.
        valMatcher = TP.rc(' ?' + attrValue + ' ?', 'g');
        TP.elementSetAttribute(
                        anElement,
                        attrName,
                        existingWholeValue.strip(valMatcher),
                        true);
    }

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementReplaceAttributeValue',
function(anElement, attrName, oldValue, newValue) {

    /**
     * @name elementReplaceAttributeValue
     * @synopsis Replaces the old attribute value with the new attribute value
     *     in the supplied element.
     * @param {Element} anElement The element to remove the attribute value
     *     from.
     * @param {String} attrName The name of the attribute to replace the value
     *     in.
     * @param {String} oldValue The old value to replace in the attribute's
     *     value.
     * @param {String} newValue The new value to put in place of the old value
     *     in the attribute's value.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidString
     * @returns {Element} The element.
     * @todo
     */

    var wholeValue,
        oldValueRegExp;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isEmpty(oldValue)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    //  when being asked to make the new value empty we're really not
    //  replacing, we're removing
    if (TP.isEmpty(newValue)) {
        //  TODO: Code here??
    }

    //  If there was no prior value, then just set the attribute to the new
    //  value and return.
    if (TP.isEmpty(wholeValue =
                    TP.elementGetAttribute(anElement, attrName, true))) {
        TP.elementSetAttribute(anElement, attrName, newValue, true);

        return anElement;
    }

    //  NOTE: The RegExp here makes sure that the old value is either
    //  first, last or is surrounded by one character of whitespace.
    oldValueRegExp = TP.rc('(^|\\s)' + oldValue + '(\\s|$)');

    wholeValue = wholeValue.replace(oldValueRegExp,
                                            '$1' + newValue + '$2');

    TP.elementSetAttribute(anElement, attrName, wholeValue, true);

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementRemoveClass',
function(anElement, className) {

    /**
     * @name elementRemoveClass
     * @synopsis Removes a CSS class name from anElement's 'className' CSS class
     *     list.
     * @param {Element} anElement DOM Node of type Node.ELEMENT_NODE.
     * @param {String} className The CSS class name to remove.
     * @raises TP.sig.InvalidElement
     * @returns {Element} The element.
     * @todo
     */

    var re,
        str;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isEmpty(className)) {
        return;
    }

    //  If the native 'classList' property is available, use that.
    if (TP.isValid(anElement.classList)) {
        return anElement.classList.remove(className);
    }

    str = TP.elementGetClass(anElement);
    if (TP.isEmpty(str)) {
        return anElement;
    }

    //  NOTE: The RegExp here makes sure that the className is either first,
    //  last or is surrounded by one character of whitespace.
    re = TP.rc('(^|\\s)' + className + '(\\s|$)');

    str = str.replace(re, '$2');

    TP.elementSetAttribute(anElement, 'class', str);

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementReplaceClass',
function(anElement, oldClassName, newClassName) {

    /**
     * @name elementReplaceClass
     * @synopsis Replaces the old CSS class name in anElement's 'className' CSS
     *     class list with the new CSS class name.
     * @param {Element} anElement DOM Node of type Node.ELEMENT_NODE.
     * @param {String} oldClassName The CSS class name to replace.
     * @param {String} newClassName The CSS class name to replace it with.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidString
     * @returns {Element} The element.
     * @todo
     */

    var wholeClassValue,
        oldClassRegExp;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isEmpty(oldClassName) || TP.isEmpty(newClassName)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    wholeClassValue = TP.elementGetClass(anElement);

    //  If there was no prior value, then just set the class to the new
    //  value and return.
    if (TP.isEmpty(wholeClassValue = TP.elementGetClass(anElement))) {
        TP.elementSetClass(anElement, newClassName);

        return anElement;
    }

    //  NOTE: The RegExp here makes sure that the className is either first,
    //  last or is surrounded by one character of whitespace.
    oldClassRegExp = TP.rc('(^|\\s)' + oldClassName + '(\\s|$)');

    wholeClassValue = wholeClassValue.replace(oldClassRegExp,
                                                '$1' + newClassName + '$2');

    TP.elementSetClass(anElement, wholeClassValue);

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementReplaceTextWithEditor',
function(anElement) {

    /**
     * @name elementReplaceTextWithEditor
     * @synopsis Replaces the child text content of the supplied element with an
     *     'editor' (that is, an XHTML 'input' field).
     * @param {Element} anElement The element to remove the attribute value
     *     from.
     * @raises TP.sig.InvalidElement
     * @returns {Element} The element.
     */

    var elementDoc,
        currentValue,
        textInputElement;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elementDoc = TP.nodeGetDocument(anElement);

    //  Now, try to get the text value of the element. This will normalize
    //  any Node.TEXT_NODE nodes under anElement and hand us back the first
    //  one.
    currentValue = TP.nodeGetTextContent(anElement);

    //  Create the 'input' field.
    textInputElement = TP.documentCreateElement(elementDoc,
                                                'input',
                                                TP.w3.Xmlns.XHTML);

    //  Empty out the underlying child content and append the 'input' field.
    TP.nodeEmptyContent(anElement);

    //  We don't have to worry about reassignment of textInputElement to the
    //  return value of this method since we know we created it in
    //  elementDoc.
    TP.nodeAppendChild(anElement, textInputElement, false);

    //  Set the value of the input field to the text value obtained earlier
    //  and 'select' the input field so that the text is selected.
    textInputElement.value = currentValue;
    textInputElement.select();

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementScrollBy',
function(anElement, deltaX, deltaY) {

    /**
     * @name elementScrollBy
     * @synopsis Scrolls the element by the deltaX and deltaY amounts provided.
     * @param {HTMLElement} anElement The element to scroll.
     * @param {Number} deltaX The X coordinate to scroll the element by.
     * @param {Number} deltaY The Y coordinate to scroll the element by.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidNumber
     * @todo
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!TP.isNumber(deltaX) || !TP.isNumber(deltaY)) {
        return TP.raise(this, 'TP.sig.InvalidNumber', arguments);
    }

    anElement.scrollLeft += deltaX;
    anElement.scrollTop += deltaY;

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementScrollTo',
function(anElement, x, y) {

    /**
     * @name elementScrollTo
     * @synopsis Scrolls the element to the X and Y coordinates provided.
     * @param {HTMLElement} anElement The element to scroll.
     * @param {Number} x The X coordinate to scroll the element to.
     * @param {Number} y The Y coordinate to scroll the element to.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (!TP.isNumber(x) || !TP.isNumber(y)) {
        return TP.raise(this, 'TP.sig.InvalidNumber', arguments);
    }

    anElement.scrollLeft = x;
    anElement.scrollTop = y;

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetBusyMessage',
function(anElement, aMessage) {

    /**
     * @name elementSetBusyMessage
     * @synopsis Sets the busy element message to the supplied message.
     * @param {HTMLElement} anElement The element to set the busy element
     *     message for.
     * @param {String} aMessage The message to use for the busy message.
     * @todo
     */

    var busyMessageElement;

    if (TP.notValid(busyMessageElement = anElement.busyMessageElement)) {
        return;
    }

    busyMessageElement.firstChild.nodeValue = aMessage;

    //  TODO: Add logic to refresh screen (once that is figured out)

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetClipRect',
function(anElement, top, right, bottom, left) {

    /**
     * @name elementSetClipRect
     * @synopsis Sets the element's clipping rectangle.
     * @description If a Number is supplied to top, right, bottom or left, a
     *     default unit of 'px' is assumed.
     * @param {HTMLElement} anElement The element to set the clip rect on.
     * @param {Number|String} top The value to set the top coordinate of the
     *     element's clipping rectangle to.
     * @param {Number|String} right The value to set the right coordinate of the
     *     element's clipping rectangle to.
     * @param {Number|String} bottom The value to set the bottom coordinate of
     *     the element's clipping rectangle to.
     * @param {Number|String} left The value to set the left coordinate of the
     *     element's clipping rectangle to.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    TP.elementGetStyleObj(anElement).clip =
        'rect(' + ((!TP.isNaN(top)) ? top + 'px ' : top) +
                    ((!TP.isNaN(right)) ? right + 'px ' : right) +
                    ((!TP.isNaN(bottom)) ? bottom + 'px ' : bottom) +
                    ((!TP.isNaN(left)) ? left + 'px' : left) +
                    ')';

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetHeight',
function(anElement, aHeight) {

    /**
     * @name elementSetHeight
     * @synopsis Sets the element's height.
     * @description If a Number is supplied to aHeight a default unit of 'px' is
     *     assumed.
     * @param {HTMLElement} anElement The element to set the height on.
     * @param {Number|String} aHeight The height dimension to set anElement's
     *     height to.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isNumber(aHeight)) {
        TP.elementGetStyleObj(anElement).height = aHeight + 'px';
    } else {
        TP.elementGetStyleObj(anElement).height = aHeight;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetWidth',
function(anElement, aWidth) {

    /**
     * @name elementSetWidth
     * @synopsis Sets the element's width.
     * @description If a Number is supplied to aWidth a default unit of 'px' is
     *     assumed.
     * @param {HTMLElement} anElement The element to set the width on.
     * @param {Number|String} aWidth The width dimension to set anElement's
     *     width to.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isNumber(aWidth)) {
        TP.elementGetStyleObj(anElement).width = aWidth + 'px';
    } else {
        TP.elementGetStyleObj(anElement).width = aWidth;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementShow',
function(anElement) {

    /**
     * @name elementShow
     * @synopsis Shows the element.
     * @param {HTMLElement} anElement The element to display.
     * @raises TP.sig.InvalidElement
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    TP.elementDefaultDisplay(anElement);

    //  We always make sure that the element's visibility is set to
    //  'visible'.
    TP.elementGetStyleObj(anElement).visibility = 'visible';

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$elementShowBusyLayer',
function(anElement, aMessage, topCoord, leftCoord, width, height) {

    /**
     * @name $elementShowBusyLayer
     * @synopsis Shows the busy element for the supplied element. If there is no
     *     busy element for the supplied element, one is created and then shown.
     * @param {HTMLElement} anElement The element to show the busy element
     *     message for.
     * @param {String} aMessage The message to use for the busy message.
     * @param {Number} topCoord The top coordinate (relative to the 'body'
     *     element where the busy element will be appended) of the busy element.
     *     If this is not supplied, it will default to the top of the supplied
     *     element.
     * @param {Number} leftCoord The left coordinate (relative to the 'body'
     *     element where the busy element will be appended) of the busy element.
     *     If this is not supplied, it will default to the left of the supplied
     *     element.
     * @param {Number} width The width of the busy element. If this is not
     *     supplied, it will default to the width of the supplied element.
     * @param {Number} height The height of the busy element. If this is not
     *     supplied, it will default to the height of the supplied element.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidString
     * @returns {HTMLElement} The busy element itself.
     * @todo
     */

    var busyElement,
        busyMessageElement,
        busyControlImageElement,

        busyElemStyleObj,

        busyTop,
        busyLeft,
        busyWidth,
        busyHeight;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isEmpty(aMessage)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    busyElement = anElement.busyElement;
    busyMessageElement = anElement.busyMessageElement;
    busyControlImageElement = anElement.busyControlImageElement;

    busyElemStyleObj = TP.elementGetStyleObj(busyElement);

    //  Reset the busyElement's position by using either the supplied top
    //  and left or the 'global' X and Y position of the supplied element.
    busyTop = TP.isNumber(topCoord) ?
                    topCoord :
                    TP.elementGetPageY(anElement);
    busyElemStyleObj.top = busyTop + 'px';

    busyLeft = TP.isNumber(leftCoord) ?
                    leftCoord :
                    TP.elementGetPageX(anElement);
    busyElemStyleObj.left = busyLeft + 'px';

    //  Reset the busyElement's size by using either the width and height
    //  supplied or by using the offsetWidth and offsetHeight of the
    //  supplied element.
    busyWidth = TP.isNumber(width) ?
                    width :
                    TP.elementGetWidth(anElement);
    busyElemStyleObj.width = busyWidth + 'px';

    busyHeight = TP.isNumber(height) ?
                    height :
                    TP.elementGetHeight(anElement);
    busyElemStyleObj.height = busyHeight + 'px';

    //  Set the busy message to the supplied message.
    busyMessageElement.firstChild.nodeValue = aMessage;

    //  Set the top margin of the busy image element to 50% of the busy
    //  element's height minus the busy control image's height. This will
    //  place it in the center, minus the height of the busy control image,
    //  so that it 'floats above' the busy message element, which is
    //  squarely in the center.
    TP.elementGetStyleObj(busyControlImageElement).marginTop =
                (busyHeight * 0.50 - TP.BUSY_HEIGHT) + 'px';

    //  Set the top margin of the busy message element to 50% of the busy
    //  element's height. This will place it in the center of the busy
    //  element, just below the control image.
    TP.elementGetStyleObj(busyMessageElement).marginTop =
                (busyHeight * 0.50) + 'px';

    //  Set up a resize function, so that if the busy is showing when the
    //  user resizes the window, it will resize also. This function is
    //  detached when the busy element is hidden to avoid memory leaks.
    busyElement.busyResizeFunction = function() {

            busyWidth = TP.isNumber(width) ?
                            width :
                            anElement.offsetWidth;
            busyElemStyleObj.width = busyWidth + 'px';

            busyHeight = TP.isNumber(height) ?
                            height :
                            anElement.offsetHeight;
            busyElemStyleObj.height = busyHeight + 'px';
        };

    if (TP.boot.isUA('IE')) {
        anElement.ownerDocument.parentWindow.attachEvent(
            'onresize',
            busyElement.busyResizeFunction);
    } else {
        anElement.ownerDocument.defaultView.addEventListener(
            'resize',
            busyElement.busyResizeFunction,
            false);
    }

    //  Finally, go ahead and show the busy element :-).
    busyElemStyleObj.display = 'block';

    return busyElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementShowBusyMessage',
function(anElement, aMessage) {

    /**
     * @name elementShowBusyMessage
     * @synopsis Shows a busy message along with associated graphic (when styled
     *     using the defaults) for the element provided.
     * @param {HTMLElement} anElement The element to show the busy element
     *     message for.
     * @param {String} aMessage The message to use for the busy message.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidString
     * @todo
     */

    var busyElement,

        controlImageElement,
        controlImageUrl,

        busyMessageElement,

        styleObj;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isEmpty(aMessage)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    busyElement = TP.$elementGetBusyLayer(anElement);

    //  Because this can happen early in the page load process (before the
    //  stylesheets are parsed), we have a Catch-22 where we need to display
    //  this busy panel, but the styles aren't available. Therefore, we
    //  hardcode them.

    //  Note how the z-index here is set to the TP.POPUP_TIER in the TIBET
    //  kernel.
    TP.elementSetStyle(busyElement,
                            TP.join('position: absolute;',
                            //      ' background-color: white;',
                                    ' display: none;',
                                    ' z-index: ', TP.POPUP_TIER, ';'));

    controlImageElement = busyElement.getElementsByTagName('div')[1];
    controlImageUrl = TP.uriExpandPath(TP.sys.cfg('path.lib_img')) +
                                                '/tibet_busy.gif';

    TP.elementSetStyle(
            controlImageElement,
                TP.join('position: absolute;',
                        ' left: 50%;',
                        ' margin-left: -14px;',
                        ' width: 28px;',
                        ' height: 28px;',
                        ' background-image: url(', controlImageUrl, ');'));

    busyMessageElement = busyElement.getElementsByTagName('span')[0];
    TP.elementSetStyle(
        busyMessageElement,
            TP.join(
            'position: absolute;',
            ' font-family: Tahoma, Verdana, Arial, Helvetica, sans-serif;',
            ' font-size: small;',
            ' width: 100%;',
            ' text-align: center;'));

    styleObj = TP.elementGetStyleObj(anElement);

    //  capture and turn off overflow that would show scrollbars
    anElement.oldOverflow = styleObj.overflow;
    styleObj.overflow = 'hidden';

    //  Go ahead and show the busy element.
    TP.$elementShowBusyLayer(anElement, aMessage);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSumAncestorValues',
function(anElement, propName, useOffsetAncestors) {

    /**
     * @name elementSumAncestorValues
     * @synopsis Adds up the values of the given property starting at the
     *     supplied element's ancestor and proceeding up the document tree until
     *     just under the #document node.
     * @param {Element} anElement The element to begin adding the property value
     *     of.
     * @param {String} propName The name of the property to add up the tree as
     *     we traverse the ancestors.
     * @param {Boolean} useOffsetAncestors Whether or not to use the supplied
     *     element's 'offset' ancestors (i.e. 'offsetParent' up the chain).
     * @raises TP.sig.InvalidElement,TP.sig.InvalidString
     * @returns {Number} The value of the property as computed up the ancestorp
     *     chain.
     * @todo
     */

    var totalPropertyValue,
        ancestor,
        ancestorVal,
        useOffsets;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isEmpty(propName)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    useOffsets = TP.ifInvalid(useOffsetAncestors, false);
    totalPropertyValue = 0;

    if (useOffsets) {
        ancestor = TP.elementGetOffsetParent(anElement);
    } else {
        ancestor = anElement.parentNode;
    }

    while (TP.isElement(ancestor) &&
            (ancestor.nodeType !== Node.DOCUMENT_NODE)) {
        if (TP.isNumber(ancestorVal = ancestor[propName])) {
            totalPropertyValue += ancestorVal;
        }

        if (useOffsets) {
            ancestor = TP.elementGetOffsetParent(ancestor);
        } else {
            ancestor = ancestor.parentNode;
        }
    }

    return totalPropertyValue;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSumAttributeValue',
function(anElement, attrName, attrValue, atEnd, allowDuplicates) {

    /**
     * @name elementSumAttributeValue
     * @synopsis Adds the attribute value to the attribute named by attrName of
     *     the supplied element.
     * @param {Element} anElement The element to add the attribute value to.
     * @param {String} attrName The name of the attribute to add the value to.
     * @param {String} attrValue The value to add to the attribute's value.
     * @param {Boolean} atEnd Should the add go in at the end?
     * @param {Boolean} allowDuplicates Should we allow duplicate values?
     * @raises TP.sig.InvalidElement,TP.sig.InvalidString,
     *     TP.sig.InvalidParameter
     * @returns {Element} The element.
     * @todo
     */

    var shouldAllowDups,
        shouldBeAtEnd,

        existingWholeValue,

        valMatcher;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    if (TP.isEmpty(attrName)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    //  Note here how we just check to make sure the attribute value is
    //  'valid', because it might not necessarily be a String (might be a
    //  Boolean, Number, etc.)
    if (TP.notValid(attrValue)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    shouldAllowDups = TP.ifInvalid(allowDuplicates, false);
    shouldBeAtEnd = TP.ifInvalid(atEnd, true);

    //  If the element already has a value in that attribute, then we have
    //  to do a bit of shuffle.
    if (TP.notEmpty(existingWholeValue = TP.elementGetAttribute(anElement,
                                                                attrName,
                                                                true))) {
        //  If we're not allowing duplicates, make sure that the existing
        //  attribute value doesn't already have that value in it.
        if (!shouldAllowDups) {
            valMatcher = TP.rc('(^|\\s)' + attrValue + '(\\s|$)');

            if (valMatcher.test(existingWholeValue)) {
                return anElement;
            }
        }

        //  If it should be at the end, append it to the existing value.
        if (shouldBeAtEnd) {
            TP.elementSetAttribute(
                    anElement,
                    attrName,
                    existingWholeValue + ' ' + attrValue,
                    true);
        } else {
            //  Otherwise, prepend it to the existing value.
            TP.elementSetAttribute(
                    anElement,
                    attrName,
                    attrValue + ' ' + existingWholeValue,
                    true);
        }
    } else {
        //  There is no value in the supplied attribute on the element, so
        //  just set it to be the supplied value.
        TP.elementSetAttribute(anElement, attrName, attrValue, true);
    }

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementWrapToContent',
function(anElement) {

    /**
     * @name elementWrapToContent
     * @synopsis "Shrink wraps" the element to its content.
     * @description This method grows or shrinks the element's size to be the
     *     size of its contents. It also adjusts the clipping rectangle to that
     *     same dimension.
     * @param {HTMLElement} anElement The element to wrap to its content.
     * @raises TP.sig.InvalidElement
     */

    var elementWidth,
        elementHeight,

        clipRect;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    elementWidth = TP.elementGetContentWidth(anElement);
    elementHeight = TP.elementGetContentHeight(anElement);

    TP.elementSetWidth(anElement, elementWidth);
    TP.elementSetHeight(anElement, elementHeight);

    clipRect = TP.elementGetClipRect(anElement);

    TP.elementSetClipRect(anElement,
                            clipRect.at(0),
                            clipRect.at(3) + elementWidth,
                            clipRect.at(0) + elementHeight,
                            clipRect.at(3));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlElementAddContent',
function(anElement, theContent, loadedFunction, shouldAwake) {

    /**
     * @name htmlElementAddContent
     * @synopsis Adds content from theContent onto the end of the child content
     *     of anElement.
     * @param {Element} anElement The element receiving content.
     * @param {Node|String} theContent The content to insert into the element.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just added.
     * @returns {Node} The first node of the content that was just added.
     * @todo
     */

    //  Simply a cover for inserting child content before the end of the
    //  element.
    return TP.htmlElementInsertContent(anElement,
                                        theContent,
                                        TP.BEFORE_END,
                                        loadedFunction,
                                        shouldAwake);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlElementInsertContent',
function(anElement, theContent, aPositionOrPath, loadedFunction, shouldAwake) {

    /**
     * @name htmlElementInsertContent
     * @synopsis Inserts content from theContent into/around anElement based on
     *     the position given. The position should indicate whether the content
     *     should become the previous sibling, next sibling, first child or last
     *     child.
     * @param {Element} anElement The element receiving content.
     * @param {Node|String} theContent The content to insert into the element.
     * @param {String} aPositionOrPath The position to place the content
     *     relative to anElement or a path to evaluate to get to a node at that
     *     position. This should be one of four values: TP.BEFORE_BEGIN,
     *     TP.AFTER_BEGIN, TP.BEFORE_END, TP.AFTER_END or the path to evaluate.
     *     Default is TP.BEFORE_END.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just inserted.
     * @raises TP.sig.InvalidElement
     * @returns {Node} The first node of the content that was just inserted.
     * @todo
     */

    var awakenContent,

        thePosition,

        doc,

        nodeContent,
        strContent,

        insertionNode,

        prevFirstChild,
        prevLastChild,

        elemTagName,
        elemParent,

        childContainer,

        childIndex,

        range,
        node,

        returnNode;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    awakenContent = TP.ifInvalid(shouldAwake, TP.nodeHasWindow(anElement));

    thePosition = TP.ifEmpty(aPositionOrPath, TP.BEFORE_END);

    doc = TP.nodeGetDocument(anElement);

    //  If the content is an HTML node, then we just make sure its an
    //  Element, and not a Document.
    if (TP.isHTMLNode(theContent)) {
        if (TP.isDocument(theContent)) {
            nodeContent = theContent.documentElement;
        } else {
            nodeContent = theContent;
        }

        strContent = null;
    } else {
        //  Otherwise, its an X(HT)ML node or a String - in either case, we
        //  get the HTML String representation and use that.
        strContent = TP.htmlstr(theContent);
        nodeContent = null;
    }

    //  If we have node content, then we use it - since parsing, in general,
    //  is where the performance problems are.
    if (TP.isNode(nodeContent)) {
        //  Based on the value of the position, we insert the node at the
        //  proper place in the DOM and possibly awaken it, based on the
        //  value of the 'awakenContent' flag.
        switch (thePosition) {
            case TP.AFTER_END:

                TP.nodeInsertBefore(anElement.parentNode,
                                    nodeContent,
                                    anElement.nextSibling,
                                    awakenContent);

                break;

            case TP.BEFORE_BEGIN:

                TP.nodeInsertBefore(anElement.parentNode,
                                    nodeContent,
                                    anElement,
                                    awakenContent);

                break;

            case TP.AFTER_BEGIN:

                TP.nodeInsertBefore(anElement,
                                    nodeContent,
                                    anElement.firstChild,
                                    awakenContent);

                break;

            case TP.BEFORE_END:

                TP.nodeAppendChild(anElement,
                                    nodeContent,
                                    awakenContent);

                break;

            default:

                //  Evaluate the path, using anElement as the 'context node'
                //  and insert the new content before the returned node.
                //  Note here how we 'auto collapse' into one node (so if
                //  the path returns multiple nodes, only the first one will
                //  be used). This will also cause an invalid value if no
                //  nodes are found.

                if (TP.isNode(insertionNode = TP.nodeEvaluatePath(
                                anElement,
                                thePosition,
                                null,   //  let the call determine path type
                                true))) //  autocollapse
                {
                    TP.nodeInsertBefore(anElement,
                                        nodeContent,
                                        insertionNode,
                                        awakenContent);
                }
        }
    } else if (TP.isString(strContent)) {
        //  Otherwise, if we have String content, then we can try to use the
        //  native call, insertAdjacentHTML, if we're on IE or we create a
        //  contextual fragment and use the DOM, if we're on a W3C compliant
        //  browser.
        if (TP.boot.isUA('IE')) {
            //  IE doesn't do a good job of handling '&apos;' - but it can
            //  handle the numeric version.
            strContent = strContent.replace(/&apos;/g, '&#39;');

            //  Grab the current firstChild and lastChild nodes. These come
            //  in very handy later when determining which new nodes need to
            //  be awakened.
            prevFirstChild = anElement.firstChild;
            prevLastChild = anElement.lastChild;

            elemTagName = anElement.tagName.toLowerCase();

            elemParent = anElement.parentNode;

            //  We can use 'insertAdjacentHTML' here to insert new content
            //  around the element, unless we're on IE and its one of the
            //  'table' elements that doesn't support insertAdjacentHTML:
            //      table, thead, tbody, tfoot, tr, th, td.
            if (/(table|thead|tbody|tfoot|tr|th|td)/.test(elemTagName)) {
                //  The trick here is to build a DOM using the table markup
                //  we are given and then get that and insert it into the
                //  proper place.

                //  NOTE: IE-ONLY DEFINED CALL HERE!!

                if ((thePosition === TP.AFTER_BEGIN) ||
                    (thePosition === TP.BEFORE_END)) {
                    childContainer = TP.$$buildTableDOM(elemTagName,
                                                        doc,
                                                        strContent,
                                                        true);
                } else {
                    childContainer = TP.$$buildTableDOM(elemTagName,
                                                        doc,
                                                        strContent,
                                                        false);
                }

                //  Loop over the nodes contained in the returned DOM made
                //  from the table markup. Note how each insertion plucks
                //  out 'firstChild' (which continues to shift) through each
                //  iteration of the loop.
                while (childContainer.hasChildNodes()) {
                    //  Based on the value of the position, we insert the
                    //  node at the proper place in the DOM. We'll awaken it
                    //  later.
                    switch (thePosition) {
                        case TP.AFTER_END:

                            elemParent.insertBefore(
                                            childContainer.firstChild,
                                            anElement.nextSibling);

                            break;

                        case TP.BEFORE_BEGIN:

                            elemParent.insertBefore(
                                            childContainer.firstChild,
                                            anElement);

                            break;

                        case TP.AFTER_BEGIN:

                            anElement.insertBefore(
                                            childContainer.firstChild,
                                            anElement.firstChild);

                            break;

                        case TP.BEFORE_END:

                            anElement.appendChild(
                                            childContainer.firstChild);

                            break;
                    }
                }
            } else {
                //  Otherwise, it wasn't table markup so we can just use
                //  'insertAdjacentHTML'.
                anElement.insertAdjacentHTML(thePosition, strContent);
            }

            if (awakenContent) {
                switch (thePosition) {
                    case TP.AFTER_END:

                        childIndex = TP.nodeGetChildIndex(
                                    anElement.parentNode, anElement) + 1;

                        TP.nodeAwakenChildNodesFromTo(
                                    anElement.parentNode,
                                    childIndex,
                                    TP.LAST);

                        break;

                    case TP.BEFORE_BEGIN:

                        childIndex = TP.nodeGetChildIndex(
                                    anElement.parentNode, anElement) - 1;

                        TP.nodeAwakenChildNodesFromTo(
                                    anElement.parentNode,
                                    TP.FIRST,
                                    childIndex);

                        break;

                    case TP.AFTER_BEGIN:

                        if (TP.isNode(prevFirstChild)) {
                            childIndex = TP.nodeGetChildIndex(
                                    anElement, prevFirstChild) - 1;
                        } else {
                            childIndex = anElement.childNodes.length - 1;
                        }

                        TP.nodeAwakenChildNodesFromTo(
                                    anElement,
                                    TP.FIRST,
                                    childIndex);

                        break;

                    case TP.BEFORE_END:

                        if (TP.isNode(prevLastChild)) {
                            childIndex = TP.nodeGetChildIndex(
                                    anElement, prevLastChild) + 1;
                        } else {
                            childIndex = 0;
                        }

                        TP.nodeAwakenChildNodesFromTo(
                                    anElement,
                                    childIndex,
                                    TP.LAST);

                        break;
                }
            }
        } else {
            //  We're in a W3C-compliant browser, so we can create a
            //  contextual fragment and use that.
            range = doc.createRange();

            switch (thePosition) {
                case TP.AFTER_END:

                    range.setStartAfter(anElement);

                    break;

                case TP.BEFORE_BEGIN:

                    range.setStartBefore(anElement);

                    break;

                case TP.AFTER_BEGIN:

                    range.selectNodeContents(anElement);
                    range.collapse(true);

                    break;

                case TP.BEFORE_END:

                    range.selectNodeContents(anElement);
                    range.collapse(false);

                    break;
            }

            //  Try to create a contextual fragment from the String content.
            //  If this fails (probably because of a parsing bug), then we
            //  just create a text node from the String.
            try {
                node = range.createContextualFragment(strContent);

                //  Make sure to 'repair' anything like SVG that might exist
                //  in the fragment. See the '$htmlFragmentRepair' method
                //  for more details.
                TP.$htmlFragmentRepair(node);
            } catch (e) {
                node = doc.createTextNode(strContent);

                //  NB: We don't bother awakening this, since we're just
                //  inserting a Node.TEXT_NODE.
                awakenContent = false;
            }

            //  Based on the value of the position, we insert the node at
            //  the proper place in the DOM. We awaken it based on the value
            //  of awakenContent.
            switch (thePosition) {
                case TP.AFTER_END:

                    TP.nodeInsertBefore(anElement.parentNode,
                                        node,
                                        anElement.nextSibling,
                                        awakenContent);
                    break;

                case TP.BEFORE_BEGIN:

                    TP.nodeInsertBefore(anElement.parentNode,
                                        node,
                                        anElement,
                                        awakenContent);

                    break;

                case TP.AFTER_BEGIN:

                    TP.nodeInsertBefore(anElement,
                                        node,
                                        anElement.firstChild,
                                        awakenContent);

                    break;

                case TP.BEFORE_END:

                    TP.nodeAppendChild(anElement,
                                        node,
                                        awakenContent);

                    break;
            }
        }
    }

    //  Based on the value of the position, we return the proper node.
    switch (thePosition) {
        case TP.AFTER_END:

            returnNode = anElement.nextSibling;

            break;

        case TP.BEFORE_BEGIN:

            returnNode = anElement.previousSibling;

            break;

        case TP.AFTER_BEGIN:

            returnNode = anElement.firstChild;

            break;

        case TP.BEFORE_END:

            returnNode = anElement.lastChild;

        break;
    }

    //  Execute any loaded function that we were handed.
    if (TP.isCallable(loadedFunction)) {
        loadedFunction(anElement);
    }

    //  We only signal TP.sig.DOMContentLoaded if the system is configured
    //  for it.
    if (TP.sys.shouldSignalDOMLoaded()) {
        TP.signal(TP.gid(anElement),
                    'TP.sig.DOMContentLoaded',
                    arguments,
                    theContent);
    }

    return returnNode;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlElementReplaceWith',
function(anElement, theContent, loadedFunction, shouldAwake) {

    /**
     * @name htmlElementReplaceWith
     * @synopsis Replaces anElement which should be an HTML element.
     * @description This method sets the 'outer content' of anElement to
     *     theContent which means that the entire element, including its start
     *     and end tags, will be replaced with theContent. NOTE: This method may
     *     replace anElement!!! To use this method safely, always capture its
     *     return value and use that as the target element going forward.
     * @param {HTMLElement} anElement The element to set the 'outer content' of.
     * @param {Node|String} theContent The content to replace the 'outer
     *     content' with.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just inserted.
     * @raises TP.sig.InvalidElement
     * @returns {Element|Text} The newly created Node (could be a Text node) or
     *     anElement, depending on how the replacement happened.
     * @todo
     */

    var awakenContent,

        doc,

        nodeContent,
        strContent,

        returnNode,

        elemTagName,
        elemParent,
        childIndex,

        childContainer,

        range,
        node;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    awakenContent = TP.ifInvalid(shouldAwake, TP.nodeHasWindow(anElement));

    doc = TP.nodeGetDocument(anElement);

    //  If the content is an HTML node, then we just make sure its an
    //  Element, and not a Document.
    if (TP.isHTMLNode(theContent)) {
        if (TP.isDocument(theContent)) {
            nodeContent = theContent.documentElement;
        } else {
            nodeContent = theContent;
        }

        strContent = null;
    } else {
        //  Otherwise, its an X(HT)ML node or a String - in either case, we
        //  get the HTML String representation and use that.
        strContent = TP.htmlstr(theContent);
        nodeContent = null;
    }

    //  If we have node content, then we use it - since parsing, in general,
    //  is where the performance problems are.
    if (TP.isNode(nodeContent)) {
        //  Replace anElement with the nodeContent in the parent.
        //  Note that this means that anElement is no longer part of its
        //  Document.

        //  Note reassignment since the node we're adding might have come
        //  from another document.
        returnNode = TP.nodeReplaceChild(
                                anElement.parentNode,
                                nodeContent,
                                anElement,
                                awakenContent);
    } else if (TP.isString(strContent)) {
        //  Otherwise, if we have String content, then we can try to use the
        //  native call, insertAdjacentHTML, if we're on IE or we create a
        //  contextual fragment and use the DOM, if we're on a W3C compliant
        //  browser.
        if (TP.boot.isUA('IE')) {
            //  IE doesn't do a good job of handling '&apos;' - but it can
            //  handle the numeric version.
            strContent = strContent.replace(/&apos;/g, '&#39;');

            elemTagName = anElement.tagName.toLowerCase();

            elemParent = anElement.parentNode;
            childIndex = TP.nodeGetChildIndex(elemParent, anElement);

            //  We can use 'outerHTML' here to set the new replacement of
            //  the element, unless we're on IE and its one of the 'table'
            //  elements that doesn't support outerHTML:
            //      table, thead, tbody, tfoot, tr, th, td.
            if (/(table|thead|tbody|tfoot|tr|th|td)/.test(elemTagName)) {
                //  The trick here is to build a DOM using the table markup
                //  we are given and then get that and insert it into the
                //  proper place.

                //  NOTE: IE-ONLY DEFINED CALL HERE!!
                childContainer = TP.$$buildTableDOM(elemTagName,
                                                    doc,
                                                    strContent,
                                                    false);

                //  Loop over the nodes contained in the returned DOM made
                //  from the table markup. Note how each insertion plucks
                //  out 'firstChild' (which continues to shift) through each
                //  iteration of the loop.
                while (childContainer.hasChildNodes()) {
                    elemParent.insertBefore(childContainer.firstChild,
                                            anElement);
                }

                //  Remove anElement from its parent - we're replacing it.
                elemParent.removeChild(anElement);
            } else {
                //  Otherwise, it wasn't table markup so we can just use
                //  'outerHTML'.
                anElement.outerHTML = strContent;
            }

            //  The return node is the 'new node', which can be found at the
            //  same index in the parent as anElement was.
            returnNode = elemParent.childNodes[childIndex];

            if (awakenContent) {
                //  Awaken any newly added content. Note here how we hand
                //  the whole element to the awakening function to awaken
                //  itself and all descendant content underneath it.
                TP.nodeAwakenContent(returnNode,
                                        doc,
                                        TP.nodeGetWindow(doc));
            }
        } else {
            //  We're in a W3C-compliant browser, so we can create a
            //  contextual fragment and use that.
            range = doc.createRange();
            range.setStartBefore(anElement);

            //  Try to create a contextual fragment from the String content.
            //  If this fails (probably because of a parsing bug), then we
            //  just create a text node from the String.
            try {
                node = range.createContextualFragment(strContent);

                //  Make sure to 'repair' anything like SVG that might exist
                //  in the fragment. See the '$htmlFragmentRepair' method
                //  for more details.
                TP.$htmlFragmentRepair(node);

                //  The contextual fragment is a DocumentFragment and we
                //  need to capture the element that was really created,
                //  which is the element represented by strContent, before
                //  we do the replace.
                returnNode = node.firstChild;
            } catch (e) {
                returnNode = doc.createTextNode(strContent);
            }

            //  Note reassignment since the node we're adding might have
            //  come from another document.
            returnNode = TP.nodeReplaceChild(
                                    anElement.parentNode,
                                    returnNode,
                                    anElement,
                                    awakenContent);
        }
    }

    //  Execute any loaded function that we were handed.
    if (TP.isCallable(loadedFunction)) {
        loadedFunction(returnNode.parentNode);
    }

    //  We only signal TP.sig.DOMContentLoaded if the system is configured
    //  for it.
    if (TP.sys.shouldSignalDOMLoaded()) {
        //  NOTE NOTE NOTE
        //  we signal here, but from the PARENT since outer content replaces
        //  the original element
        TP.signal(TP.gid(returnNode.parentNode),
                    'TP.sig.DOMContentLoaded',
                    arguments,
                    theContent);
    }

    //  Return whatever the return node is.
    return returnNode;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlElementSetContent',
function(anElement, theContent, loadedFunction, shouldAwake) {

    /**
     * @name htmlElementSetContent
     * @synopsis Sets the 'content' of anElement, which should be an HTML
     *     element.
     * @description This method sets the 'inner content' of anElement to
     *     theContent which means that just the contents of the element, not
     *     including its start and end tags, will be replaced with theContent.
     * @param {HTMLElement} anElement The element to set the 'inner content' of.
     * @param {Node|String} theContent The content to replace the 'inner
     *     content' with.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just inserted.
     * @raises TP.sig.InvalidElement
     * @returns {Element} The element.
     * @todo
     */

    var awakenContent,

        nodeContent,
        strContent,

        elemTagName,

        childContainer;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    awakenContent = TP.ifInvalid(shouldAwake, TP.nodeHasWindow(anElement));

    //  If the content is an HTML node, then we just make sure its an
    //  Element, and not a Document.
    if (TP.isHTMLNode(theContent)) {
        if (TP.isDocument(theContent)) {
            nodeContent = theContent.documentElement;
        } else {
            nodeContent = theContent;
        }

        strContent = null;
    } else {
        //  Otherwise, its an X(HT)ML node or a String - in either case, we
        //  get the HTML String representation and use that.
        strContent = TP.htmlstr(theContent);
        nodeContent = null;
    }

    //  If we have node content, then we use it - since parsing, in general,
    //  is where the performance problems are.
    if (TP.isNode(nodeContent)) {
        //  Clear the node

        if (TP.boot.isUA('IE')) {
            elemTagName = anElement.tagName.toLowerCase();

            //  We can use 'innerHTML' here to clear out the old content of
            //  the element, unless we're on IE and its one of the 'table'
            //  elements that doesn't support innerHTML:
            //      table, thead, tbody, tfoot, tr, th, td.
            if (/(table|thead|tbody|tfoot|tr|th|td)/.test(elemTagName)) {
                //  Clear it out manually using DOM methods and looping.
                while (anElement.hasChildNodes()) {
                    anElement.removeChild(anElement.lastChild);
                }
            } else {
                anElement.innerHTML = '';
            }
        } else {
            anElement.innerHTML = '';
        }

        //  Append the nodeContent which makes it the sole child node.

        //  Note reassignment since the node we're adding might have
        //  come from another document.
        nodeContent = TP.nodeAppendChild(anElement, nodeContent, false);
    } else if (TP.isString(strContent)) {
        if (TP.boot.isUA('IE')) {
            //  IE doesn't do a good job of handling '&apos;' - but it can
            //  handle the numeric version.
            strContent = strContent.replace(/&apos;/g, '&#39;');

            elemTagName = anElement.tagName.toLowerCase();

            //  We can use 'innerHTML' here to clear out the old content of
            //  the element, unless we're on IE and its one of the 'table'
            //  elements that doesn't support innerHTML:
            //      table, thead, tbody, tfoot, tr, th, td.
            if (/(table|thead|tbody|tfoot|tr|th|td)/.test(elemTagName)) {
                //  Clear it out manually using DOM methods and looping.
                while (anElement.hasChildNodes()) {
                    anElement.removeChild(anElement.lastChild);
                }

                //  The trick here is to build a DOM using the table markup
                //  we are given and then get that and insert it into the
                //  proper place.

                //  NOTE: IE-ONLY DEFINED CALL HERE!!
                childContainer = TP.$$buildTableDOM(
                                            elemTagName,
                                            TP.nodeGetDocument(anElement),
                                            strContent,
                                            true);

                //  Loop over the nodes contained in the returned DOM made
                //  from the table markup. Note how each insertion plucks
                //  out 'firstChild' (which continues to shift) through each
                //  iteration of the loop.
                while (childContainer.hasChildNodes()) {
                    anElement.appendChild(childContainer.firstChild);
                }
            } else {
                anElement.innerHTML = strContent;
            }
        } else {
            anElement.innerHTML = strContent;
        }
    }

    if (awakenContent) {
        //  Awaken any newly added content. Note how we loop over all of the
        //  child nodes as all of them constitute the newly added content.
        TP.nodeAwakenChildNodesFromTo(anElement, TP.FIRST, TP.LAST);
    }

    //  Execute any loaded function that we were handed.
    if (TP.isCallable(loadedFunction)) {
        loadedFunction(anElement);
    }

    //  We only signal TP.sig.DOMContentLoaded if the system is configured
    //  for it.
    if (TP.sys.shouldSignalDOMLoaded()) {
        TP.signal(TP.gid(anElement),
                    'TP.sig.DOMContentLoaded',
                    arguments,
                    theContent);
    }

    //  Return the element itself.
    return anElement;
});

//  ------------------------------------------------------------------------
//  NODE PRIMITIVES
//  ------------------------------------------------------------------------

/*
Common Node operations. Conversion into an HTML or XHTML format is a common
operation done during UI display. Most of TIBET operates on XML until the
last moment so we preserve the ability to use XSLT, XPath, etc. for as long
as possible. Only at the last stage of display do we tend to convert to a
true HTML DOM or string format.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlElementAsXHTMLString',
function(anElement) {

    /**
     * @name htmlElementAsXHTMLString
     * @synopsis Returns a String of well-formed XHTML for the HTML element.
     *     This method tries to build a compliant XHTML string from the supplied
     *     element, which should be an HTML element.
     * @param {HTMLElement} anElement The Element to serialize.
     * @raises TP.sig.InvalidElement
     * @returns {String} A String representation of the Element converted into
     *     XHTML.
     */

    var xhtmlResult,
        defaultLang,

        escapeText,

        processedRootElement;

    if (!TP.isHTMLNode(anElement) || !TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments,
                            'Element must be an HTML element.');
    }

    //  Create an Array to hold our XHTML information as we generate it.
    //  We'll join this together at the end of this method to produce the
    //  String.
    xhtmlResult = TP.ac();

    //  The default language is TIBET's current 'target' language. The
    //  markup may define its own 'lang' attribute below, which will
    //  override this setting.
    defaultLang = TP.sys.getTargetLanguage();

    escapeText = true;

    //  A flag to keep track of whether we're at the root element or not.
    processedRootElement = false;

    TP.nodeDepthTraversal(
        anElement,
function(anElement) {

            //  The 'push' function for the depth traversal

            var elemTagName,

                hasXMLNS,
                hasLang,

                elemAttrs,

                i,

                attrName,
                attrValue,

                nsPrefix,
                currentNSURI,
                currentNSPrefixes;

            //  Grab the element's tag name and convert it to lowercase. It
            //  it's empty, bail out.
            if (TP.isEmpty(elemTagName = anElement.tagName.toLowerCase())) {
                return;
            }

            //  Weird IE comment stuff because getElementsByTagName('*')
            //  returns comment nodes.
            if (elemTagName === '!') {
                xhtmlResult.push(anElement.text);
                return;
            }

            //  If the tag is a 'meta' tag with a 'generator', then its
            //  unnecessary for our produced markup so we exit here.
            if (elemTagName === 'meta') {
                if (anElement.name.toLowerCase() === 'generator') {
                    return;
                }
            }

            currentNSPrefixes = TP.ac();

            //  If the tag name is 'html', write the XHTML strict
            //  doctype, since that's what we're generating here.
            if (elemTagName === 'html') {
                xhtmlResult.push(
                        TP.XML_10_HEADER,
                        TP.w3.DocType.XHTML_10_STRICT.asString());
            }

            //  Start the tag
            xhtmlResult.push('<', elemTagName);

            hasXMLNS = false;
            hasLang = false;

            //  Grab the element's attributes
            elemAttrs = anElement.attributes;

            //  Loop over them and compute the name and value for them.
            for (i = 0; i < elemAttrs.length; i++) {
                attrName = elemAttrs[i].name.toLowerCase();

                //  If the attribute has a colon (':') in it, check to see
                //  if a namespace can be found that would match the part of
                //  the attribute name before the colon.
                if (attrName.contains(':')) {
                    //  Grab the namespace prefix by slicing it off the
                    //  attribute name.
                    nsPrefix = attrName.slice(0, attrName.indexOf(':'));

                    //  Make sure not to add the 'xmlns' prefix itself to
                    //  our 'current prefixes list' since many XML parsers
                    //  don't like to parse the TP.w3.Xmlns.XMLNS.
                    if (/xmlns/.test(nsPrefix)) {
                        continue;
                    }

                    //  If this prefix is not in the 'current prefixes list'
                    //  (tracked element-by-element and emptied after each
                    //  element is processed), then try to grab the URI and
                    //  build an 'xmlns' attribute.
                    if (!currentNSPrefixes.contains(nsPrefix)) {
                        currentNSURI = TP.w3.Xmlns.getPrefixURI(nsPrefix);

                        if (TP.notEmpty(currentNSURI)) {
                            xhtmlResult.push(' ', 'xmlns:', nsPrefix,
                                    '="', currentNSURI, '"');
                        } else {
                            xhtmlResult.push(' ', 'xmlns:', nsPrefix,
                                    '="urn:tibet:unrecognizednamespace"');
                        }

                        //  Remember that we processed this prefix for this
                        //  element so that we don't end up with multiple
                        //  'xmlns:' attributes with the same prefix on the
                        //  same element.
                        currentNSPrefixes.push(nsPrefix);
                    }
                }

                switch (attrName) {
                    case    'style':

                        //  The best way (because of IE) to get the
                        //  attribute value of the 'style' attribute is to
                        //  grab its 'cssText' property (we also lowercase
                        //  it here to conform to TIBET coding standards).
                        attrValue = TP.elementGetStyleObj(
                                        anElement).cssText.toLowerCase();
                    break;

                    case    'class':

                        //  The best way (because of IE) to get the
                        //  attribute value of the 'class' attribute is to
                        //  grab its 'className' property.
                        attrValue = anElement.className;
                    break;

                    case    'http-equiv':
                        attrValue = anElement.httpEquiv;
                    break;

                    case    'name':
                        attrValue = anElement.name;
                    break;

                    case    'for':
                        attrValue = anElement.htmlFor;
                    break;

                    case    'xmlns':
                        hasXMLNS = true;
                    break;

                    case    'lang':
                    case    'xml:lang':
                        hasLang = true;
                    break;

                    //  These attributes need a value in XHTML because
                    //  they're 'singular' in HTML (i.e. checked="checked")
                    case    'noshade':
                    case    'checked':
                    case    'selected':
                    case    'multiple':
                    case    'nowrap':
                    case    'disabled':
                        attrValue = attrName;
                    break;

                    default:

                        //  No special handling... just go ahead and grab
                        //  the value.
                        try {
                            //  Note here how we pass in '2' as a second
                            //  parameter to this call. This is a special IE
                            //  syntax that tells getAttribute to return
                            //  the originally specified value in the
                            //  markup, no matter what its been changed to.

                            //  Note that we do *not* use
                            //  TP.elementGetAttribute() here because of the
                            //  special parameter.
                            attrValue = anElement.getAttribute(
                                                            attrName, 2);
                        } catch (e) {
                            continue;
                        }
                    break;
                }

                //  If no attribute value was supplied, then we merely set
                //  it to be the empty string.
                if (TP.isEmpty(attrValue)) {
                    xhtmlResult.push(' ', attrName, '=""');
                } else {
                    //  Otherwise, we set it to its value after replacing
                    //  literal constructs with entities.
                    xhtmlResult.push(' ', attrName, '="',
                                TP.xmlLiteralsToEntities(attrValue), '"');
                }
            }

            //  If its the 'html' element, then check to see if a language
            //  or an xmlns was defined. If not, supply them.
            if (!processedRootElement) {
                if (!hasLang) {
                    xhtmlResult.push(' lang="', defaultLang,
                                        '" xml:lang="', defaultLang, '"');
                }

                if (!hasXMLNS) {
                    xhtmlResult.push(
                            ' xmlns="http://www.w3.org/1999/xhtml"');
                }

                //  Flip the flag so that we don't do this again.
                processedRootElement = true;
            }

            //  End the tag.
            xhtmlResult.push('>');

            //  If it was a 'pre' element, then we're not escaping text,
            //  since the 'pre' does that for us.
            if (elemTagName === 'pre') {
                escapeText = false;
            } else {
                escapeText = true;
            }

            //  Clear out any current namespace prefixes we are tracking.
            currentNSPrefixes.empty();
        },
function(anElement) {

            //  The 'pop' function for the depth traversal

            //  Weird IE comment stuff because getElementsByTagName('*')
            //  returns comment nodes.
            if (anElement.tagName === '!') {
                return;
            }

            //  End off the element by generating a closing tag.
            xhtmlResult.push('</',
                                anElement.tagName.toLowerCase(),
                                '>');
        },
function(nonElementNode) {

            //  The content function for the depth traversal

            var commentText;

            //  Switch on the node type... we currently support TEXT_NODEs
            //  and COMMENT_NODEs.
            switch (nonElementNode.nodeType) {
                case    Node.TEXT_NODE:

                    //  If we're supposed to escape the text, run the text
                    //  node's nodeValue through a conversion from literals
                    //  to entities and push that onto our results.
                    if (escapeText) {
                        xhtmlResult.push(
                            TP.xmlLiteralsToEntities(
                                TP.htmlEntitiesToXmlEntities(
                                            nonElementNode.nodeValue)));
                    } else {
                        //  Otherwise, we must be in a 'pre' or something,
                        //  so just push the raw text onto our results.
                        xhtmlResult.push(nonElementNode.nodeValue);
                    }

                break;

                case    Node.COMMENT_NODE:

                    //  Make sure that any embedded '--' are converted to
                    //  something benign.
                    commentText = nonElementNode.nodeValue.replace(
                                                            /--/g, '__');

                    //  Push on content that has the proper leading and
                    //  trailing comment characters.
                    xhtmlResult.push('<!--' + commentText + '-->');

                break;
            }
        }
    );

    //  Join together the result Array and convert any HTML entities to
    //  their XML equivalent. This causes replacements such as any HTML
    //  '&nbsp;'s with the XML-compliant '&#160;'s.
    xhtmlResult = TP.htmlEntitiesToXmlEntities(xhtmlResult.join(''));

    return xhtmlResult;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$htmlFragmentRepair',
function(aFragment) {

    /**
     * @name $htmlFragmentRepair
     * @synopsis "Repairs" any content in the fragment that doesn't get properly
     *     created when the supplied fragment is created.
     * @description This method is only used in the htmlElement*Content()
     *     methods to repair XML content that has been placed within HTML. For
     *     now, this is limited to Gecko/Webkit browsers and is used only for
     *     SVG embedded in HTML.
     * @param {DocumentFragment} aFragment The fragment to repair.
     */

    var fragChildren,

        i,
        svgElems,

        j,

        oldElem,
        newElem;

    if (TP.notEmpty(aFragment)) {
        //  Iterate over all of the 'top-level' fragment nodes.
        fragChildren = aFragment.childNodes;
        for (i = 0; i < fragChildren.length; i++) {
            //  Make sure that the child is an Element.
            if (!TP.isElement(fragChildren[i])) {
                continue;
            }

            //  Look for 'svg' elements, create a new Element *in an XML
            //  DOM* with the String content of that SVG element. Then,
            //  adopt the node back into the HTML document and replace the
            //  HTML document's version of the SVG node with the adopted
            //  node.
            svgElems = fragChildren[i].getElementsByTagName('svg');
            for (j = 0; j < svgElems.length; j++) {
                oldElem = svgElems[j];
                if (TP.isElement(newElem = TP.elem(TP.str(oldElem)))) {
                    newElem = oldElem.ownerDocument.adoptNode(newElem);
                    oldElem.parentNode.replaceChild(newElem, oldElem);
                }
            }

            //  Do the same for 'svg:svg' elements - HTML doesn't know the
            //  difference...

            //  TODO: What happens if the author used a different prefix?
            //  Maybe should use TP.nodeGetElementsByTagName() with a
            //  wildcard instead...
            svgElems = fragChildren[i].getElementsByTagName('svg:svg');
            for (j = 0; j < svgElems.length; j++) {
                oldElem = svgElems[j];
                if (TP.isElement(newElem = TP.elem(TP.str(oldElem)))) {
                    newElem = oldElem.ownerDocument.adoptNode(newElem);
                    oldElem.parentNode.replaceChild(newElem, oldElem);
                }
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlNodeAsXHTMLNode',
function(aNode, aDocument) {

    /**
     * @name htmlNodeAsXHTMLNode
     * @synopsis Returns an XHTML Node representing the supplied HTML node.
     * @param {HTMLNode} aNode The HTML Node to convert into XHTML.
     * @param {XMLDocument} aDocument The document which should own the result
     *     node. Defaults to the XML document TP.XML_FACTORY_DOCUMENT.
     * @raises TP.sig.InvalidNode
     * @returns {Node} An XML Node representation of aNode.
     * @todo
     */

    var doc,

        node,

        i;

    if (!TP.isHTMLNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments,
                            'Node must be an HTML node.');
    }

    doc = TP.isXMLDocument(aDocument) ? aDocument :
                            TP.XML_FACTORY_DOCUMENT;

    switch (aNode.nodeType) {
        case Node.ELEMENT_NODE:

            return TP.elementFromString(
                            TP.htmlElementAsXHTMLString(aNode));

        case Node.ATTRIBUTE_NODE:

            node = doc.createAttribute(aNode.name);
            node.value = aNode.value;

            return node;

        case Node.TEXT_NODE:

            return doc.createTextNode(aNode.data);

        case Node.CDATA_SECTION_NODE:

            return doc.createCDATASection(aNode.data);

        case Node.DOCUMENT_FRAGMENT_NODE:

            node = doc.createDocumentFragment();

            for (i = 0; i < aNode.childNodes.length; i++) {
                //  Note the recursive call here.
                TP.nodeAppendChild(
                    node,
                    TP.htmlNodeAsXHTMLNode(aNode.childNodes[i], doc));
            }

            return node;

        case Node.PROCESSING_INSTRUCTION_NODE:

            return doc.createProcessingInstruction(aNode.target,
                                                    aNode.data);

        case Node.COMMENT_NODE:

            return doc.createComment(aNode.data);

        case Node.ENTITY_REFERENCE_NODE:

            TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
            break;

        case Node.ENTITY_NODE:

            TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
            break;

        case Node.DOCUMENT_TYPE_NODE:

            TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
            break;

        case Node.NOTATION_NODE:

            TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
            break;

        case Node.DOCUMENT_NODE:

            node = TP.documentFromString(
                    TP.htmlElementAsXHTMLString(aNode.documentElement));

            if (!TP.isDocument(node)) {
                node = TP.createDocument(null, 'htmlNodeConversionError');
                TP.nodeAppendChild(
                    node.documentElement,
                    node.createTextNode(TP.nodeAsString(aNode)),
                    false);
            }

            return node;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('htmlNodeAsXHTMLString',
function(aNode) {

    /**
     * @name htmlNodeAsXHTMLString
     * @synopsis Returns an XHTML String representing the supplied HTML node.
     * @param {HTMLNode} aNode The Node to serialize.
     * @raises TP.sig.InvalidNode
     * @returns {String} A String representation of the Node converted into
     *     XHTML.
     */

    var resultNode;

    if (!TP.isHTMLNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments,
                            'Node must be an HTML node.');
    }

    if (TP.isNode(resultNode = TP.htmlNodeAsXHTMLNode(aNode))) {
        return TP.nodeAsString(resultNode);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('iframeAddContent',
function(anElement, aContent) {

    /**
     * @name iframeAddContent
     * @synopsis Adds the content to that of the supplied HTML iframe element.
     * @param {HTMLElement} anElement The iframe element to set the content of.
     * @param {String|Node} aContent The content to add to the content in the
     *     iframe.
     * @raises TP.sig.InvalidParameter,TP.sig.InvalidElement,
     *     TP.sig.InvalidDocument
     * @todo
     */

    var iframeDoc;

    if (TP.notValid(aContent)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    if (!TP.isElement(anElement) ||
        (TP.elementGetLocalName(anElement).toLowerCase() !== 'iframe' &&
            TP.elementGetLocalName(anElement).toLowerCase() !== 'object')) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments,
                            'Element must be an iframe.');
    }

    //  Grab the document from the iframe and write a blank document into it
    //  to prep the document (making sure it has 'head' and 'body'
    //  elements).
    iframeDoc = TP.elementGetIFrameDocument(anElement);

    if (TP.notValid(iframeDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments,
                            'iframe document not value.');
    }

    TP.documentAddContent(iframeDoc, aContent, null, true);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('iframeSetContent',
function(anElement, aContent, loadedFunction, shouldAwake) {

    /**
     * @name iframeSetContent
     * @synopsis Set the content of the supplied HTML iframe element.
     * @param {HTMLElement} anElement The iframe element to set the content of.
     * @param {String|Node} aContent The content to set into the iframe.
     * @param {Function} loadedFunction The Function object to execute when the
     *     content is fully loaded (i.e. when the DOM is fully formed).
     * @param {Boolean} shouldAwake Whether or not to awaken the content that we
     *     just added.
     * @raises TP.sig.InvalidParameter,TP.sig.InvalidElement,
     *     TP.sig.InvalidDocument
     * @todo
     */

    var iframeDoc,

        nodeContent;

    if (TP.notValid(aContent)) {
        return TP.raise(this, 'TP.sig.InvalidParameter', arguments);
    }

    if (!TP.isElement(anElement) ||
        (TP.elementGetLocalName(anElement).toLowerCase() !== 'iframe' &&
            TP.elementGetLocalName(anElement).toLowerCase() !== 'object')) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments,
                            'Element must be an iframe.');
    }

    //  Grab the document from the iframe and write a blank document into it
    //  to prep the document (making sure it has 'head' and 'body'
    //  elements).
    iframeDoc = TP.elementGetIFrameDocument(anElement);

    if (TP.notValid(iframeDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments,
                            'iframe document not value.');
    }

    if (TP.isNode(aContent)) {
        //  aContent is a Node

        if (TP.isDocument(aContent)) {
            nodeContent = aContent.documentElement;
        } else {
            nodeContent = aContent;
        }

        if (!TP.elementHasAttribute(anElement, 'inited')) {
            //  This process works much better when we have a blank document
            //  to start from.
            iframeDoc.open();
            iframeDoc.write('<html><head></head><body></body></html>');
            iframeDoc.close();

            TP.elementSetAttribute(anElement, 'inited', 'true');
        }

        //  We pass 'true' as the last parameter to awaken content if
        //  necessary.
        TP.documentSetContent(iframeDoc, nodeContent, loadedFunction,
                                shouldAwake);
    } else {
        //  We pass 'true' as the last parameter to awaken content if
        //  necessary.
        TP.documentSetContent(iframeDoc, aContent, loadedFunction,
                                shouldAwake);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeAsHTMLNode',
function(aNode, aDocument) {

    /**
     * @name nodeAsHTMLNode
     * @synopsis Returns an HTML Node built from the supplied node, if possible.
     * @param {Node} aNode The Node to convert into HTML.
     * @param {HTMLDocument} aDocument The document which should own the result
     *     node. Defaults to the current canvas's document.
     * @raises TP.sig.InvalidNode
     * @returns {Node} An HTML node.
     * @todo
     */

    var doc,

        node,

        i,
        elem;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
    }

    //  already HTML? we're good to go then
    if (TP.isHTMLNode(aNode)) {
        return aNode;
    }

    doc = TP.isHTMLDocument(aDocument) ? aDocument :
                            TP.sys.getUICanvas().getNativeDocument();

    switch (aNode.nodeType) {
        case Node.ELEMENT_NODE:

            return TP.stringAsHTMLNode(TP.nodeAsString(aNode), doc);

        case Node.ATTRIBUTE_NODE:

            node = doc.createAttribute(aNode.name);
            node.value = aNode.value;

            return node;

        case Node.TEXT_NODE:

            return doc.createTextNode(aNode.data);

        case Node.CDATA_SECTION_NODE:

            return doc.createCDATASection(aNode.data);

        case Node.DOCUMENT_FRAGMENT_NODE:

            node = doc.createDocumentFragment();

            for (i = 0; i < aNode.childNodes.length; i++) {
                //  Note the recursive call here.

                //  Also, we pass false to force not awakening.
                TP.nodeAppendChild(
                    node,
                    TP.nodeAsHTMLNode(aNode.childNodes[i], doc),
                    false);
            }

            return node;

        case Node.PROCESSING_INSTRUCTION_NODE:

            return doc.createTextNode(
                        TP.join('PIs cannot be created in HTML: <?',
                                aNode.target,
                                ' ',
                                aNode.data,
                                '?>'));

        case Node.COMMENT_NODE:

            return doc.createComment(aNode.data);

        case Node.ENTITY_REFERENCE_NODE:

            TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
            break;

        case Node.ENTITY_NODE:

            TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
            break;

        case Node.DOCUMENT_TYPE_NODE:

            TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
            break;

        case Node.NOTATION_NODE:

            TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
            break;

        case Node.DOCUMENT_NODE:

            //  Note the recursive call here
            elem = TP.nodeAsHTMLNode(aNode.documentElement);

            if (TP.isElement(elem)) {
                if (TP.isHTMLDocument(
                        node = TP.elementGetIFrameDocument(
                                    TP.documentCreateIFrameElement(doc)))) {
                    //  If there's a 'body' on the HTML document, use that.
                    //  Otherwise, just use the document element.

                    if (TP.isElement(TP.documentGetBody(node))) {
                        //  Pass false to force not awakening.
                        TP.nodeAppendChild(TP.documentGetBody(node),
                                            elem,
                                            false);
                    } else {
                        //  Pass false to force not awakening.
                        TP.nodeAppendChild(node.documentElement,
                                            elem,
                                            false);
                    }
                }
            } else {
                node = TP.createDocument(null, 'xmlNodeConversionError');
                TP.nodeAppendChild(
                    node.documentElement,
                    node.createTextNode(TP.nodeAsString(aNode)),
                    false);
            }

            return node;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeAsHTMLString',
function(aNode) {

    /**
     * @name nodeAsHTMLString
     * @synopsis Returns an HTML string built from the supplied node. The HTML
     *     string returned is a best-attempt at producing a valid string of
     *     markup that could be used in an innerHTML call. This is part of the
     *     core "cleansing" pathway to help ensure that content going into the
     *     UI is proper HTML content.
     * @description The setContent pipeline of TIBET requires properly formatted
     *     HTML content when the target node is an HTML node. This routine is
     *     the primary interface to perform any translation that's needed to get
     *     the new content ready. You have two options when using this routine.
     *     First, you can simply pass the node and a string/regular expression
     *     cleanse will be run on it. Second, you can pass true for useDOM and a
     *     depth-first traversal of the node will occur which builds a clean
     *     string from the DOM itself. The latter approach is intended to be
     *     more rigorous and accurate, however it can also be slower on larger
     *     target nodes.
     * @param {Node} aNode The Node to convert into HTML.
     * @raises TP.sig.InvalidNode
     * @returns {String} An HTML string.
     */

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
    }

    if (TP.isHTMLNode(aNode)) {
        return TP.nodeAsString(aNode);
    }

    return TP.stringAsHTMLString(TP.nodeAsString(aNode));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeAsXMLNode',
function(aNode, aDocument) {

    /**
     * @name nodeAsXMLNode
     * @synopsis Returns an XML Node representing the supplied node. For most
     *     nodes this just returns the node, but for HTML nodes it will return
     *     an XHTML node representation built from the receiver's content.
     * @param {Node} aNode The Node to convert into XML as needed.
     * @param {XMLDocument} aDocument The document which should own the result
     *     node. Defaults to the XML document TP.XML_FACTORY_DOCUMENT.
     * @raises TP.sig.InvalidNode
     * @returns {Node} An XML Node representation of aNode.
     * @todo
     */

    var doc;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
    }

    doc = TP.isXMLDocument(aDocument) ? aDocument :
                            TP.XML_FACTORY_DOCUMENT;

    //  already XML? we're good to go then
    if (TP.isXMLNode(aNode)) {
        return aNode;
    }

    //  must be an HTML node. have to convert it to XML (XHTML actually)
    return TP.htmlNodeAsXHTMLNode(aNode, doc);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeAsXMLString',
function(aNode) {

    /**
     * @name nodeAsXMLString
     * @synopsis Returns a String of well-formed XML for the node.
     * @param {Node} aNode The Node to serialize.
     * @raises TP.sig.InvalidNode
     * @returns {String} A String representation of the Node converted into XML.
     */

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
    }

    //  already XML? we're good to go then
    if (TP.isXMLNode(aNode)) {
        return TP.nodeAsString(aNode);
    }

    //  must be an HTML node. have to serialize it as XML (XHTML actually)
    return TP.htmlNodeAsXHTMLString(aNode);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stringAsHTMLAttribute',
function(aString) {

    /**
     * @name stringAsHTMLAttribute
     * @synopsis Returns the incoming string properly escaped for use in an HTML
     *     attribute value.
     * @param {String} aString The string to process.
     * @returns {String}
     */

    if (TP.isEmpty(aString)) {
        return '';
    }

    return aString.replace(/&/g, '&amp;').replace(/</g, '&lt;');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stringAsHTMLNode',
function(aString, aDocument) {

    /**
     * @name stringAsHTMLNode
     * @synopsis Converts the supplied markup to an HTML node. Note that in
     *     order to ensure that the node is being created from HTML markup, this
     *     method calls TP.stringAsHTMLString() on the supplied String.
     * @param {String} aString The markup to create the Node from.
     * @param {HTMLDocument} aDocument The document which should own the result
     *     node. Defaults to the current canvas's document.
     * @raises TP.sig.InvalidString
     * @returns {Node} The node created from the supplied content.
     * @todo
     */

    var doc,

        str,

        grabFrame,
        grabDoc,

        htmlStr,
        headStr,
        bodyStr,

        node,

        div;

    if (!TP.isString(aString)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    doc = TP.isHTMLDocument(aDocument) ? aDocument :
                            TP.sys.getUICanvas().getNativeDocument();

    //  Make sure the markup is 'clean' HTML.
    str = TP.stringAsHTMLString(aString);

    //  If the content string contains 'html', 'head' or 'body' tags as its
    //  'first tags', we have to treat it specially (we can't 'innerHTML' it
    //  into another element).
    if (/<(html:)?(html|head|body)(\s+|>)/i.test(str)) {
        //  create an iframe, using the HTML document we computed earlier
        //  This method 'initializes' it and attaches it to that document's
        //  'body' element.
        grabFrame = TP.documentCreateIFrameElement(doc);
        grabDoc = TP.elementGetIFrameDocument(grabFrame);

        //  grab the 'html' string from the content
        TP.regex.HTML_HTML_ELEM.lastIndex = 0;
        htmlStr = str.replace(TP.regex.HTML_HTML_ELEM, '$3');

        //  grab the 'head' string from the 'html' string
        TP.regex.HTML_HEAD_ELEM.lastIndex = 0;
        headStr = str.replace(TP.regex.HTML_HEAD_ELEM, '$3');

        //  grab the 'body' string from the 'html' string
        TP.regex.HTML_BODY_ELEM.lastIndex = 0;
        bodyStr = str.replace(TP.regex.HTML_BODY_ELEM, '$3');

        //  Go ahead and set the grabbing doc 'head's content, but not
        //  before we strip any 'script', stylesheet 'link' or inline
        //  'style' elements from the content.
        grabDoc.getElementsByTagName('head')[0].innerHTML =
                                    headStr.stripExternalHeadContent();

        //  Go ahead and set the grabbing doc 'body's content, but not
        //  before we strip any 'img' elements from the content.
        TP.documentGetBody(grabDoc).innerHTML =
                            bodyStr.stripExternalBodyContent();

        //  The node we're after is the grabbing doc's 'document element'.
        node = grabDoc.documentElement;

        //  Remove the iframe from its parent, so that we clean up after
        //  ourselves.
        TP.nodeDetach(grabFrame);
    } else {
        //  create a temporary DIV we can leverage to get new content
        div = doc.createElement('div');
        div.innerHTML = str;

        switch (div.childNodes.length) {
            case 0:
                node = doc.createTextNode(str);
            break;

            case 1:
                node = TP.nodeDetach(div.firstChild);
            break;

            default:
                node = TP.nodeListAsFragment(doc.childNodes);
            break;
        }
    }

    return node;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stringAsHTMLString',
function(aString) {

    /**
     * @name stringAsHTMLString
     * @synopsis Converts the supplied markup to a string of HTML markup.
     * @param {String} aString The markup to create the Node from.
     * @raises TP.sig.InvalidString
     * @returns {Node} The node created from the supplied content.
     */

    var str,
        comments;

    if (!TP.isString(aString)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    str = aString;

    //  NOTE: Content being processed into HTML is usually being done so
    //  that it can be displayed in a browser. Since modern browsers can now
    //  have 'real XML' embedded in their markup (i.e. SVG, VML, etc.), a
    //  number of the following steps are currently commented out, as they
    //  produce a much more strict HTML document, which will mangle any
    //  embedded XML.
    //  There are 3 exceptions to this rule:
    //      - Any 'XML declaration' at the top of the document will be
    //      stripped out. "Embedded XML" shouldn't need an XML declaration
    //      at the start of the document.
    //      - Each XML 'empty tag' will be converted to a 'full
    //      opening/closing pair', since HTML is very strict about this and
    //      XML doesn't care which form an 'empty tag' takes.
    //      - Any 'html' namespace prefixes or definitions will be stripped
    //      out to avoid problems with the browsers HTML rendering.

    //  Strip out the XML declaration
    str = str.strip(TP.regex.XML_DECL);

    //  Temporarily replace comments with numbered comment texts, so that
    //  any XML content inside of comments will be preserved.
    comments = TP.ac();
    TP.regex.XML_COMMENT.lastIndex = 0;

    str = str.replace(
        TP.regex.XML_COMMENT,
        function(wholeMatch, firstMatch, commentExpr) {

            comments.push(commentExpr);

            return TP.join('<!--', (comments.getSize() - 1), '-->');
        });

    //  Replace any XHTML 'empty' tags, with the equivalent HTML markup
    //  (either a single HTML-formatted empty tag or two HTML tags with
    //  no content, depending on where XHTML says the tag can be empty
    //  or not).
    TP.regex.XML_EMPTY_TAG.lastIndex = 0;
    str = str.replace(
        TP.regex.XML_EMPTY_TAG,
        function(wholeMatch, tagName, tagContent) {

            //  NOTE the implication here that tagName does not include
            //  prefix since the hash does not have prefixes on the keys
            if (TP.regex.XHTML_10_EMPTY_ELEMENTS.test(tagName)) {
                return TP.join('<', tagName, tagContent, '>');
            } else {
                return TP.join('<', tagName, tagContent, '>',
                                '</', tagName, '>');
            }
        });

    //  TODO:   convert xml-stylesheet entries to 'link' elements

    //  TODO:   convert trailing ?> of PIs into >

    //  TODO:   convert attribute values containing &lt; into <

    //  TODO:   convert attribute JS-entities &amp;{blah} into &{blah}

    //  TODO:   replace selected="selected", checked="checked", etc. into
    //          their "singular form" selected, checked, multiple, etc

    //  Strip out any closing tags of 'empty' tags.
    TP.regex.XHTML_10_EMPTY_ELEMENTS_STRIP.lastIndex = 0;
    str = str.strip(TP.regex.XHTML_10_EMPTY_ELEMENTS_STRIP);

    //  We'd like to avoid a lot of the clutter that XML namespace
    //  declarations make in our HTML, so we strip them out here.

    //  Strip out any 'default namespace' declarations (but not those for
    //  SVG or VML - some browsers allow those languages to be 'embedded' in
    //  HTML)
    TP.regex.NON_PREFIXED_NS_ATTR.lastIndex = 0;
    str = str.replace(TP.regex.NON_PREFIXED_NS_ATTR,
                        function(wholeMatch, quoteChar, nsUriMatch) {

                            if (nsUriMatch === TP.w3.Xmlns.SVG ||
                                nsUriMatch === TP.w3.Xmlns.VML) {
                                return wholeMatch;
                            }

                            return '';
                        });

    //  Strip out any 'prefixed namespace' declarations
    TP.regex.PREFIXED_NS_ATTR.lastIndex = 0;
    str = str.replace(TP.regex.PREFIXED_NS_ATTR,
                        function(wholeMatch, quoteChar, nsUriMatch) {

                            return '';
                        });

    //  We generally leave 'namespace-prefixed' tags alone, since even
    //  though in HTML the colon (':') has no meaning (TIBET will look for
    //  tags named 'foo:bar' - which HTML treats as their 'whole name').
    //  However, we definitely strip out any 'html:', 'svg:' and 'm:' namespace
    //  prefixes on tags as these are now supported natively by HTML5.
    str = str.replace(/<(\/)?(html|svg|m):/g, '<$1');

    //  Strip out any CDATA section directives. These can cause problems,
    //  especially in 'script' elements.

    //  Note that we do these before we perform the 'general CDATA section'
    //  removal below since content of 'script' and 'style' blocks don't
    //  need to be entitified to reside in regular HTML.
    str = str.replace(/<(script|style)([^>]*)>\s*<!\[CDATA\[/g, '<$1$2>');
    str = str.replace(/\]\]>\s*<\/(script|style)>/g, '<\/$1>');

    //  Strip out CDATA sections outside of 'script' and 'style' blocks.
    str = str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,
                        function(wholeMatch, content) {

                            return TP.htmlLiteralsToEntities(content);
                        });

    //  Put the comments back into the source text by finding the number
    //  each one was registered under and replacing it with the original
    //  comment text.
    str = str.replace(
        /<!--(\d+)-->/g,
        function(wholeMatch, commentNumber) {

            return TP.join('<!--',
                            comments.at(parseInt(commentNumber, 10)),
                            '-->');
        });

    return str;
});

//  ------------------------------------------------------------------------
//  Awakening Methods
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeAwakenContent',
function(aNode, aDocument, aWindow) {

    /**
     * @name nodeAwakenContent
     * @synopsis Awakens aNode and any child nodes under it. This version is a
     *     placeholder until the entire kernel has loaded and the rest of the
     *     awakening machinery is available.
     * @param {Node} aNode The node to awaken.
     * @param {Document} aDocument The node's document.
     * @param {Window} aWindow The node's window.
     * @raises TP.sig.InvalidElement
     * @todo
     */

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeAwakenChildNodesFromTo',
function(aNode, startIndex, endIndex) {

    /**
     * @name nodeAwakenChildNodesFromTo
     * @synopsis Awakens child nodes of aNode from startIndex to endIndex. Note
     *     that this function treats its supplied indexes as inclusive, which
     *     means that the child nodes at startIndex and at endIndex will also be
     *     awakened.
     * @param {Node} aNode The node to awaken the child nodes of.
     * @param {Number} startIndex The start index to begin awakening child nodes
     *     at or TP.FIRST to start at the first child node.
     * @param {Number} endIndex The end index to stop awakening child nodes at
     *     or TP.LAST to stop at the last child node.
     * @raise TP.sig.InvalidNode Raised when a node that isn't a kind
     *     'collection node' is provided to the method.
     * @todo
     */

    var theStartIndex,
        theEndIndex,
        i,
        childNode,
        doc,
        win;

    //  no child nodes for anything that isn't an element, document or
    //  document fragment
    if (!TP.isCollectionNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments,
                            'Node not a collection Node.');
    }

    if (startIndex === TP.FIRST) {
        theStartIndex = 0;
    } else {
        theStartIndex = startIndex;
    }

    if (endIndex === TP.LAST) {
        //  Subtract 1 off the end since our loop below is *inclusive*.
        theEndIndex = aNode.childNodes.length - 1;
    } else {
        theEndIndex = endIndex;
    }

    //  verify that we've got a window (content will be visible) and a
    //  document or there's no work to do
    if (TP.notValid(doc = TP.nodeGetDocument(aNode))) {
        return;
    }

    if (TP.notValid(win = TP.nodeGetWindow(doc))) {
        return;
    }

    //  NB: We include the last element for awakening here, since the caller
    //  of this function will have passed in the inclusive end index.
    for (i = theStartIndex; i <= theEndIndex; i++) {
        childNode = aNode.childNodes[i];

        //  Make sure the new child node is an element before we try to
        //  awaken it (since we only awaken elements). NOTE that we pass in
        //  the document and window to keep overhead down in the awaken
        if (TP.isElement(childNode)) {
            TP.nodeAwakenContent(childNode, doc, win);
        }
    }

    //  final step is to wake up the CSS, but NOTE that we do this at the
    //  element level, not the child node level
    TP.elementInitializeCSS(aNode);
    TP.elementActivateCSS(aNode);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeGetElementsByClassName',
function(aNode, aClassName) {

    /**
     * @name nodeGetElementsByClassName
     * @synopsis Returns an Array of Elements under aNode whose CSS class name
     *     matches aClassName.
     * @param {Node} aNode The node to act as the common parent when looking for
     *     elements with the supplied class name.
     * @param {String} aClassName The class name to use to find matching
     *     elements. Multiple class names should be space separated.
     * @raises TP.sig.InvalidNode
     * @returns {Array} An Array of Elements under anElement whose CSS class
     *     name matches aClassName.
     * @todo
     */

    var elem,
        classNames;

    if (!TP.isElement(aNode) && !TP.isDocument(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
    }

    elem = TP.isDocument(aNode) ? aNode.documentElement : aNode;

    //  If the native version is available, use that.
    if (TP.isCallable(elem.getElementsByClassName)) {
        //  Make sure to repackage it as an Array for consistency.
        return TP.ac(elem.getElementsByClassName(aClassName));
    }

    //  Otherwise, split the classes along the separating spaces, and join
    //  them back together with ' .'
    classNames = '.' + aClassName.split(' ').join(' .');

    //  Return the value of evaluating the classes as CSS selectors
    return TP.nodeEvaluateCSS(elem, classNames);
});

//  ------------------------------------------------------------------------
//  NODE MODIFICATION
//  ------------------------------------------------------------------------

TP.definePrimitive('nodeEmptyContent',
function(aNode) {

    /**
     * @name nodeEmptyContent
     * @synopsis Removes all content from the node provided, effectively setting
     *     the node's content to either null or the empty string depending on
     *     node capabilities.
     * @param {Node} aNode The node to empty.
     * @raises TP.sig.InvalidNode
     * @returns {Node} The node.
     */

    var elemTagName;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
    }

    switch (aNode.nodeType) {
        case Node.ELEMENT_NODE:

            if (TP.isHTMLNode(aNode)) {
                if (TP.boot.isUA('IE')) {
                    elemTagName = aNode.tagName.toLowerCase();

                    //  We can use 'innerHTML' here to clear out the old
                    //  content of the element, unless we're on IE and its
                    //  one of the 'table' elements that doesn't support
                    //  innerHTML: table, thead, tbody, tfoot, tr, th, td.
                    if (/(table|thead|tbody|tfoot|tr|th|td)/.test(
                                                            elemTagName)) {
                        //  Clear it out manually using DOM methods and
                        //  looping.
                        while (aNode.hasChildNodes()) {
                            aNode.removeChild(aNode.lastChild);
                        }
                    } else {
                        aNode.innerHTML = '';
                    }
                } else {
                    aNode.innerHTML = '';
                }
            } else {
                while (aNode.hasChildNodes()) {
                    TP.nodeDetach(aNode.lastChild);
                }
            }

            break;

        case Node.TEXT_NODE:
        case Node.CDATA_SECTION_NODE:
        case Node.PROCESSING_INSTRUCTION_NODE:
        case Node.COMMENT_NODE:

            aNode.data = '';
            break;

        case Node.DOCUMENT_NODE:
        case Node.DOCUMENT_FRAGMENT_NODE:

            while (aNode.hasChildNodes()) {
                TP.nodeDetach(aNode.lastChild);
            }

            break;

        case Node.ATTRIBUTE_NODE:

            aNode.value = '';

            break;

        case Node.ENTITY_REFERENCE_NODE:
        case Node.ENTITY_NODE:
        case Node.DOCUMENT_TYPE_NODE:
        case Node.NOTATION_NODE:

            TP.raise(this, 'TP.sig.UnsupportedOperation', arguments);
            break;

        default:
            break;
    }

    return aNode;
});

//  ------------------------------------------------------------------------
//  COMPUTATION PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('computeAngleFromCenter',
function(centerObj, endObj) {

    /**
     * @name computeAngleFromCenter
     * @synopsis Returns the angle (in degrees) between two objects one of which
     *     represents a 'center point' and the other an 'end point'.
     * @param {Event|String|Element|TP.lang.Hash|Array|TP.core.Point} centerObj
     *     An event object or an element specification, or element suitable for
     *     TP.byId() or a hash or point with 'x' and 'y values or an array with
     *     an X 'value' in the first position and a Y value in the second.
     * @param {Event|String|Element|TP.lang.Hash|Array|TP.core.Point} endObj
     *     An event object or an element specification, or element suitable for
     *     TP.byId() or a hash or point with 'x' and 'y' values or an array with
     *     an X 'value' in the first position and a Y value in the second.
     * @returns {Number} The angle (in degrees) between the center point and the
     *     end point.
     * @todo
     */

    var coords1,
        coords2,

        x1,
        y1,
        x2,
        y2,

        angle;

    coords1 = TP.coord(centerObj);
    coords2 = TP.coord(endObj);

    x1 = coords1.first();
    y1 = coords1.last();

    x2 = coords2.first();
    y2 = coords2.last();

    angle = (y2 - y1).atan2D(x2 - x1);

    return angle.standardizeAngle();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('computeAngleFromEnds',
function(obj1, obj2) {

    /**
     * @name computeAngleFromEnds
     * @synopsis Returns the angle (in degrees) between two objects that
     *     represent the 'end points'.
     * @description Given the two points (x1, y1) and (x2, y2), the distance
     *     between these points is given by the formula:
     *
     *     degreesStandardizedTo360(atan2(y2 - y1, x2 - x1))
     *
     *
     * @param {Event|String|Element|TP.lang.Hash|Array|TP.core.Point} obj1 An
     *     event object or an element specification, or element suitable for
     *     TP.byId() or a hash or point with 'x' and 'y' values or an array with
     *     an X 'value' in the first position and a Y value in the second.
     * @param {Event|String|Element|TP.lang.Hash|Array|TP.core.Point} obj2 An
     *     event object or an element specification, or element suitable for
     *     TP.byId() or a hash or point with 'x' and 'y' values or an array with
     *     an X 'value' in the first position and a Y value in the second.
     * @returns {Number} The angle (in degrees) between the x1, y1 and x2, y2
     *     using the formula above.
     * @todo
     */

    var coords1,
        coords2,

        x1,
        y1,
        x2,
        y2,

        radius,

        calcX,
        calcY,

        angle;

    coords1 = TP.coord(obj1);
    coords2 = TP.coord(obj2);

    x1 = coords1.first();
    y1 = coords1.last();

    x2 = coords2.first();
    y2 = coords2.last();

    radius = ((x2 - x1).abs() * (x2 - x1).abs() +
                    (y2 - y1).abs() * (y2 - y1).abs()).sqrt();

    calcX = x1;
    calcY = y1 - radius;

    angle = (2 * (y2 - calcY).atan2(x2 - calcX)).radiansToDegrees();

    return angle.standardizeAngle();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('computeCompassCorner',
function(angle, numIncrements, centerInIncrement) {

    /**
     * @name computeCompassCorner
     * @synopsis Computes a 'compass corner' given an angle. The values advance
     *     around the compass in a clockwise fashion (i.e. north is 1, east is
     *     9, south is 17, west is 25).
     * @description Given the angle, this method returns a value which is
     *     compatible with the following constants:
     *
     *     TP.NORTH TP.NORTH_BY_EAST TP.NORTH_NORTHEAST TP.NORTHEAST_BY_NORTH
     *     TP.NORTHEAST TP.NORTHEAST_BY_EAST TP.EAST_NORTHEAST TP.EAST_BY_NORTH
     *     TP.EAST TP.EAST_BY_SOUTH TP.EAST_SOUTHEAST TP.SOUTHEAST_BY_EAST
     *     TP.SOUTHEAST TP.SOUTHEAST_BY_SOUTH TP.SOUTH_SOUTHEAST
     *     TP.SOUTH_BY_EAST TP.SOUTH TP.SOUTH_BY_WEST TP.SOUTH_SOUTHWEST
     *     TP.SOUTHWEST_BY_SOUTH TP.SOUTHWEST TP.SOUTHWEST_BY_WEST
     *     TP.WEST_SOUTHWEST TP.WEST_BY_SOUTH TP.WEST TP.WEST_BY_NORTH
     *     TP.WEST_NORTHWEST TP.NORTHWEST_BY_WEST TP.NORTHWEST
     *     TP.NORTHWEST_BY_NORTH TP.NORTH_NORTHWEST TP.NORTH_BY_WEST
     *
     *     If a number of increments is supplied, then the value is 'snap'ed to
     *     that number of increments. For instance, if only 8 compass points are
     *     desired (to match the pre-defined constants above) and no other
     *     values, this value should be 8 and this routine will snap the value
     *     to match the follwing predefined constants:
     *
     *     TP.NORTH TP.NORTHEAST TP.EAST TP.SOUTHEAST TP.SOUTH TP.SOUTHWEST
     *     TP.WEST TP.NORTHWEST
     *
     *
     * @param {Number} angle The angle to compute the compass point from.
     * @param {Number} numIncrements An optional number of 'increments' to
     *     'snap' the value to.
     * @param {Boolean} centerInIncrement If true, this routine 'centers' the
     *     point it is using to compute the 'increment wedge' in that wedge.
     *     This prevents the computation from snapping at the 'first clockwise
     *     edge' and snapping to the center of the wedge instead. It is true by
     *     default, but requires the 'numIncrements' parameter to be supplied.
     * @raises TP.sig.InvalidNumber
     * @returns {Number} A Number matching the constant corresponding to the
     *     compass corner.
     * @todo
     */

    var center,

        theAngle,
        cornerVal;

    if (!TP.isNumber(angle)) {
        return TP.raise(this, 'TP.sig.InvalidNumber', arguments);
    }

    center = TP.ifInvalid(centerInIncrement, true);

    //  This algorithm taken from:
    //  http://en.wikipedia.org/wiki/Boxing_the_compass#Compass_points

    theAngle = angle;
    if (TP.isNumber(numIncrements) && center) {
        //  'Center' the point in increment by adding half of the value
        //  computed by dividing 360 by the number of increments
        theAngle += (360 / numIncrements) / 2;
    }

    cornerVal = (theAngle / 11.25) + 1.5;

    if (cornerVal >= 33) {
        cornerVal -= 32;
    }

    cornerVal = cornerVal.floor();

    //  If a number of increments was supplied, then we need to compute an
    //  'even increment' to snap to and subtract that from the point value.
    //  Note how we subtract 1 from the point value before doing the modulo
    //  to normalize the value against 0.
    if (TP.isNumber(numIncrements)) {
        cornerVal -= ((cornerVal - 1) % (32 / numIncrements));
    }

    return cornerVal;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('computeDistance',
function(obj1, obj2) {

    /**
     * @name computeDistance
     * @synopsis Returns the distance between two objects. Useful for things
     *     like drag and drop tolerances or magnetism.
     * @description Given the two points (x1, y1) and (x2, y2), the distance
     *     between these points is given by the formula:
     *
     *     d = sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
     *
     *
     * @param {Event|String|Element|TP.lang.Hash|Array|TP.core.Point} obj1 An
     *     event object or an element specification, or element suitable for
     *     TP.byId() or a hash or point with 'x' and 'y' values or an array with
     *     an X 'value' in the first position and a Y value in the second.
     * @param {Event|String|Element|TP.lang.Hash|Array|TP.core.Point} obj2 An
     *     event object or an element specification, or element suitable for
     *     TP.byId() or a hash or point with 'x' and 'y' values or an array with
     *     an X 'value' in the first position and a Y value in the second.
     * @returns {Number} The distance between the x1, y1 and x2, y2 using the
     *     formula above.
     * @todo
     */

    var coords1,
        coords2,

        x1,
        y1,
        x2,
        y2,

        distance;

    coords1 = TP.coord(obj1);
    coords2 = TP.coord(obj2);

    x1 = coords1.first();
    y1 = coords1.last();

    x2 = coords2.first();
    y2 = coords2.last();

    distance = ((x2 - x1).pow(2) + (y2 - y1).pow(2)).sqrt();

    return distance;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('computeVector',
function(obj1, obj2) {

    /**
     * @name computeVector
     * @synopsis Computes an informal vector, effectively a magnitude (distance)
     *     and a direction (in degrees) between two objects. The typical inputs
     *     are elements or events whose coordinates are used for the
     *     computation.
     * @param {Event|String|Element|TP.lang.Hash|Array|TP.core.Point} obj1 An
     *     event object or an element specification, or element suitable for
     *     TP.byId() or a hash or point with 'x' and 'y' values or an array with
     *     an X 'value' in the first position and a Y value in the second.
     * @param {Event|String|Element|TP.lang.Hash|Array|TP.core.Point} obj2 An
     *     event object or an element specification, or element suitable for
     *     TP.byId() or a hash or point with 'x' and 'y' values or an array with
     *     an X 'value' in the first position and a Y value in the second.
     * @returns {Array} The distance and direction of the vector expressed as an
     *     Array of: [distance, direction].
     * @todo
     */

    var coords1,
        coords2,

        x1,
        y1,
        x2,
        y2,

        distance,
        direction;

    coords1 = TP.coord(obj1);
    coords2 = TP.coord(obj2);

    x1 = coords1.first();
    y1 = coords1.last();

    x2 = coords2.first();
    y2 = coords2.last();

    distance = ((x2 - x1).pow(2) + (y2 - y1).pow(2)).sqrt();

    direction = (y2 - y1).atan2D(x2 - x1).standardizeAngle();

    return TP.ac(distance, direction);
});

//  ------------------------------------------------------------------------
//  CSS MANAGEMENT PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('$computeOpaqueEnabledTargetFrom',
function(anElement) {

    /**
     * @name $computeOpaqueEnabledTargetFrom
     * @synopsis Computes an event target starting at the supplied element and
     *     working up the parent chain to an element (which may be the supplied
     *     element) that has a 'tibet:opaque' attribute on it. If any element in
     *     the chain is 'disabled', this routine returns null.
     * @param {HTMLElement} anElement The element to begin searching for the
     *     event target.
     * @raises TP.sig.InvalidElement
     */

    var theElement,
        retElement;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement', arguments);
    }

    theElement = anElement;
    retElement = null;

    //  Starting at the supplied element, traverse up the parent chain to
    //  the Document node.
    while (theElement.nodeType !== Node.DOCUMENT_NODE) {
        //  If the element at this level is 'disabled', then nothing we do
        //  here matters, so we bail out.
        if (TP.elementHasAttribute(theElement, 'disabled')) {
            retElement = null;
            break;
        }

        //  If the return element hasn't already been set and the element at
        //  this level is 'opaque', then set the element at this level to be
        //  the return element.
        if (TP.notValid(retElement) &&
            TP.elementHasAttribute(theElement, 'tibet:opaque', true)) {
            retElement = theElement;

            //  Notice how we do *not* break here, so that if any parent
            //  above us is disabled, we will still return 'null'.
        }

        theElement = theElement.parentNode;
    }

    return retElement;
});

//  ------------------------------------------------------------------------
//  WINDOW PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('$$checkWindowClosed',
function(aWindow, aWindowID) {

    /**
     * @synopsis Checks to see if the window whose ID is provided is indeed
     *     closed.
     * @description This function checks to see if a window which got an
     *     onunload event is truly closed. This function is scheduled by the
     *     standard onunload event handler to ensure that it will fire the
     *     proper TIBET event accurately. If the window is closed, this function
     *     will signal a TP.sig.WindowClosed signal, using the window's global
     *     ID as its origin. Note here how we supply both the window itself and
     *     its ID. This is because of the differences of browsers as to whether
     *     a handle to a closed Window is still valid, whether it can be
     *     obtained by looking it up using that ID and whether the ID can be
     *     computed. Since we can't be sure of any of this, we supply both to
     *     this method.
     * @param {Window} aWindow The window to check.
     * @param {String} aWindowID The ID of the window to check.
     * @raises TP.sig.InvalidWindow,TP.sig.InvalidString
     * @returns {Boolean} True if the call succeeded.
     * @function $$checkWindowClosed
     * @todo
     */

    if (TP.notValid(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (TP.isEmpty(aWindowID)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    //  if the window has been closed, then we'll signal that fact,
    //  otherwise we may simply have been called due to a document unload
    //  event
    if (aWindow.closed) {
        try {
            TP.signal(aWindowID, 'TP.sig.WindowClosed', null, null);
        } catch (e) {
        } finally {
            TP.core.Window.removeWindowInfo(aWindowID);
            TP.global[aWindowID] = null; //  bound to $$tibet
        }

        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('open',
function(url, name, aSpec, shouldReplace) {

    /**
     * @synopsis Opens a new Window and instruments it to set it up for use with
     *     TIBET.
     * @description This function opens a new window and sets it up for use with
     *     TIBET. This function manages a number of problems with the standard
     *     window.open() call, including firing an onload properly after an
     *     asychronous window.load call that is loaded externally (which native
     *     browsers won't fire).
     * @param {String} url The URL to load into the window.
     * @param {String} name The name to give this window. This must be unique.
     * @param {TP.lang.Hash|String} aSpec A 'spec string' of key=value pairs or
     *     a hash that can be used to produce a feature string. You should use
     *     'top' and 'left' on all browsers and TIBET will convert as needed.
     * @param {Boolean} shouldReplace Whether the content should be replaced if
     *     the window is already open.
     * @returns {Window} The newly opened window.
     * @function open
     * @todo
     */

    var newWin,
        tpwin,
        winName,
        spec;

    //  Watch out for the common 'top.' or 'parent.' prefixes that often
    //  show up on window references. If they are there, slice them off.
    if (TP.isString(name)) {
        if (/^top./.test(name)) {
            winName = name.slice(4, name.length);
        } else if (/^parent./.test(name)) {
            winName = name.slice(7, name.length);
        } else {
            winName = name;
        }
    } else {
        winName = TP.getNextWindowName();
    }

    //  If we got a valid spec and it wasn't empty, then convert it into
    //  the funky 'key=value,' syntax that the native window.open call
    //  expects.
    if (TP.isString(aSpec)) {
        spec = aSpec;
    } else if (TP.notEmpty(aSpec)) {
        spec = '';

        aSpec.perform(
            function(kvPair) {

                spec += kvPair.first() + '=' + kvPair.last() + ',';
            });

        //  chop off the last comma from the perform
        spec = spec.chop(',');
    }

    //  HACK:   convert top/left into screenX/screenY for mozilla browsers
    if (TP.notEmpty(spec) && TP.boot.isUA('GECKO')) {
        spec = spec.replace('top', 'screenY');
        spec = spec.replace('left', 'screenX');
    }

    //  NOTE: Nav 4.X strikes again! We can't actually pass undefined values
    //  in for the various parameters or Nav 4.X will freak out, so we must
    //  test them and only send in the ones that are valid.
    if (TP.notValid(spec) && !shouldReplace) {
        newWin = window.open('', winName);
    } else if (TP.notValid(spec)) {
        newWin = window.open('', winName, null, shouldReplace);
    } else {
        newWin = window.open('', winName, spec, shouldReplace);
    }

    if (TP.notValid(newWin)) {
        TP.raise(this, 'TP.sig.WindowException', arguments,
                    'Unable to open window');
        return;
    }

    //  If a valid url is supplied, then load it and signal an 'onload'.
    if (TP.notEmpty(url)) {
        //  this will create a new instance as needed, then instrument it
        tpwin = TP.core.Window.construct(newWin);
        tpwin.setLocation(url);
    } else {
        //  Otherwise, go ahead and write 'html' and 'body' elements here to
        //  make the document real so we can instrument

        if (TP.isTrue(shouldReplace)) {
            newWin.document.open(TP.HTML_TEXT_ENCODED, 'replace');
        } else {
            newWin.document.open(TP.HTML_TEXT_ENCODED);
        }

        newWin.document.write('<html><body></body></html>');
        newWin.document.close();

        //  force creation of a window instance. this will instrument which
        //  is why we do it after blowing away the content via open/write.
        tpwin = TP.core.Window.construct(newWin);
    }

    return newWin;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$$processDocumentLoaded',
function(aWindow) {

    /**
     * @name $$processDocumentLoaded
     * @synopsis The standard TIBET hook for consistent onload processing.
     * @description This function is attached to native windows by tibet_hook.js
     *     to ensure we get a consistent entry point for page setup. Once
     *     invoked, this function will find and invoke any onload functions
     *     registered for the window via the TP.core.Window method
     *     registerOnloadFunction(). The final step in this method is to signal
     *     TP.sig.DocumentLoaded and TP.sig.DOMContentLoaded for the window and
     *     document respectively.
     * @param {Window} aWindow The window which was loaded.
     * @raises TP.sig.InvalidWindow
     */

    var winLoadFuncs,
        i,
        len;

    TP.debug('break.document_loaded');

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (TP.$$DEBUG) {
        TP.boot.$stdout(aWindow.document.documentElement, TP.TRACE);
    }

    //  clear the flag once we process our checks
    TP.core.Window.$$isDocumentWriting = false;

    //  instrument it so we're sure it has some basic TIBET features
    TP.core.Window.instrument(aWindow);

    //  update ACL content if possible so that subsequent CSS processing and
    //  awakening can work with an awareness of the ACL context
    TP.windowAssignACLKeys(aWindow);

    //  we allow zero or more page load functions to be registered so that
    //  we don't have native onload processing getting mixed up with our
    //  entry point. this gives us a bit more control
    winLoadFuncs = TP.core.Window.getWindowInfo(TP.gid(aWindow),
                                                'loadFunctions');

    if (TP.notEmpty(winLoadFuncs)) {
        //  empty the list so that if any of the load functions want to
        //  change window content we don't loop endlessly
        TP.core.Window.setWindowInfo(aWindow, 'loadFunctions', TP.ac());

        try {
            //  We *must* unique the page load function so that if the
            //  same one has been registered multiple times (because of
            //  multiple TP.core.Document.writes or whatever), it will only
            //  be executed once.
            winLoadFuncs = winLoadFuncs.unique();

            //  Execute the page load functions and then empty the array
            //  so that we don't run them again.
            len = winLoadFuncs.length;
            for (i = 0; i < len; i++) {
                winLoadFuncs[i](aWindow.document);
            }

            winLoadFuncs.empty();
        } catch (e) {
            TP.ifError() ?
                TP.error(TP.ec(e, TP.join('Pageload function: ',
                                            TP.str(winLoadFuncs[i]),
                                            ' generated error.')),
                            TP.LOG, arguments) : 0;
        }
    }

    /*
    //  process the CSS styles as needed/directed
    try {
        if (TP.sys.shouldProcessCSS()) {
            TP.$windowStyleSetup(aWindow);
        };
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Window style setup generated error.'),
                            TP.LOG, arguments): 0;
    };
    */

    //  If the flag that should get set in htmlDocumentSetContent() for
    //  awakening is 'true', then go ahead and awaken the content.
    if (TP.isTrue(TP.core.Window.getWindowInfo(TP.gid(aWindow),
                                                'shouldAwake'))) {
        //  awaken any newly added content.
        try {
            TP.nodeAwakenContent(aWindow.document.documentElement,
                                    aWindow.document,
                                    aWindow);
        } catch (e) {
            TP.ifError() ?
                TP.error(TP.ec(e, 'Window content awaken generated error.'),
                            TP.LOG, arguments) : 0;
        }
    }

    //  Make sure that if there is an Element that wanted to be focused as
    //  the first focused element on the page (using the HTML5 'autofocus'
    //  attribute) that it is, indeed, focused.
    TP.documentFocusAutofocusedElement(aWindow.document);

    //  final operation is to signal that we've done the work
    try {
        //  We signal TP.sig.DocumentLoaded using the GID of the window as
        //  the origin.
        TP.signal(TP.gid(aWindow),
                    'TP.sig.DocumentLoaded',
                    arguments);
        TP.signal('tibet://' + TP.gid(aWindow),
                    'TP.sig.DocumentLoaded',
                    arguments);

        //  We only signal DOMContentLoaded if the system is configured for
        //  it.
        if (TP.sys.shouldSignalDOMLoaded()) {
            //  We signal DOMContentLoaded using the GID of the document as
            //  the origin.

            //  For document level operations this is the only place we can
            //  properly signal DOMContentLoaded since we want to be sure
            //  it's really loaded and need to wait for the onload
            //  triggering of this handler.
            TP.signal(TP.gid(aWindow.document),
                        'TP.sig.DOMContentLoaded',
                        arguments,
                        aWindow.document.documentElement);
            TP.signal('tibet://' + TP.gid(aWindow) + '/#document',
                        'TP.sig.DOMContentLoaded',
                        arguments,
                        aWindow.document.documentElement);
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(
                TP.ec(
                    e, 'TP.sig.DOMContentLoaded handler generated error.'),
                    TP.LOG, arguments) : 0;
    }

    return;
});

//  ------------------------------------------------------------------------

// Direct assignment here to support internal reference to function.
TP.$$processDocumentUnloaded = function(aWindow, checkForWindowClosed) {

    /**
     * @name $$processDocumentUnloaded
     * @synopsis Processes an onunload event from the window by executing all of
     *     the onunload functions registered by the function above and then
     *     signaling the tibet frame with our window's global ID.
     * @param {Window} aWindow The window which was loaded.
     * @param {Boolean} checkForWindowClosed Whether we should check to see if
     *     the window is closing.
     * @raises TP.sig.InvalidWindow
     * @todo
     */

    var checkWindow,
        winID,
        winDidClose;

    TP.debug('break.document_unloaded');

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    checkWindow = TP.ifInvalid(checkForWindowClosed, true);

    //  We try to make the onunload function as short and sweet as possible.
    //  Browsers dislike long onunload functions.

    //  To tell the system that we're unloading a window, we call the TIBET
    //  signaling infrastructure thusly:
    //      - our window's document's global ID
    //      - 'TP.sig.DocumentUnloaded' signal type name
    winID = TP.gid(aWindow);

    TP.signal(winID, 'TP.sig.DocumentUnloaded', arguments);
    TP.signal('tibet://' + winID, 'TP.sig.DocumentUnloaded', arguments);

    //  close open windows if we're unloading the code frame
    if ((TP.$$processDocumentUnloaded.codeframe === aWindow) &&
            TP.boot.isUA('GECKO')) {
        TP.core.Window.closeRegisteredWindows();

        return;
    }

    //  clear the 'backhack' slots from the window info. This means that if
    //  we load new content into the same window, these will be starting
    //  fresh. Note that, if we're closing the window, the window's entire
    //  registry entry will be removed, so in that case this logic is
    //  somewhat superfluous.
    TP.core.Window.removeWindowInfo(aWindow, 'backhack1');
    TP.core.Window.removeWindowInfo(aWindow, 'backhack2');
    TP.core.Window.removeWindowInfo(aWindow, 'backhack3');

    if (checkWindow) {
        winDidClose = false;

        //  schedule a job to check on the window's close status
        TP.schedule(TP.hc(
                    'step',
                    function() {

                        //  Note here how we set the closured variable so
                        //  that we can use it in the limit function below.
                        //  Note also that we pass *both* the window and the
                        //  window ID in. See the TP.$$checkWindowClosed()
                        //  function for more information.
                        winDidClose = TP.$$checkWindowClosed(
                                                    aWindow, winID);

                        return winDidClose;
                    },
                    'delay', 1000,      //  start after 1 second
                    'interval', 500,    //  repeat every half second
                    'limit',
                    function(aJob) {

                        //  don't run more than 5 times (1, 1.5, 2, 2.5, 3)
                        if (aJob.get('iteration') > 5) {
                            return true;
                        }

                        //  don't run if the window closed routine succeeded
                        if (winDidClose) {
                            return true;
                        }

                        return false;
                    }));
    }

    return;
};

// Register it.
TP.definePrimitive('$$processDocumentUnloaded', TP.$$processDocumentUnloaded);

//  ------------------------------------------------------------------------

//  put a reference to the TIBET codebase on the document unload handler so
//  we can check to see when the codebase is exiting later
TP.$$processDocumentUnloaded.codeframe = window;

//  ------------------------------------------------------------------------

TP.definePrimitive('win',
function(anObject) {

    /**
     * @name win
     * @synopsis A general purpose routine that can return a window based on a
     *     variety of input object types.
     * @param {Object} anObject A string, window, node, or other object which
     *     can provide a window or be used to construct one.
     * @returns {Window} A native window object.
     */

    if (TP.notValid(anObject)) {
        return;
    } else if (TP.isString(anObject)) {
        return TP.sys.getWindowById(anObject);
    } else if (TP.isWindow(anObject)) {
        return anObject;
    } else if (TP.isElement(anObject) &&
                (anObject.tagName.toLowerCase() === 'iframe' ||
                    anObject.tagName.toLowerCase() === 'object')) {
        return TP.elementGetIFrameWindow(anObject);
    } else if (TP.isNode(anObject)) {
        return TP.nodeGetWindow(anObject);
    } else if (TP.canInvoke(anObject, 'getNativeWindow')) {
        return anObject.getNativeWindow();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowAssignACLKeys',
function(aWindow, aclType) {

    /**
     * @name windowAssignACLKeys
     * @synopsis Updates the current set of ACL keys on the window's document's
     *     body element (when available). This operation sets acl: attributes
     *     which can be leveraged to drive UI changes via CSS that are
     *     "permission-specific" to the current user.
     * @param {Window} aWindow The native window to update.
     * @param {String} aclType The acl type: real or effective. When not present
     *     both are set.
     * @raises TP.sig.InvalidWindow
     * @todo
     */

    var doc;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(null, 'TP.sig.InvalidWindow', arguments);
    }

    if (TP.notValid(TP.sys.getTypeByName('TP.core.User'))) {
        //  no keys to assign since not loading TP.core.User
        return;
    }

    doc = aWindow.document;

    if (TP.isElement(TP.documentGetBody(doc))) {
        switch (aclType) {
            case TP.ACL_REAL:

                TP.elementSetAttribute(
                        TP.documentGetBody(doc),
                        TP.ACL_REAL,
                        TP.core.User.getRealAccessKeys().join(' '),
                        true);
                break;

            case TP.ACL_EFFECTIVE:

                TP.elementSetAttribute(
                        TP.documentGetBody(doc),
                        TP.ACL_EFFECTIVE,
                        TP.core.User.getEffectiveAccessKeys().join(' '),
                        true);

                break;

            default:

                TP.elementSetAttribute(
                        TP.documentGetBody(doc),
                        TP.ACL_REAL,
                        TP.core.User.getRealAccessKeys().join(' '),
                        true);
                TP.elementSetAttribute(
                        TP.documentGetBody(doc),
                        TP.ACL_EFFECTIVE,
                        TP.core.User.getEffectiveAccessKeys().join(' '),
                        true);
                break;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowAssignCommonIds',
function(aWindow) {

    /**
     * @name windowAssignCommonIds
     * @synopsis Assigns ids to commonly used elements, such as the root
     *     element, the head, the body, etc. (if they don't already exist).
     * @param {Window} aWindow The native window to update.
     * @raises TP.sig.InvalidWindow
     */

    var doc,
        elem,
        index;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(null, 'TP.sig.InvalidWindow', arguments);
    }

    doc = aWindow.document;

    //  If there is a native document root element and it doesn't have an
    //  id, give it one.
    if (TP.isElement(elem = doc.documentElement)) {
        if (TP.isEmpty(TP.elementGetAttribute(elem, 'id'))) {
            //  Compute the id by slicing off everything to the right of the
            //  colon (':') in the node name.
            if ((index = elem.nodeName.indexOf(':')) !== TP.NOT_FOUND) {
                TP.elementSetAttribute(elem,
                                        'id',
                                        elem.nodeName.slice(index));
            } else {
                TP.elementSetAttribute(elem,
                                        'id',
                                        elem.nodeName);
            }
        }
    }

    //  If there is a native head element and it doesn't have an id, give
    //  it one
    if (TP.isElement(elem = TP.nodeGetFirstElementByTagName(doc, 'head'))) {
        //  Set a 'head' convenience slot on the window, since the DOM spec
        //  didn't 'deign' to give us this slot (like 'body' is for the body
        //  element).
        doc.head = elem;

        //  Set the head element's id to 'head' (if it doesn't already have
        //  an id).
        if (TP.isEmpty(TP.elementGetAttribute(elem, 'id'))) {
            TP.elementSetAttribute(elem, 'id', 'head');
        }
    }

    //  If there is a native body element and it doesn't have an id, give
    //  it one
    if (TP.isElement(elem = TP.documentGetBody(doc))) {
        //  Set the body element's id to 'body' (if it doesn't already have
        //  an id).
        if (TP.isEmpty(TP.elementGetAttribute(elem, 'id'))) {
            TP.elementSetAttribute(elem, 'id', 'body');
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowComputeWindowOffsets',
function(aWindow, otherWindow) {

    /**
     * @name windowComputeWindowOffsets
     * @synopsis Computes position offsets between the first window and the
     *     second window.
     * @description This method assumes that the supplied windows are either
     *     iframe windows embedded somewhere in the same top-level window (maybe
     *     at different levels) or one of them is the top-level window itself.
     *     Note that this routine will hand back positive values if the second
     *     window is positioned at a greater top,left value than the first
     *     window and negative values if the first window is at a greater
     *     top,left value.
     * @param {Window} aWindow The first window to compute offset values for.
     * @param {Window} otherWindow The second window to compute offset values
     *     for.
     * @raises TP.sig.InvalidWindow
     * @returns {Array} The offsets expressed as [width, height].
     * @todo
     */

    var frame1OffsetX,
        frame1OffsetY,

        win,
        frameElement,

        frameCoords,

        frame2OffsetX,
        frame2OffsetY;

    if (!TP.isWindow(aWindow) || !TP.isWindow(otherWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    //  Always set initial values to 0, so that numeric computations won't
    //  be NaNed.

    frame1OffsetX = 0;
    frame1OffsetY = 0;

    //  Iterate up through the 'frameElement / window' hierarchy, computing
    //  the offset as we go (for the first window).
    win = aWindow;
    while (TP.isElement(frameElement = win.frameElement)) {

        //  NB: We're not interested in transformed coordinates here, so we pass
        //  'false' as the second parameter
        frameCoords = TP.elementGetBorderBox(frameElement, false);

        frame1OffsetX += frameCoords.at('left');
        frame1OffsetY += frameCoords.at('top');

        win = TP.nodeGetWindow(frameElement);
    }

    //  Always set initial values to 0, so that numeric computations won't
    //  be NaNed.
    frame2OffsetX = 0;
    frame2OffsetY = 0;

    //  Iterate up through the 'frameElement / window' hierarchy, computing
    //  the offset as we go (for the second window).
    win = otherWindow;
    while (TP.isElement(frameElement = win.frameElement)) {

        //  NB: We're not interested in transformed coordinates here, so we pass
        //  'false' as the second parameter
        frameCoords = TP.elementGetBorderBox(frameElement, false);

        frame2OffsetX += frameCoords.at('left');
        frame2OffsetY += frameCoords.at('top');

        win = TP.nodeGetWindow(frameElement);
    }

    return TP.ac(frame2OffsetX - frame1OffsetX, frame2OffsetY - frame1OffsetY);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowGetParentNames',
function(aWindow) {

    /**
     * @name windowGetParentNames
     * @synopsis Returns the list of parent window/frame names for the window
     *     provided. This data is used in building a global ID.
     * @raises TP.sig.InvalidWindow
     * @returns {Array} The names of all of the parent windows of aWindow all
     *     the way up to the top level window containing it.
     * @todo
     */

    var arr,
        win;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    arr = TP.ac();

    //  Note that we use '==' and '!=' in these comparisons, not what
    //  you'd expect when comparing window pointers. But it seems
    //  like some browsers (IE) sometimes won't compare these
    //  properly using strict equality...

    //  If the window is the top level window, just return an empty
    //  array here
    if (aWindow === aWindow.top) {
        return arr;
    }

    win = aWindow.parent;

    //  While the parent window isn't the top window, add its name
    //  to the list.
    while (win !== aWindow.top) {
        //  NOTE that this will assign unique names to intermediate frames
        arr.push(TP.lid(win));
        win = win.parent;
    }

    //  Go ahead and add the top-level window's name to our array
    arr.push(TP.lid(aWindow.top));

    //  Reverse the array so that top's name is first, followed by
    //  all of the frames between top and ourselves in descending
    //  order, followed by our name
    arr.reverse();

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowGetScreenWidthAndHeight',
function(aWindow) {

    /**
     * @name windowGetScreenWidthAndHeight
     * @synopsis Obtains the width and height of the screen that contains the
     *     supplied window.
     * @param {Window} aWindow The window whose screen the width and height will
     *     be obtained.
     * @raises TP.sig.InvalidWindow
     * @returns {Array} An ordered pair containing the width amount in the first
     *     position and the height amount in the second position.
     * @todo
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    return TP.ac(aWindow.screen.availWidth, aWindow.screen.availHeight);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowIsInstrumented',
function(aWindow) {

    /**
     * @name windowIsInstrumented
     * @synopsis Checks to see whether the supplied native window has been
     *     instrumented (that is, provided with TIBET window features.
     * @param {Window} aWindow The window to test.
     * @returns {Boolean} Whether or not the supplied native window has been
     *     instrumented.
     */

    //  check out the window...might not be a window ;)
    if (!TP.isWindow(aWindow)) {
        return false;
    }

    //  the $$instrumented flag is true when instrumentation is in place
    return TP.isTrue(aWindow.$$instrumented);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowMoveBy',
function(aWindow, deltaX, deltaY) {

    /**
     * @name windowMoveBy
     * @synopsis Moves the window by the deltaX and deltaY amounts provided.
     * @param {Window} aWindow The window to move.
     * @param {Number} deltaX The X amount to move the window by.
     * @param {Number} deltaY The Y amount to move the window by.
     * @raises TP.sig.InvalidWindow,TP.sig.InvalidNumber
     * @todo
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (!TP.isNumber(deltaX) || !TP.isNumber(deltaY)) {
        return TP.raise(this, 'TP.sig.InvalidNumber', arguments);
    }

    aWindow.moveBy(deltaX, deltaY);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowMoveTo',
function(aWindow, x, y) {

    /**
     * @name windowMoveTo
     * @synopsis Moves the window to the X and Y coordinates provided.
     * @param {Window} aWindow The window to move.
     * @param {Number} x The X coordinate to move the window to.
     * @param {Number} y The Y coordinate to move the window to.
     * @raises TP.sig.InvalidWindow,TP.sig.InvalidNumber
     * @todo
     */

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow', arguments);
    }

    if (!TP.isNumber(x) || !TP.isNumber(y)) {
        return TP.raise(this, 'TP.sig.InvalidNumber', arguments);
    }

    aWindow.moveTo(x, y);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowResetLocation',
function(aWindow) {

    /**
     * @name windowResetLocation
     * @synopsis Resets the window's location using the 'TIBET-approved' way of
     *     doing so. This method is used by the hook file to (re)process
     *     navigations using links, etc.
     * @description The tibet_hook.js file captures all inbound locations and
     *     routes them to this call so that all TIBET-enabled pages which find
     *     their way into a window are properly processed for CSS and/or markup
     *     extensions. This allows TIBET to work effectively with content
     *     containing links, or with bookmarked pages, etc.
     * @param {Window} aWindow The window to reset the location of.
     */

    //  NOTE: This is the *most reliable* way of doing this (rather than
    //  setting up a JS-level 'onload' handler on the frameElement, etc.)
    //  In fact, this is the only way this works in IE. But even in Mozilla,
    //  et. al. nested iframes will get wonked if this isn't done this way -
    //  probably some race condition thing...

    TP.windowStopLoading(aWindow);

    //  NB: This function needs to be forked in order to be 'outside' of the
    //  window stoppage procedure above.
    (function() {

        var loc,

            locVals,
            hashVal,

            locURI;

        loc = aWindow.location.toString();

        //  Set a value on the window's 'frameElement' to tell the machinery
        //  that will be invoked during the setting of this content (over in
        //  the hook file) not to reinvoke this method - otherwise, we'll
        //  end up in a loop. This also gives the 'real' value of the
        //  location that we're trying to use, which the hook file needs on
        //  Webkit-based browsers since a 'document.open()' call will reset
        //  the window location to the top-level window's URL.
        aWindow.frameElement.setAttribute('tibet_settinglocation', loc);

        loc = decodeURI(loc);

        //  'loc' might have a hash on it. In that case, its a bookmark that
        //  the user made and we need to decode it further to see if we can
        //  get a 'history identifier' (i.e. usually a URI) from it.
        if (loc.contains('#')) {
            locVals = loc.split('#');
            hashVal = locVals.last();

            loc = TP.atob(hashVal);
        }

        locURI = TP.uc(loc);

        TP.tpwin(aWindow).setContent(
            locURI,
            TP.request('loadFunc',
                        function(aNode) {

                            //  Remove the 'anti-looping' value (described
                            //  above) now that we're done.
                            aWindow.frameElement.removeAttribute(
                                        'tibet_settinglocation');
                        }));
    }).afterUnwind();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowSetupBackKeyHandlers',
function(aWindow) {

    /**
     * @name windowSetupBackKeyHandlers
     * @synopsis Configures the top level window(s) so that keydown (in the case
     *     of IE) or keypress (in the case of Mozilla) with the 'backspace' key
     *     received by the window itself will not cause TIBET to be flushed back
     *     to its frameset.
     * @param {Window} aWindow The window to configure.
     */

    //  might be in a non-tibet frameset, so just ignore here
    if (!TP.isWindow(aWindow)) {
        return;
    }

    //  Set up key handlers for 'keypress' and 'keydown' (depending on the
    //  browser) aWindow's documentElement (or body) so that backspace
    //  won't cause TIBET to be flushed back to its frameset.
    if (TP.boot.isUA('GECKO') || TP.boot.isUA('WEBKIT')) {
        aWindow.document.documentElement.addEventListener(
            'keypress',
            function(anEvent) {

                if ((anEvent.keyCode === TP.BACK_SPACE_KEY) &&
                    (anEvent.target === this)) {
                    anEvent.preventDefault();
                }
            },false);
    } else if (TP.boot.isUA('IE')) {
        TP.documentGetBody(aWindow.document).attachEvent(
            'onkeydown',
            function(anEvent) {

                if ((anEvent.keyCode === TP.BACK_SPACE_KEY) &&
                    (anEvent.srcElement === TP.documentGetBody(aWindow.document))) {
                    anEvent.returnValue = false;
                }
            });
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowSetupFocusHandlers',
function(aWindow) {

    /**
     * @name windowSetupFocusHandlers
     * @synopsis Configures the top level window(s) so that focus will return to
     *     the canvas rather than moving outside the ui frame(s).
     * @param {Window} aWindow The window to configure.
     */

    //  might be in a non-tibet frameset, so just ignore here
    if (!TP.isWindow(aWindow)) {
        return;
    }

    //  Set a handler on the 'top' window so that it always focuses down onto
    //  whatever TIBET's canvas window is. Note: Do not shortcut this by using
    //  'canvasWindow'. The actual ui canvas window may change as the
    //  application is executed.
    if (TP.boot.isUA('GECKO')) {
        aWindow.addEventListener('focus',
                function(anEvent) {

                    var docBody;

                    //  For some reason, on Gecko trying to focus the canvas
                    //  window causes problems with focusing items not in the
                    //  canvas window. Focusing the document's body (if there is
                    //  one) seems to get around the problem.
                    if (anEvent.target === aWindow) {
                        if (TP.isElement(docBody = TP.documentGetBody(
                                TP.sys.getUICanvas(true).document))) {
                            docBody.focus();
                        }
                    }
                },
                false);
    } else if (TP.boot.isUA('WEBKIT')) {
        aWindow.addEventListener('focus',
                function(anEvent) {

                    if (anEvent.target === aWindow) {
                        TP.sys.getUICanvas(true).focus();
                    }
                });
    } else if (TP.boot.isUA('IE')) {
        aWindow.attachEvent('onfocus',
                function(anEvent) {

                    if (anEvent.srcElement === aWindow) {
                        TP.sys.getUICanvas(true).focus();
                    }
                });
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================