//  ========================================================================
/*
NAME:   xs_time.js
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
 * @type {TP.xs.time}
 * @synopsis A string representing a time and optional time zone data in the
 *     format HH:MM:SS[.sss] followed by Z for UTC time, or a +/- prefixed HH:MM
 *     timezone offset.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('time');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex capable of validating the lexical format and splitting the
//  various segments out into a match result for further testing
TP.xs.time.Type.defineConstant('TIME_REGEX',
    /^([-])*([0-9]{2}):([0-9]{2}):([0-9]{2}[\.]*[0-9]*)(([Z\+\-]*)([0-9]{2})*[:]*([0-9]{2})*)$/);

//  indexes into the match result produced by the previous RegExp
TP.xs.time.Type.defineConstant('MINUS_INDEX', 1);
TP.xs.time.Type.defineConstant('HOUR_INDEX', 2);
TP.xs.time.Type.defineConstant('MINUTE_INDEX', 3);
TP.xs.time.Type.defineConstant('SECOND_INDEX', 4);
TP.xs.time.Type.defineConstant('ZONE_INDEX', 5);

//  ------------------------------------------------------------------------

TP.xs.time.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided it meets the criteria for a
     *     valid time string with optional time zone data.
     * @param {String} anObject The object to validate.
     * @returns {Boolean} 
     * @todo
     */

    var str,
        m,

        hour,
        min,
        sec,
        zi;

    if (!TP.isString(anObject)) {
        return false;
    }

    str = anObject;

    m = str.match(this.get('TIME_REGEX'));
    if (TP.notValid(m)) {
        return false;
    }

    //  ---
    //  TIME PART
    //  ---

    hour = parseInt(m.at(this.get('HOUR_INDEX')), 10);
    min = parseInt(m.at(this.get('MINUTE_INDEX')), 10);
    sec = m.at(this.get('SECOND_INDEX'));   //  might have ., don't parse

    //  hours can never be more than 24
    if (hour > 24) {
        return false;
    } else if (hour === 24) {
        //  hours can't be 24 unless mins and secs are 0
        if ((min !== 0) || (sec !== '00')) {
            return false;
        }
    }

    //  minutes can't be more than 59 in any case
    if (min > 59) {
        return false;
    }

    //  if there are fractional seconds it can't end in 0
    if (/\./.test(sec) && /0$/.test(sec)) {
        return false;
    }

    //  seconds can't be more than 59
    if (parseInt(sec.split('.').at(0), 10) > 59) {
        return false;
    }

    //  check on time zone separately
    if (TP.notEmpty(zi = m.at(this.get('ZONE_INDEX')))) {
        return TP.core.TimeZone.validate(zi);
    }

    //  made it through the gauntlet
    return true;
});

//  ------------------------------------------------------------------------

TP.xs.time.Type.defineMethod('validateFacetMaxExclusive',
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

    var m1,
        hour1,
        min1,
        sec1,
        zone1,

        m2,
        hour2,
        min2,
        sec2,
        zone2;

    m1 = aValue.match(this.get('TIME_REGEX'));
    m2 = TP.elementGetAttribute(aFacet, 'value').match(
                                                this.get('TIME_REGEX'));

    zone1 = m1.at(this.get('ZONE_INDEX'));
    zone2 = m2.at(this.get('ZONE_INDEX'));

    //  if we got differing zone data then we've got issues
    if (zone1 !== zone2) {
        return this.raise('TP.sig.UnsupportedFeature', arguments,
                    'Timezone comparisons not currently supported.');
    }

    hour1 = parseInt(m1.at(this.get('HOUR_INDEX')), 10);
    hour2 = parseInt(m2.at(this.get('HOUR_INDEX')), 10);

    if (hour1 > hour2) {
        return false;
    }

    if (hour1 < hour2) {
        return true;
    }

    min1 = parseInt(m1.at(this.get('MINUTE_INDEX')), 10);
    min2 = parseInt(m2.at(this.get('MINUTE_INDEX')), 10);

    if (min1 > min2) {
        return false;
    }

    if (min1 < min2) {
        return true;
    }

    sec1 = m1.at(this.get('SECOND_INDEX'));
    sec2 = m2.at(this.get('SECOND_INDEX'));

    if (sec1 >= sec2) {
        return false;
    }

    if (sec1 < sec2) {
        return true;
    }
});

//  ------------------------------------------------------------------------

TP.xs.time.Type.defineMethod('validateFacetMaxInclusive',
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

    var m1,
        hour1,
        min1,
        sec1,
        zone1,

        m2,
        hour2,
        min2,
        sec2,
        zone2;

    m1 = aValue.match(this.get('TIME_REGEX'));
    m2 = TP.elementGetAttribute(aFacet, 'value').match(
                                                this.get('TIME_REGEX'));

    zone1 = m1.at(this.get('ZONE_INDEX'));
    zone2 = m2.at(this.get('ZONE_INDEX'));

    //  if we got differing zone data then we've got issues
    if (zone1 !== zone2) {
        return this.raise('TP.sig.UnsupportedFeature', arguments,
                    'Timezone comparisons not currently supported.');
    }

    hour1 = parseInt(m1.at(this.get('HOUR_INDEX')), 10);
    hour2 = parseInt(m2.at(this.get('HOUR_INDEX')), 10);

    if (hour1 > hour2) {
        return false;
    }

    if (hour1 < hour2) {
        return true;
    }

    min1 = parseInt(m1.at(this.get('MINUTE_INDEX')), 10);
    min2 = parseInt(m2.at(this.get('MINUTE_INDEX')), 10);

    if (min1 > min2) {
        return false;
    }

    if (min1 < min2) {
        return true;
    }

    sec1 = m1.at(this.get('SECOND_INDEX'));
    sec2 = m2.at(this.get('SECOND_INDEX'));

    if (sec1 > sec2) {
        return false;
    }

    if (sec1 <= sec2) {
        return true;
    }
});

//  ------------------------------------------------------------------------

TP.xs.time.Type.defineMethod('validateFacetMinExclusive',
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

    var m1,
        hour1,
        min1,
        sec1,
        zone1,

        m2,
        hour2,
        min2,
        sec2,
        zone2;

    m1 = aValue.match(this.get('TIME_REGEX'));
    m2 = TP.elementGetAttribute(aFacet, 'value').match(
                                                this.get('TIME_REGEX'));

    zone1 = m1.at(this.get('ZONE_INDEX'));
    zone2 = m2.at(this.get('ZONE_INDEX'));

    //  if we got differing zone data then we've got issues
    if (zone1 !== zone2) {
        return this.raise('TP.sig.UnsupportedFeature', arguments,
                    'Timezone comparisons not currently supported.');
    }

    hour1 = parseInt(m1.at(this.get('HOUR_INDEX')), 10);
    hour2 = parseInt(m2.at(this.get('HOUR_INDEX')), 10);

    if (hour1 < hour2) {
        return false;
    }

    if (hour1 > hour2) {
        return true;
    }

    min1 = parseInt(m1.at(this.get('MINUTE_INDEX')), 10);
    min2 = parseInt(m2.at(this.get('MINUTE_INDEX')), 10);

    if (min1 < min2) {
        return false;
    }

    if (min1 > min2) {
        return true;
    }

    sec1 = m1.at(this.get('SECOND_INDEX'));
    sec2 = m2.at(this.get('SECOND_INDEX'));

    if (sec1 <= sec2) {
        return false;
    }

    if (sec1 > sec2) {
        return true;
    }
});

//  ------------------------------------------------------------------------

TP.xs.time.Type.defineMethod('validateFacetMinInclusive',
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

    var m1,
        hour1,
        min1,
        sec1,
        zone1,

        m2,
        hour2,
        min2,
        sec2,
        zone2;

    m1 = aValue.match(this.get('TIME_REGEX'));
    m2 = TP.elementGetAttribute(aFacet, 'value').match(
                                                this.get('TIME_REGEX'));

    zone1 = m1.at(this.get('ZONE_INDEX'));
    zone2 = m2.at(this.get('ZONE_INDEX'));

    //  if we got differing zone data then we've got issues
    if (zone1 !== zone2) {
        return this.raise('TP.sig.UnsupportedFeature', arguments,
                    'Timezone comparisons not currently supported.');
    }

    hour1 = parseInt(m1.at(this.get('HOUR_INDEX')), 10);
    hour2 = parseInt(m2.at(this.get('HOUR_INDEX')), 10);

    if (hour1 < hour2) {
        return false;
    }

    if (hour1 > hour2) {
        return true;
    }

    min1 = parseInt(m1.at(this.get('MINUTE_INDEX')), 10);
    min2 = parseInt(m2.at(this.get('MINUTE_INDEX')), 10);

    if (min1 < min2) {
        return false;
    }

    if (min1 > min2) {
        return true;
    }

    sec1 = m1.at(this.get('SECOND_INDEX'));
    sec2 = m2.at(this.get('SECOND_INDEX'));

    if (sec1 < sec2) {
        return false;
    }

    if (sec1 >= sec2) {
        return true;
    }
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

