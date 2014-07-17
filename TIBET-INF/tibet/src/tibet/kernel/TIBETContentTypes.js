//  ========================================================================
/*
NAME:   TIBETContentTypes.js
AUTH:   Scott Shattuck (ss)
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

/* JSHint checking */

/* jshint evil:true
*/

//  ========================================================================
//  TP.lang.Object Extensions
//  ========================================================================

TP.lang.Object.Type.defineMethod('constructContentObject',
function(aURI, content) {

    /**
     * @name constructContentObject
     * @synopsis Returns a content handler for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs.
     * @param {TP.core.URI} aURI The URI containing the content.
     * @param {Object} content The content to set into the content object.
     * @returns {Object} The object representation of the content.
     * @todo
     */

    return this.construct(content);
});

//  ========================================================================
//  TP.core.CSSStyleSheet
//  ========================================================================

/**
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:CSSStyleSheet');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.CSSStyleSheet.Type.defineMethod('constructContentObject',
function(aURI, content) {

    /**
     * @name constructContentObject
     * @synopsis Returns a content handler for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs.
     * @param {TP.core.URI} aURI The URI containing the content.
     * @param {String} content The string content to process.
     * @returns {Object} The object representation of the content.
     * @todo
     */

    return this.construct(aURI, content);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The URI that this stylesheet is coming from, either because it maps to a
//  '.css' file somewhere or its part of an embedded 'style' element that
//  has an ID (either assigned by the author or auto-assigned by TIBET)
//  which is then used as an XPointer.
TP.core.CSSStyleSheet.Inst.defineAttribute('sourceURI');

//  The stylesheet's XML & indexed representation.
TP.core.CSSStyleSheet.Inst.defineAttribute('cssSheet');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CSSStyleSheet.Inst.defineMethod('init',
function(aURI, content) {

    /**
     * @name init
     * @synopsis Initialize the instance.
     * @param {TP.core.URI|String} aURI A TP.core.URI or String containing a
     *     proper URI.
     * @param {String} content The string content to process.
     * @returns {TP.core.CSSStyleSheet} A new instance.
     * @todo
     */

    this.callNextMethod();

    this.set('sourceURI', aURI);
    this.set('cssSheet', content);

    return this;
});

//  ========================================================================
//  TP.core.JSONContent
//  ========================================================================

/**
 * @type {TP.core.JSONContent}
 * @synopsis A content handler specific to the TP.core.JSONContent format.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:JSONContent');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.JSONContent.Type.defineMethod('constructContentObject',
function(aURI, content) {

    /**
     * @name constructContentObject
     * @synopsis Returns a content handler for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs.
     * @param {TP.core.URI} aURI The URI containing the content.
     * @param {String} content The string content to process.
     * @returns {Object} The object representation of the content.
     * @todo
     */

    return this.construct(content);
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Returns a TP.core.JSONContent-formatted string containing the
     *     data in the object provided.
     * @returns {String} A properly formatted TP.core.JSONContent string.
     */

    return TP.js2json(anObject);
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Type.defineMethod('fromNode',
function(aNode) {

    /**
     * @name fromNode
     * @synopsis Returns a TP.core.JSONContent-formatted string built from the
     *     node.
     * @returns {String} A properly formatted TP.core.JSONContent string.
     */

    return TP.xml2json(aNode);
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Type.defineMethod('fromTP_core_Node',
function(aNode) {

    /**
     * @name fromTP_core_Node
     * @synopsis Returns a TP.core.JSONContent-formatted string built from the
     *     node.
     * @returns {String} A properly formatted TP.core.JSONContent string.
     */

    return TP.xml2json(aNode.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Type.defineMethod('reconstitute',
function(aString) {

    /**
     * @name reconstitute
     * @synopsis Returns the object(s) represented by the given
     *     TP.core.JSONContent string.
     * @description If the string isn't valid TP.core.JSONContent this method
     *     returns null.
     * @param {String} aString A TP.core.JSONContent formatted string.
     * @returns {Object} The object representation of the TP.core.JSONContent
     *     string.
     */

    return TP.json2js(aString);
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Type.defineMethod('validate',
function(aString) {

    /**
     * @name validate
     * @synopsis Returns true if the string parameter is valid
     *     TP.core.JSONContent.
     * @param {String} aString A string to test.
     * @returns {Boolean}
     */

    return TP.notEmpty(TP.json2js(aString));
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The JSON content's JavaScript representation
TP.core.JSONContent.Inst.defineAttribute('data');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineMethod('init',
function(data) {

    /**
     * @name init
     * @synopsis Returns a newly constructed Object from inbound JSON content.
     * @param {Object} data The string to use for data.
     * @returns {Object} A new instance.
     */

    var jsonData;

    this.callNextMethod();

    //  If a String was handed in, it's probably JSON - try to convert it.

    if (TP.isString(data) && TP.notEmpty(data)) {
        jsonData = TP.json2js(data);
    } else {
        jsonData = data;
    }

    this.set('data', jsonData);

    return this;
});

//  ========================================================================
//  TP.core.AccessPath
//  ========================================================================

/**
 * @type {TP.core.AccessPath}
 * @synopsis A common supertype for access paths, which can get used in TIBET
 *     get() and set() calls to provide sophisticated data access. Common
 *     subtypes include types to access TIBETan JS objects, 'plain' JSON data
 *     objects and XML data objects.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:AccessPath');

//  This is an abstract supertype - need a concrete subtype to get real work
//  done.
TP.core.AccessPath.isAbstract(true);

//  ------------------------------------------------------------------------

TP.definePrimitive('apc',
function(aPath) {

    return TP.core.AccessPath.construct(aPath);
});

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineAttribute('$observedAddresses');

TP.core.AccessPath.Type.defineAttribute('$executedPaths');

TP.core.AccessPath.Type.defineAttribute('$changedAddresses');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineMethod('construct',
function(aPath, shouldCollapse) {

    /**
     * @name construct
     * @synopsis Returns a new instance of an access path or aPath if it is
     *     already a path.
     * @param {String} aPath The String to build the instance from.
     * @param {Boolean} shouldCollapse Whether or not this path should
     *     'collapse' its results - i.e. if its a collection with only one item,
     *     it will just return that item. The default is false.
     * @returns {TP.core.AccessPath} A new instance or aPath if it's already a
     *     path.
     */

    if (aPath.isAccessPath()) {
        return aPath;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineMethod('getConcreteType',
function(aPath) {

    /**
     * @name getConcreteType
     * @synopsis Returns the type to use for a particular access path.
     * @param {String} aPath A path string from which the subtype will be
     *     determined.
     * @returns {TP.lang.RootObject.<TP.core.AccessPath>} A TP.core.AccessPath
     *     subtype type object.
     */

    var path;

    //  If we're handed a '#tibet(...)' pointer, then we know what kind of
    //  path it is (or should be, anyway)
    if (TP.regex.TIBET_POINTER.test(aPath)) {

        path = TP.regex.TIBET_POINTER.match(aPath);

        //  If it has 'TIBETan' access path characters, create a 'complex' TIBET
        //  path to deal with it.
        if (TP.regex.TIBET_PATH.test(path.at(1))) {
            return TP.core.ComplexTIBETPath;
        } else {
            //  Otherwise, it's just a simple path
            return TP.core.SimpleTIBETPath;
        }
    }

    //  Barename (i.e. ID) paths
    if (TP.regex.BARENAME.test(aPath)) {
        return TP.core.BarenamePath;
    }

    //  It could be some kind of XPointer - either xpointer(), xpath1() or
    //  element() scheme
    if (TP.regex.XPOINTER.test(aPath)) {

        //  If we're handed an '#element(...)' pointer, then we know what kind
        //  of path it is (or should be, anyway)

        //  NB: We do *not* check against TP.regex.ELEMENT_PATH here, since it
        //  matches all IDs ("#"), attributes ("@"), etc.
        if (TP.regex.ELEMENT_POINTER.test(aPath)) {
            return TP.core.ElementPath;
        } else {
            return TP.core.XPathPath;
        }
    }

    //  If we're handed an '#css(...)' or other kind of 'xtension' pointer, then
    //  we know what kind of path it is (or should be, anyway)
    if (TP.regex.XTENSION_POINTER.test(aPath)) {
        return TP.core.XTensionPath;
    }

    //  attribute paths
    if (TP.regex.ATTRIBUTE.test(aPath)) {
        return TP.core.SimpleXMLPath;
    }

    //  If there is no 'path punctuation' (only word characters), that means
    //  it's all alphanumeric characters, which means it's a 'simple path'.
    if (TP.regex.ONLY_WORD.test(aPath)) {
        return TP.core.SimpleTIBETPath;
    }

    //  Otherwise, if it has 'TIBETan' access path characters, create a TIBET
    //  path to deal with it.
    if (TP.regex.TIBET_PATH.test(aPath)) {
        return TP.core.ComplexTIBETPath;
    }

    if (TP.regex.XPATH_PATH.test(aPath) ||
        TP.regex.HAS_SLASH.test(aPath)) {
        return TP.core.XPathPath;
    }

    return TP.core.CSSPath;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineMethod('$getExecutedPaths',
function() {

    /**
     * @name $getExecutedPaths
     * @synopsis Returns the hash to use to register executed paths. This method
     *     is supplied to avoid problems with this hash not being initialized
     *     when TIBET is starting up.
     * @returns {TP.lang.Hash} The executed paths hash.
     */

    var theHash;

    if (TP.notValid(theHash = this.$get('$executedPaths'))) {
        theHash = TP.hc();
        this.set('$executedPaths', theHash);
    }

    return theHash;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineMethod('$getChangedAddresses',
function() {

    /**
     * @name $getChangedAddresses
     * @synopsis Returns the Array to use to register changed addresses. This
     *     method is supplied to avoid problems with this hash not being
     *     initialized when TIBET is starting up.
     * @returns {Array} The changed addresses array.
     */

    var theArray;

    if (TP.notValid(theArray = this.$get('$changedAddresses'))) {
        theArray = TP.ac();
        this.set('$changedAddresses', theArray);
    }

    return theArray;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineMethod('$getObservedAddresses',
function() {

    /**
     * @name $getObservedAddresses
     * @synopsis Returns the hash to use to register observed addresses. This
     *     method is supplied to avoid problems with this hash not being
     *     initialized when TIBET is starting up.
     * @returns {TP.lang.Hash} The observed addresses hash.
     */

    var theHash;

    if (TP.notValid(theHash = this.$get('$observedAddresses'))) {
        theHash = TP.hc();
        this.set('$observedAddresses', theHash);
    }

    return theHash;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineMethod('registerChangedAddress',
function(anAddress, anAction) {

    /**
     * @name registerChangedAddress
     * @synopsis Registers a 'data address' (i.e. a unique location in the
     *     source object that is currently being processed by the receiver) as a
     *     'changed' address (i.e. a location where the data has been changed)
     * @param {String} anAddress The data address where the data change took
     *     place.
     * @param {String} anAction The 'action' that was taken by the 'set'
     *     machinery. This should be one of:
     *          TP.CREATE
     *          TP.UPDATE
     *          TP.DELETE
     * @returns {Object} The receiver.
     */

    TP.core.AccessPath.$getChangedAddresses().push(
        TP.hc('address', anAddress, 'action', anAction));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineMethod('registerObservedAddress',
function(anAddress, sourceObjectID, interestedPath) {

    /**
     * @name registerObservedAddress
     * @synopsis Registers a 'data address' (i.e. a unique location in the
     *     source object that is currently being processed by the receiver) as
     *     an 'observed' address (i.e. a location where the data has been
     *     retrieved and observers might be interested in changes there).
     * @param {String} anAddress The data address where the data retrieval took
     *     place.
     * @param {String} sourceObjectID The unique ID of the source object.
     * @param {String} interestedPath The String representation of the path that
     *     is interested in changes at the supplied address.
     * @returns {Object} The receiver.
     */

    var addressMap,

        sources,
        paths;

    //  Build a map that looks like this:
    //  {
    //      <sourceObjID>  :    {
    //                              <address>   :   [pathStr1, pathStr2, ...]
    //                          }
    //  }

    //  All observed addresses in the system
    addressMap = TP.core.AccessPath.$getObservedAddresses();

    //  Observed addresses are only interesting in the combination between the
    //  path *and* the data object it was executed against.

    sources = addressMap.atPutIfAbsent(sourceObjectID, TP.hc());

    paths = sources.atPutIfAbsent(anAddress, TP.ac());
    paths.add(interestedPath);

    //  Make sure to unique the paths so that we don't have more than one
    //  occurrence of the same path for a particular address.
    paths.unique();

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The path's internal path
TP.core.AccessPath.Inst.defineAttribute('srcPath');

//  Whether or not to make data structures on execution
TP.core.AccessPath.Inst.defineAttribute('shouldMake');

//  How to make data structures on execution (if we are making them)
TP.core.AccessPath.Inst.defineAttribute('packageWith');

//  Whether or not to collapse results into a single value
TP.core.AccessPath.Inst.defineAttribute('shouldCollapse');

//  How to extract a 'final value'
TP.core.AccessPath.Inst.defineAttribute('extractWith');

//  If a 'not valid' value is found, this Function can create values
TP.core.AccessPath.Inst.defineAttribute('fallbackWith');

//  Paths that would have been invalidated due to structural mutations
TP.core.AccessPath.Inst.defineAttribute('$invalidatedPaths');

//  Addresses to remove due to structural mutations
TP.core.AccessPath.Inst.defineAttribute('$addressesToRemove');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('init',
function(aPath, shouldCollapse) {

    /**
     * @name init
     * @synopsis Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {Boolean} shouldCollapse Whether or not this path should
     *     'collapse' its results - i.e. if its a collection with only one item,
     *     it will just return that item. The default is false.
     * @returns {TP.core.AccessPath} The receiver.
     */

    this.callNextMethod();

    this.set('srcPath', aPath);
    this.set('shouldMake', false);
    this.set('shouldCollapse', TP.ifInvalid(shouldCollapse, false));

    this.set('$invalidatedPaths', TP.ac());
    this.set('$addressesToRemove', TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var str,
        val;

    str = TP.tname(this) + '.construct(\'' + this.get('srcPath') +
           '\')';

    if ((val = this.get('shouldMake')) === true) {
        str += '.set(\'shouldMake\', ' + val + ')';
    }

    if ((val = this.get('shouldCollapse')) === true) {
        str += '.set(\'shouldCollapse\', ' + val + ')';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var repStr,
        str;

    repStr = this.$get('srcPath').asString();

    try {
        str = TP.tname(this) + ' :: ' + '(' + repStr + ')';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    return '<span class="TP_core_AccessPath ' +
                    TP.escapeTypeName(TP.tname(this)) + '">' +
                this.asString() +
            '<\/span>';
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var str;

    try {
        str = '{"type":' + TP.tname(this).quoted('"') + ',' +
                '"data":' + this.$get('srcPath').asString().quoted('"') + '}';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '<\/dd>' +
                    '<dt class="pretty key">Path:<\/dt>' +
                    '<dd class="pretty value">' +
                        this.asString() +
                    '<\/dd>' +
                    '<\/dl>';
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('asString',
function() {

    /**
     * @name asString
     * @synopsis Returns the String representation of the receiver.
     * @returns {String} The String representation of the receiver.
     */

    return this.get('srcPath');
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    return '<instance type="' + TP.tname(this) + '"' +
                    ' path="' + this.asString() + '"\/>';
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('isAccessPath',
function() {

    /**
     * @name isAccessPath
     * @synopsis Returns whether or not the receiver is an access path object.
     * @returns {Boolean} True - the receiver is an access path.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @name executeGet
     * @synopsis Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     get data.
     * @param {arguments} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('executeSet',
function(targetObj, attributeValue, shouldSignal, varargs) {

    /**
     * @name executeSet
     * @synopsis Executes the path in a 'set' fashion - i.e. with the intent of
     *     setting the supplied data into the supplied target object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     set data.
     * @param {attributeValue} Object The object to use as the value to set into
     *     the target object.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @param {arguments} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @returns {Object} The result of executing a 'set' against the target
     *     object using the receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('getFirstSimplePath',
function() {

    /**
     * @name getFirstSimplePath
     * @synopsis Returns the first 'simple path' of the receiver. For instance,
     *     in a simple path such as '1.2.3', this method will return '1'.
     * @returns {String} The first simple path of the receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('processFinalValue',
function(aReturnValue, targetObj) {

    /**
     * @name processFinalValue
     * @synopsis Processes the final value before it is returned from the
     *     receiver
     * @description This method postprocesses the final value before it is
     *     returned from the receiver. This postprocessing includes the
     *     following steps, if they are configured on the receiver:
     *          1.  Collapsing any single-valued Collection results
     *          2.  Using an extractor to extract a final value 'beyond' the
     *          last path step
     *          3.  Packaging any remaining results into a type or by using a
     *          Function
     *          4.  Using a fallback Function to create a result if one couldn't
     *          be found (i.e. the value is not valid).
     * @param {Object} aReturnValue The initial return value from this path.
     * @param {targetObj} Object The object to that the receiver has just
     *     executed against.
     * @returns {Object} The final value to be returned from this path.
     */

    var retVal,

        shouldCollapse,
        extractWith,

        keys,

        packageWith,
        fallbackWith;

    if (TP.isValid(retVal = aReturnValue)) {

        //  If we're configured to collapse, then do it.
        if ((shouldCollapse = this.get('shouldCollapse'))) {
            retVal = TP.collapse(retVal);
        }

        //  If we're configured to extract with either an aspect name or a
        //  Function, then do that. Note that if we have a collection then we
        //  extract each value in the collection using our extractor.
        if (TP.isValid(extractWith = this.get('extractWith'))) {
            if (TP.isCollection(retVal)) {
                keys = TP.keys(retVal);

                keys.perform(
                        function(aKey) {
                            retVal.atPut(
                                aKey,
                                TP.val(retVal.at(aKey), extractWith));
                        });
            } else {
                retVal = TP.val(retVal, extractWith);
            }
        }

        //  If we have a 'packageWith' configured, then it's either a Function
        //  or a Type (or String type name). Use it to package the results.
        if (TP.isValid(packageWith = this.get('packageWith'))) {
            if (TP.isCallable(packageWith)) {
                retVal = packageWith(retVal);
            } else if (TP.isType(packageWith)) {
                retVal = packageWith.construct(retVal);
            } else if (TP.isString(packageWith) &&
                        TP.isType(packageWith = packageWith.asType())) {
                retVal = packageWith.construct(retVal);
            }
        }
    } else if (TP.isCallable(fallbackWith = this.get('fallbackWith'))) {
        //  If we didn't have a suitable return value, but we were configured
        //  with a fallback Function, then go ahead and use it to try to return
        //  an initial value.
        retVal = fallbackWith(targetObj);
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('updateRegistrationsAfterSignaling',
function(targetObj) {

    /**
     * @name updateRegistrationsAfterSignaling
     * @synopsis Updates any path registrations and their attendant address
     *     information after signaling a change. This method is called to
     *     provide any 'cleanup' for paths that reference data that no longer
     *     exist and to reset them to data that might now exist at the same
     *     address.
     * @param {targetObj} Object The object to update the path and address
     *     information for.
     * @returns {TP.core.AccessPath} The receiver.
     */

    var observedAddresses,

        executedPaths,

        invalidatedPaths,
        addressesToRemove;

    observedAddresses = TP.core.AccessPath.$getObservedAddresses().at(
                            TP.id(targetObj));

    if (TP.isEmpty(observedAddresses)) {
        return this;
    }

    executedPaths = TP.core.AccessPath.$getExecutedPaths().at(
                            TP.id(targetObj));

    invalidatedPaths = this.get('$invalidatedPaths');
    addressesToRemove = this.get('$addressesToRemove');

    //  Remove old addresses that are now no longer valid (since we signaled
    //  them with a TP.DELETE). If we created structure as well (i.e. replaced
    //  one tree with another tree), then executing the 'get' below will
    //  repopulate this with addresses that are still valid.
    observedAddresses.removeKeys(addressesToRemove);

    //  Remove the matching paths that were invalid from the executed paths.
    //  Again, if we created structure, then executing the 'get' below will
    //  repopulate this with paths that are still valid.
    executedPaths.removeAll(invalidatedPaths);

    //  Now, we need to go through the invalidated paths and rerun their 'get'
    //  to re-execute and re-register their path.
    invalidatedPaths.perform(
            function (aPath) {
                TP.apc(aPath).executeGet(targetObj);
            });

    invalidatedPaths.empty();
    addressesToRemove.empty();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('updateRegistrationsBeforeSignaling',
function(targetObj) {

    /**
     * @name updateRegistrationsBeforeSignaling
     * @synopsis Updates any path registrations and their attendant address
     *     information before signaling a change. This method is called to
     *     mark any paths that match addresses that reference data that might be
     *     being deleted or whose structure is changing. This information is
     *     then used after signaling change to 'clean up' these referred to
     *     paths and addresses.
     * @param {targetObj} Object The object to update the path and address
     *     information for.
     * @returns {TP.core.AccessPath} The receiver.
     */

    var observedAddresses,
        observedAddressesKeys,

        changedAddresses,

        invalidatedPaths,
        addressesToRemove;

    //  We need to clear the path information registered for the addresses
    //  'under' the data that changed.
    observedAddresses = TP.core.AccessPath.$getObservedAddresses().at(
                            TP.id(targetObj));

    if (TP.isEmpty(observedAddresses)) {
        return this;
    }

    observedAddressesKeys = TP.keys(observedAddresses);

    //  Go through the addresses that changed and match them against any
    //  entries in observedAddresses
    changedAddresses = TP.core.AccessPath.$getChangedAddresses();

    invalidatedPaths = this.get('$invalidatedPaths');
    addressesToRemove = this.get('$addressesToRemove');

    changedAddresses.perform(
            function (locAddrPair) {
                var anAddress,

                    i,
                    len,

                    theKey;

                anAddress = locAddrPair.at('address');

                len = observedAddressesKeys.getSize();
                for (i = 0; i < len; i++) {

                    theKey = observedAddressesKeys.at(i);

                    //  Since we're removing keys along the way (and altering
                    //  the data structure as we go), we need this check
                    if (!observedAddresses.hasKey(theKey)) {
                        continue;
                    }

                    if (theKey === anAddress) {
                        //  An address/action pair has already been entered for
                        //  the actual changed address at the root, so we don't
                        //  need to do anything here.
                        continue;
                    } else if (theKey.startsWith(anAddress)) {
                        invalidatedPaths = invalidatedPaths.concat(
                                        observedAddresses.at(theKey));
                        addressesToRemove.push(theKey);

                        TP.core.AccessPath.registerChangedAddress(
                                theKey, TP.DELETE);
                    }
                }
            });

    invalidatedPaths = invalidatedPaths.unique();

    this.set('$invalidatedPaths', invalidatedPaths);
    this.set('$addressesToRemove', addressesToRemove);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('sendChangedSignal',
function(targetObj) {

    /**
     * @name sendChangedSignal
     * @synopsis Sends a signal using the supplied target object as the origin
     *     to let observers know that we have changed.
     * @param {targetObj} Object The object to send the 'changed signal' from.
     * @returns {TP.core.AccessPath} The receiver.
     */

    var allAddresses,

        observedAddresses,

        executedPaths,

        changedAddresses,
        changedPaths;

    //  '$observedAddresses' is a map that looks like this:
    //  {
    //      <sourceObjID>  :    {
    //                              <address>   :   [path1, path2, ...]
    //                          }
    //  }

    allAddresses = TP.core.AccessPath.$getObservedAddresses();

    observedAddresses = allAddresses.at(TP.id(targetObj));

    //  If we couldn't find any 'observed' addresses for the target object, then
    //  we should try to compute them - at least for this path. This is normally
    //  done by doing a 'get'.

    if (TP.isEmpty(observedAddresses)) {
        this.executeGet(targetObj);

        observedAddresses = allAddresses.at(TP.id(targetObj));

        //  If we still can't find any, then we just exit
        if (TP.isEmpty(observedAddresses)) {
            return this;
        }
    } else {

        //  Make sure that this path is registered in 'executed paths' - to make
        //  sure that at least observers of this path will be notified.
        executedPaths = TP.core.AccessPath.$getExecutedPaths().at(
                            TP.id(targetObj));

       //  If we can't find any executed paths for the source, or not one for
       //  this path, then execute a get - this will register this path in both
       //  'executed paths' and, more importantly, will register any addresses
       //  that this path references in the data object
        if (TP.notValid(executedPaths) ||
            TP.notValid(executedPaths.at(this.get('srcPath')))) {
            this.executeGet(targetObj);
        }
    }

    //  Grab all of the data addresses that changed. We'll iterate over this,
    //  comparing with the 'observed' addresses and then collect the paths that
    //  did those observations.

    changedAddresses = TP.core.AccessPath.$getChangedAddresses();

    changedPaths = TP.hc();

    observedAddresses.perform(
        function (addressPair) {
            var observedAddress,
                interestedPaths,

                i,
                j,

                records,

                record;

            observedAddress = addressPair.first();

            //  Note that this is an Array of paths
            interestedPaths = addressPair.last();

            for (i = 0; i < changedAddresses.getSize(); i++) {

                if (changedAddresses.at(i).at('address') === observedAddress) {

                    //  We found an address match between changed and observed
                    //  addresses. Add the paths from the observed address and
                    //  the action from the changed address into the Array of
                    //  'changed paths'.

                    for (j = 0; j < interestedPaths.getSize(); j++) {

                        record = changedAddresses.at(i);

                        //  Make sure there's an Array at actions, since the
                        //  address could've been changed in more than one way.
                        if (TP.isArray(
                                records =
                                changedPaths.at(interestedPaths.at(j)))) {

                            records.push(record);
                        } else {
                            //  New entry - create an Array.
                            changedPaths.atPut(interestedPaths.at(j),
                                                TP.ac(record));
                        }
                    }
                }
            }
        });

    //  Note how we send a 'true' here for forcing change signaling. Callers of
    //  this method should've already checked to make sure we should be
    //  signaling - otherwise, we just did an expensive computation for nothing.
    targetObj.changed('value',
                        TP.UPDATE,
                        TP.hc(TP.CHANGE_PATHS, changedPaths),
                        true);

    return this;
});

//  ========================================================================
//  TP.core.SimpleTIBETPath
//  ========================================================================

/**
 * @type {TP.core.SimpleTIBETPath}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.AccessPath.defineSubtype('SimpleTIBETPath');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Type.defineAttribute('$traversalLevel');
TP.core.SimpleTIBETPath.Type.defineAttribute('$prefixParts');

TP.core.SimpleTIBETPath.Type.defineAttribute('$currentSource');
TP.core.SimpleTIBETPath.Type.defineAttribute('$currentPath');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Performs one-time setup for the type on startup/import.
     */

    this.Type.set('$traversalLevel', 0);
    this.Type.set('$prefixParts', TP.ac());
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Type.defineMethod('endChangedAddress',
function() {

    /**
     * @name endChangedAddress
     * @synopsis
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    this.get('$prefixParts').pop();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Type.defineMethod('endObservedAddress',
function() {

    /**
     * @name endObservedAddress
     * @synopsis
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    this.get('$prefixParts').pop();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Type.defineMethod('getChangedAddress',
function() {

    /**
     * @name getChangedAddress
     * @synopsis
     * @returns {String}
     */

    return this.get('$prefixParts').join('.');
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Type.defineMethod('startChangedAddress',
function(addressPart) {

    /**
     * @name startChangedAddress
     * @synopsis
     * @param {String} addressPart
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var prefixParts;

    prefixParts = this.get('$prefixParts');

    prefixParts.push(addressPart);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Type.defineMethod('startObservedAddress',
function(addressPart) {

    /**
     * @name startObservedAddress
     * @synopsis
     * @param {String} addressPart
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var prefixParts,

        sourceObjectID,
        pathSrc;

    prefixParts = this.get('$prefixParts');

    prefixParts.push(addressPart);

    sourceObjectID = TP.id(TP.core.SimpleTIBETPath.get('$currentSource'));
    pathSrc = TP.core.SimpleTIBETPath.get('$currentPath').get('srcPath');

    this.registerObservedAddress(prefixParts.join('.'),
                                    sourceObjectID,
                                    pathSrc);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('init',
function(aPath, shouldCollapse) {

    /**
     * @name init
     * @synopsis Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {Boolean} shouldCollapse Whether or not this path should
     *     'collapse' its results - i.e. if its a collection with only one item,
     *     it will just return that item. The default is false.
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var path;

    //  Make sure that any 'access path' scheme is stripped off
    if (TP.regex.TIBET_POINTER.test(aPath)) {
        path = TP.regex.TIBET_POINTER.match(aPath).at(1);
    } else {
        path = aPath;
    }

    this.callNextMethod(path, shouldCollapse);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @name executeGet
     * @synopsis Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     get data.
     * @param {arguments} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var args,

        path,

        retVal;

    this.preGetAccess(targetObj);

    this.getType().startObservedAddress(this.get('srcPath'));

    //  Fill in any templated expressions in the path (which must be numeric
    //  positions) with data from the passed arguments.
    path = this.get('srcPath');
    if (TP.regex.HAS_ACP.test(path)) {
        //  Grab the arguments and slice the first one off (since it's the
        //  targetObj, which we already have).
        args = TP.args(arguments, 1);

        path = path.transform(args);
    }

    retVal = targetObj.get(path);

    this.getType().endObservedAddress();

    this.postGetAccess(targetObj);

    return this.processFinalValue(retVal, targetObj);
});

//  -----------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('executeSet',
function(targetObj, attributeValue, shouldSignal, varargs) {

    /**
     * @name executeSet
     * @synopsis Executes the path in a 'set' fashion - i.e. with the intent of
     *     setting the supplied data into the supplied target object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     set data.
     * @param {attributeValue} Object The object to use as the value to set into
     *     the target object.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @param {arguments} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @returns {Object} The result of executing a 'set' against the target
     *     object using the receiver.
     */

    var srcPath,
        thisType,

        op,

        args,

        retVal,
        traversalLevel,

        sigFlag,

        mutatedStructure;

    srcPath = this.get('srcPath');
    thisType = this.getType();

    if (TP.notValid(targetObj)) {
      return this.raise('TP.sig.InvalidParameter', arguments);
    }

    if (TP.notValid(attributeValue)) {
        op = TP.DELETE;
    } else if (TP.isDefined(targetObj.get(srcPath))) {
        op = TP.UPDATE;
    } else {
        op = TP.CREATE;
    }

    this.preSetAccess(targetObj);

    thisType.startChangedAddress(srcPath);

    thisType.registerChangedAddress(thisType.getChangedAddress(), op);

    if (TP.regex.HAS_ACP.test(srcPath)) {
        //  Grab the arguments and slice the first three off (since they're
        //  targetObj, attributeValue and shouldSignal which we already have).
        args = TP.args(arguments, 3);

        srcPath = srcPath.transform(args);
    }

    //  Note here how we always do the set with a 'false' and then send a
    //  'changed' message later with additional information. We also pass a
    //  second 'false' to avoid warnings on undeclared attributes.
    retVal = targetObj.set(srcPath, attributeValue, false, false);

    thisType.endChangedAddress();

    this.postSetAccess(targetObj);

    traversalLevel = TP.core.SimpleTIBETPath.get('$traversalLevel');

    if (traversalLevel === 0) {

        if (TP.isValid(shouldSignal)) {
          sigFlag = shouldSignal;
        } else if (TP.isValid(targetObj)) {
          sigFlag = targetObj.shouldSignalChange();
        }

        if (sigFlag) {

            mutatedStructure = TP.isReferenceType(attributeValue);

            if (mutatedStructure) {
                this.updateRegistrationsBeforeSignaling(targetObj);
            }

            //  Send the changed signal
            this.sendChangedSignal(targetObj);

            if (mutatedStructure) {
                this.updateRegistrationsAfterSignaling(targetObj);
            }
        }

        //  Empty the changed addresses now that we've sent the signal.
        TP.core.AccessPath.$getChangedAddresses().empty();
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('getFirstSimplePath',
function() {

    /**
     * @name getFirstSimplePath
     * @synopsis Returns the first 'simple path' of the receiver. For instance,
     *     in a simple path such as '1.2.3', this method will return '1'.
     * @returns {String} The first simple path of the receiver.
     */

    //  For simple paths, our whole path is the first simple path.
    return this.get('srcPath');
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('preGetAccess',
function(targetObj) {

    /**
     * @name preGetAccess
     * @synopsis
     * @param {targetObj} Object
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var executedPaths;

    executedPaths = TP.core.AccessPath.$getExecutedPaths().atPutIfAbsent(
                    TP.id(targetObj),
                    TP.hc());

    executedPaths.atPut(this.get('srcPath'), true);

    TP.core.SimpleTIBETPath.set(
        '$currentSource',
        TP.ifInvalid(TP.core.SimpleTIBETPath.get('$currentSource'), targetObj));
    TP.core.SimpleTIBETPath.set(
        '$currentPath',
        TP.ifInvalid(TP.core.SimpleTIBETPath.get('$currentPath'), this));

    TP.core.SimpleTIBETPath.set(
        '$traversalLevel',
        TP.core.SimpleTIBETPath.get('$traversalLevel') + 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('preSetAccess',
function(targetObj) {

    /**
     * @name preSetAccess
     * @synopsis
     * @param {targetObj} Object
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    TP.core.SimpleTIBETPath.set(
        '$traversalLevel',
        TP.core.SimpleTIBETPath.get('$traversalLevel') + 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('postGetAccess',
function(targetObj) {

    /**
     * @name postGetAccess
     * @synopsis
     * @param {targetObj} Object
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var traversalLevel;

    traversalLevel = TP.core.SimpleTIBETPath.get('$traversalLevel') - 1;

    TP.core.SimpleTIBETPath.set('$traversalLevel', traversalLevel);

    if (traversalLevel === 0) {
        TP.core.SimpleTIBETPath.set('$currentSource', null);
        TP.core.SimpleTIBETPath.set('$currentPath', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('postSetAccess',
function(targetObj) {

    /**
     * @name postSetAccess
     * @synopsis
     * @param {targetObj} Object
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var traversalLevel;

    traversalLevel = TP.core.SimpleTIBETPath.get('$traversalLevel') - 1;

    TP.core.SimpleTIBETPath.set('$traversalLevel', traversalLevel);

    return this;
});

//  ========================================================================
//  TP.core.ComplexTIBETPath
//  ========================================================================

/**
 * @type {TP.core.ComplexTIBETPath}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.defineSubtype('ComplexTIBETPath');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The transformed path we actually execute - it may have templated
//  expressions.
TP.core.ComplexTIBETPath.Inst.defineAttribute('$transformedPath');

//  Whether or not the receiver 'created structure' on it's latest run. This is
//  reset after each 'setter run' of the path.
TP.core.ComplexTIBETPath.Inst.defineAttribute('$createdStructure');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @name executeGet
     * @synopsis Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     get data.
     * @param {arguments} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @raises TP.sig.InvalidPath
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var args,

        path,

        retVal;

    //  This kind of path won't work against XML
    if (TP.isNode(targetObj) || TP.isKindOf(targetObj, TP.core.Node)) {
        return this.raise('TP.sig.InvalidPath', arguments);
    }

    this.preGetAccess(targetObj);

    //  Fill in any templated expressions in the path (which must be numeric
    //  positions) with data from the passed arguments.
    path = this.get('srcPath');
    if (TP.regex.HAS_ACP.test(path)) {
        //  Grab the arguments and slice the first one off (since it's the
        //  targetObj, which we already have).
        args = TP.args(arguments, 1);

        path = path.transform(args);
    }
    this.set('$transformedPath', path);

    if (TP.isString(targetObj)) {
        retVal = this.$executeStringGet(targetObj);
    } else if (TP.isArray(targetObj)) {
        retVal = this.$executeArrayGet(targetObj);
    } else {
        retVal = this.$executeObjectGet(targetObj);
    }

    this.postGetAccess(targetObj);

    return this.processFinalValue(retVal, targetObj);
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.defineMethod('executeSet',
function(targetObj, attributeValue, shouldSignal, varargs) {

    /**
     * @name executeSet
     * @synopsis Executes the path in a 'set' fashion - i.e. with the intent of
     *     setting the supplied data into the supplied target object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     set data.
     * @param {attributeValue} Object The object to use as the value to set into
     *     the target object.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @param {arguments} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @raises TP.sig.InvalidPath
     * @returns {Object} The result of executing a 'set' against the target
     *     object using the receiver.
     */

    var path,
        args,

        retVal,
        traversalLevel,

        sigFlag,

        mutatedStructure,
        executedPaths;

    if (TP.notValid(targetObj)) {
      return this.raise('TP.sig.InvalidParameter', arguments);
    }

    //  This kind of path won't work against XML
    if (TP.isNode(targetObj) || TP.isKindOf(targetObj, TP.core.Node)) {
      return this.raise('TP.sig.InvalidPath', arguments);
    }

    this.set('$createdStructure', false);

    this.preSetAccess(targetObj);

    //  Fill in any templated expressions in the path (which must be numeric
    //  positions) with data from the passed arguments.
    path = this.get('srcPath');
    if (TP.regex.HAS_ACP.test(path)) {
        //  Grab the arguments and slice the first three off (since they're
        //  targetObj, attributeValue and shouldSignal which we already have).
        args = TP.args(arguments, 3);

        path = path.transform(args);
    }
    this.set('$transformedPath', path);

    //  Note here how we always do the set with a 'false' and then send a
    //  'changed' message later with additional information.

    if (TP.isArray(targetObj)) {
        retVal = this.$executeArraySet(targetObj, attributeValue, false);
    } else {
        retVal = this.$executeObjectSet(targetObj, attributeValue, false);
    }

    this.postSetAccess(targetObj);

    traversalLevel = TP.core.SimpleTIBETPath.get('$traversalLevel');

    if (traversalLevel === 0) {

        if (TP.isValid(shouldSignal)) {
          sigFlag = shouldSignal;
        } else if (TP.isValid(targetObj)) {
          sigFlag = targetObj.shouldSignalChange();
        }

        if (sigFlag) {

            mutatedStructure = TP.isReferenceType(attributeValue);

            if (mutatedStructure) {
                this.updateRegistrationsBeforeSignaling(targetObj);
            }

            if (this.get('$createdStructure')) {
                executedPaths = TP.core.AccessPath.$getExecutedPaths().at(
                                        TP.id(targetObj));

                executedPaths.perform(
                        function (pathEntry) {
                            TP.apc(pathEntry.first()).executeGet(targetObj);
                        });
            }

            //  Send the changed signal
            this.sendChangedSignal(targetObj);

            if (mutatedStructure) {
                this.updateRegistrationsAfterSignaling(targetObj);
            }
        }

        //  Empty the changed addresses now that we've sent the signal.
        TP.core.AccessPath.$getChangedAddresses().empty();
    }

    this.set('$createdStructure', false);

    return retVal;
});

//  ------------------------------------------------------------------------
//  Getter Methods
//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.defineMethod('$executeArrayGet',
function(targetObj) {

    /**
     * @name $executeArrayGet
     * @synopsis Returns the result of executing the path in a 'get' fashion
     *     against an object of type 'Array'.
     * @param {targetObj} Array The object to execute the receiver against to
     *     retrieve data.
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var attrName,

        dotIndex,

        query,

        thisType,

        hadNaN,

        queryParts,

        val,
        retVal;

    attrName = this.get('$transformedPath');

    //  See if we need to traverse down via a period ('.') or if this is
    //  completely a range that we handle here.
    if ((dotIndex = attrName.indexOf('.')) !== -1) {
        query = attrName.slice(0, dotIndex);
        attrName = attrName.slice(dotIndex + 1);
    } else {
        query = attrName;
        attrName = null;
    }

    thisType = this.getType();

    if (/[,:]/.test(query)) {
        val = TP.ac();

        if (TP.regex.HAS_COLON.test(query)) {

            //  If there is no attrName, that means that there was nothing left
            //  after consuming our own query. In that case, we just return an
            //  Array with our items.
            if (TP.notValid(attrName)) {
                targetObj.vslice(query).perform(
                        function(index) {

                            thisType.startObservedAddress(index);

                            val.push(targetObj.at(index));

                            thisType.endObservedAddress();
                        });
            } else {
                //  Otherwise, we take each one of our items and capture the
                //  return value of its 'get'.
                targetObj.vslice(query).perform(
                        function(index) {

                            thisType.startObservedAddress(index);

                            val.push(targetObj.at(index).get(TP.apc(attrName)));

                            thisType.endObservedAddress();
                        });
            }
        } else {
            //  Make sure to strip off the leading '[' and trailing ']'
            query = query.slice(1, query.getSize() - 1);

            hadNaN = false;

            queryParts = query.split(',').convert(
                                function(item) {

                                    var itemVal;

                                    if (!TP.isNumber(
                                            itemVal = item.asNumber())) {
                                        hadNaN = true;
                                    }

                                    return itemVal;
                                });

            if (hadNaN) {
                return undefined;
            }

            //  If there is no attrName, that means that there was nothing left
            //  after consuming our own query. In that case, we just return an
            //  Array with our items.
            if (TP.notValid(attrName)) {
                targetObj.performOver(
                        function(item, key) {

                            thisType.startObservedAddress(key);

                            val.push(item);

                            thisType.endObservedAddress();
                        }, queryParts);
            } else {
                //  Otherwise, we take each one of our items and capture the
                //  return value of its 'get'.
                targetObj.performOver(
                        function(item, key) {

                            thisType.startObservedAddress(key);

                            if (TP.isValid(item)) {
                                val.push(item.get(TP.apc(attrName)));
                            } else {
                                val.push(item);
                            }

                            thisType.endObservedAddress();
                        }, queryParts);
            }
        }

        return val;
    }

    //  call back in with first part of access path
    if (TP.notValid(val = targetObj.get(query))) {
        return val;
    }

    //  only continue if the attrName is valid and the result object can
    //  stay with the program :)
    if (TP.isString(attrName) && TP.canInvoke(val, 'get')) {
        thisType.startObservedAddress(query);

        retVal = val.get(TP.apc(attrName));

        thisType.endObservedAddress();

        return retVal;
    } else {
        return val;
    }

    //  Had an access character, but we can't compute the path.
    return;
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.defineMethod('$executeObjectGet',
function(targetObj) {

    /**
     * @name $executeObjectGet
     * @synopsis Returns the result of executing the path in a 'get' fashion
     *     against an object of type 'Object'.
     * @param {targetObj} Object The object to execute the receiver against to
     *     retrieve data.
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var attrName,

        dotIndex,

        query,

        thisType,

        queryParts,

        val,
        retVal;

    attrName = this.get('$transformedPath');

    //  See if we need to traverse down via a period ('.') or if this is
    //  completely a range that we handle here.
    if ((dotIndex = attrName.indexOf('.')) !== -1) {
        query = attrName.slice(0, dotIndex);
        attrName = attrName.slice(dotIndex + 1);
    } else {
        query = attrName;
        attrName = null;
    }

    thisType = this.getType();

    if (/,/.test(query)) {
        //  Make sure to strip off the leading '[' and trailing ']'
        query = query.slice(1, query.getSize() - 1);

        queryParts = query.split(',');

        val = TP.ac();

        //  If there is no attrName, that means that there was nothing left
        //  after consuming our own query. In that case, we just return an Array
        //  with our items.
        if (TP.notValid(attrName)) {
            targetObj.performOver(
                    function(item, key) {

                        thisType.startObservedAddress(key);

                        val.push(item);

                        thisType.endObservedAddress();
                    }, queryParts);
        } else {
            //  Otherwise, we take each one of our items and capture the return
            //  value of its 'get'.
            targetObj.performOver(
                    function(item, key) {

                        thisType.startObservedAddress(key);

                        if (TP.isValid(item)) {
                            val.push(item.get(TP.apc(attrName)));
                        } else {
                            val.push(item);
                        }

                        thisType.endObservedAddress();

                    }, queryParts);
        }

        return val;
    }

    //  call back in with first part of access path
    if (query !== attrName) {

        if (TP.notValid(val = targetObj.get(query))) {
            //  could be a hash key instead...
            return targetObj.getProperty(attrName);
        }
    }

    //  only continue if the attrName is valid and the result object can stay
    //  with the program :)
    if (TP.isString(attrName) && TP.canInvoke(val, 'get')) {
        thisType.startObservedAddress(query);

        retVal = val.get(TP.apc(attrName));

        thisType.endObservedAddress();

        return retVal;
    } else {
        return val;
    }

    //  Had an access character, but we can't compute the path.
    return;
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.defineMethod('$executeStringGet',
function(targetObj) {

    /**
     * @name $executeStringGet
     * @synopsis Returns the result of executing the path in a 'get' fashion
     *     against an object of type 'String'.
     * @param {targetObj} String The object to execute the receiver against to
     *     retrieve data.
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var attrName,

        dotIndex,

        val,

        query,
        hadNaN,
        queryParts;

    attrName = this.get('$transformedPath');

    //  See if we need to traverse down via a period ('.') or if this is
    //  completely a range that we handle here.
    if ((dotIndex = attrName.indexOf('.')) !== -1) {
        query = attrName.slice(0, dotIndex);
        attrName = attrName.slice(dotIndex + 1);
    } else {
        query = attrName;
        attrName = null;
    }

    if (/[,:]/.test(attrName)) {
        val = TP.ac();

        if (TP.regex.HAS_COLON.test(attrName)) {

            targetObj.asArray().vslice(attrName).perform(
                    function(index) {

                        val.push(targetObj.at(index));
                    });
        } else {
            //  Make sure to strip off the leading '[' and trailing ']'
            query = query.slice(1, query.getSize() - 1);

            hadNaN = false;

            queryParts = query.split(',').convert(
                        function(item) {

                            var itemVal;

                            if (!TP.isNumber(itemVal = item.asNumber())) {
                                hadNaN = true;
                            }

                            return itemVal;
                        });

            if (hadNaN) {
                return undefined;
            }

            targetObj.asArray().performOver(
                    function(item) {

                        val.push(item);
                    }, queryParts);
        }

        return val.join('');
    }

    if (TP.notValid(attrName)) {
        return undefined;
    }

    //  Had an access character, but it must be one that Strings don't support -
    //  let standard method do the work
    return targetObj.get(attrName);
});

//  ------------------------------------------------------------------------
//  Setter Methods
//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.defineMethod('$executeArraySet',
function(targetObj, attributeValue, shouldSignal) {

    /**
     * @name $executeArraySet
     * @synopsis Executes the path in a 'set' fashion against an object of type
     *     'Array'.
     * @param {targetObj} Array The object to execute the receiver against to
     *     set data.
     * @param {attributeValue} Object The object to use as the value to set into
     *     the target object.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @returns {Array|null} The targetObj or null.
     */

    var attrName,

        dotIndex,
        query,

        thisType,
        shouldMake,

        val,

        queryParts,

        attrIsNumber;

    attrName = this.get('$transformedPath');

    //  See if we need to traverse down via a period ('.') or if this is
    //  completely a range that we handle here.
    if ((dotIndex = attrName.indexOf('.')) !== -1) {
        query = attrName.slice(0, dotIndex);
        attrName = attrName.slice(dotIndex + 1);
    } else {
        query = attrName;
        attrName = null;
    }

    thisType = this.getType();

    shouldMake = this.get('shouldMake');

    if (/[,:]/.test(query)) {

        if (TP.regex.HAS_COLON.test(query)) {
            //  If there is no attrName, that means that there was nothing left
            //  after consuming our own query. In that case, we just set our own
            //  items using the supplied attribute value.
            if (TP.notValid(attrName)) {
                targetObj.vslice(query).perform(
                        function(index, count) {

                            var op;

                            if (TP.notValid(attributeValue)) {
                                op = TP.DELETE;
                            } else if (TP.isDefined(targetObj.at(index))) {
                                op = TP.UPDATE;
                            } else {
                                op = TP.CREATE;
                            }

                            thisType.startChangedAddress(index);

                            thisType.registerChangedAddress(
                                thisType.getChangedAddress(), op);

                            targetObj.atPut(
                                    index,
                                    attributeValue);

                            thisType.endChangedAddress();
                        });
            } else {
                //  Otherwise, we take each one of our items and send it a 'set'
                //  message with the attribute value.

                attrIsNumber = TP.isNumber(
                                    TP.apc(attrName).getFirstSimplePath().
                                        asNumber());

                //  If an Array was not supplied, then we use the supplied value
                //  in a repeating fashion.
                targetObj.vslice(query).perform(
                    function(index, count) {

                        var val,
                            op;

                        val = targetObj.at(index);

                        thisType.startChangedAddress(index);

                        //  If item is not valid, or it's not a reference type,
                        //  then we blow away the entry and make it a reference
                        //  type - we need to set the slot...
                        if (shouldMake &&
                            (TP.notValid(val) || !TP.isReferenceType(val))) {

                            //  If the slot was already defined, but wasn't a
                            //  reference type, then we're just updating it.
                            if (TP.isDefined(val)) {
                                op = TP.UPDATE;
                            } else {
                                op = TP.CREATE;
                            }

                            val = attrIsNumber ? TP.ac() :
                                                    TP.lang.Object.construct();

                            //  And we set it back onto the targetObj
                            targetObj.atPut(index, val);

                            //  Need to register this as a changed address since
                            //  we altered what was at this slot.
                            thisType.registerChangedAddress(
                                thisType.getChangedAddress(), op);

                            //  Make sure to let this path know that we created
                            //  structure - this makes a difference when
                            //  signaling change.
                            this.set('$createdStructure', true);
                        }

                        if (TP.notValid(val) || !TP.isReferenceType(val)) {
                            thisType.endChangedAddress();

                            return;
                        }

                        //  This 'set' call will take care of registering the
                        //  changed address.
                        val.set(TP.apc(attrName).set('shouldMake', shouldMake),
                                attributeValue,
                                false,
                                false);

                        thisType.endChangedAddress();
                    }.bind(this));
            }
        } else if (/,/.test(query)) {
            //  Make sure to strip off the leading '[' and trailing ']'
            query = query.slice(1, query.getSize() - 1);

            queryParts = query.split(',').convert(
                                function(item) {

                                    return item.asNumber();
                                });

            //  If there is no attrName, that means that there was nothing left
            //  after consuming our own query. In that case, we just set our own
            //  items using the supplied attribute value.
            if (TP.notValid(attrName)) {
                targetObj.performOver(
                        function(item, index, count) {

                            var op;

                            if (TP.notValid(attributeValue)) {
                                op = TP.DELETE;
                            } else if (TP.isDefined(targetObj.at(index))) {
                                op = TP.UPDATE;
                            } else {
                                op = TP.CREATE;
                            }

                            thisType.startChangedAddress(index);

                            thisType.registerChangedAddress(
                                thisType.getChangedAddress(), op);

                            targetObj.atPut(
                                    index,
                                    attributeValue);

                            thisType.endChangedAddress();
                        }, queryParts);
            } else {
                //  Otherwise, we take each one of our items and send it a 'set'
                //  message with the attribute value.

                attrIsNumber = TP.isNumber(
                                    TP.apc(attrName).getFirstSimplePath().
                                        asNumber());

                targetObj.performOver(
                    function(item, index, count) {

                        var val,
                            op;

                        val = item;

                        thisType.startChangedAddress(index);

                        //  If item is not valid, or it's not a reference type,
                        //  then we blow away the entry and make it a reference
                        //  type - we need to set the slot...
                        if (shouldMake &&
                            (TP.notValid(val) || !TP.isReferenceType(val))) {

                            //  If the slot was already defined, but wasn't a
                            //  reference type, then we're just updating it.
                            if (TP.isDefined(val)) {
                                op = TP.UPDATE;
                            } else {
                                op = TP.CREATE;
                            }

                            val = attrIsNumber ? TP.ac() :
                                                    TP.lang.Object.construct();

                            //  And we set it back onto the targetObj
                            targetObj.set(index, val, false, false);

                            //  Need to register this as a changed address since
                            //  we altered what was at this slot.
                            thisType.registerChangedAddress(
                                thisType.getChangedAddress(), op);

                            //  Make sure to let this path know that we created
                            //  structure - this makes a difference when
                            //  signaling change.
                            this.set('$createdStructure', true);
                        }

                        if (TP.notValid(val) || !TP.isReferenceType(val)) {
                            thisType.endChangedAddress();

                            return;
                        }

                        //  This 'set' call will take care of registering the
                        //  changed address.
                        val.set(TP.apc(attrName).set('shouldMake', shouldMake),
                                attributeValue,
                                false,
                                false);

                        thisType.endChangedAddress();
                    }.bind(this), queryParts);
            }
        }

        return targetObj;
    }

    //  Retrieve what's at the first part of access path in targetObj

    val = targetObj.get(query);

    //  If we should create structural data and targetObj either doesn't have a
    //  value or doesn't have a reference type value at the place pointed to by
    //  'query', then we create a reference type (either an Object or an Array)
    //  and set it into place.
    if (shouldMake && (TP.notValid(val) || !TP.isReferenceType(val))) {
        val = TP.isNumber(TP.apc(attrName).getFirstSimplePath().asNumber()) ?
                                                    TP.ac() :
                                                    TP.lang.Object.construct();

        targetObj.set(TP.apc(query).set('shouldMake', shouldMake),
                         val,
                         false,
                         false);
    }

    if (TP.notValid(val) || !TP.isReferenceType(val)) {
        //  Had an access character and needed a reference type, but we can't
        //  create the Object (probably had shouldMake turned off)
        return;
    }

    //  only continue if the result object can stay with the program :)
    if (TP.isString(attrName) && TP.canInvoke(val, 'set')) {
        thisType.startChangedAddress(query);

        //  This 'set' call will take care of registering the changed address.
        val.set(TP.apc(attrName).set('shouldMake', shouldMake),
                attributeValue,
                false,
                false);

        thisType.endChangedAddress();

        //  typically we want to return the original object from a set()
        return targetObj;
    }

    //  Had an access character, but we can't compute the path.
    return;
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.defineMethod('$executeObjectSet',
function(targetObj, attributeValue, shouldSignal) {

    /**
     * @name $executeObjectSet
     * @synopsis Executes the path in a 'set' fashion against an object of type
     *     'Object'.
     * @param {targetObj} Object The object to execute the receiver against to
     *     set data.
     * @param {attributeValue} Object The object to use as the value to set into
     *     the target object.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @returns {Object|null} The targetObj or null.
     */

    var attrName,

        dotIndex,
        query,

        thisType,
        shouldMake,

        val,

        queryParts,

        attrIsNumber;

    attrName = this.get('$transformedPath');

    //  See if we need to traverse down via a period ('.') or if this is
    //  completely a range that we handle here.
    if ((dotIndex = attrName.indexOf('.')) !== -1) {
        query = attrName.slice(0, dotIndex);
        attrName = attrName.slice(dotIndex + 1);
    } else {
        query = attrName;
        attrName = null;
    }

    thisType = this.getType();

    shouldMake = this.get('shouldMake');

    if (/,/.test(query)) {
        //  Make sure to strip off the leading '[' and trailing ']'
        query = query.slice(1, query.getSize() - 1);

        queryParts = query.split(',');

        //  If there is no attrName, that means that there was nothing left
        //  after consuming our own query. In that case, we just set our own
        //  items using the supplied attribute value.
        if (TP.notValid(attrName)) {
            targetObj.performOver(
                    function(item, index, count) {

                        var op;

                        if (TP.notValid(attributeValue)) {
                            op = TP.DELETE;
                        } else if (TP.isDefined(targetObj.get(index))) {
                            op = TP.UPDATE;
                        } else{
                            op = TP.CREATE;
                        }

                        thisType.startChangedAddress(index);

                        thisType.registerChangedAddress(
                            thisType.getChangedAddress(), op);

                        targetObj.set(index, attributeValue, false, false);

                        thisType.endChangedAddress();
                    }, queryParts);
        } else {
            //  Otherwise, we take each one of our items and send it a 'set'
            //  message with the attribute value.

            attrIsNumber = TP.isNumber(
                            TP.apc(attrName).getFirstSimplePath().asNumber());

            targetObj.performOver(
                function(item, index, count) {

                    var val,
                        op;

                    val = item;

                    thisType.startChangedAddress(index);

                    //  If item is not valid, or it's not a reference type,
                    //  then we blow away the entry and make it a reference
                    //  type - we need to set the slot...
                    if (shouldMake &&
                        (TP.notValid(val) || !TP.isReferenceType(val))) {

                        //  If the slot was already defined, but wasn't a
                        //  reference type, then we're just updating it.
                        if (TP.isDefined(val)) {
                            op = TP.UPDATE;
                        } else {
                            op = TP.CREATE;
                        }

                        val = attrIsNumber ? TP.ac() :
                                                TP.lang.Object.construct();

                        //  And we set it back onto the targetObj
                        targetObj.set(index, val, false, false);

                        //  Need to register this as a changed address since we
                        //  altered what was at this slot.
                        thisType.registerChangedAddress(
                            thisType.getChangedAddress(), op);

                        //  Make sure to let this path know that we created
                        //  structure - this makes a difference when signaling
                        //  change.
                        this.set('$createdStructure', true);
                    }

                    if (TP.notValid(val) || !TP.isReferenceType(val)) {
                        thisType.endChangedAddress();

                        return;
                    }

                    //  This 'set' call will take care of registering the
                    //  changed address.
                    val.set(TP.apc(attrName).set('shouldMake', shouldMake),
                            attributeValue,
                            false,
                            false);

                    thisType.endChangedAddress();
                }.bind(this), queryParts);
        }

        return targetObj;
    }

    //  Retrieve what's at the first part of access path in targetObj

    val = targetObj.get(query);

    //  If we should create structural data and targetObj either doesn't have a
    //  value or doesn't have a reference type value at the place pointed to by
    //  'query', then we create a reference type (either an Object or an Array)
    //  and set it into place.
    if (shouldMake && (TP.notValid(val) || !TP.isReferenceType(val))) {
        val = TP.isNumber(TP.apc(attrName).getFirstSimplePath().asNumber()) ?
                                                    TP.ac() :
                                                    TP.lang.Object.construct();

        targetObj.set(TP.apc(query).set('shouldMake', shouldMake),
                         val,
                         false,
                         false);
    }

    if (TP.notValid(val) || !TP.isReferenceType(val)) {
        //  Had an access character and needed a reference type, but we can't
        //  create the Object (probably had shouldMake turned off)
        return;
    }

    //  only continue if the result object can stay with the program :)
    if (TP.isString(attrName) && TP.canInvoke(val, 'set')) {
        thisType.startChangedAddress(query);

        //  This 'set' call will take care of registering the changed address.
        val.set(TP.apc(attrName).set('shouldMake', shouldMake),
                attributeValue,
                false,
                false);

        thisType.endChangedAddress();

        //  typically we want to return the original object from a set()
        return targetObj;
    }

    //  Had an access character, but we can't compute the path.
    return;
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.defineMethod('getFirstSimplePath',
function() {

    /**
     * @name getFirstSimplePath
     * @synopsis Returns the first 'simple path' of the receiver. For instance,
     *     in a simple path such as '1.2.3', this method will return '1'.
     * @returns {String} The first simple path of the receiver.
     */

    var srcPath,

        paths,
        firstPath;

    srcPath = this.get('srcPath');

    //  First, split by '.'
    paths = srcPath.split('.');

    firstPath = paths.first();

    if (/[,:]/.test(firstPath)) {

        //  Strip off the leading and trailing '[' and ']'
        firstPath = firstPath.slice(1, firstPath.getSize() - 1);

        if (TP.regex.HAS_COLON.test(firstPath)) {
            firstPath = firstPath.split(':').first();
        } else {
            firstPath = firstPath.split(',').first();
        }
    }

    return firstPath;
});

//  ========================================================================
//  TP.core.XMLPath
//  ========================================================================

/**
 * @type {TP.core.XMLPath}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.AccessPath.defineSubtype('XMLPath');

//  This is an abstract supertype - need a concrete subtype to get real work
//  done.
TP.core.XMLPath.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The transformed path we actually execute - it may have templated
//  expressions.
TP.core.XMLPath.Inst.defineAttribute('$transformedPath');

//  -----------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.XMLPath.Inst.defineMethod('$addChangedAddressFromNode',
function(aNode) {

    /**
     * @name $addChangedAddressFromNode
     * @synopsis Adds the supplied node's address and action to
     *     TP.core.AccessPath's 'changed address list'.
     * @param {Node} aNode The Node to extract the address and action from.
     * @returns {TP.core.XMLPath} The receiver.
     */

    var address,

        attrName,
        elem,

        action;

    address = TP.nodeGetDocumentPosition(aNode);

    if (TP.isAttributeNode(aNode)) {

        attrName = TP.attributeGetLocalName(aNode);
        elem = TP.attributeGetOwnerElement(aNode);

        //  We need to test the owner element to see if it already has an
        //  appropriate action (i.e. TP.CREATE if this attribute has just been
        //  created). Otherwise, we set it to TP.UPDATE.

        if (TP.notValid(action = TP.elementGetChangeAction(
                                                elem, TP.ATTR + attrName))) {
            action = TP.UPDATE;
        }

    } else if (TP.isElement(elem = aNode)) {

        //  We need to flag changes on the content element, but not if the
        //  '$$getContentForSetOperation()' created this element. It will
        //  have tagged it with a TP.CREATE action already.

        if (TP.notValid(action = TP.elementGetChangeAction(elem, TP.SELF))) {
            action = TP.UPDATE;
        }
    }

    TP.core.AccessPath.registerChangedAddress(address, action);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XMLPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @name executeGet
     * @synopsis Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     get data.
     * @param {arguments} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @raises TP.sig.InvalidPath
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var args,

        pathSrc,

        executedPaths,

        natTargetObj,

        path,

        nodes,

        addresses,

        doc,
        sourceObjectID;

    //  This kind of path only works against XML
    if (!TP.isNode(targetObj) && !TP.isKindOf(targetObj, TP.core.Node)) {
        return this.raise('TP.sig.InvalidPath', arguments);
    }

    pathSrc = this.get('srcPath');

    executedPaths = TP.core.AccessPath.$getExecutedPaths().atPutIfAbsent(
                    TP.id(targetObj),
                    TP.hc());

    executedPaths.atPut(pathSrc, true);

    //  Fill in any templated expressions in the path (which must be numeric
    //  positions) with data from the passed arguments.
    path = this.get('srcPath');
    if (TP.regex.HAS_ACP.test(path)) {
        //  Grab the arguments and slice the first one off (since it's the
        //  targetObj, which we already have).
        args = TP.args(arguments, 1);

        path = path.transform(args);
    }
    this.set('$transformedPath', path);

    //  Make sure the target object is unwrapped
    natTargetObj = TP.unwrap(targetObj);

    //  Call 'getPathType()' (which may return null) to determine path type and
    //  'false' on autoCollapse (we collapse later if we're set for it, but for
    //  now we want an Array).
    nodes = TP.nodeEvaluatePath(natTargetObj, pathSrc,
                                this.getPathType(), false);

    addresses = TP.ac();

    //  Gather all addresses from the returned nodes. Each call to
    //  TP.nodeGetAncestorPositions() returns an Array of positions all the way
    //  down
    nodes.perform(
            function (aNode) {
                addresses = addresses.concat(
                            TP.nodeGetAncestorPositions(aNode, true));
            });

    //  Now unique the values in addresses, in case there were duplicates
    addresses.unique();

    doc = !TP.isDocument(natTargetObj) ?
                natTargetObj.ownerDocument :
                natTargetObj;

    sourceObjectID = TP.wrap(doc).getID();

    addresses.perform(
            function (anAddress) {
                TP.core.AccessPath.registerObservedAddress(
                    anAddress, sourceObjectID, pathSrc);
            });

    return this.processFinalValue(nodes, targetObj);
});

//  -----------------------------------------------------------------------

TP.core.XMLPath.Inst.defineMethod('executeSet',
function(targetObj, attributeValue, shouldSignal, varargs) {

    /**
     * @name executeSet
     * @synopsis Executes the path in a 'set' fashion - i.e. with the intent of
     *     setting the supplied data into the supplied target object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     set data.
     * @param {attributeValue} Object The object to use as the value to set into
     *     the target object.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @param {arguments} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @returns {TP.core.XPathPath} The receiver.
     */

    var natTargetObj,
        targetDoc,
        targetTPDoc,

        signalChange,

        flagChanges,
        leaveFlaggedChanges,

        path,
        args,

        createdStructure,

        content,

        mutatedStructure,

        value,

        affectedElems,

        tpcontent,

        ownerElem,

        len,
        i,

        contentnode,

        executedPaths;

    //  This kind of path only works against XML
    if (!TP.isNode(targetObj) && !TP.isKindOf(targetObj, TP.core.Node)) {
        return this.raise('TP.sig.InvalidPath', arguments);
    }

    natTargetObj = TP.unwrap(targetObj);

    targetDoc = !TP.isDocument(natTargetObj) ?
                        TP.wrap(natTargetObj.ownerDocument) :
                        TP.wrap(natTargetObj);

    targetTPDoc = TP.wrap(targetDoc);

    if (TP.isValid(shouldSignal)) {
      signalChange = shouldSignal;
    } else if (TP.isValid(targetTPDoc)) {
      signalChange = targetTPDoc.shouldSignalChange();
    }

    //  If the target object is flagging changes, then we set both flags to
    //  true. Otherwise, we set whether we flag changes as to whether we want to
    //  signal change (in which case we have to, in order to get the proper set
    //  of addresses) but we don't want to leave those flags around, so we set
    //  the 'leaveFlaggedChanges' to false to strip them out.
    if (TP.wrap(targetObj).shouldFlagChanges()) {
        flagChanges = true;
        leaveFlaggedChanges = true;
    } else {
        flagChanges = signalChange;
        leaveFlaggedChanges = false;
    }

    path = this.get('srcPath');
    if (TP.regex.HAS_ACP.test(path)) {
        //  Grab the arguments and slice the first three off (since they're
        //  targetObj, attributeValue and shouldSignal which we already have).
        args = TP.args(arguments, 3);

        path = path.transform(args);
    }
    this.set('$transformedPath', path);

    //  First, we have to get the nodes that we can use to set the value - if we
    //  can't do that, then we're dead in the water...

    //  Note here how we pass 'true' to *always* flag changes in any content
    //  that we generate
    if (TP.notValid(content = this.$$getContentForSetOperation(
                                                natTargetObj, flagChanges))) {

        //  unable to build nodes...path may not be specific enough
        TP.ifWarn() ?
            TP.warn(TP.boot.$annotate(
                        this,
                        'Unable to set value for path: ' + path),
                    TP.LOG,
                    arguments) : 0;

        return this;
    }

    //  At this point, content will always be a TP.NODESET... see if we can
    //  collapse it down to a single node. Our tests later are optimized for
    //  single nodes, so it's better if we collapse down.
    content = TP.collapse(content);

    createdStructure = false;

    if (!TP.isArray(content)) {
        if (TP.isElement(content)) {
            createdStructure =
                TP.elementGetChangeAction(content, TP.SELF) === TP.CREATE;
        }
    } else {
        createdStructure =
            TP.isValid(
                    content.detect(
                        function (item) {
                            if (TP.isElement(item)) {
                                return TP.elementGetChangeAction(
                                            item, TP.SELF) === TP.CREATE;
                            }
                            return false;
                        }));
    }

    //  ---
    //  update target node values
    //  ---

    //  normalize inbound nodes to elements so we don't try to put a document
    //  where it can't be appended
    value = TP.isDocument(attributeValue) ?
            TP.elem(attributeValue) : attributeValue;

    mutatedStructure = TP.isNode(value);

    //  there are four primary variations we have to account for if we're
    //  going to get this correct: S-M, S-S, M-M, M-S. also, we have to keep
    //  in mind that we've got a second set of considerations about elements
    //  vs. attributes, and a third set around nodes vs. javascript objects

    if (signalChange) {
        affectedElems = TP.ac();
    }

    if (TP.isNode(content)) {
        //  leverage TP.core.Node wrappers to manage update intelligently
        tpcontent = TP.wrap(content);
        tpcontent.set('content', value);

        //  99% is single value targeting a single element or attribute node
        if (TP.isElement(content)) {
            //  If we're gonna signal a change, then add the element's address
            //  to the list of changed addresses.
            if (signalChange) {
                affectedElems.push(content);

                //  Note here how we pass in 'false', because we don't want to
                //  overwrite any existing change flag record for the TP.SELF
                //  address on this element.
                TP.elementFlagChange(content, TP.SELF, TP.UPDATE, false);

                this.$addChangedAddressFromNode(content);
            } else if (flagChanges) {
                //  Note here how we pass in 'false', because we don't want to
                //  overwrite any existing change flag record for the TP.SELF
                //  address on this element.
                TP.elementFlagChange(content, TP.SELF, TP.UPDATE, false);
            }
        } else if (TP.isAttributeNode(content)) {
            //  If we're gonna signal a change, then add the attribute's address
            //  to the list of changed addresses.
            if (signalChange) {
                ownerElem = TP.attributeGetOwnerElement(content);
                affectedElems.push(ownerElem);

                //  Note here how we pass in 'false', because we don't want to
                //  overwrite any existing change flag record for the TP.ATTR +
                //  content.name address on this element.
                TP.elementFlagChange(
                        ownerElem, TP.ATTR + content.name, TP.UPDATE, false);

                this.$addChangedAddressFromNode(content);
            } else if (flagChanges) {
                //  Note here how we pass in 'false', because we don't want to
                //  overwrite any existing change flag record for the TP.ATTR +
                //  content.name address on this element.
                TP.elementFlagChange(
                        ownerElem, TP.ATTR + content.name, TP.UPDATE, false);

            }
        }
    } else if (TP.isArray(content)) {
        len = content.getSize();
        for (i = 0; i < len; i++) {
            contentnode = content.at(i);

            //  leverage TP.core.Node wrappers to manage update intelligently
            tpcontent = TP.wrap(contentnode);
            tpcontent.set('content', value);

            if (TP.isNode(content)) {
                if (TP.isElement(contentnode)) {
                    //  If we're gonna signal a change, then add the element's
                    //  address to the list of changed addresses.
                    if (signalChange) {
                        affectedElems.push(contentnode);

                        //  Note here how we pass in 'false', because we don't
                        //  want to overwrite any existing change flag record
                        //  for the TP.SELF address on this element.
                        TP.elementFlagChange(
                                contentnode, TP.SELF, TP.UPDATE, false);

                        this.$addChangedAddressFromNode(contentnode);
                    } else if (flagChanges) {
                        //  Note here how we pass in 'false', because we don't
                        //  want to overwrite any existing change flag record
                        //  for the TP.SELF address on this element.
                        TP.elementFlagChange(
                                contentnode, TP.SELF, TP.UPDATE, false);
                    }
                } else if (TP.isAttributeNode(contentnode)) {
                    //  If we're gonna signal a change, then add the attribute's
                    //  address to the list of changed addresses.
                    if (signalChange) {
                        ownerElem = TP.attributeGetOwnerElement(contentnode);
                        affectedElems.push(ownerElem);

                        //  Note here how we pass in 'false', because we don't
                        //  want to overwrite any existing change flag record
                        //  for the TP.ATTR + contentnode.name address on this
                        //  element.
                        TP.elementFlagChange(
                                ownerElem,
                                TP.ATTR + contentnode.name,
                                TP.UPDATE,
                                false);

                        this.$addChangedAddressFromNode(contentnode);
                    } else if (flagChanges) {
                        //  Note here how we pass in 'false', because we don't
                        //  want to overwrite any existing change flag record
                        //  for the TP.ATTR + contentnode.name address on this
                        //  element.
                        TP.elementFlagChange(
                                ownerElem,
                                TP.ATTR + contentnode.name,
                                TP.UPDATE,
                                false);
                    }
                } else {
                    //  not a node or collection of them? only real option is
                    //  that the XPath returned a scalar value, which we can't
                    //  process anyway...
                    TP.ifWarn() ?
                        TP.warn(TP.boot.$annotate(
                                    this,
                                    'Path probably points to scalar value.' +
                                    ' Unable to set value.'),
                                TP.LOG, arguments) : 0;

                    return;
                }
            }
        }
    } else {
        //  not a node or collection of them? only real option is that the
        //  XPath returned a scalar value, which we can't process anyway...

        TP.ifWarn() ?
            TP.warn(TP.boot.$annotate(
                        this,
                        'Path probably points to scalar value.' +
                        ' Unable to set value.'),
                    TP.LOG, arguments) : 0;

        return;
    }

    if (signalChange) {

        //  If it was a structural change, then we need to clear the path
        //  information registered for the addresses 'under' the node that
        //  changed.
        if (mutatedStructure) {
            this.updateRegistrationsBeforeSignaling(targetTPDoc);
        }

        //  If we 'created structure', that means that all of the previously
        //  executed paths need to be run, because they could now refer to new
        //  addresses.
        if (createdStructure) {
            if (TP.notEmpty(
                executedPaths = TP.core.AccessPath.$getExecutedPaths().at(
                                                    targetTPDoc.getID()))) {
                executedPaths.perform(
                        function (pathEntry) {
                            TP.apc(pathEntry.first()).executeGet(targetTPDoc);
                        });
            }
        }

        //  Send the changed signal
        this.sendChangedSignal(targetTPDoc);

        if (mutatedStructure) {
            this.updateRegistrationsAfterSignaling(targetTPDoc);
        }

        //  Empty the changed addresses now that we've sent the signal.
        TP.core.AccessPath.$getChangedAddresses().empty();

        //  If the node wasn't originally configured to flag changes, then (now
        //  that we've registered all addresses that have changed) we need to
        //  strip it out.
        if (!leaveFlaggedChanges) {
            affectedElems.perform(
                    function (anElem) {
                        TP.elementStripChangeFlags(anElem);
                    });
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XMLPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @name $$getContentForSetOperation
     * @synopsis Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Array} The array of Nodes that got built.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.XMLPath.Inst.defineMethod('getPathType',
function() {

    /**
     * @name getPathType
     * @synopsis Returns the receiver's 'path type', which should be one of
     *     these constants:
     *          TP.XPOINTER_PATH_TYPE
     *          TP.XTENSION_POINTER_PATH_TYPE
     *          TP.CSS_PATH_TYPE
     * @returns {String} A path type
     */

    //  Note here that we return null, allowing the low-level primitive call to
    //  determine the path type. Subtypes of this type can override this to
    //  specify the path type.
    return null;
});

//  ========================================================================
//  TP.core.SimpleXMLPath
//  ========================================================================

TP.core.XMLPath.defineSubtype('SimpleXMLPath');

//  ------------------------------------------------------------------------

TP.core.SimpleXMLPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @name $$getContentForSetOperation
     * @synopsis Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Array} The array of Nodes that got built.
     */

    //  TODO: Need Attribute path support
});

//  ========================================================================
//  TP.core.ElementPath
//  ========================================================================

TP.core.XMLPath.defineSubtype('ElementPath');

//  ------------------------------------------------------------------------

TP.core.ElementPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @name $$getContentForSetOperation
     * @synopsis Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Array} The array of Nodes that got built.
     */

    var path,
        content;

    if (TP.notValid(path = this.get('$transformedPath'))) {
        path = this.get('srcPath');
    }

    //  element schemes are fine as long as they reference an existing object...
    //  we can't build new content down an element path

    //  Note that TP.nodeEvaluateElementScheme() will only ever return one node
    //  (the 'path' down to the node must be unique).
    content = TP.nodeEvaluateElementScheme(aNode, path);

    if (!TP.isElement(content)) {
        TP.ifWarn() ?
            TP.warn(TP.boot.$annotate(
                        this,
                        'Unable to obtain content to set for path: ' +
                        path),
                    TP.LOG,
                    arguments) : 0;
    } else {
        //  To be API compliant, we wrap the single Element in an Array
        content = TP.ac(content);
    }

    return content;
});

//  ========================================================================
//  TP.core.XTensionPath
//  ========================================================================

TP.core.XMLPath.defineSubtype('XTensionPath');

//  ------------------------------------------------------------------------

TP.core.XTensionPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @name $$getContentForSetOperation
     * @synopsis Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Array} The array of Nodes that got built.
     */

    var path,
        content;

    if (TP.notValid(path = this.get('$transformedPath'))) {
        path = this.get('srcPath');
    }

    //  Evaluate the XTension syntax.
    content = TP.nodeEvaluateXTension(aNode, path, false);

    if (TP.notValid(content)) {
        TP.ifWarn() ?
            TP.warn(TP.boot.$annotate(
                        this,
                        'Unable to obtain content to set for path: ' +
                        path),
                    TP.LOG,
                    arguments) : 0;
    }

    return content;
});

//  ========================================================================
//  TP.core.CSSPath
//  ========================================================================

TP.core.XTensionPath.defineSubtype('CSSPath');

//  ------------------------------------------------------------------------

//  avoid binding and apply issues by creating our alias as a wrapper
TP.definePrimitive('cpc',
function() {

    /**
     * @name cpc
     * @synopsis Returns a newly initialized CSSPath instance.
     * @param {String} aPath The CSS path as a String.
     * @returns {TP.core.CSSPath} The new instance.
     * @todo
     */

    return TP.core.CSSPath.construct.apply(TP.core.CSSPath, arguments);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CSSPath.Inst.defineMethod('getPathType',
function() {

    /**
     * @name getPathType
     * @synopsis Returns the receiver's 'path type', which should be one of
     *     these constants:
     *          TP.XPOINTER_PATH_TYPE
     *          TP.XTENSION_POINTER_PATH_TYPE
     *          TP.CSS_PATH_TYPE
     * @returns {String} A path type
     */

    return TP.CSS_PATH_TYPE;
});

//  ========================================================================
//  TP.core.BarenamePath
//  ========================================================================

TP.core.XMLPath.defineSubtype('BarenamePath');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.BarenamePath.Inst.defineMethod('init',
function(aPath, shouldCollapse) {

    /**
     * @name init
     * @synopsis Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {Boolean} shouldCollapse Whether or not this path should
     *     'collapse' its results - i.e. if its a collection with only one item,
     *     it will just return that item. The default is false.
     * @returns {TP.core.BarenamePath} The receiver.
     */

    this.callNextMethod();

    //  For CSS paths, we go ahead and turn on 'shouldMake' because the only
    //  kinds of paths that will be building structure are our 'TIBET special'
    //  barename paths with attribute additions.
    this.set('shouldMake', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.BarenamePath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @name $$getContentForSetOperation
     * @synopsis Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Array} The array of Nodes that got built.
     */

    var path,
        content;

    if (TP.notValid(path = this.get('$transformedPath'))) {
        path = this.get('srcPath');
    }

    //  Note we return an Array if we didn't get one to keep the API
    //  consistent (we can get an Array of attributes here due to 'special
    //  TIBET barename' syntax).
    if (!TP.isArray(content = TP.nodeEvaluateBarename(
                            aNode, path, false, this.get('shouldMake')))) {
        content = TP.ac(content);
    }

    if (TP.notValid(content)) {
        TP.ifWarn() ?
            TP.warn(TP.boot.$annotate(
                        this,
                        'Unable to obtain content to set for path: ' +
                        path),
                    TP.LOG,
                    arguments) : 0;
    }

    return content;
});

//  ------------------------------------------------------------------------

TP.core.BarenamePath.Inst.defineMethod('getPathType',
function() {

    /**
     * @name getPathType
     * @synopsis Returns the receiver's 'path type', which should be one of
     *     these constants:
     *          TP.XPOINTER_PATH_TYPE
     *          TP.XTENSION_POINTER_PATH_TYPE
     *          TP.BARENAME_PATH_TYPE
     *          TP.CSS_PATH_TYPE
     * @returns {String} A path type
     */

    return TP.BARENAME_PATH_TYPE;
});

//  ========================================================================
//  XPath support
//  ========================================================================

//  ========================================================================
//  TP.extern.XPathFunctionResolver
//  ========================================================================

/*
Note that the setup for this type is handled dynamically during processing
of the getFunctionResolver method on TP.core.XPathPath.
*/

TP.extern.XPathFunctionResolver = function() {};

//  ========================================================================
//  TP.extern.XPathNamespaceResolver
//  ========================================================================

/*
Note that the setup for this type is handled dynamically during processing
of the getNSResolver method on TP.core.XPathPath.
*/

TP.extern.XPathNamespaceResolver = function() {};

//  ========================================================================
//  TP.extern.XPathVariableResolver
//  ========================================================================

/*
Note that the setup for this type is handled dynamically during processing
of the getVariableResolver method on TP.core.XPathPath.
*/

TP.extern.XPathVariableResolver = function() {};

//  ========================================================================
//  TP.core.XPathPath
//  ========================================================================

/**
 * @type {TP.core.XPathPath}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.XMLPath.defineSubtype('XPathPath');

//  ------------------------------------------------------------------------

//  avoid binding and apply issues by creating our alias as a wrapper
TP.definePrimitive('xpc',
function() {

    /**
     * @name xpc
     * @synopsis Returns a newly initialized XPathPath instance. Note that if
     *     you specify a non native path, the external XPath parser will be
     *     loaded. The default is a native path, unless namespace-qualified
     *     extension functions are found.
     * @param {String} aPath The XPath as a String.
     * @param {Boolean} forceNative Whether or not the path should be 'forced'
     *     to be a native path, rather than letting this type compute whether
     *     it is either a native or non-native path. See this type's
     *     discussion for more information.
     * @returns {TP.core.XPathPath} The new instance.
     * @todo
     */

    return TP.core.XPathPath.construct.apply(TP.core.XPathPath, arguments);
});

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  This RegExp detects paths with either custom XPath variable references
//  in it ('$' followed by word characters) or custom XPath namespaced
//  functions in it (word characters followed by colon followed by word
//  characters followed by an opening parenthesis).
TP.core.XPathPath.Type.defineConstant('NON_NATIVE_PATH_REGEX',
                                TP.rc('\\$\\w+|\\w+:[\\w-]+\\('));

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.XPathPath.Type.defineAttribute('$tpParser');
TP.core.XPathPath.Type.defineAttribute('$nsResolver');
TP.core.XPathPath.Type.defineAttribute('$fnResolver');
TP.core.XPathPath.Type.defineAttribute('$varResolver');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineAttribute('isNative');

TP.core.XPathPath.Inst.defineAttribute('$tpPath');
TP.core.XPathPath.Inst.defineAttribute('$tpContext');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.XPathPath.Type.defineMethod('canonicalizePath',
function(aPath) {

    /**
     * @name canonicalizePath
     * @synopsis Returns the 'canonical' version of the supplied path. The
     *     canonical version is one where all shortcuts have been expanded. Note
     *     that this call will force loading of the non-native XPath parser to
     *     provide the canonical path expansion.
     * @param {String} aPath The path to canonicalize.
     * @returns {String} The canonicalized path.
     */

    var parser,
        primitiveXPathObj;

    parser = this.getParser();

    primitiveXPathObj = parser.parse(aPath);

    return primitiveXPathObj.expression.toString();
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Type.defineMethod('getFunctionResolver',
function() {

    /**
     * @name getFunctionResolver
     * @synopsis Returns the function resolver instance, a single instance used
     *     by the type to resolve XPaths with extension functions.
     * @returns {TP.extern.XPathFunctionResolver} A function resolver instance.
     */

    var resolver;

    if (TP.notValid(resolver = this.$get('$fnResolver'))) {
        //  Make sure to force the parser to load.
        this.getParser();

        //  now we can set up the TP.extern.XPathFunctionResolver type
        //  properly since we've got the TP.extern.XPathParser imported
        TP.extern.XPathFunctionResolver.prototype =
                        new TP.extern.XPathParser.FunctionResolver();

        TP.extern.XPathFunctionResolver.prototype.constructor =
                        TP.extern.XPathFunctionResolver;
        TP.extern.XPathFunctionResolver.prototype.superclass =
                        TP.extern.XPathParser.FunctionResolver.prototype;

        TP.extern.XPathFunctionResolver.prototype.getFunctionWithName =
            function(ns, ln, c) {

                var canonicalPrefix,
                    namespaceType;

                if (TP.notEmpty(ns) &&
                    TP.notEmpty(canonicalPrefix =
                                TP.w3.Xmlns.getCanonicalPrefix(ns))) {
                    if (TP.isType(namespaceType =
                                    (canonicalPrefix + ':').asType())) {
                        if (TP.isCallable(namespaceType[ln])) {
                            return namespaceType[ln];
                        }
                    }
                }

                return this.superclass.getFunctionWithName.bind(this)(
                                                                ns, ln, c);
            };

        resolver = new TP.extern.XPathFunctionResolver();

        this.$set('$fnResolver', resolver);
    }

    return resolver;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Type.defineMethod('getNSResolver',
function() {

    /**
     * @name getNSResolver
     * @synopsis Returns the namespace resolver instance, a single instance used
     *     by the type to resolve namespace-related XPaths.
     * @returns {TP.extern.XPathNamespaceResolver} A namespace resolver
     *     instance.
     */

    var resolver;

    if (TP.notValid(resolver = this.$get('$nsResolver'))) {
        //  Make sure to force the parser to load.
        this.getParser();

        //  now we can set up the TP.extern.XPathNamespaceResolver type
        //  properly since we've got the TP.extern.XPathParser imported
        TP.extern.XPathNamespaceResolver.prototype =
                        new TP.extern.XPathParser.NamespaceResolver();

        TP.extern.XPathNamespaceResolver.prototype.constructor =
                        TP.extern.XPathNamespaceResolver;
        TP.extern.XPathNamespaceResolver.prototype.superclass =
                        TP.extern.XPathParser.NamespaceResolver.prototype;

        TP.extern.XPathNamespaceResolver.prototype.getNamespacePrefix =
            function(prefix,n) {

                var namespace;

                if (TP.notEmpty(prefix) &&
                    TP.isString(namespace =
                                TP.w3.Xmlns.getPrefixURI(prefix))) {
                    return namespace;
                }

                return this.superclass.getNamespacePrefix.bind(this)(prefix, n);
            };

        resolver = new TP.extern.XPathNamespaceResolver();

        this.$set('$nsResolver', resolver);
    }

    return resolver;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Type.defineMethod('getParser',
function() {

    /**
     * @name getParser
     * @synopsis Returns the receiver's non-native XPath parser instance.
     * @returns {TP.extern.XPathParser} A function resolver instance.
     */

    var parser;

    if (TP.notValid(parser = this.$get('$tpParser'))) {
        if (TP.notValid(TP.extern.XPathParser)) {
            //  NOTE the dependency here because TP.extern.XPathParser isn't
            //  a true TIBET type and has no load node information
            TP.sys.importScript(TP.sys.cfg('xpath.parser_path'));
        }

        parser = new TP.extern.XPathParser();
        this.$set('$tpParser', parser);
    }

    return parser;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Type.defineMethod('getVariableResolver',
function() {

    /**
     * @name getVariableResolver
     * @synopsis Returns the variable resolver instance, a single instance used
     *     by the type to resolve XPaths with variables.
     * @returns {TP.extern.XPathVariableResolver} A variable resolver instance.
     */

    var resolver;

    if (TP.notValid(resolver = this.$get('$varResolver'))) {
        //  Make sure to force the parser to load.
        this.getParser();

        //  now we can set up the TP.extern.XPathVariableResolver type
        //  properly since we've got the TP.extern.XPathParser imported
        TP.extern.XPathVariableResolver.prototype =
                        new TP.extern.XPathParser.VariableResolver();

        TP.extern.XPathVariableResolver.prototype.constructor =
                        TP.extern.XPathVariableResolver;
        TP.extern.XPathVariableResolver.prototype.superclass =
                        TP.extern.XPathParser.VariableResolver.prototype;

        TP.extern.XPathVariableResolver.prototype.getVariableWithName =
            function(ns, ln, c) {

                var $$result,

                    newNodeSet;

                switch (ln) {
                    case    'rowIndex':

                        return new TP.extern.XPathParser.XNumber(100);

                    default:

                        eval('$$result = ' + ln);

                        if (TP.isNumber($$result)) {
                            return new TP.extern.XPathParser.XNumber(
                                                                $$result);
                        } else if (TP.isBoolean($$result)) {
                            return new TP.extern.XPathParser.XBoolean(
                                                                $$result);
                        } else if (TP.isNode($$result)) {
                            newNodeSet =
                                    new TP.extern.XPathParser.XNodeSet();
                            newNodeSet.add($$result);
                        } else {
                            return new TP.extern.XPathParser.XString(
                                                    $$result.asString());
                        }

                    break;
                }

                return;
            };

        resolver = new TP.extern.XPathVariableResolver();

        this.$set('$varResolver', resolver);
    }

    return resolver;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('init',
function(aPath, shouldCollapse, forceNative) {

    /**
     * @name init
     * @synopsis Returns a newly initialized instance. Note that if you specify
     *     a non native path the external XPath parser will be loaded. The
     *     default is a native path, unless namespace-qualified extension
     *     functions are found.
     * @param {String} aPath The XPath as a String.
     * @param {Boolean} shouldCollapse Whether or not this path should
     *     'collapse' its results - i.e. if its a collection with only one item,
     *     it will just return that item. The default is false.
     * @param {Boolean} forceNative Whether or not the path should be 'forced'
     *     to be a native path, rather than letting this type compute whether
     *     it is either a native or non-native path. See this type's
     *     discussion for more information.
     * @returns {TP.core.XPathPath} The new instance.
     * @todo
     */

    var thePath;

    //  Make sure that any 'xpath path' scheme is stripped off
    if (TP.regex.XPATH_POINTER.test(aPath)) {
        thePath = TP.regex.XPATH_POINTER.match(aPath).at(2);
    } else {
        thePath = aPath;
    }

    //  Allow the shortcut convenience that TIBET provides of specifying the
    //  '$def:' prefix (intentionally illegal because it leads with a '$')
    //  for elements that are in the default namespace.
    TP.regex.XPATH_DEFAULTNS.lastIndex = 0;
    thePath = thePath.replace(TP.regex.XPATH_DEFAULTNS, '*[name()="$1"]');

    this.setPath(thePath, forceNative);

    //  Note here how we pass the modified path so that 'srcPath' gets properly
    //  set (even though 'setPath' did that above, our supertype won't know
    //  that).
    this.callNextMethod(thePath, shouldCollapse);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('asReplacedString',
function(replacementFunction) {

    /**
     * @name asReplacedString
     * @synopsis Returns a String representation of the receiver after
     *     substitutions have taken place at each location step.
     * @description For a non-native path substitutions will be performed by the
     *     supplied Function which should take a single argument, that of the
     *     location step that the parser is currently at. For a native path no
     *     alteration occurs and the path's string value is returned unchanged.
     * @param {Function} replacementFunction The Function that will perform the
     *     replacement at each location step in the receiver.
     * @returns {String} The replaced String representation of the receiver.
     */

    var path;

    if (TP.notEmpty(path = this.$get('$tpPath'))) {
        return path.expression.toReplacedString(replacementFunction);
    }

    return this.asString();
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var str,
        val;

    str = 'TP.core.XPathPath.construct(\'' + this.get('srcPath') +
            '\', ' +
            this.get('isNative') + ')';

    if ((val = this.get('shouldMake')) === true) {
        str += '.set(\'shouldMake\', ' + val + ')';
    }

    if ((val = this.get('shouldCollapse')) === true) {
        str += '.set(\'shouldCollapse\', ' + val + ')';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @name asString
     * @synopsis Returns the String representation of the receiver. For
     *     non-native paths this is the string representation of the parsed
     *     expression (which is canonicalized).
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.core.XPathPath's String representation. The default is
     *     true.
     * @returns {String} The String representation of the receiver.
     */

    var wantsVerbose,

        path,
        repStr;

    wantsVerbose = TP.ifInvalid(verbose, true);

    if (wantsVerbose && TP.notEmpty(path = this.$get('$tpPath'))) {
        repStr = path.expression.toString();
    } else {
        repStr = this.$get('srcPath');
    }

    return repStr;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('$$createNodesForPath',
function(aNode, flagChanges) {

    /**
     * @name $$createNodesForPath
     * @synopsis Builds a set of nodes into the receiver's native node using the
     *     supplied path expression.
     * @description This method traverses up the given path expression, looking
     *     for matching nodes. If it finds them, it then works back down the
     *     expression, building out the nodes necessary for the expression to be
     *     able to work against a real tree.
     * @param {Node} aNode The node to start building the node tree based on the
     *     supplied expression.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Array} The array of Nodes that got built.
     * @todo
     */

    var wasNative,
        oldMakeStruct,

        results;

    //  We need to temporarily switch the XPath to make sure it uses the
    //  non-native parser, so we save the settings of the path type and whether
    //  the parser is configured to create nodes as it executes.
    wasNative = this.get('isNative');
    oldMakeStruct = this.get('shouldMake');

    //  Switch the path type to a non native path and the create nodes on
    //  execution to true.
    this.set('isNative', false);
    this.set('shouldMake', true);

    //  created. note that we pass the flagging state here so the path can flag
    //  anything it has to create when the node is flagging changes
    results = this.execOnNative(aNode, TP.NODESET, false, flagChanges);

    //  Set the path type and the create nodes on execution switches back to
    //  their previous value.
    this.set('isNative', wasNative);
    this.set('shouldMake', oldMakeStruct);

    return results;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('$createNonNativeParserContext',
function(aPath) {

    /**
     * @name $createNonNativeParserContext
     * @synopsis Sets up the context information for the non-native XPath parser
     *     for the receiver.
     * @param {String} aPath The XPath as a String. Defaults to the receiver's
     *     current path.
     * @returns {TP.core.XPathPath} The receiver.
     * @todo
     */

    var path,
        context,
        parser;

    //  have we been here before for this path?
    if ((aPath === this.$get('srcPath')) &&
        TP.isValid(this.$get('$tpContext'))) {
        return this;
    }

    //  default to our internal path if one isn't provided
    path = TP.ifEmpty(aPath, this.$get('srcPath'));

    //  Use the parser that we allocated on the type and parse the path into
    //  the path construct used by the non-native parser. NOTE that
    //  requesting the parser in this fashion will force loading of the
    //  TP.extern.XPathParser code if it isn't already loaded
    parser = this.getType().getParser();

    this.$set('$tpPath', parser.parse(path));

    //  Allocate and initialize a TP.extern.XPathParser.XPathContext and
    //  supply the namespace and function resolver that we defined on the
    //  type.
    context = new TP.extern.XPathParser.XPathContext(
                                this.getType().getVariableResolver(),
                                this.getType().getNSResolver(),
                                this.getType().getFunctionResolver());

    context.shouldCreateNodes = false;

    this.$set('$tpContext', context);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('exec',
function(aTPNode, resultType, logErrors, flagChanges) {

    /**
     * @name exec
     * @synopsis 'Executes' the XPath by evaluating it against the supplied
     *     TP.core.Node.
     * @param {TP.core.Node} aTPNode The TP.core.Node to execute the receiver
     *     against.
     * @param {Number} resultType The type of result desired, either TP.NODESET
     *     or TP.FIRST_NODE.
     * @param {Boolean} logErrors Used to turn off error notification,
     *     particularly during operations such as String localization which can
     *     cause recusion issues.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged. Defaults to the value set by the TP.core.Node being
     *     processed.
     * @returns {Object} The result of evaluating the receiver against the
     *     supplied TP.core.Node. Will be one of: String, Number, Boolean or
     *     Array (of Nodes).
     * @todo
     */

    return this.execOnNative(
                    aTPNode.getNativeNode(),
                    resultType,
                    logErrors,
                    TP.ifInvalid(flagChanges, aTPNode.shouldFlagChanges()));
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('execOnNative',
function(aNode, resultType, logErrors, flagChanges) {

    /**
     * @name execOnNative
     * @synopsis 'Executes' the XPath by evaluating it against the supplied
     *     Node.
     * @param {Node} aNode The Node to execute the receiver against.
     * @param {Number} resultType The type of result desired, either TP.NODESET
     *     or TP.FIRST_NODE.
     * @param {Boolean} logErrors Used to turn off error notification,
     *     particularly during operations such as string localization which can
     *     cause recusion issues.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Object} The result of evaluating the receiver against the
     *     supplied TP.core.Node. Will be one of: String, Number, Boolean or
     *     Array (of Nodes).
     * @todo
     */

    var flag,
        srcPath,
        context,
        result;

    flag = TP.ifEmpty(flagChanges, false);

    if (TP.notValid(srcPath = this.get('$transformedPath'))) {
        srcPath = this.get('srcPath');
    }

    //  One thing to note is that if you run an XPath against an HTML document
    //  you have to use the external XPath parser _EVEN_ if there are no
    //  non-native constructs in the srcPath. Which means, in essence, that
    //  we're only a native path at execution time if we're native in terms of
    //  syntax, AND being evaluated against a valid XML document... oh and we
    //  can't be requesting to flag changes :)
    if (this.isNativePath() &&
        TP.isXMLDocument(TP.nodeGetDocument(aNode)) &&
        !flag) {
        //  Note here how we use the primitive call. If we used
        //  TP.core.Node's evaluateXPath(), we'd likely recurse because we
        //  are most likely being called from there.
        return TP.nodeEvaluateXPath(aNode, srcPath, resultType, logErrors);
    }

    //  If we're here its because we're either not a native path, or we're being
    //  run against an HTML document, or we're being asked to flag changes.
    //  Either way we need to process the srcPath using the non-native XPath
    //  processor...

    //  create a non-native context if necessary
    if (TP.notValid(context = this.$get('$tpContext'))) {
        this.$createNonNativeParserContext(srcPath);
        context = this.$get('$tpContext');
    }

    //  configure the context node to the node provided
    context.expressionContextNode = aNode;

    //  tag the context with our change flagging status
    context.shouldFlagNodes = flag;

    //  set error logging control flag as well
    context.logErrors = TP.ifInvalid(logErrors, true);

    //  run that baby!
    result = this.$get('$tpPath').evaluate(context);

    //  We need to switch on result's constructor to find out the type of what
    //  was returned and then convert it to a native JavaScript object. Note
    //  that the default case is for when we've had a node set returned and we
    //  must convert it to a JS array.
    switch (result.constructor) {
        case TP.extern.XPathParser.XString:

            return result.stringValue();

        case TP.extern.XPathParser.XNumber:

            return result.numberValue();

        case TP.extern.XPathParser.XBoolean:

            return result.booleanValue();

        default:

            if (resultType === TP.FIRST_NODE) {
                return result.first();
            } else {
                return result.toArray();
            }
    }
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('execRemove',
function(aTPNode) {

    /**
     * @name execRemove
     * @synopsis Removes all nodes under the receiver which match the XPath
     *     provided. This method is typically called via remove when an XPath is
     *     provided as the attributeName.
     * @param {TP.core.Node} aTPNode The TP.core.Node to execute the receiver
     *     against.
     * @returns {TP.core.XPathPath} The receiver.
     */

    var node,

        pathStr,

        oldMakeStruct,
        results,

        len,
        i,

        elem;

    node = aTPNode.getNativeNode();

    if (TP.notValid(pathStr = this.get('$transformedPath'))) {
        pathStr = this.get('srcPath');
    }

    oldMakeStruct = this.get('shouldMake');
    this.set('shouldMake', false);

    this.set('isNative', false);
    results = this.execOnNative(node, TP.NODESET, false);

    this.set('shouldMake', oldMakeStruct);

    //  If there were no results, there probably wasn't a valid XPath.
    //  Exit here.
    if (TP.notValid(results) || (results.getSize() === 0)) {
        return this;
    }

    len = results.getSize();

    //  Found something, so now we have to remove it (and/or flag as needed)
    for (i = 0; i < len; i++) {
        node = results[i];

        //  If what we have is an attribute then we are being asked to remove it
        //  from it's containing element
        if (node.nodeType === Node.ATTRIBUTE_NODE) {
            elem = TP.attributeGetOwnerElement(node);

            //  flag the attribute's owner element as having changed
            if (aTPNode.shouldFlagChanges()) {
                TP.elementFlagChange(elem, TP.ATTR + node.name, TP.DELETE);
            }

            //  Rip out the attribute itself so it won't be seen in any
            //  serialization of the DOM. Unfortunately our current flagging
            //  model doesn't allow filtering as we do at the element level, so
            //  we have to do this here and rely on the flagging to say that
            //  this attribute once existed.
            elem.removeAttributeNode(node);

            this.changed('@' + node.name, TP.DELETE);
        } else {
            //  when dealing with other elements we get their parent node so
            //  we can remove when needed
            elem = node.parentNode;

            if (aTPNode.shouldFlagChanges()) {
                //  if we're flagging rather than 'doing' then we set the change
                //  flag to TP.DELETE and that's all
                TP.elementFlagChange(node, TP.SELF, TP.DELETE);

                TP.ifTrace(TP.$DEBUG) ?
                    TP.trace('Node flagged: ' + TP.nodeAsString(node),
                                TP.LOG, arguments) : 0;
            } else {
                //  if we're not flagging then just rip it out of the DOM
                TP.nodeRemoveChild(elem, node);
            }

            TP.wrap(elem).changed('content', TP.DELETE);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @name $$getContentForSetOperation
     * @synopsis Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Array} The array of Nodes that got built.
     */

    var shouldMake,

        results,

        path,
        lastSegment,
        ndx,

        targetsAttr,
        attrPath,

        xPath;

    shouldMake = this.get('shouldMake');

    //  We pass 'false' to not log errors here - we may be constructing.
    results = this.execOnNative(aNode, TP.NODESET, false, flagChanges);

    //  If we found content by executing ourself against the target object, then
    //  most other concerns are moot - we got at least one targeted node (even
    //  if that's an attribute node) and we can set it's value.

    //  If we didn't, well we've more work to do.
    if (TP.isEmpty(results)) {

        if (TP.notValid(path = this.get('$transformedPath'))) {
            path = this.get('srcPath');
        }

        //  only support build on demand behavior if the flag is set
        if (TP.notTrue(shouldMake)) {
            TP.ifWarn() ?
                TP.warn(TP.boot.$annotate(
                            this,
                            'Unable to obtain content to set for path: ' +
                            path),
                        TP.LOG,
                        arguments) : 0;

            return TP.ac();
        }

        //  attribute-targeting paths can make life interesting since we may
        //  want to access the elements and add the attribute when not found, or
        //  we may want to only operate on pre-existing attribute nodes.
        //  Although standard technologies such as XForms (section 4.2.2)
        //  implies we don't build new attributes when they're missing from
        //  existing instances, we don't think that's particularly practical
        //  from a development perspective so we tend to build them and manage
        //  relevancy separately from whether the data exists or not
        if (TP.regex.HAS_AT.test(path)) {
            lastSegment = path;

            if ((ndx = path.lastIndexOf('/')) !== TP.NOT_FOUND) {
                lastSegment = path.slice(ndx + 1);
            }

            //  If the first character of the last segment is a '@', or the last
            //  segment starts with 'attribute::' then we're dealing with an
            //  attribute path after all
            if (lastSegment.charAt(0) === '@') {
                targetsAttr = true;
                attrPath = lastSegment.slice(1);
            } else if (lastSegment.startsWith('attribute::')) {
                targetsAttr = true;
                attrPath = lastSegment.slice(11);
            }

            //  We have a choice here based on how we want to deal with
            //  attribute-targeting paths where the nodes don't exist yet. If we
            //  only want to process those nodes that exist we leave the
            //  attribute portion on the XPath and let it return attribute
            //  nodes. If we want to be able to build those attributes on the
            //  fly when they're missing we need to strip off the attribute
            //  portion of the path and run it to get the elements being
            //  targeted. As it turns out we always build them for binding
            //  support so we have to strip off the tail and run with that.
            if (targetsAttr) {
                xPath = TP.xpc(path.slice(0, ndx));
            }
        }

        //  Note that results will always be a TP.NODESET
        results = this.$$createNodesForPath(aNode, flagChanges);

        if (TP.isEmpty(results)) {
            //  unable to build nodes... path may not be specific enough
            TP.ifWarn() ?
                TP.warn(TP.boot.$annotate(
                            this,
                            'Unable to build content for path: ' + path),
                        TP.LOG,
                        arguments) : 0;

            return TP.ac();
        }
    }

    return results;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('getShouldMake',
function() {

    /**
     * @name getShouldMake
     * @synopsis Returns whether the receiver is currently configured to create
     *     Nodes as it is executed against a particular context node.
     * @returns {Boolean} Whether the receiver is configured to create nodes as
     *     it executes.
     */

    var context;

    //  if we have a context it will know, otherwise we assume false since
    //  we'd have to have a context to process otherwise
    if (TP.isValid(context = this.$get('$tpContext'))) {
        return context.shouldCreateNodes;
    }

    //  Note that we use $get() here to avoid endless recursion
    return this.$get('shouldMake');
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('getReferencedNodes',
function(aNode) {

    /**
     * @name getReferencedNodes
     * @synopsis Returns an Array of the Nodes that are referenced by this path,
     *     using aNode as the 'context node' (e.g. starting point).
     * @param {Node|TP.core.Node} aNode The Node to execute the receiver
     *     against.
     * @returns {Array} The array of TP.core.Nodes referenced by the receiver.
     * @todo
     */

    var context,

        stepExprs,
        parser,
        stepNodes,

        len,
        i,
        expr,

        tpPath,
        tpResult;

    //  force creation of a non-native path processing context
    if (TP.notValid(context = this.$get('$tpContext'))) {
        this.$createNonNativeParserContext();
        context = this.$get('$tpContext');
    }

    //  collect the location "subpaths" in this XPath
    stepExprs = this.getReferencedLocationSteps();

    //  if the location subpaths contains 1 path it's the path itself, so there
    //  are no 'referenced nodes'
    if (stepExprs.getSize() === 1) {
        return TP.ac();
    }

    //  Grab the non-native context and parser objects and configure them
    //  in preparation for executing the path at each referenced location

    //  Make sure to TP.unwrap() aNode - it might have been a TP.core.Node.
    context.expressionContextNode = TP.unwrap(aNode);

    parser = this.getType().getParser();

    stepNodes = TP.ac();

    //  Loop over each referenced location path, parsing and evaluating
    //  each path and adding the results to stepNodes.
    len = stepExprs.getSize();
    for (i = 0; i < len; i++) {
        expr = stepExprs.at(i);

        tpPath = parser.parse(expr);
        tpResult = tpPath.evaluate(context);

        stepNodes.add(tpResult.toArray());
    }

    //  flatten stepNodes out as it probably has multiple Arrays (if more
    //  than one stepExpr had results, which is highly likely).
    stepNodes = stepNodes.flatten();

    return stepNodes;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('getReferencedLocationSteps',
function() {

    /**
     * @name getReferencedLocationSteps
     * @synopsis Returns an Array of the location steps that are used by this
     *     path any place in its expression.
     * @returns {Array} The array of Strings that represent location steps
     *     referenced by expression in the receiver.
     * @todo
     */

    var context,
        locationSteps;

    //  force creation of a non-native path processing context, which will
    //  ensure that we get a parsed path set in the tpPath attribute
    if (TP.notValid(context = this.$get('$tpContext'))) {
        this.$createNonNativeParserContext();
    }

    locationSteps = TP.ac();

    //  Grab all of the location paths referenced by the receiver and
    //  transform them into their String representation.
    this.$get('$tpPath').expression.gatherLocationPathsInto(locationSteps);

    return locationSteps;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('isAbsolute',
function() {

    /**
     * @name isAbsolute
     * @synopsis Returns whether or not the receiver contains an 'absolute'
     *     XPath (that is, one that starts with a '/').
     * @returns {Boolean} Whether or not the receiver contains an 'absolute'
     *     XPath.
     */

    var path;

    //  if we've got a tpPath (non-native parsed path content) we can ask it
    if (TP.isValid(path = this.$get('$tpPath'))) {
        return path.expression.locationPath.absolute;
    }

    //  simple check on native paths is does it start with "/"
    return this.$get('srcPath').startsWith('/');
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('isNativePath',
function(aFlag) {

    /**
     * @name isNativePath
     * @synopsis Returns true if the receiver can execute using the browser's
     *     native XPath parser. The default for most paths is true, however if
     *     you've requested special processing such as node creation or
     *     extension function handling this will return false.
     * @param {Boolean} aFlag True will force the path to be a native path if
     *     possible, false will set it to non native path.
     * @returns {Boolean} Whether or not native processing is sufficient.
     * @todo
     */

    var path;

    if (TP.isBoolean(aFlag)) {
        path = this.$get('srcPath');

        if (aFlag) {
            if (TP.core.XPathPath.NON_NATIVE_PATH_REGEX.test(path)) {
                TP.ifWarn() ?
                    TP.warn('Found non-native XPath constructs in XPath: ' +
                            path +
                            '. Forcing XPath to use non native parser.',
                            TP.LOG, arguments) : 0;

                this.set('isNative', false);

                this.$createNonNativeParserContext(path);
            } else {
                this.set('isNative', true);
            }
        } else {
            this.set('isNative', false);

            this.$createNonNativeParserContext(path);
        }
    }

    return this.get('isNative');
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('setShouldMake',
function(shouldMakeStruct) {

    /**
     * @name setShouldMake
     * @synopsis Sets whether the receiver is currently configured to create
     *     Nodes as it is executed against a particular context node.
     * @param {shouldMakeStruct} Boolean the receiver should be configured to
     *     create nodes as it executes.
     * @returns {TP.core.XPathPath} The receiver.
     */

    var context;

    if (TP.isTrue(shouldMakeStruct)) {
        //  force creation of a non-native parsing context, and set ourselves to
        //  be a non-native path (can't do this operation with native paths)
        this.isNativePath(false);
    }

    //  if we've got a context already then update it, but don't create one just
    //  to say "false"
    if (TP.isValid(context = this.$get('$tpContext'))) {
        context.shouldCreateNodes = shouldMakeStruct;
    }

    //  Note that we use $set() here to avoid endless recursion
    this.$set('shouldMake', shouldMakeStruct);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('setPath',
function(aPath, forceNative) {

    /**
     * @name setPath
     * @synopsis Sets the XPath expression for the receiver to the supplied
     *     path. The caller can also force the path type to be of a particular
     *     type, but if the path contains namespace-qualified extension
     *     functions it will force the path to be a non native path.
     * @param {String} aPath The XPath as a String.
     * @param {Boolean} forceNative Whether or not the path should be 'forced'
     *     to be a native path, rather than letting this type compute whether
     *     it is either a native or non-native path. See this type's
     *     discussion for more information.
     * @returns {TP.core.XPathPath} The receiver.
     * @todo
     */

    var pathType;

    if (TP.notValid(forceNative)) {
        //  based on whether it looks like a non-native path we'll either
        //  accept their input or ensure consistent processing
        if (TP.core.XPathPath.NON_NATIVE_PATH_REGEX.test(aPath)) {
            if (forceNative) {
                TP.ifWarn() ?
                    TP.warn('Found non-native XPath constructs in XPath: ' +
                            aPath +
                            '. Forcing XPath to use non native parser.',
                            TP.LOG, arguments) : 0;
            }

            pathType = false;
        } else {
            pathType = true;
        }
    } else {
        pathType = forceNative;
    }

    this.set('isNative', pathType);

    //  If we're a non-native path we'll need additional processing assistance
    //  so we get that configured once at initialization time
    if (pathType === TP.core.XPathPath.NON_NATIVE_PATH) {
        this.$createNonNativeParserContext(aPath);
    }

    //  Save the path itself, but NOTE that we do this last so that the
    //  $createNonNativeParserContext processing can test against the "current"
    //  path, not the new one to see if a new context needs to be created.
    this.$set('srcPath', aPath);

    return this;
});

//  ========================================================================
//  TP.w3.DTDInfo
//  ========================================================================

/**
 * @type {TP.w3.DTDInfo}
 * @synopsis This type of JSONContent provides convenience routines for
 *     accessing and validating DTD data as processed by the scripts located
 *     here: https://github.com/dominicmarks/html4-dtd-json
 * @description This type accesses data that has a structure that could contain
 *     items such as these. Note that this is not a complete description of the
 *     data schema. See the data file itself for more structural elements:
 *
 *     'data': { 'element': { 'ul': { 'attributes': { 'id': { 'default': '',
 *     'type': '#implied', 'value': 'cdata', } }, 'cdata': false,
 *     'childElements': [], 'contentType': 'element', 'contentModel': {
 *     'expanded': { 'sequenceGroup': { 'children': [], 'elements': ['li'],
 *     'text': false } } }, 'empty': false, 'omitStart': false, 'omitEnd':
 *     false, 'text': false } } }
 * @todo
 */

//  ------------------------------------------------------------------------

TP.core.JSONContent.defineSubtype('w3:DTDInfo');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.w3.DTDInfo.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Performs one-time setup for the type on startup/import.
     */

    var dtdInfoURI,
        dtdInfo;

    //  Set this up so that it observes the 'AppStart' signal and tries to
    //  load 2000ms after it gets that signal. This avoids a large pause at
    //  app startup.
    this.observe(
        TP.sys,
        'TP.sig.AppStart',
        function(aSignal) {

            this.ignore(TP.sys, aSignal.getSignalName());

            (function() {

                //  Load the DTD information for HTML 4.01 Strict
                dtdInfoURI = TP.uc('~lib_lib/json/html401_strict.json');
                dtdInfo = dtdInfoURI.getResource(
                                    TP.hc('async', false,
                                            'contentHandler', this));

                if (TP.isValid(dtdInfo)) {
                    TP.w3.DocType.HTML_401_STRICT.set('dtdInfo', dtdInfo);
                }

            }.bind(this)).fork(2000);
        }.bind(this));

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.w3.DTDInfo.Inst.defineAttribute(
        'elements',
        {'value': TP.apc('data.element', true)});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.w3.DTDInfo.Inst.defineMethod('elementIsValidChildOf',
function(childElementName, parentElementName) {

    /**
     * @name elementIsValidChildOf
     * @synopsis Returns whether or not the child element is a valid child of
     *     the parent element given the information in the contained schema.
     * @param {String} childElementName The name of the child element.
     * @param {String} parentElementName The name of the parent element.
     * @returns {Boolean} Whether or not the child element is a valid child of
     *     the parent element.
     * @todo
     */

    var parentContentModels,

        childElems;

    parentContentModels = this.get('elements').at(
                            parentElementName).at(
                            'contentModel').at(
                            'expanded');

    //  There could be more than one parent content model describing valid
    //  child elements. We must iterate through them all. They can take the
    //  form of an 'orGroup', 'andGroup' or 'sequenceGroup'.
    parentContentModels.perform(
        function(contentModel) {

            var groupElem;

            if (TP.isEmpty(groupElem = contentModel.at('orGroup'))) {
                if (TP.isEmpty(groupElem =
                                contentModel.at('sequenceGroup'))) {
                    groupElem = contentModel.at('andGroup');
                }
            }

            if (TP.isElement(groupElem) &&
                TP.isArray(childElems = groupElem.at('elements'))) {
                return TP.BREAK;
            }
    });

    if (TP.isEmpty(childElems)) {
        return false;
    }

    return childElems.contains(childElementName);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
