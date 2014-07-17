//  ========================================================================
/*
NAME:   html_Element.js
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

/**
 * @type {html:Element}
 * @synopsis The html:Element type is the top-level type in the xhtml node
 *     hierarchy. Note that we use the prefix html here since that is the
 *     defined canonical prefix for XHTML as well as HTML.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('html:Element');

//  can't construct concrete instances of this
TP.html.Element.isAbstract(true);

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.html.Element.Type.defineMethod('tshCompile',
function(aRequest) {

    /**
     * @name tshCompile
     * @synopsis Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @description Since subtype element types are already (X)HTML nodes, this
     *     implementation of this method merely hands null.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     */

    //  Return nothing, which means to not transform the current element,
    //  but to descend into its children.
    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('addCSSClass',
function(aCSSClass,atEnd) {

    /**
     * @name addCSSClass
     * @synopsis Adds the CSS class whose name is equal to aCSSClass to this
     *     object's CSS class name list.
     * @description Note that if the 'atEnd' argument is set to 'true', this
     *     causes aCSSClass to be appended to the end of the list of CSS class
     *     names. Since the order of CSS class names is important when
     *     specifying multiple names in the same 'className' attribute for the
     *     same element (for purposes of computing precedence), this is
     *     important.
     * @param {String} aCSSClass The name of the CSS class to add.
     * @param {Boolean} atEnd Whether or not this CSS class should be added to
     *     the end of the list of CSS classes.
     * @returns {html:Element} The receiver.
     * @todo
     */

    TP.elementAddCSSClass(this.getNativeNode(), aCSSClass, atEnd);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('getClass',
function() {

    /**
     * @name getClass
     * @synopsis Gets the CSS class of the receiver.
     * @returns {String} A string containing the current class name.
     */

    return TP.elementGetClass(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('getStyle',
function() {

    /**
     * @name getStyle
     * @synopsis Gets the style of this component.
     * @returns {String} A string containing the current inline style of this
     *     element.
     */

    return TP.elementGetStyle(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('removeCSSClass',
function(aCSSClass) {

    /**
     * @name removeCSSClass
     * @synopsis Removes the CSS class whose name is equal to aCSSClass from
     *     this object's CSS class name list.
     * @param {String} aCSSClass The name of the CSS class to remove.
     * @returns {html:Element} The receiver.
     */

    TP.elementRemoveCSSClass(this.getNativeNode(), aCSSClass);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('replaceCSSClass',
function(oldCSSClass,newCSSClass) {

    /**
     * @name replaceCSSClass
     * @synopsis Replaces the CSS class whose name is equal to oldCSSClass with
     *     the CSS class named newCSSClass. this object's CSS class name list.
     * @param {String} oldCSSClass The name of the CSS class to replace.
     * @param {String} newCSSClass The name of the CSS class to replace it with.
     * @returns {html:Element} The receiver.
     * @todo
     */

    TP.elementReplaceCSSClass(this.getNativeNode(),
                                oldCSSClass,
                                newCSSClass);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('setClass',
function(aClassName) {

    /**
     * @name setClass
     * @synopsis An optimized method to set the native element's CSS class name
     *     to aClassName.
     * @param {String} aClassName The CSS class name to set the native element's
     *     class name to.
     * @returns {html:Element} The receiver.
     */

    TP.elementSetClass(this.getNativeNode(), aClassName);

    return this;
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('setHidden',
function(beHidden) {

    /**
     * @name setHidden
     * @synopsis The setter for the receiver's hidden state.
     * @param {Boolean} beHidden Whether or not the receiver is in a hidden
     *     state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    if (TP.isTrue(beHidden)) {
        TP.elementHide(node);
    } else {
        TP.elementShow(node);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('setStyle',
function(aStyle) {

    /**
     * @name setStyle
     * @synopsis Sets the style of this component to the style parameters given
     *     in aStyleString.
     * @param {String|TP.lang.Hash} aStyle The description of the style in CSS
     *     format, or a hash of style strings.
     * @returns {html:Element} The receiver.
     */

    var styleObj;

    if (TP.isString(aStyle)) {
        //  We have the whole 'style' String and we want to set it all at
        //  once.
        TP.elementSetStyle(this.getNativeNode(), aStyle);
    }

    styleObj = this.getNativeNode().style;

    //  Loop over all of the key/value pairs in the hash.
    aStyle.perform(
            function(kvPair) {

                var domPropName;

                //  Get the actual DOM property name
                domPropName = kvPair.first().asDOMName();

                //  If we got a valid DOM property, set its value on the
                //  native style object to the value at this key in the
                //  collection.
                if (TP.isString(domPropName)) {
                    styleObj[domPropName] = kvPair.last();
                }
            });

    return this;
});

//  ------------------------------------------------------------------------
//  DATA BINDING
//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Returns the receiver's "value" whatever that means for this
     *     type. The default operations here check for a non-empty value
     *     attribute, a value slot, and finally the text value.
     * @returns {Object} The value of the receiver.
     * @todo
     */

    var node,
        val;

    node = this.getNativeNode();

    //  attribute is our first choice since that's most common
    if (TP.elementHasAttribute(node, 'value')) {
        return this.getAttribute('value');
    }

    //  next choice is a value slot, but that's rare actually
    try {
        if (TP.notEmpty(val = node.value)) {
            return val;
        }
    } catch (e) {
    }

    //  last value option is the text value
    return TP.nodeGetTextContent(node);
});

//  ------------------------------------------------------------------------

TP.html.Element.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the receiver's "value" whatever that means for this type.
     *     The two default operations here are to set a 'value' attribute and a
     *     'value' slot if possible.
     * @param {String} aValue The new value to set.
     * @returns {html:Element} The receiver.
     * @todo
     */

    var node,
        val;

    node = this.getNativeNode();

    //  we'll work in pairs here, since we want to keep the DOM and XML in
    //  sync as much as possible. NOTE that few controls will actually
    //  respond positively to this, so it's typical to override this method
    this.setAttribute('value', aValue);

    try {
        if (TP.notEmpty(val = node.value)) {
            node.value = aValue;
        } else {
            TP.nodeSetTextContent(node, aValue);
        }
    } catch (e) {
        TP.nodeSetTextContent(node, aValue);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
