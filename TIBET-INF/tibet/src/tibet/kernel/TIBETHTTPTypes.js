//  ========================================================================
/*
NAME:   TIBETHTTPTypes.js
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
//  TP.sig.HTTPRequest
//  ========================================================================

/**
 * @type {TP.sig.HTTPRequest}
 * @synopsis Top-level request type for HTTP-based services.
 */

//  ------------------------------------------------------------------------

TP.sig.URIRequest.defineSubtype('HTTPRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.Type.defineAttribute('responseType', 'TP.sig.HTTPResponse');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.Inst.defineMethod('failJob',
function(aFaultCode, aFaultString) {

    /**
     * @name failJob
     * @synopsis Fails the HTTP request, aborting any underlying native
     *     XMLHttpRequest object as well. NOTE that this would have to be an
     *     asynchronous request for this to work effectively.
     * @param {Object} aFaultCode A reason for the failure.
     * @param {String} aFaultString A text description of the reason for the
     *     failure.
     * @returns {TP.sig.HTTPRequest}
     * @todo
     */

    var httpObj,
        msg,
        url,
        uri;

    //  presumably we can do this only because the request is async and
    //  we've got some cycles...so do what we can to turn off the request
    if (TP.isXHR(httpObj = this.at('xhr'))) {
        TP.httpAbort(httpObj);
    }

    msg = aFaultCode + ' ' + aFaultString;

    this.atPut('direction', TP.RECV);
    this.atPut('message',
        TP.isEmpty(msg) ? 'HTTP request aborted.' :
                        'HTTP request aborted: ' + msg);

    TP.ifInfo(TP.sys.shouldLogIO()) ?
            TP.sys.logIO(this, TP.INFO, arguments) : 0;

    //  TODO: migrate to the TP.core.HTTPURIHandler

    //  update what we consider to be our "final uri", the qualified URI
    //  based on parameter data etc.
    url = this.at('finaluri');
    if (TP.isURI(url)) {
        uri = TP.uc(url);
        if (TP.isURI(uri)) {
            uri.isLoaded(false);
            uri.isDirty(true);
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.Inst.defineMethod('cancelJob',
function(aFaultCode, aFaultString) {

    /**
     * @name cancelJob
     * @synopsis Cancels an HTTP request, aborting any underlying native
     *     XMLHttpRequest object as well. NOTE that this would have to
     * @param {Object} aFaultCode A reason for the cancellation.
     * @param {String} aFaultString A text description of the reason for the
     *     cancellation.
     * @returns {TP.sig.HTTPRequest}
     * @todo
     */

    var httpObj,
        msg,
        url,
        uri;

    //  presumably we can do this only because the request is async and
    //  we've got some cycles...so do what we can to turn off the request
    if (TP.isXHR(httpObj = this.at('xhr'))) {
        TP.httpAbort(httpObj);
    }

    msg = aFaultCode + ' ' + aFaultString;

    this.atPut('direction', TP.RECV);
    this.atPut('message',
        TP.isEmpty(msg) ? 'HTTP request cancelled.' :
                        'HTTP request cancelled: ' + msg);

    TP.ifInfo(TP.sys.shouldLogIO()) ?
            TP.sys.logIO(this, TP.INFO, arguments) : 0;

    //  TODO: migrate to the TP.core.HTTPURIHandler

    //  update what we consider to be our "final uri", the qualified URI
    //  based on parameter data etc.
    url = this.at('finaluri');
    if (TP.isURI(url)) {
        uri = TP.uc(url);
        if (TP.isURI(uri)) {
            uri.isLoaded(false);
            uri.isDirty(true);
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.Inst.defineMethod('completeJob',
function(aResult) {

    /**
     * @name completeJob
     * @synopsis Completes the request, peforming any wrapup that might be
     *     necessary to ensure proper capture of the result data.
     *     TP.sig.URIRequests will attempt to update their target URI instance
     *     with any result data in response to this call.
     * @param {Object} aResult An optional object to set as the result of the
     *     request.
     * @returns {TP.sig.HTTPRequest}
     * @todo
     */

    var httpObj,
        url,
        uri,
        data;

    if (TP.isXHR(httpObj = this.at('xhr'))) {
        //  update what we consider to be our "final uri", the qualified URI
        //  based on parameter data etc.
        url = this.at('finaluri');
        if (TP.isURI(url)) {
            uri = TP.uc(url);
            if (TP.isURI(uri)) {
                uri.updateHeaders(httpObj);
                data = uri.updateResourceCache(this);

                uri.isLoaded(true);
                uri.isDirty(false);
            }
        }
    }

    data = data || aResult;
    this.set('result', data);

    return this.callNextMethod(data);
});

//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.Inst.defineMethod('handleIOFailed',
function(aSignal) {

    /**
     * @name handleIOFailed
     * @synopsis Handles notification that the underlying IO operation failed
     *     for some reason. The reason for the failure should be recorded in the
     *     response's faultCode/faultText content. IFF the receiver handles the
     *     specific status code, i.e. it has a method such as handle404, then
     *     that handler is called before processing a fail call.
     * @param {TP.sig.IOFailed} aSignal A response object containing the native
     *     request as 'xhr'.
     * @returns {TP.sig.HTTPRequest} The receiver.
     */

    var request,
        httpObj,
        code,
        defer,
        faultCode,
        result;

    request = aSignal.getPayload();
    if (TP.isValid(request)) {
        httpObj = request.at('xhr');
        this.atPut('xhr', httpObj);
    }

    //  If the XHR mechanism has aborted in Mozilla, it will cause the
    //  '.status' property to throw an exception if it is read.
    try {
        //  the next thing to try is to see if we handle the status code in
        //  question, which lets us defer to handle404 etc.
        code = httpObj.status;

        //  set the fault code, which might be cleared if the handler is
        //  able to recover gracefully.
        this.set('faultCode', code);

        //  set the fault text, if any. this should be cleared by any handler
        //  function as needed.
        this.set('faultText', httpObj.statusText);

        if (TP.canInvoke(request, 'handle' + code)) {
            defer = true;
            request['handle' + code](aSignal);
        } else if (TP.canInvoke(this, 'handle' + code)) {
            defer = true;
            this['handle' + code](aSignal);
        }
    } catch (e) {
    } finally {
        //  When we've deferred to a status-specific handler that handler is
        //  responsible for completion of the job since some handlers may
        //  need to make additional asynchronous calls to resolve things.
        if (TP.notTrue(defer)) {
            if (TP.isValid(faultCode = this.getFaultCode())) {
                this.fail(faultCode, this.getFaultText());
            } else {
                result = aSignal.getResult();
                if (TP.isValid(result)) {
                    this.complete(result);
                } else {
                    this.complete();
                }
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.Inst.defineMethod('handleIOSucceeded',
function(aSignal) {

    /**
     * @name handleIOSucceeded
     * @synopsis A handler which is invoked when the request's low-level IO has
     *     completed successfully.
     * @param {TP.sig.IOSucceeded} aSignal The signal, whose payload is includes
     *     the low-level request object itself as httpObj.
     * @returns {TP.sig.HTTPRequest} The receiver.
     */

    var request,
        httpObj,
        code,
        defer,
        faultCode,
        result;

    //  first step is to make sure that if the incoming signal's request
    //  isn't actually the receiver we still tuck away the xhr for reference
    request = aSignal.getPayload();
    if (TP.isValid(request)) {
        httpObj = request.at('xhr');
        this.atPut('xhr', httpObj);
    }

    //  If the XHR mechanism has aborted in Mozilla, it will cause the
    //  '.status' property to throw an exception if it is read.
    try {
        //  the next thing to try is to see if we handle the status code in
        //  question, which lets us defer to handle304 etc.
        code = httpObj.status;

        if (TP.canInvoke(request, 'handle' + code)) {
            defer = true;
            request['handle' + code](aSignal);
        } else if (TP.canInvoke(this, 'handle' + code)) {
            defer = true;
            this['handle' + code](aSignal);
        }
    } catch (e) {
    } finally {
        //  When we've deferred to a status-specific handler that handler is
        //  responsible for completion of the job since some handlers may
        //  need to make additional asynchronous calls to resolve things.
        if (TP.notTrue(defer)) {
            if (TP.isValid(faultCode = this.getFaultCode())) {
                this.fail(faultCode, this.getFaultText());
            } else {
                result = aSignal.getResult();
                if (TP.isValid(result)) {
                    this.complete(result);
                } else {
                    this.complete();
                }
            }
        }
    }

    return this;
});

//  ========================================================================
//  TP.sig.HTTPResponse
//  ========================================================================

/**
 * @type {TP.sig.HTTPResponse}
 * @synopsis Provides a general purpose HTTP response wrapper.
 */

//  ------------------------------------------------------------------------

TP.sig.URIResponse.defineSubtype('HTTPResponse');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineAttribute('responseXML');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getFaultCode',
function() {

    /**
     * @name getFaultCode
     * @synopsis Returns the fault code if any.
     * @returns {String} A fault code.
     */

    var httpObj,
        statusCode;

    httpObj = this.getRequest().at('xhr');
    if (TP.isXHR(httpObj)) {
        if (!TP.httpDidSucceed(httpObj)) {
            //  If the XHR mechanism has aborted in Mozilla, it will cause
            //  the '.status' property to throw an exception if it is read.
            try {
                statusCode = httpObj.status;
            } catch (e) {
                statusCode = null;
            } finally {
                return statusCode;
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getFaultText',
function() {

    /**
     * @name getFaultText
     * @synopsis Returns the fault message string if any.
     * @returns {String} A fault message string.
     */

    var httpObj;

    httpObj = this.getRequest().at('xhr');
    if (TP.isXHR(httpObj)) {
        if (!TP.httpDidSucceed(httpObj)) {
            return httpObj.statusText;
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getNativeObject',
function() {

    /**
     * @name getNativeObject
     * @synopsis Returns the native XMLHttpRequest object which serves as the
     *     container for the response data managed by this type. This method is
     *     consistent with the requirements of TP.unwrap() so that
     *     TP.unwrap()ing a TP.sig.HTTPResponse will return you the native
     *     XMLHttpRequest that it contains.
     * @returns {XMLHttpRequest} The native XMLHttpRequest.
     */

    //  if we have one it'll be stored with our request in the 'xhr' key
    return this.getRequest().at('xhr');
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResponseHeader',
function(headerName) {

    /**
     * @name getResponseHeader
     * @synopsis Returns the value of the named response header.
     * @param {String} headerName The HTTP header to return.
     * @returns {String}
     */

    var httpObj,
        header;

    httpObj = this.getNativeObject();
    if (TP.notValid(httpObj)) {
        return;
    }

    try {
        header = httpObj.getResponseHeader(headerName);
    } catch (e) {
        //  moz likes to toss its cookies rather than be sensible here when
        //  a header isn't found :(
        return;
    }

    return header;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResponseHeaders',
function() {

    /**
     * @name getResponseHeaders
     * @synopsis Returns a hash containing all response header key/value pairs.
     * @returns {TP.lang.Hash}
     */

    var httpObj,

        str,

        dict,
        arr,

        i,

        parts,
        key,
        value;

    httpObj = this.getNativeObject();
    if (TP.notValid(httpObj)) {
        return;
    }

    str = httpObj.getAllResponseHeaders();

    dict = TP.hc();
    arr = str.split('\n');

    for (i = 0; i < arr.getSize(); i++) {
        parts = arr.at(i).split(':');
        key = parts.shift();
        value = parts.join(':');

        if (TP.notEmpty(key)) {
            dict.atPut(key, value);
        }
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResponseStatusCode',
function() {

    /**
     * @name getResponseStatusCode
     * @synopsis Returns the HTTP status code (200 for success) of the response.
     * @returns {Number} The status code.
     */

    var httpObj;

    httpObj = this.getNativeObject();
    if (TP.notValid(httpObj)) {
        return;
    }

    //  If the XHR mechanism has aborted in Mozilla, it will cause the
    //  '.status' property to throw an exception if it is read.
    try {
        return httpObj.status;
    } catch (e) {
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResponseStatusText',
function() {

    /**
     * @name getResponseStatusText
     * @synopsis Returns the status message (text) of the response.
     * @returns {String}
     */

    var httpObj;

    httpObj = this.getNativeObject();
    if (TP.notValid(httpObj)) {
        return;
    }

    try {
        return httpObj.statusText;
    } catch (e) {
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResponseText',
function() {

    /**
     * @name getResponseText
     * @synopsis Returns the response text.
     * @returns {String}
     */

    var httpObj,
        text;

    httpObj = this.getNativeObject();
    if (TP.notValid(httpObj)) {
        return;
    }

    try {
        text = httpObj.responseText;
    } catch (e) {
    }

    return text;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResponseXML',
function() {

    /**
     * @name getResponseXML
     * @synopsis Returns the DOM Node containing the response in XML form.
     * @returns {XMLDocument}
     */

    var xml,
        httpObj,
        text;

    //  did we already build it? just return it
    if (TP.isNode(xml = this.$get('responseXML'))) {
        return xml;
    }

    httpObj = this.getNativeObject();
    if (TP.notValid(httpObj)) {
        return;
    }

    try {
        //  Moz needs to work from text to avoid tainting-related
        //  exceptions and other browsers mess with responseXML as well, so
        //  we just use the text.
        text = httpObj.responseText;

        if (TP.notEmpty(text)) {
            //  NOTE not everything we go after actually _is_ XML to tell
            //  the parse step to work quietly
            xml = TP.documentFromString(text, null, false);
        }
    } catch (e) {
        xml = null;
    }

    if (TP.isNode(xml)) {
        this.$set('responseXML', xml);
    }

    return xml;
});

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.Inst.defineMethod('getResult',
function(aFormat) {

    /**
     * @name getResult
     * @synopsis Returns the request result. By default it tries to return the
     *     XML representation, followed by the text representation if the XML
     *     can't be formed from the response. An explicit return type can be
     *     forced by supplying a format constant.
     * @param {Constant} aFormat One of the TP constants for low-level result
     *     data: TP.DOM, TP.TEXT, or TP.NATIVE.
     * @returns {Object} The object in the requested format.
     * @todo
     */

    var result;

    switch (aFormat) {
        case TP.DOM:
            return this.getResponseXML();
        case TP.TEXT:
            return this.getResponseText();
        case TP.NATIVE:
            return this.getRequest().at('xhr');
        default:
            //  Default is to try to find the best object possible at the
            //  low level.
            result = this.getResponseXML();
            if (TP.notValid(result)) {
                result = this.getResponseText();
            }
            return result;
    }
});

//  ========================================================================
//  TP.core.HTTPService
//  ========================================================================

/**
 * @type {TP.core.HTTPService}
 * @synopsis The top-level service for all services which use HTTP-based
 *     primitives for their transport layer. This service is capable of
 *     performing all the basic requirements of making XMLHttpRequest calls
 *     while offering several template methods that subtypes can override to
 *     perform service-specific adjustments to the overall request processing
 *     logic.
 */

//  ------------------------------------------------------------------------

TP.core.URIService.defineSubtype('HTTPService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the default MIME type to use for encoding the body
TP.core.HTTPService.Type.defineAttribute('mimetype', TP.PLAIN_TEXT_ENCODED);

//  the default verb to use for services of this type
TP.core.HTTPService.Type.defineAttribute('verb', TP.HTTP_GET);

//  HTTP services can support access via either sync or async requests
TP.core.HTTPService.Type.defineAttribute('supportedModes',
                                        TP.core.SyncAsync.DUAL_MODE);
TP.core.HTTPService.Type.defineAttribute('mode',
                                        TP.core.SyncAsync.ASYNCHRONOUS);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.HTTPService.Inst.defineMethod('finalizeRequest',
function(aRequest) {

    /**
     * @name finalizeRequest
     * @synopsis Perform any final updates or processing on the request to make
     *     sure it is ready to send to TP.httpCall() for processing.
     * @param {TP.sig.Request} aRequest The request being finalized.
     * @returns {TP.sig.HTTPRequest} The request to send. NOTE that this may not
     *     be the original request.
     */

    var mimetype,

        body,
        boundaryMarker,

        headers;

    mimetype = aRequest.at('mimetype');

    //  If the MIME type is set to be one of the 'multipart' encoding types
    //  that we support, then we need to grab the 'boundary' that will be
    //  found throughout the body, but we grab the one at the end surrounded
    //  by '--' and '--'.
    if (mimetype === TP.MP_RELATED_ENCODED ||
        mimetype === TP.MP_FORMDATA_ENCODED) {
        body = aRequest.at('body');
        boundaryMarker = /--([$\w]+)--/.match(body);

        headers = aRequest.at('headers');

        //  If we successfully got a boundary value, then add it to the
        //  'Content-Type' header.
        if (TP.notEmpty(boundaryMarker.at(1))) {
            headers.atPut('Content-Type',
                            TP.join(mimetype,
                                    '; boundary="',
                                    boundaryMarker.at(1),
                                    '"'));
        } else {
            headers.atPut('Content-Type', mimetype);
        }
    }

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.core.HTTPService.Inst.defineMethod('getMIMEType',
function() {

    /**
     * @name getMIMEType
     * @synopsis Returns the MIME type this service uses for body encoding by
     *     default. This value is only used when a request does not specify a
     *     mimetype directly.
     * @returns {Constant} A constant suitable for TP.httpEncode.
     * @todo
     */

    return TP.ifInvalid(this.$get('mimetype'),
                        this.getType().get('mimetype'));
});

//  ------------------------------------------------------------------------

TP.core.HTTPService.Inst.defineMethod('getVerb',
function() {

    /**
     * @name getVerb
     * @synopsis Returns the HTTP verb used for this service type by default. In
     *     some cases this value isn't simply a default, it's the value used for
     *     all requests made via this service.
     * @returns {Constant} A TIBET HTTP Verb constant such as TP.HTTP_GET.
     * @todo
     */

    return TP.ifInvalid(this.$get('verb'), this.getType().get('verb'));
});

//  ------------------------------------------------------------------------

TP.core.HTTPService.Inst.defineMethod('handleHTTPRequest',
function(aRequest) {

    /**
     * @name handleHTTPRequest
     * @synopsis Constructs an appropriate response for the request provided,
     *     working to manage asynchronous calls in a manner consistent with the
     *     rest of the service/request/response model.
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @raises TP.sig.InvalidRequest, TP.sig.InvalidURI
     * @returns {TP.sig.HTTPResponse} The service's response to the request.
     */

    var request,
        url,
        response;

    if (!TP.isKindOf(aRequest, 'TP.sig.HTTPRequest')) {
        this.raise('TP.sig.InvalidRequest', arguments);

        return;
    }

    //  If either a new 'serviceURI' parameter or a 'uri' parameter with an
    //  absolute path is supplied in the request, we reset our serviceURI to
    //  that value.
    this.updateServiceURI(aRequest);

    request = aRequest;

    //  start by rewriting the uri to target the proper concrete location
    request.atPut('uri', this.rewriteRequestURI(request));

    //  rewriting sometimes still fails to produce a viable url. when that
    //  happens the rewrite call will have signaled the error so we just
    //  fail the request.
    url = request.at('uri');
    if (TP.notValid(url)) {
        return request.fail(TP.FAILURE, 'TP.sig.InvalidURI');
    }

    //  rewrite the verb as needed. some services require POST etc.
    request.atPut('verb', this.rewriteRequestVerb(request));

    //  rewrite the mode, whether we're async or sync. This will only change
    //  the value if it hasn't been set to something already, but it may
    //  warn when the value appears to be inconsistent with what the service
    //  is capable of processing.
    request.atPut('async', this.rewriteRequestMode(request));

    //  NOTE that we need to do this prior to the body processing
    request.atPut('mimetype', this.rewriteRequestMIMEType(request));

    //  rewrite/update the request body content
    request.atPut('body', this.rewriteRequestBody(request));

    //  rewrite/update the headers as needed for this service
    //  NOTE that we do this last so all body transformations are done in
    //  case we want to manipulate the headers based on body content
    request.atPut('headers', this.rewriteRequestHeaders(request));

    //  one last chance to tweak things before we ship it to the primitive
    //  and NOTE NOTE NOTE that we capture the return value here which
    //  allows the entire request to be reconstructed if necessary
    request = this.finalizeRequest(request);

    //  with all request tweaking in place we can now construct our
    //  response, which may have had the type/name altered by request
    //  rewriting
    response = request.constructResponse();

    //  go ahead and perform the HTTP call
    this.performHTTPCall(request);

    //  we return a response specific to the request, but note that it may
    //  not be complete if the call was async
    return response;
});

//  ------------------------------------------------------------------------

TP.core.HTTPService.Inst.defineMethod('performHTTPCall',
function(aRequest) {

    /**
     * @name performHTTPCall
     * @synopsis Performs the HTTP call. This is the method that actually does
     *     the work and can be overridden in subtypes of this type that have
     *     special types of HTTP calling semantics (WebDAV is a good example of
     *     this).
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @raises TP.sig.InvalidURI
     * @returns {TP.sig.HTTPRequest} The supplied request.
     */

    var url,
        httpObj;

    //  Make sure we have a viable URL.
    url = aRequest.at('uri');
    if (TP.notValid(url)) {
        return aRequest.fail(TP.FAILURE, 'TP.sig.InvalidURI');
    }

    try {
        //  TP.$httpWrapup() processing will call back to the request via
        //  handleIO* based on success/failure and the rest is handled
        //  there...see the request type's handleIO* methods for more
        httpObj = TP.httpCall(url, aRequest);
    } catch (e) {
        aRequest.atPut('object', e);
        aRequest.atPut('message', TP.str(e));

        return TP.httpError(
                    url,
                    TP.ifKeyInvalid(aRequest, 'exceptionType',
                                                        'HTTPException'),
                    arguments,
                    aRequest);
    }

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.core.HTTPService.Inst.defineMethod('rewriteRequestBody',
function(aRequest) {

    /**
     * @name rewriteRequestBody
     * @synopsis Encodes the request body for transmission. Processing in this
     *     method makes use of keys in the request to drive a call to the
     *     TP.httpEncode() primitive. If you don't want this processing to occur
     *     you can put a key of 'noencode' with a value of true in the request.
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @returns {String} The string value of the encoded body content.
     */

    return TP.httpEncodeRequestBody(aRequest);
});

//  ------------------------------------------------------------------------

TP.core.HTTPService.Inst.defineMethod('rewriteRequestMIMEType',
function(aRequest) {

    /**
     * @name rewriteRequestMIMEType
     * @synopsis Returns the MIME type this service uses for body encoding.
     * @returns {Constant} A constant suitable for TP.httpEncode.
     */

    //  Return the MIME type using the following hierarchy:
    //      1.  The request's mimetype. If empty:
    //      2.  The service instance's mimetype. If empty:
    //      3.  The MIME type that can be guess from the content and the URI,
    //          defaulting to the service type's mime type.
    return TP.ifEmpty(
            aRequest.at('mimetype'),
            TP.ifEmpty(
                this.$get('mimetype'),
                TP.ietf.Mime.guessMIMEType(
                    aRequest.at('body'),
                    aRequest.at('uri'),
                    this.getType().get('mimetype'))
                )
            );
});

//  ------------------------------------------------------------------------

TP.core.HTTPService.Inst.defineMethod('rewriteRequestHeaders',
function(aRequest) {

    /**
     * @name rewriteRequestHeaders
     * @synopsis Returns a TP.lang.Hash of HTTP headers appropriate for the
     *     service. Typical headers include an X-Request-Id for the request ID
     *     to help identify "conversations" related to a particular request.
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @returns {TP.lang.Hash} The hash of rewritten request headers.
     */

    var headers,
        url;

    //  make sure we can define header values as needed to control the call
    headers = TP.ifInvalid(aRequest.at('headers'), TP.hc());

    //  Make sure we have a viable URL.
    url = aRequest.at('uri');
    if (TP.notValid(url)) {
        return aRequest.fail(TP.FAILURE, 'TP.sig.InvalidURI');
    }

    //  make sure we provide the request ID in the call headers for
    //  tracking purposes
    if (TP.uriNeedsPrivileges(url) &&
        TP.sys.cfg('tibet.simple_cors_only')) {
            //  url needs privileges but we're configured for 'simple CORS'
            //  only, which disallows custom 'X-' headers.
    } else {
        headers.atPutIfAbsent('X-Request-Id', aRequest.getRequestID());
    }

    //  If there is no header defined for Content-Type in the request, use the
    //  MIME type that was determined for body encoding.
    headers.atPutIfAbsent('Content-Type', aRequest.at('mimetype'));

    return headers;
});

//  ------------------------------------------------------------------------

TP.core.HTTPService.Inst.defineMethod('rewriteRequestVerb',
function(aRequest) {

    /**
     * @name rewriteRequestVerb
     * @synopsis Returns the HTTP verb to use for the request. For many services
     *     the value in the request will be used, but some services force the
     *     verb to be a specific one, such as XML-RPC where POST is a
     *     requirement.
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @returns {Constant} A TIBET HTTP Verb constant such as TP.HTTP_GET.
     */

    return TP.ifEmpty(aRequest.at('verb'), this.getVerb());
});

//  ========================================================================
//  TP.sig.HTTPLoadRequest
//  ========================================================================

TP.sig.HTTPRequest.defineSubtype('HTTPLoadRequest');

//  ========================================================================
//  TP.sig.HTTPNukeRequest
//  ========================================================================

TP.sig.HTTPRequest.defineSubtype('HTTPNukeRequest');

//  ========================================================================
//  TP.sig.HTTPSaveRequest
//  ========================================================================

TP.sig.HTTPRequest.defineSubtype('HTTPSaveRequest');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
