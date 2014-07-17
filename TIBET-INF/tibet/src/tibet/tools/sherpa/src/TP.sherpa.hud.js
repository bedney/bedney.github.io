//  ========================================================================
/*
NAME:   TP.sherpa.hud.js
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
 * @type {TP.sherpa.hud}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:hud');

TP.sherpa.hud.shouldRegisterInstances(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.hud.Type.defineMethod('tshAwakenDOM',
function(aRequest) {

    /**
     * @name tshAwakenDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Number} The TP.DESCEND flag, telling the system to descend into
     *     the children of this element.
     */

    var elem;

    if (TP.isElement(elem = aRequest.at('cmdNode'))) {
        this.addStylesheetTo(TP.nodeGetDocument(elem));
    }

    return TP.DESCEND;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('setup',
function() {

    /**
     * @name setup
     */

    var doc,
        triggerElement;

    doc = this.getNativeDocument();

    //  Create and overlay a small version of the TIBET image for access.
    triggerElement = TP.documentCreateElement(
                            doc, 'div', TP.w3.Xmlns.XHTML);

    TP.elementSetAttribute(triggerElement, 'id', 'triggerHUD');

    TP.nodeAppendChild(TP.documentGetBody(doc), triggerElement);

    (function(aSignal) {

            this.toggle('hidden');

        }).bind(this).observe(TP.wrap(triggerElement), 'TP.sig.DOMClick');

    /*
    var dragSource,
        dragStart,
        dragEnd,

        dropTarget,
        dragOver,
        dragLeave;

    dragSource = TP.byCSS('.dragSource')[0];

    dragStart = function(evt) {
        console.log('started it');
        evt.dataTransfer.setData('Text', 'Foofy');
        return true;
    };
    dragSource.addEventListener('dragstart', dragStart, false);

    dragEnd = function(evt) {
        console.log('ended it');
        return true;
    };
    dragSource.addEventListener('dragend', dragEnd, false);
    */

    var dropTargets,
        dragEnter,
        dragLeave,
        dragOver,
        drop,
        
        natThis;

    dropTargets = TP.byCSS('sherpa|huddrawer');

    dragEnter = function(evt) {
        //var dt;

        evt.preventDefault();
        //TP.elementGetStyleObj(this).backgroundColor = 'blue';

        //dt = evt.dataTransfer;
        //dt.dropEffect = 'move';
    };

    dragLeave = function(evt) {
        evt.preventDefault();
        //TP.elementGetStyleObj(this).backgroundColor = '';
    };

    dragOver = function(evt) {
        evt.preventDefault();
        //console.log('drag over');
    };

    var hudThis = this;

    drop = function(evt) {
        evt.stopPropagation();
        console.log('dropped: ' + evt.target);
        hudThis.makeInspectorForAt(TP.$$DNDObj, TP.pc(TP.eventGetPageXY(evt)));
    };

    natThis = this.getNativeNode();

    dropTargets.push(natThis);
    dropTargets.perform(
                function(anElem) {
                    //anElem.addEventListener('dragenter', dragEnter, false);
                    //anElem.addEventListener('dragleave', dragLeave, false);
                    anElem.addEventListener('dragover', dragOver, false);
                    anElem.addEventListener('drop', drop, false);
                });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('makeInspectorForAt',
function(anObject, aPoint) {

    /**
     * @name setHidden
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    var testTile,

        data;

    testTile = TP.byOID('Sherpa').makeTile(TP.genID('inspector_tile'));
    testTile.toggle('hidden');

    testTile.setPagePositionAndSize(
                TP.rtc(aPoint.getX(), aPoint.getY(), 200, 200));

    if (TP.isValid(data = anObject)) {
        if (TP.isValid(data.get('data'))) {
            data = data.get('data');
        }
    }

    testTile.setHeader(TP.id(data));

/*
    data = TP.format(
                data,
                TP.sys.cfg('sherpa.default_format', 'sherpa:pp').asType());
    testTile.setProcessedContent(data);
*/

    var CodeMirror = TP.byOID('SherpaConsole').get('textInput').$getEditorConstructor();

    var content = '';
    CodeMirror.runMode(
            TP.json(data),
            TP.JSON_ENCODED,
            function (text, style) {
                if (style) {
                    content += '<span class="cm-' + style + '">' +
                             text +
                             '</span>';
                } else {
                    content += text;
                }
            });

    content = content.replace('\n', '<br/>');
    content = '<span xmlns="' + TP.w3.Xmlns.XHTML + '" class="cm-s-midnight CodeMirror">' + content + '</span>';

    testTile.setProcessedContent(content);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('setHidden',
function(beHidden) {

    /**
     * @name setHidden
     * @abstract
     * @returns {TP.sherpa.hud} The receiver.
     */

    if (this.get('hidden') === beHidden) {
        return this;
    }

    TP.byOID('SherpaConsole').set('hidden', beHidden);

    if (TP.isTrue(beHidden)) {
        this.hideAllHUDDrawers();

        this.getNativeWindow().focus();
    } else {
        this.showAllHUDDrawers();
    
        TP.byOID('SherpaConsole').focusInput();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('hideAllHUDDrawers',
function() {

    /**
     * @name hideAllHUDDrawers
     * @returns {TP.sherpa.hud} The receiver.
     * @abstract
     * @todo
     */

    var hudDrawers;

    hudDrawers = TP.wrap(TP.byCSS('sherpa|huddrawer'));

    hudDrawers.perform(
        function(aHUDDrawer) {
            aHUDDrawer.setHidden(true);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('showAllHUDDrawers',
function() {

    /**
     * @name showAllHUDDrawers
     * @returns {TP.sherpa.hud} The receiver.
     * @abstract
     * @todo
     */

    var hudDrawers;

    hudDrawers = TP.wrap(TP.byCSS('sherpa|huddrawer'));

    hudDrawers.perform(
        function(aHUDDrawer) {
            aHUDDrawer.setHidden(false);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('haloCanBlur',
function(aHalo, aSignal) {

    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.hud.Inst.defineMethod('haloCanFocus',
function(aHalo, aSignal) {

    return false;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:huddrawer');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
