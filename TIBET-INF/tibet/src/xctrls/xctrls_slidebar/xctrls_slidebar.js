//  ========================================================================
/*
NAME:   xctrls_slidebar.js
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
 * @type {TP.xctrls.slidebar}
 * @synopsis Manages slidebar XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:slidebar');

TP.xctrls.slidebar.addTraitsFrom(TP.xctrls.Element,
                                    TP.core.TemplatedNode);
TP.xctrls.slidebar.Type.resolveTrait('tshCompile', TP.core.TemplatedNode);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Shared drag responder instances
TP.xctrls.slidebar.Type.defineAttribute('vertSlideResponder');
TP.xctrls.slidebar.Type.defineAttribute('horizSlideResponder');

TP.xctrls.slidebar.Type.defineAttribute('defaultIncrement', 5);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineAttribute(
        'thumb',
        {'value': TP.cpc('*[tibet|pelem="thumb"]', true)});

TP.xctrls.slidebar.Inst.defineAttribute(
        'decrementButton',
        {'value': TP.cpc('.decrement', true)});

TP.xctrls.slidebar.Inst.defineAttribute(
        'incrementButton',
        {'value': TP.cpc('.increment', true)});

TP.xctrls.slidebar.Inst.defineAttribute(
        'dragger',
        {'value': TP.cpc('*[tibet|pelem="drag"]', true)});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Type.defineMethod('tshAwakenDOM',
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
        elemTPNode;

    //  Make sure to call the 'xctrls:Element' version of 'tshAwakenDOM',
    //  since it does processing for this step (note that it's a mixin, so
    //  we can't 'callNextMethod' here and get its method). We make sure to
    //  use 'apply' so that 'this' references get resolved properly.
    TP.xctrls.Element.tshAwakenDOM.apply(this, TP.ac(aRequest));

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('cmdNode'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Get a handle to a TP.core.Node representing the rich text area. Note
    //  that this will both ensure a unique 'id' for the element and
    //  register it.
    elemTPNode = TP.tpnode(elem);

    elemTPNode.setAttribute('value', '0');

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    var barLength,
        thumbLength,

        percentage;

    //  TODO: Right now we assume a vertical orientation.

    barLength = TP.elementGetHeight(this.getNativeNode());
    thumbLength = TP.elementGetHeight(this.get('thumb'));

    percentage = this.getThumbPosition() / (barLength - thumbLength);

    return percentage;
});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('getThumbPosition',
function() {

    /**
     * @name getThumbPosition
     * @synopsis Returns the slidebar's 'thumb position' in pixels (relative to
     *     the overall slidebar).
     * @returns {Number} The receiver's thumb position.
     */

    var currentVal;

    //  TODO: Right now we assume a vertical orientation.

    currentVal = TP.elementGetStyleValueInPixels(this.get('thumb'), 'top');

    return currentVal;
});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('handleDOMClick',
function(aSignal) {

    /**
     * @name handleDOMClick
     * @synopsis This method is invoked as the slidebar's buttons are clicked.
     *     It notifies any observers that the slidebar's value has changed.
     * @param {TP.sig.DOMClick} aSignal The signal that caused this handler to
     *     trip.
     */

    var side;

    if (aSignal.getTarget() === this.get('decrementButton')) {
        side = 'TP.TOP';
    }

    if (aSignal.getTarget() === this.get('incrementButton')) {
        side = 'TP.BOTTOM';
    }

    this.moveByIncrement(
                side,
                TP.ifEmpty(this.getAttribute('xctrls:increment'),
                            this.getType().get('defaultIncrement')));

    if (this.shouldSignalChange()) {
        this.changed('value', TP.UPDATE);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('handleDOMDragMove',
function(aSignal) {

    /**
     * @name handleDOMDragMove
     * @synopsis This method is invoked as the slidebar is dragged. It notifies
     *     any observers that the slidebar's value has changed.
     * @param {TP.sig.DOMDragMove} aSignal The signal that caused this handler
     *     to trip.
     */

    if (this.shouldSignalChange()) {
        this.changed('value', TP.UPDATE);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('moveByIncrement',
function(aSide, incrementValue) {

    /**
     * @name moveByIncrement
     * @param {undefined} aSide
     * @param {undefined} incrementValue
     * @returns {TP.xctrls.slidebar} The receiver.
     * @abstract
     * @todo
     */

    var increment;

    //  TODO: Right now we assume a vertical orientation.

    increment = TP.elementGetPixelValue(this.get('thumb'),
                                        incrementValue,
                                        'top');

    if (aSide === 'TP.TOP') {
        increment = -increment;
    }

    this.setThumbPosition(this.getThumbPosition() + increment);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.slidebar} The receiver.
     */

    var barLength,
        thumbLength,

        absolutePixels;

    //  TODO: Right now we assume a vertical orientation.

    barLength = TP.elementGetHeight(this.getNativeNode());
    thumbLength = TP.elementGetHeight(this.get('thumb'));

    absolutePixels = (barLength - thumbLength) * aValue;

    this.setThumbPosition(absolutePixels);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.slidebar.Inst.defineMethod('setThumbPosition',
function(pixelValue) {

    /**
     * @name setThumbPosition
     * @synopsis Sets the slidebar's 'thumb position' in pixels (relative to the
     *     overall slidebar).
     * @param {Number} pixelValue The value to set.
     * @returns {TP.xctrls.slidebar} The receiver.
     */

    var barLength,
        thumbLength,
        maxValue,

        newPosition;

    //  TODO: Right now we assume a vertical orientation.

    barLength = TP.elementGetHeight(this.getNativeNode());
    thumbLength = TP.elementGetHeight(this.get('thumb'));

    maxValue = barLength - thumbLength;

    newPosition = pixelValue.max(0);
    newPosition = newPosition.min(maxValue);

    TP.elementGetStyleObj(this.get('thumb')).top = newPosition + 'px';

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
