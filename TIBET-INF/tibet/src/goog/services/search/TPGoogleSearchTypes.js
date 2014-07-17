//  ========================================================================
/*
NAME:   TPGoogleSearchTypes.js
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

//  ========================================================================
//  TP.goog.GoogleSearchData
//  ========================================================================

/**
 * @type {TP.goog.GoogleSearchData}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.core.JSONContent.defineSubtype('goog:GoogleSearchData');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.goog.GoogleSearchData.Inst.defineAttribute(
        'results',
        {'value':
                TP.apc('data.responseData.results')});

TP.goog.GoogleSearchData.Inst.defineAttribute(
        'resultsFromTo',
        {'value':
                TP.apc('data.responseData.results.[{{1}}:{{2}}]')});

TP.goog.GoogleSearchData.Inst.defineAttribute(
        'estimatedResultCount',
        {'value':
                TP.apc('data.responseData.cursor.estimatedResultCount', true)});

TP.goog.GoogleSearchData.Inst.defineAttribute(
        'currentPageIndex',
        {'value':
                TP.apc('data.responseData.cursor.currentPageIndex', true)});

TP.goog.GoogleSearchData.Inst.defineAttribute(
        'moreResultsUrl',
        {'value':
                TP.apc('data.responseData.cursor.moreResultsUrl', true)});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
