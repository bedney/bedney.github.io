//  ========================================================================
/*
NAME:   xctrls_richtext.js
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
 * @type {TP.xctrls.richtext}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.defineSubtype('richtext');

TP.xctrls.richtext.shouldRegisterInstances(true);

//  Events:
//      xctrls-richtext-selected

//  A URI to the 'frame file' - the file that will be loaded into the
//  iframe that this type builds to hold the custom control.
TP.xctrls.FramedElement.set('frameFileURI',
        TP.uc('~lib_src/xctrls/xctrls_richtext/xctrls_richtext_stub.html'));

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.xctrls.richtext.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @name cmdGetContent
     * @synopsis Invoked by the TSH when the receiver is the data source for a
     *     command sequence which is piping data from the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var obj,
        output;

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        return aRequest.fail(TP.FAILURE, 'No command instance.');
    }

    if (TP.notValid(output = obj.getValue())) {
        return aRequest.fail(TP.FAILURE, 'No content.');
    } else {
        output = TP.join('<span xmlns="', TP.w3.Xmlns.XHTML, '">',
                            output,
                            '</span>');

        return aRequest.complete(output);
    }
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @name cmdSetContent
     * @synopsis Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    var input,
        obj,
        content;

    if (TP.isEmpty(input = aRequest.stdin())) {
        return aRequest.fail(TP.FAILURE, 'No content.');
    }

    if (TP.notValid(obj = aRequest.at('cmdInstance'))) {
        return aRequest.fail(TP.FAILURE, 'No command instance.');
    }

    //  stdin is always an Array, so we want the first item.
    content = input.at(0);

    obj.setContent(content, aRequest);

    aRequest.complete();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineAttribute('$oldSelectionLength');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('configure',
function() {

    /**
     * @name configure
     * @returns {TP.xctrls.richtext} The receiver.
     * @abstract
     * @todo
     */

    var editorInst;

    editorInst = this.$getEditorInstance();

    editorInst.onNodeChange.add(
            function(ed, ctrlManager, elem, isCollapsed, otherObj) {

                this.selectionChangeHandler(ed, ctrlManager, elem,
                                            isCollapsed, otherObj);
            }.bind(this));

    //  Seems a bit funky, but it works... should we check to make sure the
    //  'save' plugin is loaded?
    editorInst.settings.save_onsavecallback =
            function(editor) {

                this.signal('TP.sig.ContentSave', null, this.getValue());
            }.bind(this);

    this.refresh();

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('focus',
function() {

    /**
     * @name focus
     * @synopsis Focuses the receiver for keyboard input.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return this.$getEditorInstance().getContent();
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('$getEditorInstance',
function() {

    /**
     * @name $getEditorInstance
     * @synopsis Returns the internal TinyMCE editor instance.
     * @returns {Object} The internal TinyMCE editor instance.
     */

    return this.get('tpIFrame').get('tinyMCE').activeEditor;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('refresh',
function(aSignal) {

    /**
     * @name refresh
     * @synopsis Updates the receiver to reflect the current value of any data
     *     binding it may have. If the signal argument's payload specified a
     *     'deep' refresh then descendant elements are also updated.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action. This signal should include a key of 'deep' and a value of
     *     true to cause a deep refresh that updates all nodes.
     * @todo
     */

    /*
    var xml;

    xml = this.getBoundContent();

    this.setContent(TP.str(xml));
    */

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('focus',
function() {

    /**
     * @name focus
     * @synopsis Focuses the receiver for keyboard input.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('selectionChangeHandler',
function(editorID, ctrlManager, elem, isCollapsed, otherObj) {

    /**
     * @name selectionChangeHandler
     * @param {undefined} editorID
     * @param {undefined} ctrlManager
     * @param {undefined} elem
     * @param {undefined} isCollapsed
     * @param {undefined} otherObj
     * @returns {TP.xctrls.richtext} The receiver.
     * @abstract
     * @todo
     */

    var oldLength,
        newLength;

    oldLength = TP.ifInvalid(this.$get('$oldSelectionLength'), 0);
    newLength = this.getSelection().length;

    if (oldLength !== newLength) {
        this.$changed('selection', TP.CREATE);
    }

    //  Set the old selection length, but don't broadcast a 'change' signal
    //  for this.
    this.$set('$oldSelectionLength', newLength, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    this.$getEditorInstance().setContent(aValue);

    return this;
});

//  ------------------------------------------------------------------------
//  PubSub sharing
//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('handleXMPPPubsubEventInput',
function(aSignal) {

    /**
     * @name handleXMPPPubsubEventInput
     * @param {undefined} aSignal
     * @returns {TP.xctrls.richtext} The receiver.
     * @abstract
     * @todo
     */

    var firstItem,
        itemContent;

    //  The node payload is a TP.lang.Hash that has a 'node' slot that
    //  contains an TP.xmpp.Message node. This message node contains an XMPP
    //  pubsub 'event' node which contains 1...n 'item' elements. Here we
    //  just go after the first one.
    firstItem = aSignal.getPayload().at('node').getNamedDescendant('item');
    itemContent = firstItem.firstChild;

    this.setContent(TP.str(itemContent));
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('publishContent',
function(publishName) {

    /**
     * @name publishContent
     * @param {undefined} publishName
     * @returns {undefined}
     * @abstract
     * @todo
     */

    var payload,

        requestParams,
        msgReq;

    if (TP.isEmpty(publishName)) {
        return;
    }

    payload = TP.elem(
                TP.join('<span xmlns="', TP.w3.Xmlns.XHTML, '">',
                        this.getValue(),
                        '</span>'));

    requestParams = TP.hc(
        'action', 'publish',
        'pubsubServiceJID', TP.xmpp.JID.construct('pubsub.localhost'),
        'nodeID', '/home/localhost/testrat/' + publishName,
        'payload', payload);

    msgReq = TP.sig.XMPPRequest.construct(requestParams);
    msgReq.defineMethod(
        'handleRequestSucceeded',
function(aResponse) {

            TP.log(aResponse.getResponseText(), TP.LOG, arguments);
});

    msgReq.defineMethod(
        'handleRequestFailed',
function(aResponse) {

            TP.ifError() ?
                TP.error(aResponse.getResponseText(),
                            TP.LOG,
                            arguments) : 0;
});

    msgReq.fire();
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('shouldShare',
function(shareFlag, shareName) {

    /**
     * @name shouldShare
     * @param {undefined} shareFlag
     * @param {undefined} shareName
     * @returns {TP.xctrls.richtext} The receiver.
     * @abstract
     * @todo
     */

    var requestParams,
        msgReq;

    if (TP.isEmpty(shareName)) {
        return;
    }

    //  First, if the shareFlag is false, then we want to unsubscribe.
    if (TP.isFalse(shareFlag)) {
        requestParams = TP.hc(
            'id', 'unsubscribe1',
            'action', 'unsubscribe',
            'pubsubServiceJID', TP.xmpp.JID.construct('pubsub.localhost'),
            'nodeID', '/home/localhost/testrat/' + shareName);

        this.ignore(null, 'TP.sig.XMPPPubsubEventInput');
    } else {
        //  Otherwise, we want to subscribe.
        requestParams = TP.hc(
            'action', 'subscribe',
            'pubsubServiceJID', TP.xmpp.JID.construct('pubsub.localhost'),
            'nodeID', '/home/localhost/testrat/' + shareName);

        this.observe(null, 'TP.sig.XMPPPubsubEventInput');
    }

    msgReq = TP.sig.XMPPRequest.construct(requestParams);
    msgReq.defineMethod(
        'handleRequestSucceeded',
function(aResponse) {

            TP.log(aResponse.getResponseText(), TP.LOG, arguments);
});

    msgReq.defineMethod(
        'handleRequestFailed',
function(aResponse) {

            TP.ifError() ?
                TP.error(aResponse.getResponseText(),
                            TP.LOG,
                            arguments) : 0;
});

    msgReq.fire();

    return this;
});

//  ------------------------------------------------------------------------
//  textUtilities methods
//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('clearValue',
function() {

    /**
     * @name clearValue
     * @synopsis Clears the entire value of the receiver.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    var oldVal;

    oldVal = this.$getEditorInstance().getContent();

    this.$getEditorInstance().setContent('');

    this.changed('value', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('clearSelection',
function() {

    /**
     * @name clearSelection
     * @returns {undefined}
     * @abstract
     * @todo
     */

    var oldVal;

    oldVal = this.getSelection();

    this.$getEditorInstance().selection.setContent('');

    this.changed('selection', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('collapseSelection',
function(toStart) {

    /**
     * @name collapseSelection
     * @synopsis Collapse the current selection to one end or the other.
     * @param {Boolean} toStart Whether or not to collapse the selection to the
     *     start of itself. This defaults to false (i.e. the selection will
     *     collapse to the end).
     * @returns {TP.xctrls.richtext} The receiver.
     * @todo
     */

    this.$getEditorInstance().selection.collapse(toStart);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('getSelection',
function() {

    /**
     * @name getSelection
     * @synopsis Returns the currently selected text.
     * @returns {String} The currently selected text.
     */

    return this.$getEditorInstance().selection.getContent();
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('getSelectionEnd',
function() {

    /**
     * @name getSelectionEnd
     * @synopsis Returns the ending index of the currently selected text.
     * @returns {Number} The ending index of the current selection.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('getSelectionStart',
function() {

    /**
     * @name getSelectionStart
     * @synopsis Returns the starting index of the currently selected text.
     * @returns {Number} The starting index of the current selection.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('insertAfterSelection',
function(aText) {

    /**
     * @name insertAfterSelection
     * @synopsis Inserts the supplied text after the current selection.
     * @param {String} aText The text to insert.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    TP.documentInsertAfterSelection(this.$getEditorInstance().getDoc(),
                                    aText);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('insertBeforeSelection',
function(aText) {

    /**
     * @name insertBeforeSelection
     * @synopsis Inserts the supplied text before the current selection.
     * @param {String} aText The text to insert before the current selection.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    TP.documentInsertBeforeSelection(this.$getEditorInstance().getDoc(),
                                        aText);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('replaceSelection',
function(aText) {

    /**
     * @name replaceSelection
     * @param {undefined} aText
     * @returns {undefined}
     * @abstract
     * @todo
     */

    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.$getEditorInstance().selection.setContent(aText);

    newVal = this.getSelection();

    this.changed('selection', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('selectFromTo',
function(aStartIndex, anEndIndex) {

    /**
     * @name selectFromTo
     * @synopsis Selects the contents of the receiver from the supplied starting
     *     index to the supplied ending index.
     * @param {Number} aStartIndex The starting index.
     * @param {Number} aEndIndex The ending index.
     * @returns {TP.xctrls.richtext} The receiver.
     * @todo
     */

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('setCursorToEnd',
function() {

    /**
     * @name setCursorToEnd
     * @synopsis Sets the cursor to the end position of the receiver.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('setCursorToStart',
function() {

    /**
     * @name setCursorToStart
     * @synopsis Sets the cursor to the start position of the receiver.
     * @returns {TP.xctrls.richtext} The receiver.
     */

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('setSelection',
function(aText) {

    /**
     * @name setSelection
     * @param {undefined} aText
     * @returns {undefined}
     * @abstract
     * @todo
     */

    //  This method is just an alias for replaceSelection()
    this.replaceSelection(aText);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.richtext.Inst.defineMethod('wrapSelection',
function(beforeText, afterText) {

    /**
     * @name wrapSelection
     * @synopsis Wraps the current selection with the beforeText and afterText.
     * @param {String} beforeText The text to insert before the selection.
     * @param {String} afterText The text to insert after the selection.
     * @returns {TP.xctrls.richtext} The receiver.
     * @todo
     */

    this.replaceSelection(TP.join(beforeText,
                            this.getSelection(),
                            afterText));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
