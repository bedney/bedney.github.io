//  ========================================================================
/*
NAME:   html_FormsModuleNodes.js
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
//  ------------------------------------------------------------------------

/* These node type have the following hierarchy

    - '*' indicates abstract supertype
    - (parens) indicate a trait

*   TP.html.Element
*       TP.html.Attrs
            TP.html.option
            TP.html.optgroup
            TP.html.fieldset
            TP.html.label
            TP.html.form
*           TP.html.Aligned
                TP.html.legend
*           TP.html.Focused
                TP.html.select
                TP.html.textarea (TP.html.textUtilities)
*               TP.html.input
                    TP.html.inputImage
                    TP.html.inputHidden
*                   TP.html.inputVisible
*                       TP.html.inputClickable
*                           TP.html.inputCheckable
                                TP.html.inputCheckbox
                                TP.html.inputRadio
                            TP.html.button
                            TP.html.inputButton
                            TP.html.inputColor
                            TP.html.inputDate
                            TP.html.inputDateTime
                            TP.html.inputDateTimeLocal
                            TP.html.inputMonth
                            TP.html.inputRange
                            TP.html.inputReset
                            TP.html.inputSubmit
                            TP.html.inputTime
                            TP.html.inputWeek
*                       TP.html.inputSelectable
                            TP.html.inputEmail (TP.html.textUtilities)
                            TP.html.inputFile
                            TP.html.inputNumber (TP.html.textUtilities)
                            TP.html.inputPassword (TP.html.textUtilities)
                            TP.html.inputSearch (TP.html.textUtilities)
                            TP.html.inputTel (TP.html.textUtilities)
                            TP.html.inputText (TP.html.textUtilities)
                            TP.html.inputUrl (TP.html.textUtilities)
*/

//  ========================================================================
//  TP.html.fieldset
//  ========================================================================

/**
 * @type {TP.html.fieldset}
 * @synopsis 'fieldset' tag. Group form fields.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('fieldset');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.fieldset.Inst.defineMethod('refresh',
function(aSignal) {

    /**
     * @name refresh
     * @synopsis Updates the receiver to reflect the current value of any data
     *     binding it may have. If the signal argument's payload specified a
     *     'deep' refresh then descendant elements are also updated. In this
     *     case that means making sure that its children are properly updated
     *     when the fieldset is being used as a way to create an enclosing
     *     binding context.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action. This signal should include a key of 'deep' and a value of
     *     true to cause a deep refresh that updates all nodes.
     * @todo
     */

    if (TP.isTrue(aSignal.at('deep'))) {
        //  TODO:   fix this
        //return this.$refreshBoundRoots(aSignal);
    }

    return;
});

//  ========================================================================
//  TP.html.textUtilities
//  ========================================================================

/**
 * @type {TP.html.textUtilities}
 * @synopsis A utility type that is mixed into elements that can manipulate
 *     their text value.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('html:textUtilities');
TP.html.textUtilities.addTraitsFrom(TP.html.Element);

TP.html.textUtilities.Type.resolveTraits(
        TP.ac('tshCompile', 'canConnectFrom', 'canConnectTo',
                'isValidConnectorDest', 'isValidConnectorSource'),
        TP.html.Element);

TP.html.textUtilities.Inst.resolveTraits(
        TP.ac('getDisplayValue', 'setDisplayValue', 'setHidden'),
        TP.html.Element);

//  can't construct concrete instances of this
TP.html.textUtilities.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('clearValue',
function() {

    /**
     * @name clearValue
     * @synopsis Clears the entire value of the receiver.
     * @returns {TP.html.textUtilities} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node,

        oldVal;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    oldVal = node.value;
    node.value = '';

    this.changed('value', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('clearSelection',
function() {

    /**
     * @name clearSelection
     * @synopsis Clears the currently selected text.
     * @returns {TP.html.textUtilities} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node,
        oldVal;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    oldVal = this.getSelection();

    TP.textElementReplaceSelection(node, '');

    this.changed('selection', TP.DELETE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, ''));

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('collapseSelection',
function(toStart) {

    /**
     * @name collapseSelection
     * @synopsis Collapse the current selection to one end or the other.
     * @param {Boolean} toStart Whether or not to collapse the selection to the
     *     start of itself. This defaults to false (i.e. the selection will
     *     collapse to the end).
     * @returns {TP.html.textUtilities} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    if (TP.boot.isUA('IE')) {
        //  Nasty code to get the current indices of the selection in IE,
        //  which is going away in IE9... so why bother?
        return this;
    }

    if (toStart) {
        node.setSelectionRange(node.selectionStart, node.selectionStart);
    } else {
        node.setSelectionRange(node.selectionEnd, node.selectionEnd);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('getSelection',
function() {

    /**
     * @name getSelection
     * @synopsis Returns the currently selected text.
     * @returns {String} The currently selected text.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node,
        sel;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    if (TP.boot.isUA('IE')) {
        if (TP.notValid(sel = this.getNativeDocument().selection)) {
            return '';
        }

        return sel.createRange().text;
    }

    return node.value.substring(node.selectionStart, node.selectionEnd);
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('getSelectionEnd',
function() {

    /**
     * @name getSelectionEnd
     * @synopsis Returns the ending index of the currently selected text.
     * @returns {Number} The ending index of the current selection.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node,

        range,
        rangeDup,

        start,
        end;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    if (TP.boot.isUA('IE')) {
        range = this.getNativeDocument().selection.createRange();

        rangeDup = range.duplicate();
        start = 0 - rangeDup.moveStart('character', -100000) - 1;
        end = start + range.text.length;

        return end;
    }

    return node.selectionEnd;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('getSelectionStart',
function() {

    /**
     * @name getSelectionStart
     * @synopsis Returns the starting index of the currently selected text.
     * @returns {Number} The starting index of the current selection.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node,

        range,
        rangeDup,

        start;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    if (TP.boot.isUA('IE')) {
        range = this.getNativeDocument().selection.createRange();

        rangeDup = range.duplicate();
        start = 0 - rangeDup.moveStart('character', -100000) - 1;

        return start;
    }

    return node.selectionStart;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('getValue',
function() {

    /**
     * @name getValue
     * @synopsis Returns the value of the receiver. This is a synonym for
     *     returning the current display value. If the receiver is a bound
     *     element that value should be in sync (other than differences due to
     *     formatters) with the bound value.
     * @returns {String} The value in string form.
     */

    return this.getDisplayValue();
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('insertAfterSelection',
function(aText) {

    /**
     * @name insertAfterSelection
     * @synopsis Inserts the supplied text after the current selection.
     * @param {String} aText The text to insert after the current selection.
     * @returns {TP.html.textUtilities} The receiver.
     */

    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.replaceSelection(TP.join(oldVal, aText));

    newVal = this.getSelection();

    this.changed('selection', TP.INSERT,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('insertBeforeSelection',
function(aText) {

    /**
     * @name insertBeforeSelection
     * @synopsis Inserts the supplied text before the current selection.
     * @param {String} aText The text to insert before the current selection.
     * @returns {TP.html.textUtilities} The receiver.
     */

    var oldVal,
        newVal;

    oldVal = this.getSelection();

    this.replaceSelection(TP.join(aText, oldVal));

    newVal = this.getSelection();

    this.changed('selection', TP.INSERT,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('replaceSelection',
function(aText) {

    /**
     * @name replaceSelection
     * @synopsis Replaces the current selection with the supplied text.
     * @param {String} aText The text to replace the current selection with.
     * @returns {TP.html.textUtilities} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node,

        oldVal,
        newVal;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    oldVal = this.getSelection();

    TP.textElementReplaceSelection(node, aText);

    newVal = this.getSelection();

    this.changed('selection', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, newVal));

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('selectFromTo',
function(aStartIndex, anEndIndex) {

    /**
     * @name selectFromTo
     * @synopsis Selects the contents of the receiver from the supplied starting
     *     index to the supplied ending index.
     * @param {Number} aStartIndex The starting index.
     * @param {Number} aEndIndex The ending index.
     * @returns {TP.html.textUtilities} The receiver.
     * @todo
     */

    var node,

        range;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    if (TP.boot.isUA('IE')) {
        range = node.createTextRange();
        range.collapse(true);
        range.moveStart('character', aStartIndex);
        range.moveEnd('character', anEndIndex - aStartIndex);
        range.select();

        return this;
    }

    node.setSelectionRange(aStartIndex, anEndIndex);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('setCursorToEnd',
function() {

    /**
     * @name setCursorToEnd
     * @synopsis Sets the cursor to the end position of the receiver.
     * @returns {TP.html.textUtilities} The receiver.
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    try {
        node.focus();
    } catch (e) {
    }

    TP.documentCollapseSelection(this.getNativeDocument());

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('setCursorToStart',
function() {

    /**
     * @name setCursorToStart
     * @synopsis Sets the cursor to the start position of the receiver.
     * @returns {TP.html.textUtilities} The receiver.
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    try {
        node.focus();
    } catch (e) {
    }

    TP.documentCollapseSelection(this.getNativeDocument(), true);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('setValue',
function(aValue, signalFlag) {

    /**
     * @name setValue
     * @synopsis Sets the value of the receiver's node. For a UI element this
     *     method will ensure any display formatters are invoked. NOTE that this
     *     method does not update the receiver's bound value if it's a bound
     *     control. In fact, this method is used in response to a change in the
     *     bound value to update the display value, so this method should avoid
     *     changes to the bound value to avoid recursions.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} signalFlag Should changes be notified. If false changes
     *     are not signaled. Defaults to this.shouldSignalChange().
     * @returns {TP.core.UIElementNode} The receiver.
     * @todo
     */

    var oldVal,
    
        value,
        flag;

    oldVal = this.getValue();

    //  showas is the attribute we use to define formatting pipelines for
    //  the UI controls, so if we have that attribute we have formatting
    if (this.hasAttribute('xctrls:showas')) {
        value = this.$formatValue(aValue, 'xctrls:showas');
    } else {
        value = aValue;
    }

    this.setDisplayValue(value);

    //  signal as needed
    flag = TP.ifInvalid(signalFlag, this.shouldSignalChange());
    if (flag) {
        this.changed('value', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, value));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('setSelection',
function(aText) {

    /**
     * @name setSelection
     * @synopsis Sets the current selection to the supplied text.
     * @param {String} aText The text to set the selection to.
     * @returns {TP.html.textUtilities} The receiver.
     */

    //  This method is just an alias for replaceSelection().
    this.replaceSelection(aText);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.textUtilities.Inst.defineMethod('wrapSelection',
function(beforeText, afterText) {

    /**
     * @name wrapSelection
     * @synopsis Wraps the current selection with the beforeText and afterText.
     * @param {String} beforeText The text to insert before the selection.
     * @param {String} afterText The text to insert after the selection.
     * @returns {TP.html.textUtilities} The receiver.
     * @todo
     */

    return this.replaceSelection(TP.join(beforeText,
                                            this.getSelection(),
                                            afterText));
});

//  ========================================================================
//  TP.html.input
//  ========================================================================

/**
 * @type {TP.html.input}
 * @synopsis INPUT tag. Generic input control.
 * @description NOTE: for TIBET's purposes this particular node type serves as
 *     an abstract supertype from which a number of specialized types descend to
 *     allow custom behavior to be inherited.
 *
 *     Also note that while the actual xhtml DTD doesn't specify intermediate
 *     types we do so here to help maximize reuse. That means we've created
 *     several custom elements such as TP.html.inputClickable or
 *     TP.html.inputCheckable from which the various input subtypes inherit.
 */

//  ------------------------------------------------------------------------

TP.html.Focused.defineSubtype('input');

//  can't construct concrete instances of this
TP.html.input.isAbstract(true);

TP.html.input.set('uriAttrs', TP.ac('src', 'usemap'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('fromArray',
function(anObject, aRequest) {

    /**
     * @name fromArray
     * @synopsis Returns a formatted XML String with the supplied Boolean object
     *     as the content.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     * @todo
     */

    return anObject.as('TP.html.select', aRequest);
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('fromBoolean',
function(anObject, aRequest) {

    /**
     * @name fromBoolean
     * @synopsis Returns a formatted XML String with the supplied Boolean object
     *     as the content.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     * @todo
     */

    var val,
        fieldNum;

    val = TP.str(anObject);

    fieldNum = TP.ifInvalid(aRequest.at('$INDEX'), TP.genID().slice(10));

    return TP.join('<input id="field_',
                    fieldNum,
                    '" type="checkbox" value="', val, '"/>');
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('fromDate',
function(anObject, aRequest) {

    /**
     * @name fromDate
     * @synopsis Returns a formatted XML String with the supplied Date object as
     *     the content.
     * @description The supplied request can contain the following keys and
     *     values that are used in this method:
     *
     *     'escapeContent' Boolean Whether or not to 'escape' the content (i.e.
     *     if it has embedded markup). This defaults to false.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     * @todo
     */

    var val,
        fieldNum;

    if (TP.isTrue(aRequest.at('escapeContent'))) {
        val = TP.xmlLiteralsToEntities(TP.str(anObject));
    } else {
        val = TP.str(anObject);
    }

    fieldNum = TP.ifInvalid(aRequest.at('$INDEX'), TP.genID().slice(10));

    return TP.join('<input id="field_', fieldNum,
                    '" type="text" value="', val, '"/>');
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('fromNumber',
function(anObject, aRequest) {

    /**
     * @name fromNumber
     * @synopsis Returns a formatted XML String with the supplied Number object
     *     as the content.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     * @todo
     */

    var val,
        fieldNum;

    if (TP.isTrue(aRequest.at('escapeContent'))) {
        val = TP.xmlLiteralsToEntities(TP.str(anObject));
    } else {
        val = TP.str(anObject);
    }

    fieldNum = TP.ifInvalid(aRequest.at('$INDEX'), TP.genID().slice(10));

    return TP.join('<input id="field_', fieldNum,
                    '" type="text" value="', val, '"/>');
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('fromString',
function(anObject, aRequest) {

    /**
     * @name fromString
     * @synopsis Returns a formatted XML String with the supplied String object
     *     as the content.
     * @description The supplied request can contain the following keys and
     *     values that are used in this method:
     *
     *     'escapeContent' Boolean Whether or not to 'escape' the content (i.e.
     *     if it has embedded markup). This defaults to false.
     * @param {Boolean} anObject The Object to wrap in the elements.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     containing parameters.
     * @returns {String} The content formatted as markup.
     * @todo
     */

    var val,
        fieldNum;

    if (TP.isTrue(aRequest.at('escapeContent'))) {
        val = TP.xmlLiteralsToEntities(
                        TP.htmlEntitiesToXmlEntities(TP.str(anObject)));
    } else {
        val = TP.str(anObject);
    }

    fieldNum = TP.ifInvalid(aRequest.at('$INDEX'), TP.genID().slice(10));

    return TP.join('<input id="field_', fieldNum,
                    '" type="text" value="', val, '"/>');
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('generateMarkup',
function(anObject, attrStr, itemFormat, shouldAutoWrap, formatArgs, theRequest) {

    /**
     * @name generateMarkup
     * @synopsis Generates markup for the supplied Object using the other
     *     parameters supplied.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {String} attrStr The String containing either the literal
     *     attribute markup or a 'template invocation' that can be used inside
     *     of a template.
     * @param {String} itemFormat The name of an 'item format', either a tag
     *     name (which defaults to the 'item tag name' of this type) or some
     *     other format type which can be applied to this type.
     * @param {Boolean} shouldAutoWrap Whether or not the markup generation
     *     machinery should 'autowrap' items of the supplied object (each item
     *     in an Array or each key/value pair in an Object).
     * @param {TP.lang.Hash} formatArgs The 'formatting arguments' used by this
     *     machinery to generate item markup.
     * @param {TP.sig.Request|TP.lang.Hash} theRequest An optional object
     *     containing parameters.
     * @returns {String} The markup generated by taking the supplied Object and
     *     iterating over its items.
     * @todo
     */

    var tagName,
        template,
        str;

    tagName = this.getTagName();

    //  We use the abstract 'TP.html.input' type here for 'item formatting'.
    //  It will taste the object its receiving and return the 'correct
    //  default markup' based on that.

    if (TP.isArray(anObject)) {
        template = TP.join(
                    '<label for="field_{{$INDEX}}">',
                    'Field #{{$INDEX}}:',
                    '</label>',
                    '{{%%TP.html.input}}');
    } else {
        //  Otherwise, the object that will be handed to the iteration
        //  mechanism will be [key,value] pairs, so we can use that fact
        //  to generate item tags around each one.
        template = TP.join(
                    '<label for="field_{{$INDEX}}">',
                    '{{0}}:',
                    '</label>',
                    '{{1%%TP.html.input}}');
    }

    //  Perform the transformation.
    str = template.transform(anObject, theRequest);

    return str;
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('shouldAutoWrapItems',
function(anObject, formatArgs) {

    /**
     * @name shouldAutoWrapItems
     * @synopsis Whether or not our fromArray() / fromObject() methods
     *     'auto-wrap items'. See those methods for more information.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.lang.Hash} formatArgs An optional object containing
     *     parameters.
     * @returns {Boolean} Whether or not we automatically wrap items.
     * @todo
     */

    if (TP.isBoolean(formatArgs.at('autowrap'))) {
        return formatArgs.at('autowrap');
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('getConcreteType',
function(aNodeOrId) {

    /**
     * @name getConcreteType
     * @synopsis Returns the subtype to use for the node provided. Note that for
     *     TP.html.input elements the specific type returned is based on the
     *     value of the type attribute.
     * @param {Node|String} aNodeOrId The native node to wrap or an ID used to
     *     locate it.
     * @returns {TP.lang.RootObject.<TP.html.input>} A TP.html.input subtype
     *     type object.
     */

    var inputType,
        typeName;

    if (TP.isString(aNodeOrId)) {
        return TP.byOID(aNodeOrId);
    }

    //  Default the inputType to 'text' if its not present, which is what
    //  most browsers do (i.e. if the author leaves of 'type="..."')
    if (TP.isFalse(inputType = TP.elementGetAttribute(aNodeOrId, 'type'))) {
        inputType = 'text';
    }

    //  TP.html.form contains a map of the native element 'types'
    //  to node component types for those various types.
    typeName = TP.html.form.NODE_TYPE_NAMES.at(inputType);

    return typeName.asType();
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.input.Type.defineMethod('handlePeerTP_sig_DOMChange',
function(aTargetElem, anEvent) {

    /**
     * @name handlePeerTP_sig_DOMChange
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @raises TP.sig.InvalidNode
     * @returns {TP.html.input} The receiver.
     * @abstract
     * @todo
     */

    var tpElem;

    tpElem = TP.wrap(aTargetElem);
    //tpElem.setBoundOutput(tpElem.getValue());
    if (TP.isValid(tpElem) && tpElem.shouldSignalChange()) {
        tpElem.changed('value', TP.UPDATE);
    }
});

//  ------------------------------------------------------------------------

TP.html.input.Inst.defineMethod('isSingleValued',
function() {

    /**
     * @name isSingleValued
     * @synopsis Returns true if the receiver deals with single values.
     * @description See the TP.core.Node's 'isScalarValue()' instance method for
     *     more information.
     * @returns {Boolean} True when single valued.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.html.input.Inst.defineMethod('isScalarValued',
function() {

    /**
     * @name isScalarValued
     * @synopsis Returns true if the receiver deals with scalar values.
     * @description See the TP.core.Node's 'isScalarValue()' instance method for
     *     more information.
     * @returns {Boolean} For input types, this returns true.
     */

    return true;
});

//  ========================================================================
//  TP.html.inputVisible
//  ========================================================================

/**
 * @type {TP.html.inputVisible}
 * @synopsis Common functionality for those input nodes which have a visible
 *     representation.
 */

//  ------------------------------------------------------------------------

//  visible ones
TP.html.input.defineSubtype('inputVisible');

//  can't construct concrete instances of this
TP.html.inputVisible.isAbstract(true);

//  ========================================================================
//  TP.html.inputClickable
//  ========================================================================

/**
 * @type {TP.html.inputClickable}
 * @synopsis Common supertype for nodes that can be clicked with the mouse. This
 *     includes buttons, checkboxes, radio items, etc.
 */

//  ------------------------------------------------------------------------

//  buttons
TP.html.inputVisible.defineSubtype('inputClickable');

//  can't construct concrete instances of this
TP.html.inputClickable.isAbstract(true);

TP.backstop(TP.ac('click'), TP.html.inputClickable.getInstPrototype());

//  ------------------------------------------------------------------------

TP.html.inputClickable.Inst.defineMethod('disable',
function() {

    /**
     * @name disable
     * @synopsis Disables the control using the standard disabled attribute.
     * @returns {TP.html.inputClickable} The receiver.
     */

    this.setAttribute('disabled', 'true');

    return this;
});

//  ------------------------------------------------------------------------

TP.html.inputClickable.Inst.defineMethod('enable',
function() {

    /**
     * @name enable
     * @synopsis Enables the control by removing any disabled attribute.
     * @returns {TP.html.inputClickable} The receiver.
     */

    this.removeAttribute('disabled');

    return this;
});

//  ========================================================================
//  TP.html.inputCheckable
//  ========================================================================

/**
 * @type {TP.html.inputCheckable}
 * @synopsis Represents input nodes that can be 'checked' in some form. This
 *     includes checkboxes and radio items.
 */

//  ------------------------------------------------------------------------

//  check boxes / radio buttons
TP.html.inputClickable.defineSubtype('inputCheckable');

//  can't construct concrete instances of this
TP.html.inputCheckable.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('deselect',
function() {

    /**
     * @name deselect
     * @synopsis Causes the receiver to deselect (i.e. on this type it emulates
     *     a 'click' that turns it off.
     * @returns {TP.html.inputCheckable} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    //  if we're off then this is a noop
    if (TP.isFalse(node.checked)) {
        return this;
    }

    node.click();

    return this;
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Returns the checked state of the receiver.
     * @returns {Boolean}
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return TP.bc(node.checked);
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('on',
function() {

    /**
     * @name on
     * @synopsis Sets the receiver's checked state to 'true'.
     * @returns {TP.html.inputCheckable} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    node.checked = true;
    this.setAttribute('checked', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('off',
function() {

    /**
     * @name off
     * @synopsis Sets the receiver's checked state to 'false'.
     * @returns {TP.html.inputCheckable} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    node.checked = false;
    this.setAttribute('checked', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('select',
function() {

    /**
     * @name select
     * @synopsis Causes the receiver to select (i.e. on this type it emulates a
     *     'click').
     * @returns {TP.html.inputCheckable} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    //  if we're on then this is a noop
    if (node.checked) {
        return this;
    }

    node.click();

    return this;
});

//  ------------------------------------------------------------------------

TP.html.inputCheckable.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the checked state of the receiver. NOTE that when using
     *     this method the current locale's list of FALSE_STRINGS as will
     *     determine whether a value's boolean equivalent is true or false. So
     *     you can send "false" as a string and turn off the checkbox unlike
     *     standard HTML.
     * @returns {TP.html.inputCheckable} The receiver.
     */

    var val;

    val = TP.bc(aValue);
    if (val) {
        this.on();
    } else {
        this.off();
    }

    return this;
});

//  ========================================================================
//  TP.html.inputSelectable
//  ========================================================================

/**
 * @type {TP.html.inputSelectable}
 * @abtract Common supertype for nodes that can be selected. This includes the
 *     various text widgets for example.
 * @todo
 */

//  ------------------------------------------------------------------------

//  file, password, text, etc.
TP.html.inputVisible.defineSubtype('inputSelectable');

//  can't construct concrete instances of this
TP.html.inputSelectable.isAbstract(true);

//  ------------------------------------------------------------------------

TP.backstop(TP.ac('select'), TP.html.inputSelectable.getInstPrototype());

//  ========================================================================
//  TP.html.form
//  ========================================================================

/**
 * @type {TP.html.form}
 * @synopsis 'form' tag. An input form. The TP.html.form object acts as a group
 *     control for individual node component objects representing the form's
 *     items as well as a wrapper for the form operations themselves.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('form');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  Standard type transformations for element<-> node component type.

//  When a particular element is found, the type attribute is used as a
//  key into this hash to locate the TIBET type to use as a wrapper. A new
//  instance of that type is used so get() related calls always return a
//  properly wrapped dom element.
TP.html.form.Type.defineConstant('NODE_TYPE_NAMES',
    TP.hc('button', 'TP.html.inputButton',
            'image', 'TP.html.inputImage',
            'checkbox', 'TP.html.inputCheckbox',
            'color', 'TP.html.inputColor',
            'date', 'TP.html.inputDate',
            'datetime', 'TP.html.inputDateTime',
            'datetime-local', 'TP.html.inputDateTimeLocal',
            'email', 'TP.html.inputEmail',
            'file', 'TP.html.inputFile',
            'hidden', 'TP.html.inputHidden',
            'month', 'TP.html.inputMonth',
            'number', 'TP.html.inputNumber',
            'password', 'TP.html.inputPassword',
            'radio', 'TP.html.inputRadio',
            'range', 'TP.html.inputRange',
            'reset', 'TP.html.inputReset',
            'search', 'TP.html.inputSearch',
            'select-one', 'TP.html.select',
            'select-single', 'TP.html.select',
            'select-multiple', 'TP.html.select',
            'submit', 'TP.html.inputSubmit',
            'tel', 'TP.html.inputTel',
            'text', 'TP.html.inputText',
            'textarea', 'TP.html.textarea',
            'time', 'TP.html.inputTime',
            'url', 'TP.html.inputUrl',
            'week', 'TP.html.inputWeek'));

TP.html.form.set('uriAttrs', TP.ac('action'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.form.Type.defineMethod('getItemTagName',
function() {

    /**
     * @name getItemTagName
     * @synopsis Returns the 'default item tag name' for use it the
     *     fromArray()/fromObject() methods.
     * @returns {String} The item tag name.
     * @todo
     */

    return 'html:input';
});

//  ------------------------------------------------------------------------

TP.html.form.Type.defineMethod('shouldAutoWrapItems',
function(anObject, formatArgs) {

    /**
     * @name shouldAutoWrapItems
     * @synopsis Whether or not our fromArray() / fromObject() methods
     *     'auto-wrap items'. See those methods for more information.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.lang.Hash} formatArgs An optional object containing
     *     parameters.
     * @returns {Boolean} Whether or not we automatically wrap items.
     * @todo
     */

    if (TP.isBoolean(formatArgs.at('autowrap'))) {
        return formatArgs.at('autowrap');
    }

    return false;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.form.Inst.defineMethod('getElementArray',
function() {

    /**
     * @name getElementArray
     * @synopsis Returns the Array of native elements. In the case of a form
     *     object this is the elements[] "array". Beware, however. The so-called
     *     elements array isn't a fully functional array in all browsers so
     *     TIBET array methods may not apply.
     * @returns {Array} The array of native items.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.elements;
});

//  ------------------------------------------------------------------------

TP.html.form.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Returns the value of the receiver. When targeting a form the
     *     returned value is the set of key/value pairs for each form control in
     *     the form.
     * @returns {TP.lang.Hash} A hash containing keys and values which represent
     *     the overall value of the form.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var i,
        list,
        el,
        node,
        dict;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    dict = TP.hc();
    list = node.elements;
    for (i = 0; i < list.length; i++) {
        el = 'TP.html.Element'.construct(list[i]);
        if (TP.notValid(el)) {
            TP.ifWarn() ?
                TP.warn(TP.boot.$annotate(
                            TP.nodeCloneNode(list[i]),
                            'Unable to acquire wrapper.'),
                        TP.LOG, arguments) : 0;

            continue;
        }

        dict.atPut(el.getSubmitName(), el.getValue());
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.html.form.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the value of the receiver. When targeting a form the input
     *     is a set of key/value pairs containing the new data for the form
     *     controls.
     * @param {TP.lang.Hash} aValue Hash containing key/value pairs where the
     *     keys need to map to ids or names in the form.
     * @returns {TP.html.form} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node,
        list,
        i,
        el;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    if (!TP.isKindOf(aValue, TP.lang.Hash)) {
        return this.raise('TP.sig.InvalidParameter', arguments,
                            'Must provide a hash of key value pairs.');
    }

    list = node.elements;
    for (i = 0; i < list.length; i++) {
        el = 'TP.html.Element'.construct(list[i]);
        if (TP.notValid(el)) {
            TP.ifWarn() ?
                TP.warn(TP.boot.$annotate(
                            TP.nodeCloneNode(list[i]),
                            'Unable to acquire wrapper.'),
                        TP.LOG, arguments) : 0;

            continue;
        }

        //  rely on the individual elements to do the real work
        el.setDisplayValue(aValue.at(el.getSubmitName()));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.form.Inst.defineMethod('reset',
function() {

    /**
     * @name reset
     * @synopsis Resets the form. As a node component, however, this method
     *     provides the opportunity for custom reset pre/post processing.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    //  TODO:   need to deal with bound element/form reset

    //  TODO:   capture potential lost data here?
    return node.reset();
});

//  ------------------------------------------------------------------------

TP.html.form.Inst.defineMethod('submit',
function() {

    /**
     * @name submit
     * @synopsis Submits the form. As a node component, however, this method
     *     provides the opportunity for custom submit pre/post processing.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    //  TODO:   validation hook? parameters to control submit
    //          method/etc?
    return node.submit();
});

//  ========================================================================
//  TP.html.inputButton
//  ========================================================================

/**
 * @type {TP.html.inputButton}
 * @synopsis <input type="button"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputButton');

//  ========================================================================
//  TP.html.inputColor
//  ========================================================================

/**
 * @type {TP.html.inputColor}
 * @synopsis <input type="color"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputColor');

//  ========================================================================
//  TP.html.inputDate
//  ========================================================================

/**
 * @type {TP.html.inputDate}
 * @synopsis <input type="date"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputDate');

//  ========================================================================
//  TP.html.inputDateTime
//  ========================================================================

/**
 * @type {TP.html.inputDateTime}
 * @synopsis <input type="datetime"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputDateTime');

//  ========================================================================
//  TP.html.inputDateTimeLocal
//  ========================================================================

/**
 * @type {TP.html.inputDateTimeLocal
 * @synopsis <input type="datetime-local"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputDateTimeLocal');

//  ========================================================================
//  TP.html.inputMonth
//  ========================================================================

/**
 * @type {TP.html.inputMonth
 * @synopsis <input type="month"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputMonth');

//  ========================================================================
//  TP.html.inputRange
//  ========================================================================

/**
 * @type {TP.html.inputRange}
 * @synopsis <input type="range"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputRange');

//  ========================================================================
//  TP.html.inputCheckbox
//  ========================================================================

/**
 * @type {TP.html.inputCheckbox}
 * @synopsis <input type="checkbox"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputCheckable.defineSubtype('inputCheckbox');

//  ========================================================================
//  TP.html.inputEmail
//  ========================================================================

/**
 * @type {TP.html.inputEmail}
 * @synopsis <input type="email"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputEmail');

TP.html.inputEmail.addTraitsFrom(TP.html.textUtilities);

TP.html.inputEmail.Type.resolveTraits(
        TP.ac('tshCompile', 'canConnectFrom', 'canConnectTo',
                'isValidConnectorDest', 'isValidConnectorSource'),
        TP.html.Element);

TP.html.inputEmail.Inst.resolveTraits(
        TP.ac('getValue', 'setValue', 'addCSSClass', 'getClass', 'getStyle',
                'removeCSSClass', 'replaceCSSClass', 'setClass', 'setStyle',
                'setHidden'),
        TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputEmail.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Returns the value of the receiver.
     * @returns {String} The receiver's input value.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.value;
});

//  ------------------------------------------------------------------------

TP.html.inputEmail.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the value of the receiver.
     * @returns {TP.html.inputEmail} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    //  not gonna work, but hey, we can try :)
    node.value = aValue;

    return this;
});

//  ========================================================================
//  TP.html.inputFile
//  ========================================================================

/**
 * @type {TP.html.inputFile}
 * @synopsis <input type="file"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputFile');

//  ========================================================================
//  TP.html.inputHidden
//  ========================================================================

/**
 * @type {TP.html.inputHidden}
 * @synopsis <input type="hidden"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.input.defineSubtype('inputHidden');

//  ========================================================================
//  TP.html.inputNumber
//  ========================================================================

/**
 * @type {TP.html.inputNumber}
 * @synopsis <input type="number"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputNumber');

TP.html.inputNumber.addTraitsFrom(TP.html.textUtilities);

TP.html.inputNumber.Type.resolveTraits(
        TP.ac('tshCompile', 'canConnectFrom', 'canConnectTo',
                'isValidConnectorDest', 'isValidConnectorSource'),
        TP.html.Element);

TP.html.inputNumber.Inst.resolveTraits(
        TP.ac('getValue', 'setValue', 'addCSSClass', 'getClass', 'getStyle',
                'removeCSSClass', 'replaceCSSClass', 'setClass', 'setStyle',
                'setHidden'),
        TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputNumber.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Returns the value of the receiver.
     * @returns {String} The receiver's input value.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.value;
});

//  ------------------------------------------------------------------------

TP.html.inputNumber.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the value of the receiver.
     * @returns {TP.html.inputNumber} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    //  not gonna work, but hey, we can try :)
    node.value = aValue;

    return this;
});

//  ========================================================================
//  TP.html.inputImage
//  ========================================================================

/**
 * @type {TP.html.inputImage}
 * @synopsis <input type="image"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.input.defineSubtype('inputImage');

//  ========================================================================
//  TP.html.inputPassword
//  ========================================================================

/**
 * @type {TP.html.inputPassword}
 * @synopsis <input type="password"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputPassword');

TP.html.inputPassword.addTraitsFrom(TP.html.textUtilities);

TP.html.inputPassword.Type.resolveTraits(
        TP.ac('tshCompile', 'canConnectFrom', 'canConnectTo',
                'isValidConnectorDest', 'isValidConnectorSource'),
        TP.html.Element);

TP.html.inputPassword.Inst.resolveTraits(
        TP.ac('getValue', 'setValue', 'addCSSClass', 'getClass', 'getStyle',
                'removeCSSClass', 'replaceCSSClass', 'setClass', 'setStyle',
                'setHidden'),
        TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputPassword.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Returns the value of the receiver.
     * @returns {String} The receiver's input value.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.value;
});

//  ------------------------------------------------------------------------

TP.html.inputPassword.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the value of the receiver.
     * @returns {TP.html.inputPassword} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    //  not gonna work, but hey, we can try :)
    node.value = aValue;

    return this;
});

//  ========================================================================
//  TP.html.inputSearch
//  ========================================================================

/**
 * @type {TP.html.inputSearch}
 * @synopsis <input type="search"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputSearch');

TP.html.inputSearch.addTraitsFrom(TP.html.textUtilities);

TP.html.inputSearch.Type.resolveTraits(
        TP.ac('tshCompile', 'canConnectFrom', 'canConnectTo',
                'isValidConnectorDest', 'isValidConnectorSource'),
        TP.html.Element);

TP.html.inputSearch.Inst.resolveTraits(
        TP.ac('getValue', 'setValue', 'addCSSClass', 'getClass', 'getStyle',
                'removeCSSClass', 'replaceCSSClass', 'setClass', 'setStyle',
                'setHidden'),
        TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputSearch.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Returns the value of the receiver.
     * @returns {String} The receiver's input value.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.value;
});

//  ------------------------------------------------------------------------

TP.html.inputSearch.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the value of the receiver.
     * @returns {TP.html.inputSearch} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    //  not gonna work, but hey, we can try :)
    node.value = aValue;

    return this;
});

//  ========================================================================
//  TP.html.inputRadio
//  ========================================================================

/**
 * @type {TP.html.inputRadio}
 * @synopsis <input type="radio">. This type is a wrapper for a radio group
 *     items, allowing you to set/get their value easily.
 */

//  ------------------------------------------------------------------------

TP.html.inputCheckable.defineSubtype('inputRadio');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputRadio.Inst.defineMethod('off',
function() {

    /**
     * @name off
     * @synopsis Sets the receiver to the 'off' state, a noop for radios.
     * @returns {TP.html.inputRadio} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    node.checked = false;
    this.removeAttribute('checked');

    return this;
});

//  ------------------------------------------------------------------------

TP.html.inputRadio.Inst.defineMethod('on',
function() {

    /**
     * @name on
     * @synopsis Sets the receiver to the 'on' state, which sets its checked
     *     value to true.
     * @returns {TP.html.inputRadio} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    node.checked = true;
    this.setAttribute('checked', 'checked');

    return this;
});

//  ------------------------------------------------------------------------

TP.html.inputRadio.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Returns the value of the radio group selection. This
     *     corresponds to the value of the currently selected item.
     * @returns {Object} The value of the currently selected radio button.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node,
        name,
        doc,
        i,
        items,
        item;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    name = TP.elementGetAttribute(node, 'name');
    if (TP.isEmpty(name)) {
        return this.raise('TP.sig.InvalidName', arguments,
                                'Radio item missing name attribute');
    }

    doc = this.getNativeDocument();
    items = TP.nodeGetDescendantElementsByName(doc, name);

    //  find the selected element and stop when found
    for (i = 0; i < items.length; i++) {
        item = items[i];
        if (item.checked ||
            (TP.elementGetAttribute(item, 'checked') === 'checked')) {
            //  the selected element's string value
            return item.value;
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.html.inputRadio.Inst.defineMethod('getSubmitName',
function() {

    /**
     * @name getSubmitName
     * @synopsis Returns the name under which the receiver would be submitted
     *     when used in a forms context.
     * @returns {TP.html.inputRadio} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node,
        key;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    key = TP.elementGetAttribute(node, 'id');
    if (TP.isEmpty(key)) {
        key = TP.elementGetAttribute(node, 'name');
    }

    return key;
});

//  ------------------------------------------------------------------------

TP.html.inputRadio.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the receivers' value to the value provided (if it matches
     *     the value of an item in the group).
     * @param {Object} aValue The value to set (select) in the receiver.
     * @returns {TP.html.inputRadio} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node,
        name,
        doc,
        i,
        item,
        items;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    if (TP.isEmpty(name = TP.elementGetAttribute(node, 'name'))) {
        return this.raise('TP.sig.InvalidName', arguments,
                                'Radio item missing name attribute');
    }

    doc = this.getNativeDocument();
    items = TP.nodeGetDescendantElementsByName(doc, name);

    for (i = 0; i < items.length; i++) {
        item = items[i];

        if (item.value === aValue) {
            item.checked = true;
            TP.elementSetAttribute(item, 'checked', 'checked');
        } else {
            item.checked = false;
            TP.elementRemoveAttribute(item, 'checked');
        }
    }

    return this;
});

//  ========================================================================
//  TP.html.inputReset
//  ========================================================================

/**
 * @type {TP.html.inputReset}
 * @synopsis <input type="reset"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputReset');

//  ========================================================================
//  TP.html.inputSubmit
//  ========================================================================

/**
 * @type {TP.html.inputSubmit}
 * @synopsis <input type="submit"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputSubmit');

//  ========================================================================
//  TP.html.inputTel
//  ========================================================================

/**
 * @type {TP.html.inputTel}
 * @synopsis <input type="tel"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputTel');

TP.html.inputTel.addTraitsFrom(TP.html.textUtilities);

TP.html.inputTel.Type.resolveTraits(
        TP.ac('tshCompile', 'canConnectFrom', 'canConnectTo',
                'isValidConnectorDest', 'isValidConnectorSource'),
        TP.html.Element);

TP.html.inputTel.Inst.resolveTraits(
        TP.ac('getValue', 'setValue', 'addCSSClass', 'getClass', 'getStyle',
                'removeCSSClass', 'replaceCSSClass', 'setClass', 'setStyle',
                'setHidden'),
        TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputTel.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Returns the value of the receiver.
     * @returns {String} The receiver's input value.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.value;
});

//  ------------------------------------------------------------------------

TP.html.inputTel.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the value of the receiver.
     * @returns {TP.html.inputTel} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    //  not gonna work, but hey, we can try :)
    node.value = aValue;

    return this;
});

//  ========================================================================
//  TP.html.inputText
//  ========================================================================

/**
 * @type {TP.html.inputText}
 * @synopsis <input type="text"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputText');

TP.html.inputText.addTraitsFrom(TP.html.textUtilities);

TP.html.inputText.Type.resolveTraits(
        TP.ac('tshCompile', 'canConnectFrom', 'canConnectTo',
                'isValidConnectorDest', 'isValidConnectorSource'),
        TP.html.Element);

TP.html.inputText.Inst.resolveTraits(
        TP.ac('getValue', 'setValue', 'addCSSClass', 'getClass', 'getStyle',
                'removeCSSClass', 'replaceCSSClass', 'setClass', 'setStyle',
                'setHidden'),
        TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputText.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Returns the value of the receiver.
     * @returns {String} The receiver's formatted input value.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.value;
});

//  ------------------------------------------------------------------------

TP.html.inputText.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the value of the receiver.
     * @returns {TP.html.inputText} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    node.value = aValue;

    return this;
});

//  ========================================================================
//  TP.html.inputTime
//  ========================================================================

/**
 * @type {TP.html.inputTime}
 * @synopsis <input type="time"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputTime');

//  ========================================================================
//  TP.html.inputWeek
//  ========================================================================

/**
 * @type {TP.html.inputWeek}
 * @synopsis <input type="week"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('inputWeek');

//  ========================================================================
//  TP.html.inputUrl
//  ========================================================================

/**
 * @type {TP.html.inputUrl}
 * @synopsis <input type="url"> tag.
 */

//  ------------------------------------------------------------------------

TP.html.inputSelectable.defineSubtype('inputUrl');

TP.html.inputUrl.addTraitsFrom(TP.html.textUtilities);

TP.html.inputUrl.Type.resolveTraits(
        TP.ac('tshCompile', 'canConnectFrom', 'canConnectTo',
                'isValidConnectorDest', 'isValidConnectorSource'),
        TP.html.Element);

TP.html.inputUrl.Inst.resolveTraits(
        TP.ac('getValue', 'setValue', 'addCSSClass', 'getClass', 'getStyle',
                'removeCSSClass', 'replaceCSSClass', 'setClass', 'setStyle',
                'setHidden'),
        TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.inputUrl.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Returns the value of the receiver.
     * @returns {String} The receiver's formatted input value.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.value;
});

//  ------------------------------------------------------------------------

TP.html.inputUrl.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the value of the receiver.
     * @returns {TP.html.inputUrl} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    node.value = aValue;

    return this;
});

//  ========================================================================
//  TP.html.label
//  ========================================================================

/**
 * @type {TP.html.label}
 * @synopsis 'label' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('label');

//  ========================================================================
//  TP.html.legend
//  ========================================================================

/**
 * @type {TP.html.legend}
 * @synopsis 'legend' tag. Fieldset label.
 */

//  ------------------------------------------------------------------------

TP.html.Aligned.defineSubtype('legend');

//  ========================================================================
//  TP.html.optgroup
//  ========================================================================

/**
 * @type {TP.html.optgroup}
 * @synopsis 'optgroup' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('optgroup');

//  ========================================================================
//  TP.html.option
//  ========================================================================

/**
 * @type {TP.html.option}
 * @synopsis 'option' tag. A 'select' tag option. This type acts in the "item"
 *     role relative to an TP.html.Select object. Most methods of interest are
 *     on the TP.html.Select type.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('option');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.option.Type.defineMethod('generateMarkup',
function(anObject, attrStr, itemFormat, shouldAutoWrap, formatArgs, theRequest) {

    /**
     * @name generateMarkup
     * @synopsis Generates markup for the supplied Object using the other
     *     parameters supplied.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {String} attrStr The String containing either the literal
     *     attribute markup or a 'template invocation' that can be used inside
     *     of a template.
     * @param {String} itemFormat The name of an 'item format', either a tag
     *     name (which defaults to the 'item tag name' of this type) or some
     *     other format type which can be applied to this type.
     * @param {Boolean} shouldAutoWrap Whether or not the markup generation
     *     machinery should 'autowrap' items of the supplied object (each item
     *     in an Array or each key/value pair in an Object).
     * @param {TP.lang.Hash} formatArgs The 'formatting arguments' used by this
     *     machinery to generate item markup.
     * @param {TP.sig.Request|TP.lang.Hash} theRequest An optional object
     *     containing parameters.
     * @returns {String} The markup generated by taking the supplied Object and
     *     iterating over its items.
     * @todo
     */

    var tagName,
        template,
        str;

    tagName = this.getTagName();

    if (TP.isFalse(shouldAutoWrap)) {
        if (TP.isTrue(theRequest.at('repeat'))) {
            if (TP.isArray(anObject)) {
                template = TP.join('<', tagName,
                                    attrStr, ' value="{{$INDEX}}">',
                                    '{{%%', itemFormat, '}}',
                                    '</', tagName, '>');
            } else {
                template = TP.join('<', tagName,
                                    attrStr, ' value="{{0}}">',
                                    '{{1%%', itemFormat, '}}',
                                    '</', tagName, '>');
            }

            //  Perform the transformation.
            str = template.transform(anObject, theRequest);

            return str;
        }
    } else {
        //  Otherwise, the object that will be handed to the iteration
        //  mechanism will be [key,value] pairs, so we can use that fact
        //  to generate item tags around each one.

        //  Build a template by joining the tag name with an invocation
        //  of the itemFormat for both the key and the value.
        template = TP.join('<', tagName,
                            attrStr, ' value="{{0}}">',
                            '{{1%%', itemFormat, '}}',
                            '</', tagName, '>');

        //  Perform the transformation.
        str = template.transform(anObject, theRequest);

        return str;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.html.option.Type.defineMethod('shouldAutoWrapItems',
function(anObject, formatArgs) {

    /**
     * @name shouldAutoWrapItems
     * @synopsis Whether or not our fromArray() / fromObject() methods
     *     'auto-wrap items'. See those methods for more information.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.lang.Hash} formatArgs An optional object containing
     *     parameters.
     * @returns {Boolean} Whether or not we automatically wrap items.
     * @todo
     */

    if (TP.isBoolean(formatArgs.at('autowrap'))) {
        return formatArgs.at('autowrap');
    }

    return false;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.option.Inst.defineMethod('isSelected',
function() {

    /**
     * @name isSelected
     * @synopsis Returns true if the receiver is selected.
     * @returns {Boolean} Whether or not the receiver is selected.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.selected;
});

//  ------------------------------------------------------------------------

TP.html.option.Inst.defineMethod('on',
function() {

    /**
     * @name on
     * @synopsis Sets the receiver's selected state to 'true'.
     * @returns {TP.html.option} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    node.selected = true;

    return this;
});

//  ------------------------------------------------------------------------

TP.html.option.Inst.defineMethod('off',
function() {

    /**
     * @name off
     * @synopsis Sets the receiver's selected state to 'false'.
     * @returns {TP.html.option} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    node.selected = false;

    return this;
});

//  ========================================================================
//  TP.html.select
//  ========================================================================

/**
 * @type {TP.html.select}
 * @synopsis 'select' tag. Single or multiple selection control.
 */

//  ------------------------------------------------------------------------

TP.html.Focused.defineSubtype('select');

//  ------------------------------------------------------------------------

TP.backstop(TP.ac('add', 'remove'), TP.html.select.getInstPrototype());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.select.Type.defineMethod('getItemTagName',
function() {

    /**
     * @name getItemTagName
     * @synopsis Returns the 'default item tag name' for use it the
     *     fromArray()/fromObject() methods.
     * @returns {String} The ID of the observer.
     * @todo
     */

    return 'html:option';
});

//  ------------------------------------------------------------------------

TP.html.select.Type.defineMethod('shouldAutoWrapItems',
function(anObject, formatArgs) {

    /**
     * @name shouldAutoWrapItems
     * @synopsis Whether or not our fromArray() / fromObject() methods
     *     'auto-wrap items'. See those methods for more information.
     * @param {Object} anObject The Object of content to wrap in markup.
     * @param {TP.lang.Hash} formatArgs An optional object containing
     *     parameters.
     * @returns {Boolean} Whether or not we automatically wrap items.
     * @todo
     */

    if (TP.isBoolean(formatArgs.at('autowrap'))) {
        return formatArgs.at('autowrap');
    }

    return false;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('allowsMultiples',
function() {

    /**
     * @name allowsMultiples
     * @synopsis Returns true if the receiver is configured for multiple
     *     selection.
     * @returns {Boolean} Whether or not the receiver allows multiple selection.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    //  this object, exit here.
    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return (node.type === 'select-multiple');
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('deselect',
function(aValue) {

    /**
     * @name deselect
     * @synopsis De-selects (clears) the option with the value provided.
     * @param {Object} aValue The value to de-select. Note that this can be an
     *     array. Also note that if no value is provided this will deselect
     *     (clear) all selected items.
     * @returns {TP.html.select} The receiver.
     */

    var i,
        dirty,
        elementArray,
        dict;

    if (TP.isEmpty(aValue)) {
        return this.deselectAll();
    }

    if (TP.notValid(elementArray = this.getElementArray())) {
        return this.raise('TP.sig.InvalidElementArray', arguments);
    }

    //  avoid MxN iterations by creating a hash of values
    if (TP.isArray(aValue)) {
        dict = TP.hc().addAllKeys(aValue, '');
    } else {
        dict = TP.hc(aValue, '');
    }

    for (i = 0; i < elementArray.length; i++) {
        if (dict.containsKey(elementArray[i].value)) {
            if (elementArray[i].selected) {
                dirty = true;
            }
            elementArray[i].selected = false;
        }
    }

    if (dirty) {
        this.changed('selection', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('deselectAll',
function() {

    /**
     * @name deselectAll
     * @synopsis Clears any current selection(s).
     * @returns {TP.html.select} The receiver.
     */

    var i,
        dirty,
        arr;

    if (TP.notValid(arr = this.getElementArray())) {
        return this.raise('TP.sig.InvalidElementArray', arguments);
    }

    dirty = false;

    for (i = 0; i < arr.length; i++) {
        if (arr[i].selected) {
            dirty = true;
        }
        arr[i].selected = false;
    }

    if (dirty) {
        this.changed('selection', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.select.Type.defineMethod('handlePeerTP_sig_DOMChange',
function(aTargetElem, anEvent) {

    /**
     * @name handlePeerTP_sig_DOMChange
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @raises TP.sig.InvalidNode
     * @returns {TP.html.select} The receiver.
     * @abstract
     * @todo
     */

    var tpElem;

    tpElem = TP.wrap(aTargetElem);
    if (TP.isValid(tpElem) && tpElem.shouldSignalChange()) {
        tpElem.changed('value', TP.UPDATE);
    }
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('getElementArray',
function() {

    /**
     * @name getElementArray
     * @synopsis Returns the Array of native elements. In the case of a select
     *     list this is the options[] "array". Beware, however. The so-called
     *     options array isn't a fully functional array in all browsers so TIBET
     *     array methods may not apply.
     * @returns {Array} The array of native items.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.options;
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Returns the selected value of the select list. This corresponds
     *     to the value of the currently selected item or items.
     * @returns {String|Array} A String containing the selected value or an
     *     Array of zero or more selected values if the receiver is set up to
     *     allow multiple selections.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node,
        theIndex,
        elementArray,
        selectionArray,
        i;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    if (TP.notValid(elementArray = this.getElementArray())) {
        return this.raise('TP.sig.InvalidElementArray', arguments);
    }

    //  If this Select isn't set up to allow multiple selection, then just
    //  return the value of the element at the native element's selected
    //  index.
    if (!this.allowsMultiples()) {
        if ((theIndex = node.selectedIndex) === TP.NOT_FOUND) {
            return null;
        }

        return elementArray[theIndex].value;
    }

    selectionArray = TP.ac();

    //  Loop over all of the elements and if the element at the index is
    //  selected, add it to the Array of selected elements.
    for (i = 0; i < elementArray.length; i++) {
        if (elementArray[i].selected) {
            selectionArray.push(elementArray[i].value);
        }
    }

    return selectionArray;
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('refreshItems',
function(aSignal, anItemset) {

    /**
     * @name refreshItems
     * @synopsis Updates the receiver's option list by processing the itemset
     *     provided (or one found in the receiver's content model). NOTE that
     *     this requires the select to have an option below it with a
     *     tibet:sourcetag="xctrls:itemset" value.
     * @description The itemset tag is an XForms tag intended for use with truly
     *     dynamic list content. It's not the best choice for a set of data that
     *     won't change actively while the page is visible so it's not really
     *     the best choice for most select controls. Still, it's possible that
     *     you want to bind a select's options to a dynamic list. For that list
     *     to operate properly it has to be encoded (after page/tag processing)
     *     to appear as follows:
     *
     *     <option tibet:prototype="true" tibet:sourcetag="xctrls:itemset"
     *     bind:info="aBindID" xctrls:label="./foo" xctrls:value="./bar">
     *     </option>
     *
     *     The tibet:prototype ensures the option isn't visible, the
     *     tibet:sourcetag tells us it's an itemset, and the remaining items are
     *     the encoded label and value content from the original <xforms:label>
     *     and <xforms:value> elements. The bind:info points to the binding for
     *     the itemset, which defines the data specific to the option list.
     *
     *     NOTE that at the present time we don't support the choices element
     *     from XForms in this tag.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action.
     * @param {xctrls:itemset} anItemset The itemset to refresh from.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    //  the itemset has to be encoded onto an option element to be valid
    //  XHTML so we have to place the values originally found in the label
    //  and value elements of the prototype item into the option in some
    //  fashion. sample markup (compiled) is shown below:

    var node,
        itemset,
        itemnode,
        origbox,
        content,
        labelref,
        valueref,
        template,
        arr,
        len,
        i;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    //  find the itemset if we have one. if not then we're a static select
    //  whose options were part of the native markup
    itemset = TP.ifInvalid(
            anItemset,
            TP.nodeGetFirstElementChildByTagName(node, 'xctrls:itemset'));
    if (TP.notValid(itemset)) {
        return;
    }

    //  swap references so we get a node and node wrapper to work with
    itemnode = TP.unwrap(itemset);
    itemset = TP.tpnode(itemset);

    //  get the container from the itemset (it will go upward until it
    //  finds the "itembox" it lives in)
    origbox = itemset.getItemContainer();
    if (!TP.isNode(origbox)) {
        //  bad markup construction, should have found a box for items...
        return this.raise('TP.sig.InvalidMarkup', arguments,
            'Itemset not enclosed in an itembox: ' + itemset.asString());
    }

    //  get the list of source data via the itemset's binding values
    content = itemset.getBoundContent();

    //  no data, empty list and bail out
    if (TP.isEmpty(content)) {
        //  replace all content with just the itemnode, restoring things to
        //  a select with a single option
        TP.nodeSetContent(origbox, itemnode);

        return;
    }

    if (!TP.canInvoke(content, 'injectInto')) {
        TP.ifWarn() ?
            TP.warn(TP.boot.$annotate(
                        this,
                        'Itemset content not a collection.'),
                    TP.LOG, arguments) : 0;

        return;
    }

    //  grab the getters from the itemset element (label and value refs)
    //  NOTE that for this to work the itemset transform must take care to
    //  deal properly with potentially nested xctrls:output elements in the
    //  label etc. (See page 102 in XForms Essentials for an example)
    labelref = TP.elementGetAttribute(itemnode, 'xctrls:label', true);
    valueref = TP.elementGetAttribute(itemnode, 'xctrls:value', true);

    //  create a substitution template we can leverage for production. NOTE
    //  that the non-attribute substition requires a leading $
    template = '<option value="{{' + valueref +
                    '}}">{{' + labelref + '}}</option>';

    //  content is a collection so we want to iterate and collect the
    //  content as we go
    arr = TP.ac();

    if (TP.isArray(content)) {
        len = content.length;
        for (i = 0; i < len; i++) {
            arr.push(template.transform(content[i]));
        }
    } else {
        arr = content.injectInto(arr,
            function(item, accum, index) {

                accum.push(template.transform(item));
                return accum;
            });
    }

    TP.nodeSetContent(origbox, arr.join());

    return;
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('refreshRepeatContent',
function(aSignal) {

    /**
     * @name refreshRepeatContent
     * @synopsis Updates the receiver when it presumably has a single option
     *     element under it representing a prototype option whose value and
     *     content can be set using the data found in the receiver's repeat
     *     content. For this to work as you'd like the option element should be
     *     encoded as follows:
     *
     *     <option value="{{$valueref}}">{{$labelref}}</option>
     *
     *     NOTE that this option syntax is effectively a TIBET substitution
     *     string, which is precisely how this method operates. It takes the
     *     content (innerHTML if you like) of the select and uses it as a
     *     substitution template with each node of the receiver's bound content.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node,
        content,
        template,
        arr,
        option;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    //  get our first option, it's the template
    option = TP.nodeGetFirstElementChildByTagName(node, 'option');
    if (TP.notValid(option)) {
        return this.raise('TP.sig.InvalidElement',
                            arguments,
                            'TP.html.select option child not found.');
    }

    //  the content we'll be using is our own in this case
    content = this.getBoundContent();
    if (TP.isEmpty(content)) {
        return;
    }

    if (!TP.canInvoke(content, 'perform')) {
        TP.ifWarn() ?
            TP.warn(TP.boot.$annotate(
                        this,
                        'Itemset is not a collection.'),
                    TP.LOG, arguments) : 0;

        return;
    }

    //  create a substitution template we can leverage for production
    template = TP.nodeAsString(option, false, true);

    //  get our array ready, and push a copy of our template into it so the
    //  prototype node ends up first in the new output
    arr = TP.ac();
    arr.push(template);

    //  content is a collection so we want to iterate and collect the
    //  content as we go
    arr = content.injectInto(arr,
        function(item, accum, index) {

            accum.push(template.transform(item));

            return accum;
        });

    TP.nodeSetContent(node, arr.join());

    return;
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('select',
function(aValue) {

    /**
     * @name select
     * @synopsis Selects the option with the value provided if found. Note that
     *     this method is roughly identical to setDisplayValue with the
     *     exception that this method does not clear existing selections when
     *     processing the value(s) provided. When no specific values are
     *     provided this method will selectAll.
     * @param {Object} aValue The value to select. Note that this can be an
     *     array.
     * @returns {TP.html.select} The receiver.
     */

    var i,
        dirty,
        elementArray,
        value,
        dict;

    //  no value? full selection
    if (TP.isEmpty(aValue)) {
        return this.selectAll();
    }

    if (TP.isString(aValue)) {
        value = aValue.split(' ').collapse();
    } else {
        value = aValue;
    }

    //  watch for multiple selection issues
    if (TP.isArray(value) && !this.allowsMultiples()) {
        return this.raise(
                'TP.sig.InvalidOperation',
                arguments,
                'Target TP.html.select does not allow multiple selection');
    }

    if (TP.notValid(elementArray = this.getElementArray())) {
        return this.raise('TP.sig.InvalidElementArray', arguments);
    }

    //  avoid MxN iterations by creating a hash of values
    if (TP.isArray(value)) {
        dict = TP.hc().addAllKeys(value);
    } else {
        dict = TP.hc(value, '');
    }

    dirty = false;

    for (i = 0; i < elementArray.length; i++) {
        //  NOTE that we don't clear ones that don't match, we just add the
        //  new items to the selection
        if (dict.containsKey(elementArray[i].value)) {
            if (!elementArray[i].selected) {
                dirty = true;
            }

            elementArray[i].selected = true;
        }
    }

    if (dirty) {
        this.changed('selection', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('selectAll',
function() {

    /**
     * @name selectAll
     * @synopsis Selects all options.
     * @returns {TP.html.select} The receiver.
     */

    var i,
        dirty,
        elementArray;

    if (!this.allowsMultiples()) {
        return this.raise(
                'TP.sig.InvalidOperation',
                arguments,
                'Target TP.html.select does not allow multiple selection');
    }

    if (TP.notValid(elementArray = this.getElementArray())) {
        return this.raise('TP.sig.InvalidElementArray', arguments);
    }

    dirty = false;

    for (i = 0; i < elementArray.length; i++) {
        if (!elementArray[i].selected) {
            dirty = true;
        }
        elementArray[i].selected = true;
    }

    if (dirty) {
        this.changed('selection', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.select.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the receivers' value to the value provided (if it matches
     *     the value of an item in the group). Note that any selected items not
     *     provided in aValue are cleared, which is different than the behavior
     *     of selectValue() which simply adds the new selected items to the
     *     existing selection.
     * @param {Object} aValue The value to set (select) in the receiver. For a
     *     select list this might be an array.
     * @returns {TP.html.select} The receiver.
     */

    var i,
        dirty,
        elementArray,
        value,
        dict;

    //  empty value means clear any selection(s)
    if (TP.isEmpty(aValue)) {
        return this.deselectAll();
    }

    if (TP.notValid(elementArray = this.getElementArray())) {
        return this.raise('TP.sig.InvalidElementArray', arguments);
    }

    if (TP.isString(aValue)) {
        value = aValue.split(' ').collapse();
    } else {
        value = aValue;
    }

    //  watch for multiple selection issues
    if (TP.isArray(value) && !this.allowsMultiples()) {
        value = value[0];
    }

    //  avoid MxN iterations by creating a hash of values
    if (TP.isArray(value)) {
        dict = TP.hc().addAllKeys(value, '');
    } else {
        dict = TP.hc(value, '');
    }

    dirty = false;

    for (i = 0; i < elementArray.length; i++) {
        if (dict.containsKey(elementArray[i].value)) {
            if (!elementArray[i].selected) {
                dirty = true;
            }
            elementArray[i].selected = true;
        } else {
            if (elementArray[i].selected) {
                dirty = true;
            }
            elementArray[i].selected = false;
        }
    }

    if (dirty) {
        this.changed('selection', TP.UPDATE);
    }

    return this;
});

//  ========================================================================
//  TP.html.textarea
//  ========================================================================

/**
 * @type {TP.html.textarea}
 * @synopsis 'textarea' tag. Multiline text input.
 */

//  ------------------------------------------------------------------------

TP.html.Focused.defineSubtype('textarea');

TP.html.textarea.addTraitsFrom(TP.html.textUtilities);

TP.html.textarea.Type.resolveTraits(
        TP.ac('tshCompile', 'canConnectFrom', 'canConnectTo',
                'isValidConnectorDest', 'isValidConnectorSource'),
        TP.html.Element);

TP.html.textarea.Inst.resolveTraits(
        TP.ac('getValue', 'setValue', 'addCSSClass', 'getClass', 'getStyle',
                'removeCSSClass', 'replaceCSSClass', 'setClass', 'setStyle',
                'setHidden'),
        TP.html.textUtilities);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.backstop(TP.ac('select'), TP.html.textarea.getInstPrototype());

//  ------------------------------------------------------------------------

TP.html.textarea.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Returns the value of the receiver.
     * @returns {String} The receiver's formatted input value.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.value;
});

//  ------------------------------------------------------------------------

TP.html.textarea.Type.defineMethod('handlePeerTP_sig_DOMChange',
function(aTargetElem, anEvent) {

    /**
     * @name handlePeerTP_sig_DOMChange
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @raises TP.sig.InvalidNode
     * @returns {TP.html.textarea} The receiver.
     * @abstract
     * @todo
     */

    var tpElem;

    tpElem = TP.wrap(aTargetElem);
    if (TP.isValid(tpElem) && tpElem.shouldSignalChange()) {
        tpElem.changed('value', TP.UPDATE);
    }
});

//  ------------------------------------------------------------------------

TP.html.textarea.Inst.defineMethod('isSingleValued',
function() {

    /**
     * @name isSingleValued
     * @synopsis Returns true if the receiver deals with single values.
     * @description See the TP.core.Node's 'isScalarValue()' instance method for
     *     more information.
     * @returns {Boolean} True when single valued.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.html.textarea.Inst.defineMethod('isScalarValued',
function() {

    /**
     * @name isScalarValued
     * @synopsis Returns true if the receiver deals with scalar values.
     * @description See the TP.core.Node's 'isScalarValue()' instance method for
     *     more information.
     * @returns {Boolean} For input types, this returns true.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.html.textarea.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the value of the receiver.
     * @returns {TP.html.textarea} The receiver.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    node.value = aValue;

    return this;
});

//  ========================================================================
//  TP.html.button
//  ========================================================================

/**
 * @type {TP.html.button}
 * @synopsis 'button' tag.
 * @description NOT the same as <input type="button"> due largely to rendering
 *     differences. The attributes and behavior are largely similar, however.
 *     This tag type supports content between the opening/closing button tags
 *     unlike the input form of this control which has no closing tag and hence
 *     no content.
 */

//  ------------------------------------------------------------------------

TP.html.inputClickable.defineSubtype('button');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
