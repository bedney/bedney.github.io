//  ========================================================================
/*
NAME:   xctrls_MultiItemElement.js
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
 * @type {TP.xctrls.MultiItemElement}
 * @synopsis Mixin that defines methods that allow the receiver to manage
 *     multiple child items, such as a listbox or tabbox.
 * @description This type uses 3 different 'getters' that it expects the type
 *     that it is being mixed into to provide:
 *     
 *     'body' -> The element that new items will be inserted into.
 *     'firstTransform' -> The first 'tsh:transform' that is defined to
 *     transform data into items that will be added. This will have the same
 *     name as a template that the author provided when authoring the markup.
 *     'transformWithName' -> The named 'tsh:transform' that is defined to
 *     transform data into items that will be added. This will have the same
 *     name as a template that the author provided when authoring the markup.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:MultiItemElement');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.MultiItemElement.Inst.defineMethod('addItem',
function(aValue, aPositionOrPath, templateName) {

    /**
     * @name addItem
     * @synopsis Adds a child item to the receiver using a template that should
     *     be embedded under the receiver. If a value for templateName is
     *     supplied, this method attempts to find and use the template named
     *     that. Otherwise, it will use the first embedded template found.
     * @param {Object} aValue The object to use as a data source.
     * @param {String} aPositionOrPath The position to place the content
     *     relative to the document's documentElement or a path to evaluate to
     *     get to a node at that position. This should be one of four values:
     *     TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END, TP.AFTER_END or the
     *     path to evaluate. Default is TP.BEFORE_END.
     * @param {String} templateName The name of the embedded template to use.
     *     This parameter is optional and if it's not supplied, the first
     *     template found will be used.
     * @returns {TP.xctrls.listbox} The receiver.
     * @todo
     */

    var bodyElem,

        transformElem,

        theValue,
        executeRequest;

    //  Grab the body (the place to add items to)
    if (!TP.isElement(bodyElem = this.get('body'))) {
        //  TODO: Raise an exception
        return;
    }

    bodyElem = TP.wrap(bodyElem);

    if (TP.notEmpty(templateName)) {
        transformElem = this.get('transformWithName', templateName);
    }

    //  Either there was no template name supplied or we couldn't find a
    //  template under us with that name, so just get the first one.
    if (!TP.isElement(transformElem)) {
        if (!TP.isElement(transformElem = this.get('firstTransform'))) {
            //  TODO: Raise an exception
            return;
        }
    }

    //  If the supplied data source isn't an Array, make it one.
    if (!TP.isArray(theValue = aValue)) {
        theValue = TP.ac(aValue);
    }

    //  Set up a request to execute the template against the data source
    executeRequest = TP.request(TP.hc('cmdExecute', true,
                                        'cmdPhases', 'Execute',
                                        'cmdSilent', true));

    //  Iterate over the Array of values, executing the template each time,
    //  grabbing the first child out of the template (which will be the new
    //  item itself) and adding it to the body element.
    theValue.perform(
        function(itemValue, index) {

            var newItemStr,
                newItemElem;

            //  Make an index available to the template each time.
            itemValue.atPut('index', index);

            executeRequest.atPut(TP.STDIN, TP.ac(itemValue));

            newItemStr = TP.process(transformElem, executeRequest);

            newItemElem = TP.elem(newItemStr);

            if (TP.notEmpty(aPositionOrPath)) {
                bodyElem.insertProcessedContent(newItemElem,
                                                aPositionOrPath);
            } else {
                bodyElem.addProcessedContent(newItemElem);
            }
});

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
