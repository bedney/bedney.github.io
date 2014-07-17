//  ========================================================================
/*
NAME:   xs_gMonthDay.js
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
 * @type {TP.xs.gMonthDay}
 * @synopsis An XML Schema month/day specification in the form --MM-DD with
 *     optional time zone data.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.xs.anySimpleType.defineSubtype('gMonthDay');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a regex capable of validating the lexical format and splitting the
//  various segments out into a match result for further testing
TP.xs.gMonthDay.Type.defineConstant('MONTHDAY_REGEX',
        /^--([0-9]{2})-([0-9]{2})(([Z\+\-]*)([0-9]{2})*[:]*([0-9]{2})*)$/);

//  indexes into the match result produced by the previous RegExp
TP.xs.gMonthDay.Type.defineConstant('MONTH_INDEX', 1);
TP.xs.gMonthDay.Type.defineConstant('DAY_INDEX', 2);
TP.xs.gMonthDay.Type.defineConstant('ZONE_INDEX', 3);

//  ------------------------------------------------------------------------

TP.xs.gMonthDay.Type.defineMethod('validate',
function(anObject) {

    /**
     * @name validate
     * @synopsis Returns true if the object provided is a valid XML Schema
     *     month/day specification in the form --MM-DD[timezone].
     * @param {String} anObject The object to validate.
     * @returns {Boolean} 
     */

    var str,
        m,
        zi,
        month,
        day;

    if (!TP.isString(anObject)) {
        return false;
    }

    str = anObject;

    m = str.match(this.get('MONTHDAY_REGEX'));
    if (TP.notValid(m)) {
        return false;
    }

    month = parseInt(m.at(this.get('MONTH_INDEX')), 10);
    day = parseInt(m.at(this.get('DAY_INDEX')), 10);

    //  month can't be 0, or greater than 12
    if (!month.isBetweenInclusive(1, 12)) {
        return false;
    }

    //  day can't be 0, or greater than the days in that month for an
    //  arbitrary leap year (here signified by 2000)
    if (!day.isBetweenInclusive(1, Date.daysInMonth(month, 2000))) {
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
//  end
//  ========================================================================

