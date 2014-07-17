//  ========================================================================
/*
NAME:   Searchers.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        The contents of this file are subject to the terms and conditions of
        the Technical Pursuit License ("TPL") Version 1.5, or subsequent
        versions as allowed by the TPL, and You may not copy or use this
        file in either source code or executable form, except in compliance
        with the terms and conditions of the TPL.  You may obtain a copy of
        the TPL (the "License") from Technical Pursuit Inc. at
        http://www.technicalpursuit.com.

        All software distributed under the License is provided strictly on
        an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR
        IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS ALL SUCH
        WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT,
        OR NON-INFRINGEMENT. See the License for specific language governing
        rights and limitations under the License.
*/
//  ========================================================================

/**
 * @type {TP.core.Searcher}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Searcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Searcher.Inst.defineMethod('search',
function(usingText) {

    /**
     * @name search
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.Searcher.Inst.defineMethod('getTitle',
function() {

    /**
     * @name search
     */

    return TP.override();
});

//  ========================================================================
//  TP.core.CSSPropertySearcher
//  ========================================================================

TP.core.Searcher.defineSubtype('core.CSSPropertySearcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CSSPropertySearcher.Inst.defineMethod('search',
function(usingText) {

    /**
     * @name search
     */

    var results,

        searchRegExp,
        CSSPropNames;

    results = TP.ac();

    searchRegExp = TP.rc(TP.regExpEscape(usingText));

    CSSPropNames = TP.CSS_ALL_PROPERTIES;
    CSSPropNames.perform(
        function(aName) {
            if (searchRegExp.test(aName)) {
                results.push(aName);
            }
        });

    return results;
});

//  ------------------------------------------------------------------------

TP.core.CSSPropertySearcher.Inst.defineMethod('getTitle',
function() {

    /**
     * @name title
     */

    return 'CSS PROPERTIES';
});

//  ========================================================================
//  TP.core.CustomTypeSearcher
//  ========================================================================

TP.core.Searcher.defineSubtype('core.CustomTypeSearcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CustomTypeSearcher.Inst.defineMethod('search',
function(usingText) {

    /**
     * @name search
     */

    var results,

        searchRegExp,
        customTypeNames;

    results = TP.ac();

//    if (usingText.startsWith('TP')) {
 //       results.push('TP.sys', 'TP.boot');
  //  } else {
        searchRegExp = TP.rc(TP.regExpEscape(usingText));

        customTypeNames = TP.sys.getMetadata('types').getKeys();
        customTypeNames.perform(
            function(aTypeName) {
                if (searchRegExp.test(aTypeName)) {
                    results.push(aTypeName);
                }
            });
   // }

    return results;
});

//  ------------------------------------------------------------------------

TP.core.CustomTypeSearcher.Inst.defineMethod('getTitle',
function() {

    /**
     * @name title
     */

    return 'TYPES';
});

//  ========================================================================
//  TP.core.MethodSearcher
//  ========================================================================

TP.core.Searcher.defineSubtype('core.MethodSearcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.MethodSearcher.Inst.defineMethod('search',
function(usingText) {

    /**
     * @name search
     */

    var results,

        searchRegExp,
        methodNames;

    results = TP.ac();

//    if (usingText.startsWith('TP')) {
 //       results.push('TP.sys', 'TP.boot');
  //  } else {
        searchRegExp = TP.rc(TP.regExpEscape(usingText));

        methodNames = TP.sys.getMetadata('methods').getKeys();
        methodNames.perform(
            function(aMethodName) {
                var methodName,
                    ownerName,
                    trackName;

                methodName = aMethodName.slice(aMethodName.lastIndexOf('_') + 1);

                if (searchRegExp.test(methodName)) {
                    ownerName = aMethodName.slice(0, aMethodName.indexOf('_'));
                    results.push(methodName + ' (' + ownerName + ')');

                    /*
                    trackName = aMethodName.slice(aMethodName.indexOf('_') + 1,
                                                aMethodName.lastIndexOf('_'));

                    results.push(
                        methodName + ' (' + ownerName + ' - ' + trackName + ')');
                    results.push(methodName);
                    */
                }
            });
   // }

    return results;
});

//  ------------------------------------------------------------------------

TP.core.MethodSearcher.Inst.defineMethod('getTitle',
function() {

    /**
     * @name search
     */

    return 'METHODS';
});

//  ========================================================================
//  TP.core.NamespaceSearcher
//  ========================================================================

TP.core.Searcher.defineSubtype('core.NamespaceSearcher');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.NamespaceSearcher.Inst.defineMethod('search',
function(usingText) {

    /**
     * @name search
     */

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.core.NamespaceSearcher.Inst.defineMethod('getTitle',
function() {

    /**
     * @name title
     */

    return 'NAMESPACES';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
