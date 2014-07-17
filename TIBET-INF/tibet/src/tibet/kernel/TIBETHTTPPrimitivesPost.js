//  ========================================================================
/*
NAME:   TIBETHTTPPrimitivesPost.js
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
//  ========================================================================

/*
Common HTTP verb support. Each of the calls in this file ultimately relies
on the low-level TP.httpCall function in one of the browser-specific HTTP
support files. The value of these wrappers lies in their pre-built request
configuration logic, which helps keep things easier for callers and in their
common response handling.

NOTE that all of these functions return the XMLHttpRequest object used to
process the request to ensure consistency and provide a means for aborting
a request or checking on its completion status.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('httpAbort',
function(httpObj) {

    /**
     * @name httpAbort
     * @synopsis Aborts an in-process XMLHttpRequest, clearing any handlers
     *     which may be present.
     * @param {XMLHttpRequest} httpObj The native XMLHttpRequest to abort.
     * @returns {XMLHttpRequest} The aborted XHR object.
     */

    if (TP.notValid(httpObj)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    //  IE prefers an empty function here
    httpObj.onreadystatechange = TP.RETURN_NULL;
    httpObj.abort();

    return httpObj;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpDelete',
function(targetUrl, aRequest) {

    /**
     * @name httpDelete
     * @synopsis Attempts to delete the target URL via an HTTP DELETE. On
     *     success the return value's status property will be TP.core.HTTP.OK.
     *     Note that no redirect processing is used in this call to avoid any
     *     potential confusion related to the true target unless you
     *     specifically add a key of 'redirect' with a value of true to the
     *     request.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @raises TP.sig.InvalidURI, HTTPException
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request;

    //  we use httpSend which is used for state-change verbs and their
    //  processing. but we make sure the request says noredirect for DELETE
    //  and we also turn off query and payload processing
    request = TP.ifInvalid(aRequest, TP.request());
    request.atPutIfAbsent('redirect', false);

    return TP.$httpSend(TP.HTTP_DELETE, targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpGet',
function(targetUrl, aRequest) {

    /**
     * @name httpGet
     * @synopsis Gets the named resource via an HTTP GET call. You can pass
     *     parameters to the root url by using the query parameter of aRequest.
     *     The query is application/x-www-form-urlencoded and appended to the
     *     targetUrl. If no query is provided then the URI is assumed to be
     *     complete and is used "as is". For GET calls the Content-Type is
     *     automatically set to the encoding format of the data to ensure
     *     consistency.
     * @param {String} targetUrl The request's target URL, or the root of that
     *     URL, ready for the addition of any encoded data values.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @raises TP.sig.InvalidURI, HTTPException
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     * @todo
     */

    var request,
        headers,
        contentType;

    request = TP.ifInvalid(aRequest, TP.request());

    //  here we ensure the proper Content-Type header is set for GET. Note
    //  that, unlike in PUT and POST, we force x-www-form-urlencoded and log
    //  a warning if they tried to supply another Content-Type.
    headers = request.at('headers');
    if (TP.notValid(headers)) {
        headers = TP.hc('Content-Type', TP.URL_ENCODED);
        request.atPutIfAbsent('headers', headers);
    } else {
        if (TP.notEmpty(contentType = headers.at('Content-Type'))) {
            if (contentType !== TP.URL_ENCODED) {
                TP.ifWarn() ?
                    TP.warn('Content-Type supplied to GET call.' +
                                ' Forcing to be ' + TP.URL_ENCODED + '.',
                            TP.IO_LOG, arguments) : 0;
            }
        }

        headers.atPut('Content-Type', TP.URL_ENCODED);
    }

    return TP.$httpQuery(TP.HTTP_GET, targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpHead',
function(targetUrl, aRequest) {

    /**
     * @name httpHead
     * @synopsis Returns an XMLHttpRequest containing the result of a HEAD call
     *     with the specified URL.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @raises TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     * @todo
     */

    return TP.$httpQuery(TP.HTTP_HEAD, targetUrl, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpOptions',
function(targetUrl, aRequest) {

    /**
     * @name httpOptions
     * @synopsis Makes an OPTIONS request of the URL provided. The 'Allow'
     *     header from the response, available via getResponseHeader, provides
     *     the option list.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @raises TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     * @todo
     */

    return TP.$httpQuery(TP.HTTP_OPTIONS, targetUrl, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpPost',
function(targetUrl, aRequest) {

    /**
     * @name httpPost
     * @synopsis Sends the data contained in the 'body' parameter of the request
     *     to the targetUrl using an HTTP POST.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @raises TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     * @todo
     */

    return TP.$httpSend(TP.HTTP_POST, targetUrl, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpPut',
function(targetUrl, aRequest) {

    /**
     * @name httpPut
     * @synopsis Sends the data contained in the 'body' parameter of the request
     *     to the targetUrl using an HTTP PUT.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @raises TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     * @todo
     */

    return TP.$httpSend(TP.HTTP_PUT, targetUrl, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpTrace',
function(targetUrl, aRequest) {

    /**
     * @name httpTrace
     * @synopsis Returns an XMLHttpRequest object containing TRACE results for
     *     the specified URL. Response headers and resultText of that object
     *     will contain the requested data.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @raises TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     * @todo
     */

    return TP.$httpQuery(TP.HTTP_TRACE, targetUrl, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$httpQuery',
function(httpVerb, targetUrl, aRequest) {

    /**
     * @name $httpQuery
     * @synopsis Returns an XMLHttpRequest containing the result of an HTTP
     *     "query", meaning a non-state-changing request, with the specified
     *     verb, URL, and associated parameters. This routine is the common
     *     handler for GET, HEAD, OPTIONS, and TRACE. You can pass parameters to
     *     the root url by using the query parameter of aRequest. The query's
     *     key/value pairs are then application/x-www-form-urlencoded and
     *     appended to the URL.
     * @param {String} httpVerb TP.HTTP_GET, TP.HTTP_HEAD, TP.HTTP_OPTIONS, or
     *     TP.HTTP_TRACE.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @raises TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     * @todo
     */

    var request,
        httpObj;

    request = TP.ifInvalid(aRequest, TP.request());

    request.atPut('uri', targetUrl);
    request.atPut('verb', httpVerb);

    if (TP.isEmpty(targetUrl)) {
        return TP.httpError(targetUrl, 'TP.sig.InvalidURI', arguments,
                            request);
    }

    try {
        httpObj = TP.httpCall(targetUrl, request);
    } catch (e) {
        request.atPut('object', e);
        request.atPut('message', TP.str(e));

        return TP.httpError(
                    targetUrl,
                    TP.ifKeyInvalid(request,
                                    'exceptionType',
                                    'HTTPException'),
                    arguments, request);
    }

    return httpObj;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$httpSend',
function(httpVerb, targetUrl, aRequest) {

    /**
     * @name $httpSend
     * @synopsis Sends the data contained in the 'body' parameter of the request
     *     to the targetUrl using the command verb provided (normally
     *     TP.HTTP_POST or TP.HTTP_PUT).
     * @param {String} httpVerb TP.HTTP_POST, TP.HTTP_PUT, etc.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @raises TP.sig.InvalidURI
     * @returns {XMLHttpRequest} The result object. On success this object's
     *     status property will be TP.core.HTTP.OK.
     * @todo
     */

    var request,
        headers,
        httpObj;

    request = TP.ifInvalid(aRequest, TP.request());
    request.atPut('uri', targetUrl);
    request.atPut('verb', httpVerb);

    if (TP.isEmpty(targetUrl)) {
        return TP.httpError(targetUrl, 'TP.sig.InvalidURI', arguments,
                            request);
    }

    // Ensure headers are converted to a hash
    headers = TP.hc(request.at('headers'));
    request.atPut('headers', headers);

    try {
        httpObj = TP.httpCall(targetUrl, request);
    } catch (e) {
        request.atPut('object', e);
        request.atPut('message', TP.str(e));

        return TP.httpError(
                    targetUrl,
                    TP.ifKeyInvalid(request,
                                    'exceptionType',
                                    'HTTPException'),
                    arguments, request);
    }

    return httpObj;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
