//  ========================================================================
/*
NAME:   TP.core.ENLocale.js
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
 * @type {TP.core.ENLocale}
 * @synopsis TP.core.ENLocale provides support for the English language,
 *     regardless of any specific country. This is the default locale used when
 *     no other locale is specified and the user's language and country codes
 *     doesn't resolve to an alternative locale.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.core.Locale.defineSubtype('ENLocale');

TP.core.ENLocale.Type.defineAttribute('langCode', 'en');

TP.core.Locale.registerLocale(TP.core.ENLocale);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
