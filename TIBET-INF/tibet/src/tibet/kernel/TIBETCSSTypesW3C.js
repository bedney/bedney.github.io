//  ========================================================================
/*
NAME:   TIBETCSSTypesW3C.js
AUTH:   William J. Edney (wje)
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

//  ========================================================================
//  TP.core.Gradient
//  ========================================================================

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Gradient.Inst.defineMethod('asCanvasGradientOn',
function(aCanvas) {

    /**
     * @name asCanvasGradientOn
     * @synopsis Converts the receiver into a gradient that can be used by the
     *     supplied HTML Canvas element.
     * @param {HTMLCanvas} aCanvas The HTML Canvas element to produce the
     *     gradient for.
     * @returns {Object} An HTML Canvas gradient object suitable for use with
     *     the supplied HTML Canvas.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.Gradient.Inst.defineMethod('asSVGGradientOn',
function(anElement, idValue) {

    /**
     * @name asSVGGradientOn
     * @synopsis Sets up an SVG 'linear gradient' element, given information in
     *     the receiver.
     * @param {Element} anElement The element to set the gradient up for.
     * @param {String} idValue The ID value for the gradient. If a gradient has
     *     already been created with this ID, it will be returned, thereby
     *     reusing the gradient element.
     * @returns {String} The 'gradient URL' for elements to use.
     * @todo
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.Gradient.Inst.defineMethod('$setupSVGGradientElement',
function(anElement, idValue, gradientTagName) {

    /**
     * @name $setupSVGGradientElement
     * @synopsis Sets up a gradient element for the supplied element. This
     *     manages all of the setup of the gradient element in the proper place
     *     in the SVG element hierarchy.
     * @param {SVGElement} anElement The element to set the gradient up for.
     * @param {String} idValue The ID value for the gradient. If a gradient has
     *     already been created with this ID, it will be returned, thereby
     *     reusing the gradient element.
     * @param {String} gradientTagName The tag name of the gradient to create -
     *     either 'linear' or 'radial'.
     * @returns {Element} The newly created SVG 'gradient' element.
     * @todo
     */

    var nativeDoc,

        gradElem,

        svgElem,
        defsElem,

        gradID,

        colors,
        stops;

    //  Grab the element's document and its 'closest' enclosing 'svg'
    //  element (the element named 'svg').
    nativeDoc = TP.nodeGetDocument(anElement);

    //  If there's already a gradient element with that ID, we just return
    //  it.
    if (TP.isElement(gradElem = nativeDoc.getElementById(idValue))) {
        return gradElem;
    }

    svgElem = TP.nodeGetFirstElementAncestorByTagName(anElement, 'svg');

    //  See if there's a 'defs' element under the 'svg' element. This is
    //  where we need to place the gradient element.
    if (TP.notValid(defsElem = TP.nodeGetFirstElementByTagName(
                                                svgElem, 'defs'))) {
        //  No pre-existing 'defs' element, so we create one and insert it
        //  as the first child to the 'svg' element.
        defsElem = TP.documentCreateElement(nativeDoc,
                                            'defs',
                                            TP.w3.Xmlns.SVG);
        svgElem.insertBefore(defsElem, svgElem.firstChild);
    }

    //  If an ID value was supplied, we want to make sure to get the 'local
    //  ID' (that is, the ID without any leading URL bits or trailing
    //  parentheses).
    if (TP.notEmpty(gradID = idValue)) {
        gradID = gradID.slice(gradID.indexOf('#') + 1,
                                gradID.lastIndexOf(')'));
    }

    //  If no gradient ID was supplied or an existing gradient element
    //  couldn't be found with that ID, then we create a gradient element
    //  and put it at the proper place within the SVG DOM.
    if (TP.isEmpty(gradID) ||
        TP.notValid(gradElem = TP.byId(gradID, nativeDoc))) {
        gradElem = TP.documentCreateElement(nativeDoc,
                                            gradientTagName,
                                            TP.w3.Xmlns.SVG);

        //  Get a unique ID, but then reassign a lowercase version of
        //  it. We'll assign it ourselves. We do this because when it
        //  gets written into the style entry we want to make sure its
        //  all lowercase, because the conversion to style hashes forces
        //  things into lowercase and we want everything to match.
        gradID = TP.lid(gradElem, true).toLowerCase();
        TP.elementSetAttribute(gradElem, 'id', gradID);

        TP.elementSetAttribute(gradElem, 'gradientUnits', 'userSpaceOnUse');

        //  Append the gradient into the 'defs' element.
        defsElem.appendChild(gradElem);
    } else {
        //  Empty out any previous stops
        TP.nodeEmptyContent(gradElem);
    }

    //  Make sure to 'normalize' the color and stop values on ourself.
    //  This will ensure that all of the colors are expressed properly, that
    //  all of the stops are expressed properly and that the number of
    //  colors and stops are equal,
    this.normalizeGradientValues();

    colors = this.get('colors');
    stops = this.get('stops');

    //  Loop over the colors and stops and set up SVG 'stop' elements.
    colors.performWith(
        function(aColor, aStop) {

            var stopElem;

            stopElem = TP.documentCreateElement(
                                    nativeDoc,
                                    'stop',
                                    TP.w3.Xmlns.SVG);

            TP.elementSetAttribute(stopElem,
                                    'offset',
                                    aStop.toFixed(8));
            TP.elementSetAttribute(stopElem,
                                    'stop-color',
                                    aColor.asHexString());
            TP.elementSetAttribute(stopElem,
                                    'stop-opacity',
                                    aColor.get('alpha'));

            //  Append each 'stop' element under the gradient element.
            gradElem.appendChild(stopElem);
        }, stops);

    return gradElem;
});

//  ========================================================================
//  TP.core.LinearGradient
//  ========================================================================

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.LinearGradient.Inst.defineMethod('asCanvasGradientOn',
function(aCanvas) {

    /**
     * @name asCanvasGradientOn
     * @synopsis Converts the receiver into a gradient that can be used by the
     *     supplied HTML Canvas element.
     * @param {HTMLCanvas} aCanvas The HTML Canvas element to produce the
     *     gradient for.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidContext
     * @returns {Object} An HTML Canvas gradient object suitable for use with
     *     the supplied HTML Canvas.
     */

    var the2DContext,

        x1,
        y1,
        x2,
        y2,

        canvasGradient,

        colors,
        stops;

    if (TP.notValid(aCanvas)) {
        return this.raise('TP.sig.InvalidElement', arguments);
    }

    if (TP.notValid(the2DContext = aCanvas.getContext('2d'))) {
        return this.raise('TP.sig.InvalidContext',
                            arguments,
                            'Canvas has invalid 2D context');
    }

    //  The receiver can express it's x1, y1, x2, y2 as percentages to be
    //  compliant with SVG. The Canvas object, however, provides for no such
    //  capability. Therefore we need to multiply by the canvas width and
    //  height to derive the proper values for a Canvas.

    if (/%/.test(x1 = this.get('x1'))) {
        x1 = (parseFloat(x1) / 100) * aCanvas.width;
    }

    if (/%/.test(y1 = this.get('y1'))) {
        y1 = (parseFloat(y1) / 100) * aCanvas.height;
    }

    if (/%/.test(x2 = this.get('x2'))) {
        x2 = (parseFloat(x2) / 100) * aCanvas.width;
    }

    if (/%/.test(y2 = this.get('y2'))) {
        y2 = (parseFloat(y2) / 100) * aCanvas.height;
    }

    canvasGradient = the2DContext.createLinearGradient(x1, y1, x2, y2);

    //  Install the color stops.

    //  First, make sure that the colors and stops are normalized (i.e.
    //  expressed in the proper units, etc.
    this.normalizeGradientValues();

    stops = this.get('stops');
    colors = this.get('colors');

    //  Iterate over the stops Array, using each color from the colors Array
    //  and add a color stop for each item iterated over.
    stops.performWith(
        function(aStopValue, aColorValue) {

            if (TP.isNumber(aStopValue)) {
                canvasGradient.addColorStop(aStopValue,
                                            aColorValue.asRGBAString());
            }
        },
        colors);

    return canvasGradient;
});

//  ------------------------------------------------------------------------

TP.core.LinearGradient.Inst.defineMethod('asSVGGradientOn',
function(anElement, idValue) {

    /**
     * @name asSVGGradientOn
     * @synopsis Sets up an SVG 'linear gradient' element, given information in
     *     the receiver.
     * @param {SVGElement} anElement The element to set the gradient up for.
     * @param {String} idValue The ID value for the gradient. If a gradient has
     *     already been created with this ID, it will be returned, thereby
     *     reusing the gradient element.
     * @returns {String} The 'gradient URL' for elements to use.
     * @todo
     */

    var gradElem,
        gradURL;

    //  Set up a linear gradient element (or return an existing one with the
    //  supplied ID).
    gradElem = this.$setupSVGGradientElement(anElement,
                                                idValue,
                                                'linearGradient');

    //  Set the various x1, y1, x2, y2 values given those values on the
    //  TP.core.Gradient object.
    TP.elementSetAttribute(gradElem, 'x1', this.get('x1'));
    TP.elementSetAttribute(gradElem, 'y1', this.get('y1'));
    TP.elementSetAttribute(gradElem, 'x2', this.get('x2'));
    TP.elementSetAttribute(gradElem, 'y2', this.get('y2'));

    //  Compute a 'gradient URL' that can be referenced by elements in their
    //  'fill' or 'stroke' properties. This includes the 'URL' of the
    //  element's document to avoid bugs in Mozilla 1.8 (Firefox 2.X).
    gradURL = TP.join('url(',
                        TP.nodeGetDocument(anElement).URL,
                        '#',
                        TP.elementGetAttribute(gradElem, 'id'),
                        ')');

    return gradURL;
});

//  ========================================================================
//  TP.core.RadialGradient
//  ========================================================================

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.RadialGradient.Inst.defineMethod('asCanvasGradientOn',
function(aCanvas) {

    /**
     * @name asCanvasGradientOn
     * @synopsis Converts the receiver into a gradient that can be used by the
     *     supplied HTML Canvas element.
     * @param {HTMLCanvas} aCanvas The HTML Canvas element to produce the
     *     gradient for.
     * @raises TP.sig.InvalidElement,TP.sig.InvalidContext
     * @returns {Object} An HTML Canvas gradient object suitable for use with
     *     the supplied HTML Canvas.
     */

    var the2DContext,

        cx,
        cy,

        viewportVal,
        radius,

        canvasGradient,

        colors,
        stops;

    if (TP.notValid(aCanvas)) {
        return this.raise('TP.sig.InvalidElement', arguments);
    }

    if (TP.notValid(the2DContext = aCanvas.getContext('2d'))) {
        return this.raise('TP.sig.InvalidContext',
                            arguments,
                            'Canvas has invalid 2D context');
    }

    //  The receiver can express it's cx, cy, radius as percentages to be
    //  compliant with SVG. The Canvas object, however, provides for no such
    //  capability. Therefore we need to multiply by the canvas width and
    //  height (or by a precomputed 'viewport value' in the case of radius)
    //  to derive the proper values for a Canvas.

    if (/%/.test(cx = this.get('cx'))) {
        cx = (parseFloat(cx) / 100) * aCanvas.width;
    }

    if (/%/.test(cy = this.get('cy'))) {
        cy = (parseFloat(cy) / 100) * aCanvas.height;
    }

    if (/%/.test(radius = this.get('radius'))) {
        //  As per the SVG spec.
        viewportVal =
            (aCanvas.width.pow(2) + aCanvas.height.pow(2)).sqrt() /
                (2).sqrt();

        radius = (parseFloat(radius) / 100) * viewportVal;
    }

    canvasGradient = the2DContext.createRadialGradient(
                                            cx, cy, 0, cx, cy, radius);

    //  Install the color stops.

    //  First, make sure that the colors and stops are normalized (i.e.
    //  expressed in the proper units, etc.
    this.normalizeGradientValues();

    stops = this.get('stops');
    colors = this.get('colors');

    //  Iterate over the stops Array, using each color from the colors Array
    //  and add a color stop for each item iterated over.
    stops.performWith(
        function(aStopValue, aColorValue) {

            if (TP.isNumber(aStopValue)) {
                canvasGradient.addColorStop(aStopValue,
                                            aColorValue.asRGBAString());
            }
        },
        colors);

    return canvasGradient;
});

//  ------------------------------------------------------------------------

TP.core.RadialGradient.Inst.defineMethod('asSVGGradientOn',
function(anElement, idValue) {

    /**
     * @name asSVGGradientOn
     * @synopsis Sets up an SVG 'radial gradient' element, given information in
     *     the receiver.
     * @param {Element} anElement The element to set the gradient up for.
     * @param {String} idValue The ID value for the gradient. If a gradient has
     *     already been created with this ID, it will be returned, thereby
     *     reusing the gradient element.
     * @returns {String} The 'gradient URL' for elements to use.
     * @todo
     */

    var gradElem,
        gradURL;

    //  Set up a radial gradient element (or return an existing one with the
    //  supplied ID).
    gradElem = this.$setupSVGGradientElement(anElement,
                                                idValue,
                                                'radialGradient');

    //  Set the various cx, cy, r, fx, fy values given those values on the
    //  TP.core.Gradient object.
    TP.elementSetAttribute(gradElem, 'cx', this.get('cx'));
    TP.elementSetAttribute(gradElem, 'cy', this.get('cy'));

    TP.elementSetAttribute(gradElem, 'r', this.get('radius'));

    TP.elementSetAttribute(gradElem, 'fx', this.get('fx'));
    TP.elementSetAttribute(gradElem, 'fy', this.get('fy'));

    //  Compute a 'gradient URL' that can be referenced by elements in their
    //  'fill' or 'stroke' properties. This includes the 'URL' of the
    //  element's document to avoid bugs in Mozilla 1.8 (Firefox 2.X).
    gradURL = TP.join('url(',
                        TP.nodeGetDocument(anElement).URL,
                        '#',
                        TP.elementGetAttribute(gradElem, 'id'),
                        ')');

    return gradURL;
});

//  ========================================================================
//  TP.core.Pattern
//  ========================================================================

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Pattern.Inst.defineMethod('asCanvasPatternOn',
function(aCanvas) {

    /**
     * @name asCanvasPatternOn
     * @synopsis Converts the receiver into a pattern that can be used by the
     *     supplied HTML Canvas element.
     * @param {HTMLCanvas} aCanvas The HTML Canvas element to produce the
     *     pattern for.
     * @returns {Object} An HTML Canvas pattern object suitable for use with the
     *     supplied HTML Canvas.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.Pattern.Inst.defineMethod('asSVGPatternOn',
function(anElement, idValue) {

    /**
     * @name asSVGPatternOn
     * @synopsis Sets up an SVG 'radial gradient' element, given information in
     *     the receiver.
     * @param {Element} anElement The element to set the pattern up for.
     * @param {String} idValue The ID value for the pattern. If a pattern has
     *     already been created with this ID, it will be returned, thereby
     *     reusing the pattern element.
     * @returns {Element} The newly created SVG 'pattern' element.
     * @todo
     */

    var nativeDoc,

        svgElem,
        defsElem,

        patID,

        patternElem,
        imageElem,

        patternURL;

    //  Grab the element's document and its 'closest' enclosing 'svg'
    //  element (the element named 'svg').
    nativeDoc = TP.nodeGetDocument(anElement);
    svgElem = TP.nodeGetFirstElementAncestorByTagName(anElement, 'svg');

    //  See if there's a 'defs' element under the 'svg' element. This is
    //  where we need to place the pattern element.
    if (TP.notValid(defsElem = TP.nodeGetFirstElementByTagName(
                                                svgElem, 'defs'))) {
        //  No pre-existing 'defs' element, so we create one and insert it
        //  as the first child to the 'svg' element.
        defsElem = TP.documentCreateElement(nativeDoc,
                                            'defs',
                                            TP.w3.Xmlns.SVG);
        svgElem.insertBefore(defsElem, svgElem.firstChild);
    }

    //  If an ID value was supplied, we want to make sure to get the 'local
    //  ID' (that is, the ID without any leading URL bits or trailing
    //  parentheses).
    if (TP.notEmpty(patID = idValue)) {
        patID = patID.slice(patID.indexOf('#') + 1,
                                patID.lastIndexOf(')'));
    }

    //  If no pattern ID was supplied or an existing pattern element
    //  couldn't be found with that ID, then we create a pattern element
    //  and put it at the proper place within the SVG DOM.
    if (TP.isEmpty(patID) ||
        TP.notValid(patternElem = TP.byId(patID, nativeDoc))) {
        patternElem = TP.documentCreateElement(nativeDoc,
                                                'pattern',
                                                TP.w3.Xmlns.SVG);

        //  Get a unique ID, but then reassign a lowercase version of
        //  it. We'll assign it ourselves. We do this because when it
        //  gets written into the style entry we want to make sure its
        //  all lowercase, because the conversion to style hashes forces
        //  things into lowercase and we want everything to match.
        patID = TP.lid(patternElem, true).toLowerCase();
        TP.elementSetAttribute(patternElem, 'id', patID);

        TP.elementSetAttribute(patternElem,
                                'patternUnits',
                                'userSpaceOnUse');

        //  Append the pattern into the 'defs' element.
        defsElem.appendChild(patternElem);
    }

    //  If an 'image' element isn't under the pattern element in the DOM,
    //  then create one and append it in.
    if (TP.notValid(imageElem =
                    patternElem.getElementsByTagName('image')[0])) {
        imageElem = TP.documentCreateElement(nativeDoc,
                                                'image',
                                                TP.w3.Xmlns.SVG);

        patternElem.appendChild(imageElem);
    }

    //  Set the various x, y, width, height values of the pattern element
    //  given those values on the TP.core.Gradient object.
    TP.elementSetAttribute(imageElem, 'x', this.get('x'));
    TP.elementSetAttribute(imageElem, 'y', this.get('y'));
    TP.elementSetAttribute(imageElem, 'width', this.get('width'));
    TP.elementSetAttribute(imageElem, 'height', this.get('height'));

    //  Set the 'xlink:href' to the URI of the pattern.
    TP.elementSetAttributeInNS(imageElem,
                                'href',
                                this.get('uri'),
                                TP.w3.Xmlns.XLINK);

    //  Compute a 'pattern URL' that can be referenced by elements in their
    //  'fill' or 'stroke' properties. This includes the 'URL' of the
    //  element's document to avoid bugs in Mozilla 1.8 (Firefox 2.X).
    patternURL = TP.join('url(',
                            TP.nodeGetDocument(anElement).URL,
                            '#',
                            patID,
                            ')');

    return patternURL;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
