//  ========================================================================
/*
NAME:   xs_anyType.js
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
 * @type {TP.xs.anyType}
 * @synopsis A top-level, non-descriptive type container. Simple and complex XML
 *     Schema types are rooted here.
 */

//  ------------------------------------------------------------------------

TP.xs.XMLSchemaType.defineSubtype('anyType');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Creates a new instance from the object provided, if possible.
     *     This method is often used with schema types as part of the processing
     *     which allows the schema types to act both as validators and
     *     formatters.
     * @param {Object} anObject The object to use as source data.
     * @returns {TP.xs.anyType} An instance of the receiver, or a string
     *     representing such an instance when the receiver doesn't have
     *     instances.
     */

    //  at this level we don't bother making any form of conversion
    return anObject;
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Tests the incoming value to see if it represents a valid
     *     instance of 'anyType'.
     * @description The XML Schema specification has no canonical definition for
     *     this type's value space but to support usage for type validation we
     *     define it to exclude null and undefined.
     * @param {Object} anObject The object to test.
     * @returns {Boolean} 
     */

    //  everything is valid at this level as long as it's a real object
    return TP.isValid(anObject);
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validateFacet',
function(aValue, aFacet) {

    /**
     * @name validateFacet
     * @synopsis Tests the incoming value to see if it represents a valid
     *     instance of the receiver when restricted by the facet given.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    var name,
        fname;

    //  grab the non-prefixed name of the facet so we can build a method
    //  name from it
    name = aFacet.nodeName.split(':').last();
    fname = 'validateFacet' + name.asStartUpper();

    //  dispatch to that method if possible
    if (TP.isMethod(this[fname])) {
        return this[fname](aValue, aFacet);
    }

    TP.ifWarn() ?
        TP.warn(TP.boot.$annotate(
                    aFacet,
                    'Unable to find facet resolution method'),
                TP.LOG,
                arguments) : 0;

    return true;
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validateFacetEnumeration',
function(aValue, aFacet) {

    /**
     * @name validateFacetEnumeration
     * @synopsis Tests the incoming value against a specific enumeration value
     *     found in the facet provided.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    var inst;

    //  this will work for anything whose lexical and value spaces are
    //  essentially the same (which means anything that's fundamentally a
    //  string) but numerical values have to be done differently

    inst = this.fromObject(TP.elementGetAttribute(aFacet, 'value'));

    return aValue.equalTo(inst);
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validateFacetFractionDigits',
function(aValue, aFacet) {

    /**
     * @name validateFacetFractionDigits
     * @synopsis Tests to make sure the inbound value has no more than the
     *     specified number of fractional digits. This facet is only supported
     *     for the TP.xs.decimal type.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    //  this facet is only supported for TP.xs.decimal
    this.raise('TP.sig.UnsupportedFeature',
                arguments,
                'Unsupported facet for this schema type');

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validateFacetLength',
function(aValue, aFacet) {

    /**
     * @name validateFacetLength
     * @synopsis Tests the incoming value to make sure it is the specified
     *     length, as length is computed for the receiving type.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    //  strings and string-like types support this, but nothing else
    this.raise('TP.sig.UnsupportedFeature',
                arguments,
                'Unsupported facet for this schema type');

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validateFacetMaxExclusive',
function(aValue, aFacet) {

    /**
     * @name validateFacetMaxExclusive
     * @synopsis Tests the incoming value to see if its value is less than the
     *     value provided in the facet specification.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    //  float and date/time types support this
    this.raise('TP.sig.UnsupportedFeature',
                arguments,
                'Unsupported facet for this schema type');

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validateFacetMaxInclusive',
function(aValue, aFacet) {

    /**
     * @name validateFacetMaxInclusive
     * @synopsis Tests the incoming value to see if it is less than or equal to
     *     the value specified in the facet node.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    //  float and date/time types support this
    this.raise('TP.sig.UnsupportedFeature',
                arguments,
                'Unsupported facet for this schema type');

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validateFacetMaxLength',
function(aValue, aFacet) {

    /**
     * @name validateFacetMaxLength
     * @synopsis Tests the incoming value to ensure its total length (as
     *     computed by the type itself) is less than or equal to the size
     *     defined in the facet.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    //  string and string-like types support this facet
    this.raise('TP.sig.UnsupportedFeature',
                arguments,
                'Unsupported facet for this schema type');

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validateFacetMinExclusive',
function(aValue, aFacet) {

    /**
     * @name validateFacetMinExclusive
     * @synopsis Tests the incoming value to verify that it is larger than the
     *     minimum value provided in the facet.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    //  float and date/time types support this
    this.raise('TP.sig.UnsupportedFeature',
                arguments,
                'Unsupported facet for this schema type');

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validateFacetMinInclusive',
function(aValue, aFacet) {

    /**
     * @name validateFacetMinInclusive
     * @synopsis Tests the incoming value to make sure its value is at least the
     *     value provided in the facet node.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    //  float and date/time types support this
    this.raise('TP.sig.UnsupportedFeature',
                arguments,
                'Unsupported facet for this schema type');

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validateFacetMinLength',
function(aValue, aFacet) {

    /**
     * @name validateFacetMinLength
     * @synopsis Tests the incoming value to make sure it is as least the length
     *     provided in the facet node (as length is computed for the receiving
     *     type). instance of the receiver when restricted by the facet given.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    //  string and string-like types support this facet
    this.raise('TP.sig.UnsupportedFeature',
                arguments,
                'Unsupported facet for this schema type');

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validateFacetPattern',
function(aValue, aFacet) {

    /**
     * @name validateFacetPattern
     * @synopsis Tests the incoming value against the regular expression
     *     provided in the facet. Note that pattern facets are "or'd" when more
     *     than one exists in a restriction. This method tests individual values
     *     and patterns and the looping logic is handled by the TP.xs.simpleType
     *     type.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    var regex,
        str;

    regex = TP.elementGetAttribute(aFacet, 'value');

    //  get the value's string representation (as it would like to see it)
    str = aValue.asString();

    return regex.test(str);
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validateFacetTotalDigits',
function(aValue, aFacet) {

    /**
     * @name validateFacetTotalDigits
     * @synopsis Tests the incoming value to make sure it has no more than the
     *     total number of decimal digits specified in the facet.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    //  supported by TP.xs.decimal and its descendants
    this.raise('TP.sig.UnsupportedFeature',
                arguments,
                'Unsupported facet for this schema type');

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.anyType.Type.defineMethod('validateFacetWhiteSpace',
function(aValue, aFacet) {

    /**
     * @name validateFacetWhiteSpace
     * @synopsis Processes whitespace in the value to meet certain criteria
     *     prior to other facets being applied. Note that processing of this
     *     facet is handled by the type, not an instance, and that it is run via
     *     TP.xs.simpleType.
     * @param {Object} aValue The object to test.
     * @param {Element} aFacet The facet node being tested.
     * @returns {Boolean} 
     * @todo
     */

    //  not really a validity check, more of a "pre-formatter" which is
    //  handled by the TP.xs.simpleType construction element
    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

