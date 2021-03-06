//  ========================================================================
/*
NAME:   TP.sig.GoogleResponse.js
AUTH:   William J. Edney (wje)
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
 * @type {TP.sig.GoogleResponse}
 * @synopsis A subtype of TP.sig.HTTPResponse that knows how to handle responses
 *     from generic Google servers. Usually, subclasses of this type are created
 *     to perform more specific tasks, but one notable exception is that
 *     instances of this type will act as responses for TP.sig.GoogleRequests
 *     that are used for 'ClientLogin' Google authentication functionality.
 */

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.defineSubtype('GoogleResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
