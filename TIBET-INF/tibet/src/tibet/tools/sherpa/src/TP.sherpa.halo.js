//  ========================================================================
/*
NAME:   TP.sherpa.halo.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        The contents of this file are subject to the terms and conditions of
        the Technical Pursuit License ("TPL") Version 1.5, or subsequent
        versions as allowed by the TPL, and You may not copy or use this
        file in either source code or executable form, except in compliance
        with the terms and conditions of the TPL.  You may obtain a copy of
        the TPL (the "License") from Technical Pursuit Inc. at
        http://www.technicalpursuit.com.

        All software distributed under the License is provided strictly on
        an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR
        IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS ALL SUCH
        WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT,
        OR NON-INFRINGEMENT. See the License for specific language governing
        rights and limitations under the License.
*/
//  ========================================================================

/**
 * @type {TP.sherpa.halo}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:halo');

TP.sherpa.halo.shouldRegisterInstances(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sherpa.halo.Type.defineMethod('tshAwakenDOM', function(aRequest) {

    /**
     * @name tshAwakenDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {String} 
     */

    var elem;

    if (TP.isElement(elem = aRequest.at('cmdNode'))) {
        this.addStylesheetTo(TP.nodeGetDocument(elem));
    }

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineAttribute('currentTargetTPElem');
TP.sherpa.halo.Inst.defineAttribute('haloRect');

TP.sherpa.halo.Inst.defineAttribute('lastCorner');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('setup',
function() {

    /**
     * @name setup
     */

    (function (aSignal) {

        if (aSignal.getShiftKey()) {
            //  Make sure to prevent default to avoid having the context menu
            //  pop up.
            aSignal.preventDefault();
            aSignal.stopPropagation();

            this.changeHaloFocus(aSignal);

            return;
        }

        }).bind(this).observe(
            TP.core.Mouse, 'TP.sig.DOMContextMenu');

    this.observe(this, 'TP.sig.DOMClick');
    //this.observe(this, 'TP.sig.DOMMouseMove');
    //this.observe(this, 'TP.sig.DOMMouseOver');

    this.observe(TP.byOID('SherpaHUD'), 'HiddenChange');

    var dragEnter,
        dragLeave,
        dragOver,
        drop,
        
        natThis;

    natThis = this.getNativeNode();

    dragEnter = function(evt) {
        evt.preventDefault();
        TP.elementGetStyleObj(this).borderWidth = '2px';
    };

    dragLeave = function(evt) {
        evt.preventDefault();
        TP.elementGetStyleObj(this).borderWidth = '1px';
    };

    dragOver = function(evt) {
        evt.preventDefault();
    };

    var haloThis = this;

    drop = function(evt) {
        var obj,
            targetTPElem;

        evt.stopPropagation();
        TP.elementGetStyleObj(this).borderWidth = '1px';

        if (TP.isValid(obj = TP.$$DNDObj) &&
            TP.isValid(targetTPElem = haloThis.get('currentTargetTPElem'))) {
            targetTPElem.setProcessedContent(TP.json(obj));
        }
    };

    natThis.addEventListener('dragenter', dragEnter, false);
    natThis.addEventListener('dragleave', dragLeave, false);
    natThis.addEventListener('dragover', dragOver, false);
    natThis.addEventListener('drop', drop, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('setHidden',
function(beHidden) {

    /**
     * @name setHidden
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    if (this.get('hidden') === beHidden) {
        return this;
    }

    if (TP.isTrue(beHidden)) {
        this.ignore(this, 'TP.sig.DOMMouseMove');
        this.ignore(this, 'TP.sig.DOMMouseOver');
        this.ignore(this, 'TP.sig.DOMMouseOut');

        this.ignore(this, 'TP.sig.DOMMouseWheel');
    } else {
        this.observe(this, 'TP.sig.DOMMouseMove');
        this.observe(this, 'TP.sig.DOMMouseOver');
        this.observe(this, 'TP.sig.DOMMouseOut');

        this.observe(this, 'TP.sig.DOMMouseWheel');
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('blur',
function() {

    /**
     * @name blur
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    this.moveAndSizeToTarget(null);

    TP.byOID('SherpaConsoleService').get('model').setVariable('HALO', null);
    this.set('currentTargetTPElem', null);

    this.signal('TP.sig.HaloDidBlur');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('focusOn',
function(target) {

    /**
     * @name focusOn
     * @param {TP.core.Node} target 
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    if (TP.isKindOf(target, TP.core.ElementNode)) {
        this.moveAndSizeToTarget(target);

        TP.byOID('SherpaConsoleService').get('model').setVariable(
                                                        'HALO', target);
        this.set('currentTargetTPElem', target);
    } else if (TP.isValid(this.get('currentTargetTPElem'))) {
        this.blur();
    } else {
        //  No existing target
    }

    this.signal('TP.sig.HaloDidFocus');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('handleSherpaHUDHiddenChange',
function(aSignal) {

    /**
     * @name handleHiddenChange
     */

    this.set('hidden', true);
    this.set('haloRect', null);

    return this;
});

//  ------------------------------------------------------------------------
//  Mouse Handling
//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('handleTP_sig_DOMClick',
function(aSignal) {

    /**
     * @name handleTP_sig_DOMClick
     * @synopsis Handles notifications of mouse click events.
     * @param {DOMClick} aSignal The TIBET signal which triggered this method.
     */

    var sigTarget,
        sigSuffix,

        editorType,
        methodName;

    if (aSignal.getShiftKey()) {
        aSignal.preventDefault();
        aSignal.stopPropagation();

        this.changeHaloFocus(aSignal);

        return;
    }

    sigTarget = aSignal.getTarget();

    if (sigTarget === this.getNativeNode() || this.contains(sigTarget)) {

        sigSuffix = TP.elementGetAttribute(sigTarget, 'id', true);
        sigSuffix = sigSuffix.slice(sigSuffix.indexOf('-') + 1);

        if (TP.isValid(sigSuffix)) {
            methodName = 'halo' + sigSuffix + 'Click';
            if (TP.isType(editorType = TP.wrap(sigTarget).getUIEditorType()) &&
                    TP.canInvoke(editorType, methodName)) {

                editorType[methodName](
                        this.get('currentTargetTPElem'), TP.wrap(sigTarget));
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('handleDOMMouseMove',
function(aSignal) {

    /**
     * @name handleDOMMouseMove
     * @param {TP.sig.DOMMouseMove} aSignal 
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    this.showHaloCorner(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('handleDOMMouseOver',
function(aSignal) {

    /**
     * @name handleDOMMouseOver
     * @param {TP.sig.DOMMouseOver} aSignal 
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    this.showHaloCorner(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('handleDOMMouseOut',
function(aSignal) {

    /**
     * @name handleDOMMouseOut
     * @param {TP.sig.DOMMouseOut} aSignal 
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    return this;

    this.hideHaloCorner();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('handleDOMMouseWheel',
function(aSignal) {

    /**
     * @name handleDOMMouseWheel
     * @param {TP.sig.DOMMouseWheel} aSignal 
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    //TP.info('got to TP.sherpa.halo::handleDOMMouseWheel', TP.LOG, arguments);
    return;

    var currentTargetTPElem,
        newTargetTPElem;

    if (aSignal.getWheelDelta().abs() > 0.5) {
        currentTargetTPElem = this.get('currentTargetTPElem');

        if (aSignal.getDirection() === TP.UP) {
            newTargetTPElem = currentTargetTPElem.getHaloParent(this);
        } else {
            newTargetTPElem = currentTargetTPElem.getNextHaloChild(
                this, aSignal);
        }

        if (TP.notValid(newTargetTPElem)) {
            return;
        }

        if (TP.isKindOf(newTargetTPElem, TP.core.ElementNode) &&
            (newTargetTPElem !== currentTargetTPElem)) {
            this.focusOn(newTargetTPElem);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('hideHaloCorner',
function() {

    var lastCorner,
        elem;

    lastCorner = this.get('lastCorner');

    if (TP.isElement(elem = TP.byId('haloCorner-' + lastCorner,
            this.get('$document')))) {
        TP.elementHide(elem);
    }

    //  Reset it to null
    this.set('lastCorner', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('moveAndSizeToTarget',
function(aTarget) {

    /**
     * @name moveAndSizeToTarget
     * @param {undefined} aTarget
 
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
 
     * @todo
     */

    var existingTPTarget,
        theRect;

    existingTPTarget = this.get('currentTargetTPElem');

    if (TP.notValid(aTarget)) {
        //  No new target

        if (TP.notValid(existingTPTarget)) {
            //  No existing target either - bail out.
            return;
        }

        //  Grab rect for existing target and adjust to be in halves
        theRect = existingTPTarget.getHaloRect(this);
        theRect = TP.rtc(
            theRect.getX() + (theRect.getWidth() / 2),
            theRect.getY() + (theRect.getHeight() / 2),
            0,
            0);
    } else {
        theRect = aTarget.getHaloRect(this);
    }

    theRect.setHeight(theRect.getHeight().min(25));

    if (TP.notValid(aTarget) && TP.notValid(existingTPTarget)) {
        this.set('hidden', true);

        this.set('haloRect', null);
    } else {
        this.setPagePositionAndSize(theRect);
        this.set('hidden', false);

        this.set('haloRect', theRect);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('showHaloCorner',
function(aSignal) {

    /**
     * @name showHaloCorner
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
     * @todo
     */

    var angle,
        corner,
        lastCorner,
        elem;

    if (TP.isFalse(this.get('open'))) {
        return this;
    }

    angle = TP.computeAngleFromEnds(
        this.get('haloRect').getCenterPoint(),
        aSignal.getEvent());

    corner = TP.computeCompassCorner(angle, 8);

    lastCorner = this.get('lastCorner');

    if (corner !== lastCorner) {
        if (TP.isElement(elem = TP.byId('haloCorner-' + lastCorner,
                this.get('$document')))) {
            TP.elementHide(elem);
        }

        if (TP.isElement(elem = TP.byId('haloCorner-' + corner,
                this.get('$document')))) {
            TP.elementShow(elem);
        }
    }

    this.set('lastCorner', corner);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('changeHaloFocus',
function(aSignal) {

    /**
     * @name changeHaloFocus
     * @returns {TP.sherpa.halo} The receiver.
     * @abstract
 
     * @todo
     */

    var sigTarget,
        targetWin,
        existingTPTarget,
        targetTPElem;

    sigTarget = aSignal.getTarget();

    //  Compute the 'target window' - that is, the window that the event's
    //  target is in... this may be different than the signals' window (weird, I
    //  know).
    if (TP.isValid(this.get('currentTargetTPElem'))) {
        targetWin = this.get('currentTargetTPElem').getNativeWindow();
    }

    existingTPTarget = this.get('currentTargetTPElem');

    //  If:
    //      a) We have an existing target
    //      b) AND: The user clicked the LEFT button
    //      c) AND: the existing target can blur
    if (TP.isValid(existingTPTarget) &&
        aSignal.getButton() === TP.LEFT &&
        existingTPTarget.haloCanBlur(this, aSignal)) {

            this.blur();
            this.set('hidden', true);

    } else if (aSignal.getButton() === TP.RIGHT) {

        if (TP.isValid(existingTPTarget) &&
                this.getNativeNode() === sigTarget) {

            targetTPElem = existingTPTarget.getHaloParent(this);

            if (targetTPElem !== existingTPTarget &&
                targetTPElem.haloCanFocus(this, aSignal)) {

                this.focusOn(targetTPElem);
            }
        } else {
            targetTPElem = TP.wrap(sigTarget);

            if (targetTPElem.haloCanFocus(this, aSignal)) {

                //  This will cause the halo to move and size to a new target.
                this.focusOn(targetTPElem);
                this.set('hidden', false);
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('haloCanBlur',
function(aHalo, aSignal) {

    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.halo.Inst.defineMethod('haloCanFocus',
function(aHalo, aSignal) {

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
