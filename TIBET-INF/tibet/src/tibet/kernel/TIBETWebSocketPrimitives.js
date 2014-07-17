//  ========================================================================
/*
NAME:   TIBETWebSocketPrimitives.js
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
 * @WebSocket support.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.definePrimitive('webSocketAbort',
function(wsObj) {

    /**
     * @name webSocketAbort
     * @synopsis Aborts an in-process WebSocket, clearing any handlers which may
     *     be present.
     * @param {WebSocket} wsObj The native WebSocket to abort.
     * @returns {WebSocket} The aborted WebSocket object.
     */

    if (TP.notValid(wsObj)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    //  Null out the 'onmessage' handler to prevent it from posting any
    //  message results - we're aborting.

    //  Best to use empty functions here
    wsObj.onmessage = TP.RETURN_NULL;

    //  Just close the socket
    wsObj.close();

    return wsObj;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webSocketCall',
function(targetUrl, aRequest) {

    /**
     * @name webSocketCall
     * @synopsis Performs a WebSocket call based on the information provided in
     *     aRequest. NOTE that the request object is updated with a number of
     *     keys which define the actual data used for the current WebSocket
     *     call.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @raises TP.sig.InvalidURI,WebSocketException,WebSocketSendException
     * @throws Error Various WebSocket-related errors.
     * @returns {WebSocket} The result object.
     * @todo
     */

    var request,
        url,

        content,
        contentString,

        wsObj,
        job;

    //  ensure we've got a default request object to avoid problems below
    request = TP.ifInvalid(aRequest, TP.request());

    //  with request mapping ensured we can now test for viable target URI
    url = targetUrl || request.at('uri');

    if (TP.isEmpty(url)) {
        return TP.webSocketError(targetUrl,
                                    'TP.sig.InvalidURI',
                                    arguments,
                                    request);
    }

    url = TP.uc(url);

    if (TP.notValid(wsObj = url.get('webSocketObj'))) {
        return TP.webSocketError(targetUrl,
                                    'TP.sig.InvalidWebSocket',
                                    arguments,
                                    request);
    }

    //  In the current WebSockets specification, we can *only* query against
    //  the domain we launched from.
    //  TODO: This code needs to be a lot more intelligent. Right now, it
    //  only checks against the protocol/domain we were launched from, which
    //  will always fail here since the protocol is always different.
    /*
    if (TP.uriNeedsPrivileges(targetUrl.getLocation())) {
        request.atPut('message', 'Permission not available to ' +
                                    'make cross-domain WebSocket call');

        return TP.webSocketError(targetUrl,
                                    'TP.sig.PrivilegeViolation',
                                    arguments,
                                    request);
    };
    */

    //  expand the url as needed using any query data in the request. NOTE
    //  that we do this for all request types, so any URL can be augmented
    //  by adding a query string or query hash to the request without
    //  actually altering the original URI. ALSO NOTE that we do NOT rewrite
    //  here, that must be done in higher-level methods so this call can be
    //  certain of what's being requested
    url = url.getLocation();
    request.addIfAbsent('uri', url);

    request.atPut('finaluri', url);

    //  we want to send the string representation whenever there's data
    content = request.at('body');
    if (TP.isValid(content)) {
        if (TP.isNode(content)) {
            contentString = TP.nodeAsString(
                content,
                request.atIfInvalid('bodyWantsXMLDeclaration', false));
        } else {
            contentString = TP.str(content);
        }
        request.atPut('finalbody', contentString);
    }

    //  WebSockets are always 'async' from a TIBET perspective.

    //  Since WebSockets are always async, we'll want a timeout option via a
    //  job
    job = TP.schedule(
            TP.hc('step',
                    function() {

                        TP.$websocketTimeout(targetUrl,
                                                request,
                                                wsObj);

                        return true;
                    },
                    'delay', TP.ifInvalid(
                                    request.at('timeout'),
                                    TP.sys.cfg('websocket.timeout'))));

    //  creating a closure lets us manage the timeout job, handle
    //  logging of the request data, and process the results easier
    wsObj.onmessage = function(closeEvt) {

            //  close out the timeout job silently
            job.kill(true);

            TP.ifInfo(TP.sys.shouldLogIO()) ?
                TP.sys.logIO(
                        TP.hc('direction', TP.RECV,
                                'message', 'WebSocket request completed.'),
                        TP.INFO, arguments) : 0;

            //  Grab any data sent back by the server and shove it onto
            //  websocket object as 'responseData'
            wsObj.responseData = closeEvt.data;

            TP.$webSocketWrapup(targetUrl, request, wsObj);
        };

    //  isolate the actual send call for finer-grained error handling
    try {
        TP.ifInfo(TP.sys.shouldLogIO()) ?
            TP.sys.logIO(
                    TP.hc('direction', TP.SEND,
                            'message', 'WebSocket request initiated.'),
                    TP.INFO, arguments) : 0;

        //  NB: For Mozilla, we "'' +" the content string here to get a
        //  primitive string - here, we just do it for consistency with
        //  Mozilla. But we only do this if contentString is valid.
        if (TP.isString(contentString)) {
            contentString = '' + contentString;
        }

        //  the actual send
        wsObj.send(contentString);

        //  WebSockets are always 'async' from a TIBET perspective - our
        //  'onmessage' handler installed above will handle it..
    } catch (e) {
        if (TP.isValid(job)) {
            //  close out the timeout job silently
            job.kill(true);
        }

        request.atPut('direction', TP.RECV);
        request.atPut('object', e);
        request.atPut('message', 'WebSocket request failed: ' + TP.str(e));

        return TP.webSocketError(targetUrl, 'WebSocketSendException',
                                    arguments, request);
    }

    return wsObj;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webSocketClose',
function(targetUrl, aRequest) {

    /**
     * @name webSocketClose
     * @synopsis Closes an open WebSocket, clearing any handlers which may be
     *     present.
     * @param {String} targetUrl The request's target URL.
     * @returns {WebSocket} The aborted WebSocket object.
     */

    var url,
        request,
        wsObj;

    url = TP.uc(targetUrl);

    //  ensure we've got a default request object to avoid problems below
    request = TP.ifInvalid(aRequest, TP.request());

    if (TP.isEmpty(url)) {
        return TP.webSocketError(targetUrl,
                                    'TP.sig.InvalidURI',
                                    arguments,
                                    request);
    }

    if (TP.notValid(wsObj = url.get('webSocketObj'))) {
        return TP.webSocketError(targetUrl,
                                    'TP.sig.InvalidWebSocket',
                                    arguments,
                                    request);
    }

    //  Just close the socket
    wsObj.close();

    return wsObj;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webSocketCreate',
function(targetUrl, openCallback) {

    /**
     * @name webSocketCreate
     * @synopsis Returns a WebSocket object for use.
     * @param {String} targetUrl The request's target URL.
     * @param {Function} openCallback 
     * @returns {WebSocket} 
     * @todo
     */

    var url,

        wsObj;

    url = TP.uc(targetUrl);

    //  If the URL already has an open WebSocket connection, we just return
    //  it.
    if (TP.isValid(wsObj = url.get('webSocketObj'))) {
        if ((wsObj.readyState !== WebSocket.OPEN) &&
                TP.isCallable(openCallback)) {
            wsObj.socketOpenCallback = openCallback;
        }

        return wsObj;
    }

    wsObj = new WebSocket(url.getLocation());

    if (TP.isCallable(openCallback)) {
        wsObj.socketOpenCallback = openCallback;
    }

    wsObj.onopen =
        function(openEvt) {

            var type;

            //  We need to keep track of the last WebSocket object used for
            //  a particular URI so we associate it here if possible
            if (TP.isURI(targetUrl) &&
                TP.isType(type = TP.sys.require('TP.core.URI'))) {
                url = TP.uc(targetUrl);
                url.set('webSocketObj', wsObj);
            }

            if (TP.isCallable(wsObj.socketOpenCallback)) {
                wsObj.socketOpenCallback(wsObj);
            }

            return;
        };

    wsObj.onclose =
        function(closeEvt) {

            TP.ifInfo() ?
                TP.info('The socket for: ' + targetUrl + ' just closed',
                        TP.LOG,
                        arguments) : 0;

            //  Clear the cached websocket object
            TP.uc(targetUrl).set('webSocketObj', null);

            return;
        };

    wsObj.onerror =
        function(errorEvt) {

            var type,
                sig,
                id;

            TP.ifInfo() ?
                TP.info('The socket for: ' + targetUrl + ' had an error',
                        TP.LOG,
                        arguments) : 0;

            //  Let the system know about an error
            TP.webSocketError(targetUrl,
                                'WebSocketException',
                                arguments,
                                TP.hc('message', 'WebSocket error',
                                        'object', TP.ec(errorEvt),
                                        'wsObj', wsObj));

            //  TODO: This needs to be made real. The reason that we have this
            //  'var' statement is purely to avoid the jshint warning message.
            var request = null;

            //  we must do this to avoid having multiple requests which
            //  share the same WebSocket object also sharing the same status
            //  text
            request.getResponse().set('responseData', null);

            request.getResponse().set('statusCode', TP.FAILURE);
            request.getResponse().set('statusText',
                                        TP.sc(TP.str(errorEvt)));

            //  get a response object for the request that we can use to
            //  convey the bad news in a consistent fashion with normal
            //  success processing.
            if (TP.notValid(type = TP.sys.getTypeByName(
                                'TP.sig.WebSocketResponse', false))) {
                if (TP.notValid(type = TP.sys.getTypeByName(
                                        'TP.sig.Response', false))) {
                    //  real problems...typically crashing during boot
                    //  since none of the core kernel response types appear
                    //  to be valid.
                    return;
                }
            }

            sig = type.construct(request);
            id = request.getRequestID();

            //  move on to general failure, timeout is considered a failure
            sig.setSignalName('TP.sig.IOFailed');
            sig.fire(id);

            //  success or failure all operations "complete" so that's last
            sig.setSignalName('TP.sig.IOCompleted');
            sig.fire(id);

            return;
        };

    if (TP.notValid(wsObj)) {
        return TP.webSocketError(
                        targetUrl,
                        'WebSocketCreateException',
                        arguments,
                        TP.hc('message',
                                'Unable to instantiate WebSocket object.'));
    }

    return wsObj;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webSocketError',
function(targetUrl, aSignal, aContext, aRequest) {

    /**
     * @name webSocketError
     * @synopsis Low-level error handler for WebSocket processing. This function
     *     will cause both the IO log and Error log to be updated to reflect the
     *     error condition.
     * @description aRequest could contain 1 or more of the following keys:
     *     
     *     'uri' - the targetUrl 'uriparams' - URI query parameters 'body' -
     *     string content 'wsObj' - websocket object 'response' -
     *     TP.sig.Response 'object' - any error object 'message' - error string
     *     'direction' - send/recv
     *     
     *     
     * @param {String} targetUrl The URL being accessed when the error occurred.
     * @param {String|TP.sig.Signal} aSignal The signal which should be raised
     *     by this call.
     * @param {arguments} aContext The calling context.
     * @param {TP.lang.Hash|TP.sig.Request} aRequest A request/hash with keys.
     * @raises WebSocketException
     * @throws Error Throws an Error containing aString.
     * @todo
     */

    var args,
        wsObj,
        signal,
        error;

    //  make sure we've got at least a basic TP.core.Request to work with
    args = TP.ifInvalid(aRequest, TP.request());

    //  make sure we tuck away the url if there's no prior value
    args.atPutIfAbsent('uri', targetUrl);

    wsObj = aRequest.at('wsObj');

    //  make sure we tuck away the native WebSocket object
    args.atPut('wsObj', wsObj);

    //  set the status of the native WebSocket to TP.FAILURE
    wsObj.status = TP.FAILURE;

    //  rarely null, but just in case
    signal = TP.ifInvalid(aSignal, 'WebSocketException');

    //  if we didn't get an error we can relay a new one
    error = args.atIfInvalid('object',
                                new Error(
                                    TP.ifEmpty(args.at('message'),
                                                signal)));

    //  make sure the IO log contains this data to show a complete record
    //  for access to the targetUrl
    args.atPut('message', 'WebSocket request exception.');
    TP.ifError() ?
        TP.error(args, TP.IO_LOG, arguments) : 0;

    //  since we're throwing an exception below we'll rely on debug mode to
    //  tell us if we should log here...the error may be handled higher up
    if (TP.$DEBUG) {
        TP.ifError() ?
            TP.error(TP.hc('object', error,
                            'message', 'WebSocket request exception.'),
                        TP.IO_LOG, arguments) : 0;
    }

    //  for TIBET-style observers we do a raise so they can respond
    TP.raise(targetUrl, signal, arguments, args);

    //  if we're not already throwing exceptions (so the raise will have
    //  done it) then we need to ensure that callers see this error...
    if (!TP.sys.shouldThrowExceptions()) {
        //  callers should catch this
        throw error;
    }

    //  Clear the cached websocket object
    TP.uc(targetUrl).set('webSocketObj', null);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$webSocketTimeout',
function(targetUrl, aRequest, wsObj) {

    /**
     * @name $webSocketTimeout
     * @synopsis Notifies the proper callback handlers and provides common
     *     signaling upon timeout of a WebSocket request. This method is invoked
     *     automatically by the webSocketCall() method when a request times out.
     * @param {String} targetUrl The full target URI in string form.
     * @param {TP.sig.Request} aRequest The request object holding parameter
     *     data.
     * @param {WebSocket} wsObj The native WebSocket object used to service the
     *     request.
     * @todo
     */

    var request,
        type,
        sig,
        id;

    //  kill the native request activity so no other callbacks will fire
    TP.webSocketAbort(wsObj);

    request = TP.request(aRequest);

    //  make sure the request has access to the native WebSocket object
    request.atPut('wsObj', wsObj);

    //  set the status of the native WebSocket to TP.FAILURE
    wsObj.status = TP.FAILURE;

    //  configure the request's final output parameters to record the error
    request.atPut('direction', TP.RECV);
    request.atPut('object', new Error('Timeout'));
    request.atPut('message', 'WebSocket request failed: Timeout');

    //  log it consistently with any other error
    TP.webSocketError(targetUrl, 'WebSocketSendException', arguments,
                        request);

    //  get a response object for the request that we can use to convey the
    //  bad news in a consistent fashion with normal success processing.
    if (TP.notValid(type = TP.sys.getTypeByName('TP.sig.WebSocketResponse',
                                                    false))) {
        if (TP.notValid(type = TP.sys.getTypeByName('TP.sig.Response',
                                                        false))) {
            //  real problems...typically crashing during boot since none of
            //  the core kernel response types appear to be valid.
            return;
        }
    }

    sig = type.construct(request);
    id = request.getRequestID();

    //  start with most specific, the fact we timed out
    sig.setSignalName('TP.sig.IOTimeout');
    sig.fire(id);

    //  move on to general failure, timeout is considered a failure
    sig.setSignalName('TP.sig.IOFailed');
    sig.fire(id);

    //  success or failure all operations "complete" so that's last
    sig.setSignalName('TP.sig.IOCompleted');
    sig.fire(id);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$webSocketWrapup',
function(targetUrl, aRequest, wsObj) {

    /**
     * @name $webSocketWrapup
     * @synopsis Notifies the proper callback handlers and provides common
     *     signaling upon completion of a WebSocket request.
     * @param {String} targetUrl The full target URI in string form.
     * @param {TP.sig.Request} aRequest The request object holding parameter
     *     data.
     * @param {WebSocket} wsObj The native WebSocket object used to service the
     *     request.
     * @todo
     */

    var request,
        url,
        type,
        sig,
        id;

    TP.debug('break.websocket_wrapup');

    request = TP.request(aRequest);
    url = TP.ifInvalid(targetUrl, request.at('uri'));

    //  make sure the request has access to the native WebSocket object
    request.atPut('wsObj', wsObj);

    //  set the status of the native WebSocket to TP.SUCCESS
    wsObj.status = TP.SUCCESS;

    //  we must do this to avoid having multiple requests which share the
    //  same WebSocket object also sharing the same response data.
    request.getResponse().set('responseData', wsObj.responseData);

    request.getResponse().set('statusCode', TP.SUCCESS);
    request.getResponse().set('statusText', TP.sc('Ok'));

    //  create a signal that will carry the request to any callbacks in a
    //  fashion that allows it to treat it like a proper response object
    if (TP.notValid(type = TP.sys.getTypeByName('TP.sig.WebSocketResponse',
                                                    false))) {
        if (TP.notValid(type = TP.sys.getTypeByName('TP.sig.Response',
                                                        false))) {
            //  real problems...typically crashing during boot since none of
            //  the core kernel response types appear to be valid.
            return;
        }
    }

    sig = type.construct(request);
    id = request.getRequestID();

    //  We will have always succeeded if we reach here. See the onerror
    //  handler installed on the WebSocket object or the
    //  TP.$webSocketTimeout() call to see cases when we fail.
    sig.setSignalName('TP.sig.IOSucceeded');
    sig.fire(id);

    sig.setSignalName('TP.sig.IOCompleted');
    sig.fire(id);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
