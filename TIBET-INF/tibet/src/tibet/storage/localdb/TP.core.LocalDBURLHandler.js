//  ========================================================================
/*
NAME:   TP.core.LocalDBURLHandler.js
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
 * @type {TP.core.LocalDBURLHandler}
 * @synopsis A URI handler type that can store and load from 'localdb://' URIs.
 */

//  ------------------------------------------------------------------------

TP.core.URIHandler.defineSubtype('LocalDBURLHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  CONTENT METHODS
//  ------------------------------------------------------------------------

TP.core.LocalDBURLHandler.Type.defineMethod('load',
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
     * @raise TP.sig.InvalidURI,TP.sig.InvalidRequest
     * @todo
     */

    var request,
        response,

        action,
        resourceID,
        dbName,

        queryDict,
        securePW,

        requestParams,

        loadRequest;

    TP.debug('break.uri_load');

    request = TP.request(aRequest);
    response = request.constructResponse();

    //  GET requests require at least a dbName
    if (TP.notValid(dbName = targetURI.get('dbName'))) {
        request.fail(TP.FAILURE,
                        'No db name specified for: ' + TP.str(targetURI));

        return response;
    }

    resourceID = targetURI.get('resourceID');

    if (request.at('verb') === TP.HTTP_HEAD) {
        action = 'retrieveItemInfo';
    }
    else if (TP.isValid(resourceID)) {
        if (resourceID === '_all_docs') {
            action = 'retrieveDBInfo';
        } else {
            action = 'retrieveItem';
        }
    } else {
        request.fail(TP.FAILURE,
                    'Can\'t compute a load action for: ' + TP.str(targetURI));

        return response;
    }

    if (TP.isValid(queryDict = targetURI.get('queryDict'))) {
        securePW = queryDict.at('securePW');
    }

    requestParams = TP.hc(
                    'action', action,
                    'dbName', dbName,
                    'securePW', securePW,
                    'id', resourceID);

    //  Construct and initialize a TP.sig.LocalDBStorageRequest
    loadRequest = TP.sig.LocalDBStorageRequest.construct(requestParams);

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

TP.core.LocalDBURLHandler.Type.defineMethod('nuke',
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

    var request,
        response,

        action,

        dbName,
        resourceID,

        queryDict,
        securePW,

        requestParams,

        nukeRequest;

    TP.debug('break.uri_nuke');

    request = TP.request(aRequest);
    response = request.constructResponse();

    //  DELETE requests require a dbName
    if (TP.notValid(dbName = targetURI.get('dbName'))) {
        request.fail(TP.FAILURE,
                        'No db name specified for: ' + TP.str(targetURI));

        return response;
    }

    if (TP.isValid(resourceID = targetURI.get('resourceID'))) {
        action = 'deleteItem';
    } else {
        action = 'deleteDB';
    }

    if (TP.isValid(queryDict = targetURI.get('queryDict'))) {
        securePW = queryDict.at('securePW');
    }

    requestParams = TP.hc(
                    'action', action,
                    'dbName', dbName,
                    'securePW', securePW,
                    'id', resourceID);

    //  Construct and initialize a TP.sig.LocalDBStorageRequest
    nukeRequest = TP.sig.LocalDBStorageRequest.construct(requestParams);

    //  'Join' that request to the incoming request. This will cause the
    //  incoming request to 'pause' until the get item request finishes and
    //  to be 'dependent' on the success/failure of the nuke item request.
    request.andJoinChild(nukeRequest);

    //  Fire the nuke request to trigger service operation.
    nukeRequest.fire();

    //  Make sure that the 2 requests match on sync/async
    request.updateRequestMode(nukeRequest);

    return response;
});

//  ------------------------------------------------------------------------

TP.core.LocalDBURLHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @name save
     * @param {TP.core.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @abstract
     * @raise TP.sig.InvalidURI,TP.sig.InvalidRequest
     * @todo
     */

    var request,
        response,

        dbName,
        resourceID,

        queryDict,
        securePW,

        cmdAction,
        content,

        requestParams,

        saveRequest;

    TP.debug('break.uri_save');

    request = TP.request(aRequest);
    response = request.constructResponse();

    //  PUT and POST requests require at least a dbName
    if (TP.notValid(dbName = targetURI.get('dbName'))) {
        request.fail(TP.FAILURE,
                        'No db name specified for: ' + TP.str(targetURI));

        return response;
    }

    resourceID = targetURI.get('resourceID');

    //  If we're adding content, then see if we have the content to add.
    cmdAction = request.at('cmdAction');

    if (cmdAction === TP.ADD) {
        //  Adding content - grab the 'last added content' that should be on our
        //  URI

        //  TODO: Figure this out.
        //  content = targetURI.get('$lastAdded');
    } else {
        //  Setting the content

        //  Grab whatever is in *the memory cache* of the URI. This will be the
        //  value of whatever was just 'set' as the 'resource' of the URI -
        //  this will be the value that we want to update.

        //  Note here how we force refresh. as well as async, to 'false' so we
        //  effectively do a synchronous "cache read".
        if (TP.isEmpty(content = targetURI.getResource(
                                TP.hc('refresh', false, 'async', false)))) {
            request.fail(
                    TP.FAILURE,
                    'No content to save for: ' + TP.str(targetURI));

            return response;
        }
    }

    if (TP.isValid(queryDict = targetURI.get('queryDict'))) {
        securePW = queryDict.at('securePW');
    }

    if (request.at('verb') === TP.HTTP_PUT) {

        if (TP.notValid(resourceID)) {
            request.fail(
                    TP.FAILURE,
                    'No resource ID specified for: ' + TP.str(targetURI));

            return response;
        }

        requestParams = TP.hc(
                        'action', 'updateItem',
                        'dbName', dbName,
                        'securePW', securePW,
                        'id', resourceID,
                        'body', content);
    } else {

        requestParams = TP.hc(
                        'action', 'createItem',
                        'dbName', dbName,
                        'securePW', securePW,
                        'body', content);
    }

    //  Construct and initialize a TP.sig.LocalDBStorageRequest
    saveRequest = TP.sig.LocalDBStorageRequest.construct(requestParams);

    //  'Join' that request to the incoming request. This will cause the
    //  incoming request to 'pause' until the put item request finishes and
    //  to be 'dependent' on the success/failure of the save request.
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
