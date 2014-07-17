//  ========================================================================
/*
NAME:   TIBETWebSocketTypes.js
AUTH:   William J. Edney (wje), Scott Shattuck (ss)
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
//  TP.sig.WebSocketRequest
//  ========================================================================

/**
 * @type {TP.sig.WebSocketRequest}
 * @synopsis Top-level request type for WebSocket-based services.
 */

//  ------------------------------------------------------------------------

TP.sig.URIRequest.defineSubtype('WebSocketRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.WebSocketRequest.Type.defineAttribute('responseType',
                                            'TP.sig.WebSocketResponse');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.WebSocketRequest.Inst.defineMethod('failJob',
function(aFaultCode, aFaultString) {

    /**
     * @name failJob
     * @synopsis Fails the WebSocket request, aborting any underlying native
     *     WebSocket object as well.
     * @param {Object} aFaultCode A reason for the failure.
     * @param {String} aFaultString A text description of the reason for the
     *     failure.
     * @returns {TP.sig.WebSocketRequest} The receiver.
     * @todo
     */

    var wsObj,
        msg,
        url,
        uri;

    //  presumably we can do this only because the request is async and
    //  we've got some cycles...so do what we can to turn off the request
    if (TP.isValid(wsObj = this.at('wsObj'))) {
        TP.webSocketAbort(wsObj);
    }

    msg = aFaultCode + ' ' + aFaultString;

    this.atPut('direction', TP.RECV);
    this.atPut('message',
                TP.isEmpty(msg) ?
                    'WebSocket request aborted.' :
                    'WebSocket request aborted: ' + msg);

    TP.ifInfo(TP.sys.shouldLogIO()) ?
                TP.sys.logIO(this, TP.INFO, arguments) : 0;

    //  TODO: migrate to the TP.core.WebSocketURIHandler

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

TP.sig.WebSocketRequest.Inst.defineMethod('cancelJob',
function(aFaultCode, aFaultString) {

    /**
     * @name cancelJob
     * @synopsis Cancels an WebSocket request, aborting any underlying native
     *     WebSocket object as well.
     * @param {Object} aFaultCode A reason for the cancellation.
     * @param {String} aFaultString A text description of the reason for the
     *     cancellation.
     * @returns {TP.sig.WebSocketRequest} The receiver.
     * @todo
     */

    var wsObj,
        msg,
        url,
        uri;

    //  presumably we can do this only because the request is async and
    //  we've got some cycles...so do what we can to turn off the request
    if (TP.isValid(wsObj = this.at('wsObj'))) {
        TP.webSocketAbort(wsObj);
    }

    msg = aFaultCode + ' ' + aFaultString;

    this.atPut('direction', TP.RECV);
    this.atPut('message',
                TP.isEmpty(msg) ?
                    'WebSocket request cancelled.' :
                    'WebSocket request cancelled: ' + msg);

    TP.ifInfo(TP.sys.shouldLogIO()) ?
                TP.sys.logIO(this, TP.INFO, arguments) : 0;

    //  TODO: migrate to the TP.core.WebSocketURIHandler

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

TP.sig.WebSocketRequest.Inst.defineMethod('completeJob',
function(aResult) {

    /**
     * @name completeJob
     * @synopsis Completes the request, peforming any wrapup that might be
     *     necessary to ensure proper capture of the result data.
     *     TP.sig.URIRequests will attempt to update their target URI instance
     *     with any result data in response to this call.
     * @param {Object} aResult An optional object to set as the result of the
     *     request.
     * @returns {TP.sig.WebSocketRequest} The receiver.
     * @todo
     */

    var wsObj,
        url,
        uri,
        data;

    if (TP.isValid(wsObj = this.at('wsObj'))) {
        //  update what we consider to be our "final uri", the qualified URI
        //  based on parameter data etc.
        url = this.at('finaluri');
        if (TP.isURI(url)) {
            uri = TP.uc(url);
            if (TP.isURI(uri)) {
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

TP.sig.WebSocketRequest.Inst.defineMethod('handleIOFailed',
function(aSignal) {

    /**
     * @name handleIOFailed
     * @synopsis Handles notification that the underlying IO operation failed
     *     for some reason. The reason for the failure should be recorded in the
     *     response's faultCode/faultText content.
     * @param {TP.sig.IOFailed} aSignal A response object containing the native
     *     request as 'wsObj'.
     * @returns {TP.sig.WebSocketRequest} The receiver.
     */

    var request,

        wsObj,

        code,
        faultCode,
        result;

    request = aSignal.getPayload();
    if (TP.isValid(request)) {
        wsObj = request.at('wsObj');
        this.atPut('wsObj', wsObj);
    }

    code = wsObj.status;

    //  set the fault code, which might be cleared if the handler is
    //  able to recover gracefully.
    this.set('faultCode', code);

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

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.WebSocketRequest.Inst.defineMethod('handleIOSucceeded',
function(aSignal) {

    /**
     * @name handleIOSucceeded
     * @synopsis A handler which is invoked when the request's low-level IO has
     *     completed successfully.
     * @param {TP.sig.IOSucceeded} aSignal The signal, whose payload is includes
     *     the low-level request object itself as wsObj.
     * @returns {TP.sig.WebSocketRequest} The receiver.
     */

    var request,
        wsObj,

        result;

    //  first step is to make sure that if the incoming signal's request
    //  isn't actually the receiver we still tuck away the websocket object
    //  for reference
    request = aSignal.getPayload();
    if (TP.isValid(request)) {
        wsObj = request.at('wsObj');
        this.atPut('wsObj', wsObj);
    }

    result = aSignal.getResult();
    if (TP.isValid(result)) {
        this.complete(result);
    } else {
        this.complete();
    }

    return this;
});

//  ========================================================================
//  TP.sig.WebSocketResponse
//  ========================================================================

/**
 * @type {TP.sig.WebSocketResponse}
 * @synopsis Provides a general purpose WebSocket response wrapper.
 */

//  ------------------------------------------------------------------------

TP.sig.URIResponse.defineSubtype('WebSocketResponse');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sig.WebSocketResponse.Inst.defineAttribute('responseData');

TP.sig.WebSocketResponse.Inst.defineAttribute('statusCode');
TP.sig.WebSocketResponse.Inst.defineAttribute('statusText');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.WebSocketResponse.Inst.defineMethod('getNativeObject',
function() {

    /**
     * @name getNativeObject
     * @synopsis Returns the native WebSocket object which serves as the
     *     container for the response data managed by this type. This method is
     *     consistent with the requirements of TP.unwrap() so that
     *     TP.unwrap()ing a TP.sig.WebSocketResponse will return you the native
     *     WebSocket that it contains.
     * @returns {WebSocket} The native WebSocket.
     */

    //  if we have one it'll be stored with our request in the 'wsObj' key
    return this.getRequest().at('wsObj');
});

//  ------------------------------------------------------------------------

TP.sig.WebSocketResponse.Inst.defineMethod('getResponseStatusCode',
function() {

    /**
     * @name getResponseStatusCode
     * @synopsis Returns the status code of the response.
     * @returns {String} 
     */

    return this.get('statusCode');
});

//  ------------------------------------------------------------------------

TP.sig.WebSocketResponse.Inst.defineMethod('getResponseStatusText',
function() {

    /**
     * @name getResponseStatusText
     * @synopsis Returns the status message (text) of the response.
     * @returns {String} 
     */

    return this.get('statusText');
});

//  ------------------------------------------------------------------------

TP.sig.WebSocketResponse.Inst.defineMethod('getResponseText',
function() {

    /**
     * @name getResponseText
     * @synopsis Returns the response text.
     * @returns {String} 
     */

    var responseText;

    if (TP.isString(responseText = this.get('responseData'))) {
        return responseText;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.WebSocketResponse.Inst.defineMethod('getResponseXML',
function() {

    /**
     * @name getResponseXML
     * @synopsis Returns the DOM Node containing the response in XML form.
     * @returns {XMLDocument} 
     */

    var responseText,

        xml;

    //  did we already build it? just return it
    if (TP.isNode(xml = this.$get('responseXML'))) {
        return xml;
    }

    if (TP.notValid(responseText = this.getResponseText())) {
        return;
    }

    if (TP.notEmpty(responseText)) {
        //  NOTE not everything we go after actually _is_ XML so tell
        //  the parse step to work quietly
        xml = TP.documentFromString(responseText, null, false);
    }

    if (TP.isNode(xml)) {
        this.$set('responseXML', xml);
    }

    return xml;
});

//  ------------------------------------------------------------------------

TP.sig.WebSocketResponse.Inst.defineMethod('getResult',
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
            return this.getRequest().at('wsObj');
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
//  TP.core.WebSocketService
//  ========================================================================

/**
 * @type {TP.core.WebSocketService}
 * @synopsis The top-level service for all services which use WebSocket-based
 *     primitives for their transport layer. This service is capable of
 *     performing all the basic requirements of making WebSocket calls while
 *     offering several template methods that subtypes can override to perform
 *     service-specific adjustments to the overall request processing logic.
 */

//  ------------------------------------------------------------------------

TP.core.URIService.defineSubtype('WebSocketService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  WebSocket services can only support async requests
TP.core.WebSocketService.Type.defineAttribute('supportedModes',
                                            TP.core.SyncAsync.ASYNCHRONOUS);
TP.core.WebSocketService.Type.defineAttribute('mode',
                                            TP.core.SyncAsync.ASYNCHRONOUS);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.WebSocketService.Inst.defineMethod('finalizeRequest',
function(aRequest) {

    /**
     * @name finalizeRequest
     * @synopsis Perform any final updates or processing on the request to make
     *     sure it is ready to send to TP.webSocketCall() for processing.
     * @param {TP.sig.Request} aRequest The request being finalized.
     * @returns {TP.sig.WebSocketRequest} The request to send. NOTE that this
     *     may not be the original request.
     */

    //  At this level, we don't do anything special, so we just return the
    //  request.
    return aRequest;
});

//  ------------------------------------------------------------------------

TP.core.WebSocketService.Inst.defineMethod('handleWebSocketRequest',
function(aRequest) {

    /**
     * @name handleWebSocketRequest
     * @synopsis Constructs an appropriate response for the request provided,
     *     working to manage asynchronous calls in a manner consistent with the
     *     rest of the service/request/response model.
     * @param {TP.sig.WebSocketRequest} aRequest The request whose parameters
     *     define the WebSocket request.
     * @raises TP.sig.InvalidRequest,TP.sig.InvalidURI
     * @returns {TP.sig.WebSocketResponse} The service's response to the
     *     request.
     */

    var request,
        url,
        response;

    if (!TP.isKindOf(aRequest, 'TP.sig.WebSocketRequest')) {
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

    //  rewrite/update the request body content
    request.atPut('body', this.rewriteRequestBody(request));

    //  one last chance to tweak things before we ship it to the primitive
    //  and NOTE NOTE NOTE that we capture the return value here which
    //  allows the entire request to be reconstructed if necessary
    request = this.finalizeRequest(request);

    //  with all request tweaking in place we can now construct our
    //  response, which may have had the type/name altered by request
    //  rewriting
    response = request.constructResponse();

    //  go ahead and perform the WebSocket call
    this.performWebSocketCall(request);

    //  we return a response specific to the request, but note that it may
    //  not be complete if the call was async
    return response;
});

//  ------------------------------------------------------------------------

TP.core.WebSocketService.Inst.defineMethod('performWebSocketCall',
function(aRequest) {

    /**
     * @name performWebSocketCall
     * @synopsis Performs the WebSocket call. This is the method that actually
     *     does the work and can be overridden in subtypes of this type that
     *     have special types of WebSocket calling semantics.
     * @param {TP.sig.WebSocketRequest} aRequest The request whose parameters
     *     define the WebSocket request.
     * @raises TP.sig.InvalidURI
     * @returns {TP.sig.WebSocketRequest} The supplied request.
     */

    var url;

    //  Make sure we have a viable URL.
    url = TP.uc(aRequest.at('uri'));
    if (TP.notValid(url)) {
        return aRequest.fail(TP.FAILURE, 'TP.sig.InvalidURI');
    }

    try {
        //  First, we need to make sure that our url has a valid
        //  'webSocketObj'. If it doesn't, we'll need to open one and put
        //  our 'TP.webSocketCall()' in as our 'open callback' (which will
        //  only be invoked if the WebSocket was successfully opened).
        if (TP.notValid(url.get('webSocketObj'))) {
            TP.webSocketCreate(url,
                                function() {

                                    TP.webSocketCall(url, aRequest);
                                });
        } else {
            //  TP.$webSocketWrapup() processing will call back to the
            //  request via handleIO* based on success/failure and the rest
            //  is handled there...see the request type's handleIO* methods
            //  for more.
            TP.webSocketCall(url, aRequest);
        }
    } catch (e) {
        aRequest.atPut('object', e);
        aRequest.atPut('message', TP.str(e));

        return TP.webSocketError(
                    url,
                    TP.ifKeyInvalid(aRequest,
                                    'exceptionType',
                                    'WebSocketException'),
                    arguments,
                    aRequest);
    }

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.core.WebSocketService.Inst.defineMethod('rewriteRequestBody',
function(aRequest) {

    /**
     * @name rewriteRequestBody
     * @synopsis Encodes the request body for transmission. If you don't want
     *     this processing to occur you can put a key of 'noencode' with a value
     *     of true in the request.
     * @param {TP.sig.WebSocketRequest} aRequest The request whose parameters
     *     define the WebSocket request.
     * @returns {String} The string value of the encoded body content.
     */

    var body;

    body = aRequest.at('body');
    if (TP.notValid(body)) {
        return;
    }

    //  check for "please don't change my body content" flag
    if (TP.isTrue(aRequest.at('noencode'))) {
        return body;
    }

    //  At this level, we don't do anything special, so we just return the
    //  body.
    return body;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
