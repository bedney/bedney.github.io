//  ========================================================================
/*
NAME:   xs_duration.js
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
 * @type {TP.xs.duration}
 * @synopsis A string representing a span of time as -PnYnMnDTnHnMnS where n
 *     represents an integer or decimal (for seconds) amount. Note that only one
 *     "segment" of time must be present for the duration to be valid. If that
 *     segment is a segment of hours, minutes, or seconds then the T must also
 *     be present.
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('duration');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

/*
The following 4 dates are used per XML Schema as test dates for duration
comparisons.
*/

TP.xs.duration.Type.defineConstant('COMPARISON_DATE_ONE',
                                TP.dc('1696-09-00T00:00:00Z'));

TP.xs.duration.Type.defineConstant('COMPARISON_DATE_TWO',
                                TP.dc('1697-02-01T00:00:00Z'));

TP.xs.duration.Type.defineConstant('COMPARISON_DATE_THREE',
                                TP.dc('1903-03-01T00:00:00Z'));

TP.xs.duration.Type.defineConstant('COMPARISON_DATE_FOUR',
                                TP.dc('1903-07-01T00:00:00Z'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('fromObject',
function(anObject) {

    /**
     * @name fromObject
     * @synopsis Constructs a new instance from the object provided, if
     *     possible. For TP.xs.duration this method throws an exception unless
     *     the inbound object's string value is a valid duration string itself.
     * @param {Object} anObject The object to use as source data.
     */

    var str;

    if (!TP.isValid(anObject)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    if (TP.isMethod(anObject.asString)) {
        str = anObject.asString();
    } else if (TP.isMethod(anObject.toString)) {
        str = anObject.toString();
    } else if (TP.isNode(anObject)) {
        str = TP.nodeAsString(anObject);
    }

    if (!this.validate(str)) {
        return;
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a conforming duration
     *     string of the form -PnYnMnDTnHnMnS.
     * @param {String} anObject The object to validate.
     * @returns {Boolean} 
     */

    var str,
        m;

    if (!TP.isString(anObject)) {
        return false;
    }

    str = anObject;

    //  must start with P or optional minus sign and one or more numbers OR
    //  a T signifying this will be a (T)ime specification
    if (!/^[-]*P[0-9T]+/.test(str)) {
        return false;
    }

    //  seems to match basic requirements meaning it starts off right and
    //  has at least one segment. next we split it into segments
    m = str.match(Date.DURATION_REGEX);
    if (TP.notValid(m)) {
        return false;
    }

    //  if there's a T, there has to be at least one of H, M, or S
    if (TP.notEmpty(m.at(Date.DURATION_T_INDEX))) {
        return (TP.notEmpty(m.at(Date.DURATION_HOUR_INDEX)) ||
                TP.notEmpty(m.at(Date.DURATION_MINUTE_INDEX)) ||
                TP.notEmpty(m.at(Date.DURATION_SECOND_INDEX)));
    } else {
        return (TP.isEmpty(m.at(Date.DURATION_HOUR_INDEX)) &&
                TP.isEmpty(m.at(Date.DURATION_MINUTE_INDEX)) &&
                TP.isEmpty(m.at(Date.DURATION_SECOND_INDEX)));
    }

    //  default to invalid
    return false;
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('validateFacetEnumeration',
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

    var inst,
        value;

    //  convert both values to normalized form for testing
    inst = Date.normalizeDuration(TP.elementGetAttribute(aFacet, 'value'));
    value = Date.normalizeDuration(aValue);

    return inst === value;
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('validateFacetMaxExclusive',
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

    var test;

    test = this.fromObject(TP.elementGetAttribute(aFacet, 'value'));

    if ((this.COMPARISON_DATE_ONE.addDuration(test).getTime() >
        this.COMPARISON_DATE_ONE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_TWO.addDuration(test).getTime() >
        this.COMPARISON_DATE_TWO.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_THREE.addDuration(test).getTime() >
        this.COMPARISON_DATE_THREE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_FOUR.addDuration(test).getTime() >
        this.COMPARISON_DATE_FOUR.addDuration(aValue).getTime())) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('validateFacetMaxInclusive',
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

    var test;

    test = this.fromObject(TP.elementGetAttribute(aFacet, 'value'));

    if ((this.COMPARISON_DATE_ONE.addDuration(test).getTime() >=
        this.COMPARISON_DATE_ONE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_TWO.addDuration(test).getTime() >=
        this.COMPARISON_DATE_TWO.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_THREE.addDuration(test).getTime() >=
        this.COMPARISON_DATE_THREE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_FOUR.addDuration(test).getTime() >=
        this.COMPARISON_DATE_FOUR.addDuration(aValue).getTime())) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('validateFacetMinExclusive',
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

    var test;

    test = this.fromObject(TP.elementGetAttribute(aFacet, 'value'));

    if ((this.COMPARISON_DATE_ONE.addDuration(test).getTime() <
        this.COMPARISON_DATE_ONE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_TWO.addDuration(test).getTime() <
        this.COMPARISON_DATE_TWO.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_THREE.addDuration(test).getTime() <
        this.COMPARISON_DATE_THREE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_FOUR.addDuration(test).getTime() <
        this.COMPARISON_DATE_FOUR.addDuration(aValue).getTime())) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('validateFacetMinInclusive',
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

    var test;

    test = this.fromObject(TP.elementGetAttribute(aFacet, 'value'));

    if ((this.COMPARISON_DATE_ONE.addDuration(test).getTime() <=
        this.COMPARISON_DATE_ONE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_TWO.addDuration(test).getTime() <=
        this.COMPARISON_DATE_TWO.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_THREE.addDuration(test).getTime() <=
        this.COMPARISON_DATE_THREE.addDuration(aValue).getTime()) &&
        (this.COMPARISON_DATE_FOUR.addDuration(test).getTime() <=
        this.COMPARISON_DATE_FOUR.addDuration(aValue).getTime())) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('getMonthsInDuration',
function(anObject) {

    /**
     * @name getMonthsInDuration
     * @synopsis Returns the number of months represented by the TP.xs.duration
     *     provided. Note that the implementation does not use information other
     *     than the Y and M segments in the duration.
     * @param {TP.xs.duration} aDuration The duration to convert.
     * @returns {Number} The number of months as an integer value.
     */

    var str;

    //  have to start with a real duration
    if (TP.notValid(str = this.from(anObject))) {
        return this.raise('TP.sig.InvalidDuration', arguments);
    }

    return Date.getMonthsInDuration(str);
});

//  ------------------------------------------------------------------------

TP.xs.duration.Type.defineMethod('getSecondsInDuration',
function(anObject) {

    /**
     * @name getSecondsInDuration
     * @synopsis Returns the number of seconds represented by the TP.xs.duration
     *     provided. Note that the implementation does not use information other
     *     than the D, H, M, and S time components.
     * @param {TP.xs.duration} aDuration The duration to convert.
     * @returns {Number} The number of seconds as a decimal value.
     */

    var str;

    //  have to start with a real duration
    if (TP.notValid(str = this.from(anObject))) {
        return this.raise('TP.sig.InvalidDuration', arguments);
    }

    return Date.getSecondsInDuration(str);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

