//  ========================================================================
/*
NAME:   TP.core.WebDAVHandler.js
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
//  ========================================================================

/**
 * @type {TP.core.WebDAVHandler}
 * @synopsis A URL handler type that can store and load from WebDAV-capable
 *     URLs.
 */

//  ------------------------------------------------------------------------

TP.core.URIHandler.defineSubtype('WebDAVHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  CONTENT METHODS
//  ------------------------------------------------------------------------

TP.core.WebDAVHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @name load
     * @synopsis Loads URI data content and returns it on request. This is a
     *     template method which defines the overall process used for loading
     *     URI data and ensuring that the URI's cache and header content are
     *     kept up to date. You should normally override one of the more
     *     specific load* methods in subtypes if you're doing custom load
     *     handling.
     * @param {TP.core.URI} targetURI The URI to load. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @todo
     */

    var request,
        response,

        action,

        loadRequest;

    TP.debug('break.uri_load');

    request = TP.request(aRequest);
    response = request.constructResponse();

    //  Manipulating a 'WebDAV' resource requires an 'action'
    if (TP.isEmpty(action = request.at('action'))) {
        request.fail();

        return response;
    }

    //  Construct and initialize an TP.core.WebDAVRequest using the URI as a
    //  parameter.
    loadRequest = TP.core.WebDAVRequest.construct(
                            TP.hc('action', action,
                                    'uri', targetURI.asString(),
                                    'username', request.at('username'),
                                    'password', request.at('password')
                                    ));

    //  'Join' that request to the incoming request. This will cause the
    //  incoming request to 'pause' until the get item request finishes and
    //  to be 'dependent' on the success/failure of the get item request.
    request.andJoinChild(loadRequest);

    //  Fire the load request to trigger service operation.
    loadRequest.fire();

    //  Make sure that the 2 requests match on sync/async
    request.updateRequestMode(loadRequest);

    return response;
});

//  ------------------------------------------------------------------------

TP.core.WebDAVHandler.Type.defineMethod('nuke',
function(targetURI, aRequest) {

    /**
     * @name nuke
     * @synopsis Deletes the target URL.
     * @param {TP.core.URI} targetURI The URI to nuke. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @todo
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.core.WebDAVHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @name save
     * @synopsis Attempts to save data using standard TIBET save primitives to
     *     the URI (after rewriting) that is provided.
     * @param {TP.core.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @todo
     */

    var request,
        response,

        content,

        action,

        saveRequest;

    TP.debug('break.uri_save');

    request = TP.request(aRequest);
    response = request.constructResponse();

    //  Saving data to a 'WebDAV' resource requires 'data' to save ;-)
    if (TP.isEmpty(content = targetURI.getResourceText(
                                            TP.hc('async', false)))) {
        request.fail();

        return response;
    }

    //  Manipulating a 'WebDAV' resource requires an 'action'
    if (TP.isEmpty(action = request.at('action'))) {
        request.fail();

        return response;
    }

    saveRequest = TP.core.WebDAVRequest.construct(
                            TP.hc('uri', targetURI.asString(),
                                    'body', content,
                                    'action', action,
                                    'refreshContent', false,
                                    'username', request.at('username'),
                                    'password', request.at('password')
                                    ));

    //  'Join' that request to the incoming request. This will cause the
    //  incoming request to 'pause' until the put item request finishes and
    //  to be 'dependent' on the success/failure of the put item request.
    request.andJoinChild(saveRequest);

    //  Fire the save request to trigger service operation.
    saveRequest.fire();

    //  Make sure that the 2 requests match on sync/async
    request.updateRequestMode(saveRequest);

    return response;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
