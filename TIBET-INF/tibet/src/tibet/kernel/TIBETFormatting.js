//  ========================================================================
/*
NAME:   TIBETFormatting.js
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
//  ------------------------------------------------------------------------

/**
The types and methods in this file support data formatting, particularly
producing string representations for various input/output requirements.

For example, TIBET's XControls features include inputfmt and outputfmt attributes
which allow you to control how data looks at the UI and how it's reformatted prior
to storage in a model. Formatters play an important role in this. For example, you
might have UI requirements for upperCase but database storage requirements for
lowerCase. The inputfmt/outputfmt feature allows you to map this requirement on a
field-by-field basis with little orno effort. More complex formatting is certainly
possible as well.

NOTE: The functionality here is integrated with TP.core.Locale support to enable
formatters to be driven by the current locale.
*/

/* JSHint checking */

//  ========================================================================
//  Object Formatters
//  ========================================================================

/**
The methods defined in this section provide support for common data formats via
TIBET's as() and from() method interfaces. Using obj.as(format) where format is
any type will cause TIBET to automatically dispatch to either a local method
specific to the receiver, or to the type to invoke it's from() method. The formats
here support string and Node representations suitable for display or storage of
HTML, XML (defaulting to XMLRPC), or JSON strings.

When the format is a string the receiver's asString method is called. Many of the
common types in TIBET will respond to this by using type-specific rules for
processing format strings. For example, Date and Number allow you to provide a
UTC #35 (http://www.unicode.org/reports/tr35/tr35-4.html) format string.
*/

//  ------------------------------------------------------------------------
//  "AS" Support
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asHTMLNode',
function(aDocument) {

    /**
     * @name asHTMLNode
     * @synopsis Produces an HTML node representation of the receiver if
     *     possible. By default this method relies on the markup string produced
     *     by asHTMLString for source text. NOTE that when a string would
     *     produce multiple "top level" nodes for the receiver a document
     *     fragment is returned with the list.
     * @param {HTMLDocument} aDocument The document which should own the result
     *     node. Defaults to the current canvas's document.
     * @returns {Node} The receiver in HTML node format.
     * @todo
     */

    return TP.stringAsHTMLNode(this.asHTMLString(), aDocument);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     * @todo
     */

    var arr,
        keys,
        len,
        i,

        key;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asHTMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    //  NB: For 'Object', we put this in a try...catch since some native Objects
    //  (i.e. XHR objects) don't like to have slots placed on them.
    try {
        this.$$format_asHTMLString = true;
    }
    catch (e) {
    }

    //  perform a simple conversion based on filtering rule if any

    arr = TP.ac();

    keys = this.getKeys();
    len = keys.getSize();

    arr.push('<span class="Object ', TP.escapeTypeName(TP.tname(this)), '">');

    for (i = 0; i < len; i++) {
        key = keys.at(i);
        arr.push('<span data-name="', key, '">',
                      TP.htmlstr(this.at(key)),
                    '<\/span>');
    }

    arr.push('<\/span>');

    //  We're done - we can remove the recursion flag.
    try {
        delete this.$$format_asHTMLString;
    }
    catch (e) {
    }

    return arr.join('');
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asStorageString',
function() {

    /**
     * @name asStorageString
     * @synopsis Produces a string representation suitable for data storage.
     *     This might be encoded in a variety of ways depending on the receiver
     *     and what "storage" means for it, but the default format is source
     *     code form.
     * @returns {String} The receiver in storage format.
     * @todo
     */

    return this.asJSONSource();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asXHTMLNode',
function() {

    /**
     * @name asXHTMLNode
     * @synopsis Produces an XHTML node representation of the receiver if
     *     possible. By default this method relies on the markup string produced
     *     by asXHTMLString for source text.
     * @returns {Node} The receiver in XHTML node format.
     * @todo
     */

    return TP.nodeFromString(this.asXHTMLString());
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asXHTMLString',
function() {

    /**
     * @name asXHTMLString
     * @synopsis Produces an XHTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XHTML string format.
     * @todo
     */

    return this.asString();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asXMLNode',
function(aDocument) {

    /**
     * @name asXMLNode
     * @synopsis Produces an XML node representation of the receiver if
     *     possible. By default this method relies on the markup string produced
     *     by asXMLString for source text.
     * @returns {Node} The receiver in XML node format.
     * @todo
     */

    return TP.nodeFromString(this.asXMLString());
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('asXMLString',
function(aFilterName) {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @param {String} aFilterName A get*Interface() filter spec.
     * @returns {String} The receiver in XML string format.
     * @todo
     */

    var arr,
        keys,
        len,
        i,

        key;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asXMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    //  NB: For 'Object', we put this in a try...catch since some native Objects
    //  (i.e. XHR objects) don't like to have slots placed on them.
    try {
        this.$$format_asXMLString = true;
    }
    catch (e) {
    }

    //  perform a simple conversion based on filtering rule if any

    arr = TP.ac();

    keys = this.getKeys(aFilterName);
    len = keys.getSize();

    for (i = 0; i < len; i++) {
        key = keys.at(i);
        arr.push( '<', key, '>', TP.xmlstr(this.at(key)), '<\/', key, '>');
    }

    //  We're done - we can remove the recursion flag.
    try {
        delete this.$$format_asXMLString;
    }
    catch (e) {
    }

    return arr.join('');
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var joinCh,

        joinArr,
        joinStr;

    this.$sortIfNeeded();

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asDumpString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asDumpString = true;

    joinCh = this.$get('delimiter');

    if (!TP.isString(joinCh)) {
        //  If 'joinCh' is not a String, maybe it's a hash or other Object with
        //  a 'join' property.
        if (!TP.isString(joinCh = joinCh.get('join'))) {
            joinCh = '';
        }
    }

    try {
        joinArr = this.collect(
            function(item, index) {

                return TP.dump(item);
        });

        joinStr = '[' + joinArr.join(joinCh) + ']';
    } catch (e) {
        joinStr = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asDumpString;

    return joinStr;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     * @todo
     */

    var arr,
        len,
        i;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asHTMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asHTMLString = true;

    //  perform a simple conversion based on filtering rule if any

    arr = TP.ac();

    len = this.getSize();

    arr.push('<span class="Array">');

    //  note that here we add the word 'item' in front of the index as part
    //  of the tag name. That allows the production here to be compliant HTML
    //  - HTML names cannot start with a number.
    for (i = 0; i < len; i++) {
        arr.push(
            '<span data-name="', i, '">',
                TP.htmlstr(this.at(i)),
            '<\/span>');
    }

    arr.push('<\/span>');

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asHTMLString;

    return arr.join('');
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var joinArr,

        i,
        len,

        joinStr;

    this.$sortIfNeeded();

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asPrettyString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asPrettyString = true;

    try {

        joinArr = TP.ac();

        len = this.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                TP.join('<dt class="pretty key">', i, '<\/dt>',
                        '<dd class="pretty value">',
                            TP.pretty(this.at(i)),
                        '<\/dd>'));
        }

        joinStr = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) +
                        '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '<\/dd>' +
                    joinArr.join('') +
                    '<\/dl>';
    } catch (e) {
        joinStr = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asPrettyString;

    return joinStr;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     * @todo
     */

    var arr,
        len,
        i;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asXMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asXMLString = true;

    //  perform a simple conversion based on filtering rule if any

    arr = TP.ac();

    len = this.getSize();

    //  note that here we add the word 'item' in front of the index as part
    //  of the tag name. That allows the production here to be compliant XML
    //  - XML names cannot start with a number.
    for (i = 0; i < len; i++) {
        arr.push(
            '<item index="', i, '">',
                TP.xmlstr(this.at(i)),
            '<\/item>');
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asXMLString;

    return arr.join('');
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     * @todo
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty Boolean"><dt\/><dd>' +
            TP.str(this) +
            '<\/dd><\/dl>';
});

//  ------------------------------------------------------------------------

Boolean.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     * @todo
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    //  '.toISOString()' is an ECMA ed5 addition
    return this.toISOString();
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     * @todo
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    return this.toISOString().quoted('"');
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    //  '.toISOString()' is an ECMA ed5 addition
    return '<dl class="pretty Date"><dt\/><dd>' +
            TP.str(this) +
            '<\/dd><\/dl>';
});

//  ------------------------------------------------------------------------

Date.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     * @todo
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    //  The only way to discern between Function objects that are one of the
    //  native constructors (types) and a regular Function object.
    if (TP.isNativeType(this)) {
        return this.getName();
    }

    //  The 'dump string' version of a Function is it's 'toString()' rep.
    return TP.objectToString(this);
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     * @todo
     */

    //  The only way to discern between Function objects that are one of the
    //  native constructors (types) and a regular Function object.
    if (TP.isNativeType(this)) {
        return '<span class="NativeType">' +
                this.getName() +
                '<\/span>';
    }

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asJSONSource',
function(aFilterName, aLevel) {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @param {String} aFilterName Ignored.
     * @param {Number} aLevel If 0, returns function() {...}
     * @returns {String} A JSON-formatted string.
     * @todo
     */

    var supertypeName,
    
        str,
        lvl;

    //  The only way to discern between Function objects that are one of the
    //  native constructors (types) and a regular Function object.
    if (TP.isNativeType(this)) {
        supertypeName = (this !== Object) ? '"Object"' : '""';

        return '{"type":"NativeType",' +
                '"data":{"name":' + this.getName().quoted('"') + ',' +
                '"supertypes":[' + supertypeName + ']}}';
    }

    if (TP.isType(this)) {
        return TP.join(this.getSupertype().getName(),
                        '.defineSubtype(\'', this.getNamespacePrefix(), ':',
                        this.getLocalName(), '\');');
    }

    lvl = TP.notDefined(aLevel) ? TP.sys.cfg('stack.descent_max') :
                                Math.max(0, aLevel);

    if (lvl === 0) {
        str = '(function () {})';
    } else {
        str = TP.join(
                '(',
                this.toString().tokenizeWhitespace().replace('{ }', '{}'),
                ')');
    }

    return str;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    //  The only way to discern between Function objects that are one of the
    //  native constructors (types) and a regular Function object.
    if (TP.isNativeType(this)) {
        return '<dl class="pretty NativeType">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' +
                        'NativeType.&lt;' + TP.name(this) + '&gt;' +
                    '<\/dd>' +
                    '<dt\/>' +
                    '<dd class="pretty value">' +
                        this.getName() +
                    '<\/dd>' +
                    '<\/dl>';
    }

    return '<dl class="pretty Function"><dt\/><dd>' +
            TP.objectToString(this) +
            '<\/dd><\/dl>';
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     * @todo
     */

    //  The only way to discern between Function objects that are one of the
    //  native constructors (types) and a regular Function object.
    if (TP.isNativeType(this)) {
        return '<type>' + this.getName() + '<\/type>';
    }

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     * @todo
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty Number"><dt\/><dd>' +
            TP.str(this) +
            '<\/dd><\/dl>';
});

//  ------------------------------------------------------------------------

Number.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     * @todo
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    //   We use 'toString()' rather than the 'source' property, since it
    //   includes the flags, etc.
    return this.toString();
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     * @todo
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    //   We use 'toString()' rather than the 'source' property, since it
    //   includes the flags, etc.
    return this.toString().quoted('"');
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty RegExp"><dt\/><dd>' +
            this.toString() +
            '<\/dd><\/dl>';
});

//  ------------------------------------------------------------------------

RegExp.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     * @todo
     */

    return TP.str(this);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     * @todo
     */

    var str;

    str = this.toString();

    if (TP.regex.IS_ELEM_MARKUP.test(str)) {
        return str;
    }

    return TP.htmlLiteralsToEntities(str);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var str;

    str = this.toString();

    if (TP.regex.CONTAINS_ELEM_MARKUP.test(str)) {

        str = str.asEscapedXML();
    }

    return '<dl class="pretty String"><dt\/><dd>' +
            str +
            '<\/dd><\/dl>';
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     * @todo
     */

    var str;

    str = this.toString();

    if (TP.regex.IS_ELEM_MARKUP.test(str)) {
        return str;
    }

    return TP.xmlLiteralsToEntities(TP.htmlEntitiesToXmlEntities(str));
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    return this.getName();
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    return '<span class="TP.lang.RootObject">' +
            this.getName() +
            '<\/span>';
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('asJSONSource',
function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var stNames;

    stNames = this.getSupertypeNames().collect(
                                function(aName) {
                                    return aName.quoted('"');
                                });

    return '{"type":"TP.lang.RootObject",' +
            '"data":{"name":' + this.getName().quoted('"') + ',' +
            '"supertypes":[' + stNames.join(',') + ']}}';
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty TP.lang.RootObject">' +
                '<dt>Type name<\/dt>' +
                '<dd class="pretty typename">' +
                    'TP.lang.RootObject.&lt;' + TP.name(this) + '&gt;' +
                '<\/dd>' +
                '<dt\/>' +
                '<dd class="pretty value">' +
                    this.getName() +
                '<\/dd>' +
                '<\/dl>';
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    return '<type>' + this.getName() + '<\/type>';
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var joinArr,

        keys,
        len,
        i,
    
        joinStr;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asDumpString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asDumpString = true;

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                    TP.join(keys.at(i),
                            ' => ',
                            TP.dump(this.get(keys.at(i)))));
        }

        joinStr = TP.tname(this) + ' :: ' + '(' + joinArr.join(', ') + ')';
    } catch (e) {
        joinStr = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asDumpString;

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var joinArr,

        keys,
        len,
        i,
    
        joinStr;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asHTMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asHTMLString = true;

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                    TP.join('<span data-name="', keys.at(i), '">',
                            TP.htmlstr(this.get(keys.at(i))),
                            '<\/span>'));
        }

        joinStr = '<span class="TP_lang_Object ' +
                        TP.escapeTypeName(TP.tname(this)) + '">' +
                     joinArr.join('') +
                     '<\/span>';
    } catch (e) {
        joinStr = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asHTMLString;

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var joinArr,

        keys,
        len,
        i,
    
        joinStr;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asJSONSource) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asJSONSource = true;

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                    TP.join(keys.at(i).quoted('"'),
                            ':',
                            TP.json(this.get(keys.at(i)))));
        }

        joinStr = '{"type":"' + TP.tname(this) + '",' +
                    '"data":{' + joinArr.join(',') + '}}';
    } catch (e) {
        joinStr = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asJSONSource;

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    var joinArr,

        keys,
        len,
        i,
    
        joinStr;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asPrettyString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asPrettyString = true;

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                TP.join('<dt class="pretty key">', keys.at(i), '<\/dt>',
                        '<dd class="pretty value">',
                            TP.pretty(this.at(keys.at(i))),
                        '<\/dd>'));
        }

        joinStr = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) +
                        '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '<\/dd>' +
                    joinArr.join('') +
                    '<\/dl>';
    } catch (e) {
        joinStr = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asPrettyString;

    return joinStr;
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var joinArr,

        keys,
        len,
        i,
    
        joinStr;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asXMLString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asXMLString = true;

    joinArr = TP.ac();

    try {
        keys = TP.keys(this);
        len = keys.getSize();

        for (i = 0; i < len; i++) {
            joinArr.push(
                    TP.join('<', keys.at(i), '>',
                            TP.xmlstr(this.get(keys.at(i))),
                            '<\/', keys.at(i), '>'));
        }

        joinStr = '<instance type="' + TP.tname(this) + '">' +
                     joinArr.join('') +
                     '<\/instance>';
    } catch (e) {
        joinStr = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asXMLString;

    return joinStr;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
