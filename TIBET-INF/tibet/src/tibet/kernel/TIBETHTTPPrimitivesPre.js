//  ========================================================================
/*
NAME:   TIBETHTTPPrimitivesPre.js
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

/**
 * @Support functions for HTTP operation. These include common error handling,
 *     status checking, and encoding routines.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.definePrimitive('httpDidSucceed',
function(httpObj) {

    /**
     * @name httpDidSucceed
     * @synopsis Returns true if the request is done and was successful.
     * @description In essence this simply tests the status code to see if it is
     *     in the range of 200 to 207. Normally success is 200, but for
     *     operations like WebDAV MkCol, Lock, etc. we may receive other 2xx
     *     codes which signify success. A status code of 304 (Not-Modified) is
     *     returned by certain servers, particularly when using ETag data for
     *     performance but it also indicates a success. A status code of 0 can
     *     also mean success when using an HTTP request to access the local file
     *     system.
     *
     *     The codes are:
     *
     *     0, OK if file system access was being performed 200, 'OK', 201,
     *     'Created', 202, 'Accepted', 203, 'Non-Authoritative Information',
     *     204, 'No Content', 205, 'Reset Content', 206, 'Partial Content', 207,
     *     'WebDAV Multi-Status', 304, 'Not Modified', (ETag and/or Opera)
     *
     *
     * @param {XMLHttpRequest} httpObj An XMLHttpRequest which was used for a
     *     server call.
     * @returns {Boolean} True if the request was successful.
     */

    var stat;

    //  If the XHR mechanism has aborted in Mozilla, it will cause the
    //  '.status' property to throw an exception if it is read.
    try {
        stat = httpObj.status;

        //  OK, Created, and Accepted are considered success codes
        if ((stat >= 200) && (stat <= 207) || (stat === 304)) {
            return true;
        }

        //  file access often returns status of 0 (improperly we realize)
        if ((stat === 0) && (httpObj.responseXML || httpObj.responseText)) {
            return true;
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'HTTP status error.'),
                        TP.IO_LOG,
                        arguments) : 0;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpDidRedirect',
function(httpObj) {

    /**
     * @name httpDidRedirect
     * @synopsis Returns true if the request provided has a status code
     *     indicating a redirect.
     * @description TIBET considers all 300-series codes other than a 304 (Not
     *     Modified) to be valid redirection indicators. We avoid 304 in
     *     particular so we can support HTTP Validation via ETag headers. The
     *     300 series codes are:
     *
     *     300, 'Multiple Choices', 301, 'Moved Permanently', 302, 'Found',
     *     303, 'See Other', 304, 'Not Modified', 305, 'Use Proxy', 306,
     *     '(Unused)', 307, 'Temporary Redirect',
     *
     *
     * @param {XMLHttpRequest} httpObj An XMLHttpRequest which was used for a
     *     server call.
     * @returns {Boolean} True for redirection responses.
     */

    var stat;

    //  If the XHR mechanism has aborted in Mozilla, it will cause the
    //  '.status' property to throw an exception if it is read.
    try {
        stat = httpObj.status;

        //  from Multiple Choices to Temporary Redirect
        if ((stat >= 300) && (stat <= 307)) {
            //  Not Modified will be false, all others are true.
            return (stat !== 304);
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'HTTP redirect error.'),
                        TP.IO_LOG,
                        arguments) : 0;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpEncode',
function(aPayload, aMIMEType, aSeparator, aMediatype, anEncoding) {

    /**
     * @name httpEncode
     * @synopsis Provides URI and data encoding support for commonly used MIME
     *     types. The data is returned, either ready to be appended to the
     *     targetUrl, or ready for use as content for a POST, PUT, or similar
     *     operation. NOTE that if the data is a string already, or is
     *     null/undefined no new content is created and the data is returned as
     *     is.
     * @description Encoding of data can be performed a number of ways but this
     *     method handles the most common formats related to content types
     *     typically used to communicate with web servers and web services.
     *     Supported MIME types include:
     *
     *     application/json application/x-www-form-urlencoded application/xml
     *     application/xml+rpc application/vnd.tpi.hidden-fields
     *     multipart/form-data multipart/related
     *
     *
     * @param {Object} aPayload The call data to encode along with the URL. Note
     *     that when this is a string it won't be altered in any form.
     * @param {String} aMIMEType One of the standard HTTP MIME type formats such
     *     as application/x-www-form-urlencoded or multipart/form-data.
     * @param {String} aSeparator Used for url encoding, this is normally the &
     *     used to separate individual key/value pairs.
     * @param {String} aMediatype Used with certain encoding types to provide
     *     data for the type of content being encoded. Defaults vary based on
     *     the encoding type.
     * @param {String} anEncoding The character set/encoding to use. Default is
     *     'UTF-8'. NOTE that changing this can cause certain encodings to be
     *     inconsistent so use caution when changing this value.
     * @returns {String} The encoded data, in string form so it can be sent to
     *     the server or stored on disk.
     * @todo
     */

    var data,
        mimetype,
        charset,
        separator,
        arr,
        list,
        item,
        size,
        i,
        j,
        len,
        el,
        val,
        boundary,
        content;

    //  when the data is a string already we presume it's in the proper
    //  form, which may not be true but we're not gonna parse it now :) We
    //  also don't go any further for data that isn't actually there.
    if (TP.notValid(aPayload) || TP.isString(aPayload)) {
        return aPayload;
    }

    //  commonly get nodes for encoding, but we want to unwrap TP.core.Nodes
    if (TP.canInvoke(aPayload, 'getNativeNode')) {
        data = aPayload.getNativeNode();
    } else {
        data = aPayload;
    }

    //  default mime type is the one used for most GET/POST/PUT calls
    mimetype = TP.ifInvalid(aMIMEType, TP.URL_ENCODED);

    charset = TP.ifInvalid(anEncoding, TP.UTF8);

    separator = TP.ifInvalid(aSeparator, '&');

    switch (mimetype) {
        case TP.JSON_ENCODED:

            //  the format preferred for AJAX mashups and public services
            //  since it leverages a gaping security hole to get around
            //  cross-site security restrictions on XMLHttpRequest
            if (TP.isNode(data)) {
                return TP.xml2json(data);
            } else {
                return TP.js2json(data);
            }

            break;

        case TP.URL_ENCODED:

            //  this format is typically used with GET requests, but it can
            //  also be used with other call types such as POST or PUT. Note
            //  that XForms allows this with POST, but considers it to be a
            //  deprecated format

            arr = TP.ac();

            if (TP.isNode(data)) {
                //  we follow the XForms approach for encoding here, using
                //  non-empty elements containing text nodes and discarding
                //  everything else. Note that we have to ensure the node
                //  itself gets encoded by putting it in the list.
                list = TP.nodeGetElementsByTagName(data, '*');
                list.unshift(data);

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    el = list.at(i);
                    if (TP.notEmpty(el))    //  empty node means no children
                    {
                        if (TP.notEmpty(val = TP.nodeGetTextContent(el))) {
                            arr.push(TP.join(TP.elementGetLocalName(el),
                                            '=',
                                            encodeURIComponent(val)));
                        }
                    }
                }
            } else {
                list = TP.keys(data);

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    if (TP.notEmpty(val = data.at(list.at(i)))) {
                        arr.push(TP.join(list.at(i),
                                        '=',
                                        encodeURIComponent(val)));
                    } else {
                        //  if there's no value, we just push on the key
                        arr.push(list.at(i));
                    }
                }
            }

            //  join using the separator provided, but return a null if the
            //  data ends up empty to avoid sending '' as content
            return TP.ifEmpty(arr.join(separator), null);

        case TP.XML_ENCODED:

            //  we don't do much here other than serialize the content if
            //  it's a node so we get the best rep possible. any filtering
            //  of the XML had to happen at a higher level (i.e. XForms)
            if (TP.isNode(data)) {
                return TP.nodeAsString(data);
            }

            //  not a node container or a native node, so who knows?
            return TP.nodeAsString(TP.js2xml(data));

        case TP.XMLRPC_ENCODED:

            //  another common format for server communication, particularly
            //  with several open source applications like OpenGroupware
            return TP.nodeAsString(TP.js2xmlrpc(data));

        case TP.FIELD_ENCODED:

            //  not a standard, but something we found useful for certain
            //  situations -- encode data as if it had been in an html form.
            //  This can then be POSTed as form content.

            arr = TP.ac();

            if (TP.isNode(data)) {
                list = TP.nodeGetElementsByTagName(data, '*');
                list.unshift(data);

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    el = list.at(i);
                    if (TP.notEmpty(el))    //  empty node means no children
                    {
                        if (TP.notEmpty(val = TP.nodeGetTextContent(el))) {
                            arr.push(
                                '<input type="hidden" name="',
                                el.tagName,
                                '" value="',
                                val.replace(/\"/g, '&quot;'),
                                '" />\n');
                        }
                    }
                }
            } else {
                list = TP.keys(data);

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    item = data.at(list.at(i));
                    if (TP.isArray(item)) {
                        size = item.getSize();
                        for (j = 0; j < size; j++) {
                            arr.push(
                                '<input type="hidden" name="',
                                list.at(i),
                                '" value="',
                                TP.str(
                                    data.at(
                                        list.at(i)).at(j)).replace(
                                                /\"/g, '&quot;'),
                                '" />\n');
                        }
                    } else {
                        arr.push(
                            '<input type="hidden" name="',
                            list.at(i),
                            '" value="',
                            TP.str(item).replace(/\"/g, '&quot;'),
                            '" />\n');
                    }
                }
            }

            return TP.ifEmpty(arr.join(''), null);

        case TP.MP_RELATED_ENCODED:

            arr = TP.ac();
            boundary = TP.genID('part');

            //  here we follow the XForms definition, encoding XML as a
            //  single part, and any binary as other parts (unsupported)

            //  place first boundary
            arr.push('--' + boundary);

            //  TODO: we don't currently support binary chunks processed via
            //  an upload element, but maybe in the future...

            //  if the data is an Array, then each item in the Array should
            //  be a TP.lang.Hash containing keys that would be the same as
            //  a regular data request, such as 'body', 'mediatype',
            //  'encoding', 'separator', etc.

            //  We then loop over those, encoding each one using the
            //  encoding data and information in each TP.lang.Hash.
            if (TP.isArray(data)) {
                data.perform(
                    function(anItem, anIndex) {

                        var itemContent,

                            itemMIMEType,
                            itemEncoding,
                            itemSeparator;

                        //  Make sure that we have 'body' data to encode
                        if (TP.notValid(itemContent = anItem.at('body'))) {
                            //  TODO: Log an error here?
                            return;
                        }

                        itemMIMEType =
                                anItem.atIfInvalid('mimetype', aMediatype);

                        itemSeparator =
                                anItem.atIfInvalid('separator', separator);

                        itemEncoding =
                                anItem.atIfInvalid('encoding', charset);

                        if (TP.notEmpty(itemMIMEType)) {
                            arr.push(
                                TP.join('Content-Type: ', itemMIMEType,
                                        '; charset=', itemEncoding));
                        }

                        arr.push('Content-ID: ' + anIndex);

                        //  honor the 'noencode' flag here
                        if (TP.notTrue(anItem.at('noencode'))) {
                            //  Note here how we supply the item's 'media
                            //  type' as the MIME type to this recursive
                            //  call to TP.httpEncode() and a 'null' for
                            //  media type. This is the correct behavior but
                            //  it effectively prevents *nested*
                            //  multipart/related encoding.
                            itemContent = TP.httpEncode(
                                            itemContent,
                                            itemMIMEType,
                                            itemSeparator,
                                            null,
                                            itemEncoding);
                        }

                        arr.push('', itemContent);

                        arr.push('--' + boundary);
                    });
            } else if (TP.isNode(data)) {
                //  if the data is a Node, we use the supplied media type or
                //  TP.XML_ENCODED if that's not defined, and the same
                //  charset as the overall multipart content

                //  and charset from the content as a whole and encode the
                //  data as XML, forming a single block.

                //  root
                arr.push(
                    TP.join('Content-Type: ',
                                TP.ifInvalid(aMediatype, TP.XML_ENCODED),
                            '; charset=',
                                charset),
                    'Content-ID: 0');

                //  Note here how we supply the item's 'media type'
                //  (defaulted here to XML encoding) as the MIME type to
                //  this recursive call to TP.httpEncode() and a 'null' for
                //  media type. This is the correct behavior but it
                //  effectively prevents *nested* multipart/related
                //  encoding.
                content = TP.httpEncode(
                                data,
                                TP.ifInvalid(aMediatype, TP.XML_ENCODED),
                                separator,
                                null,
                                charset);

                arr.push(content);

                arr.push('--' + boundary);
            } else {
                //  If a defined media type was supplied, we use that and
                //  the charset used for the overall multipart content.
                //  Otherwise, we omit those.

                //  Then, for each key, we obtain the data as a String, thus
                //  forming the block for each part.

                list = TP.keys(data);

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    if (TP.notEmpty(aMediatype)) {
                        arr.push(
                            TP.join('Content-Type: ', aMediatype,
                                    '; charset=', charset,
                                    ' '));
                    }

                    arr.push('Content-ID: ' + list.at(i));

                    content = TP.str(data.at(list.at(i)));
                    arr.push(content);

                    arr.push('--' + boundary);
                }
            }

            //  terminate final boundary
            arr.atPut(arr.getSize() - 1, arr.last() + '--');

            return arr.join('\n');

        case TP.MP_FORMDATA_ENCODED:

            //  provided for XForms compliance with older servers. The basic
            //  idea here is that each element or key/value pair gets its
            //  own chunk in the content string, with type/encoding data to
            //  describe that chunk.

            arr = TP.ac();
            boundary = TP.genID('part');

            //  per XForms spec the default here is application/octet-stream

            //  TODO: This isn't used below... regular plaintext encoding is
            //  used. Is this correct?
            //mediatype = TP.ifInvalid(aMediatype, TP.OCTET_ENCODED);

            //  start the show :)
            arr.push(TP.join('Content-Type: ', TP.MP_FORMDATA_ENCODED,
                            '; boundary=', boundary));

            //  place first boundary
            arr.push('--' + boundary);

            if (TP.isNode(data)) {
                //  we follow the XForms approach for encoding here, using
                //  non-empty elements containing text nodes and discarding
                //  everything else
                list = TP.nodeGetElementsByTagName(data, '*');
                list.unshift(data); //  not just children, but the node too

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    el = list.at(i);
                    if (TP.notEmpty(el))    //  empty node means no children
                    {
                        if (TP.notEmpty(val = TP.nodeGetTextContent(el))) {
                            arr.push(
                                TP.join(
                                    'Content-disposition: form-data',
                                    '; name="', el.tagName, '"',
                                    'Content-Type: ', TP.PLAIN_TEXT_ENCODED,
                                    '; charset=', charset),
                                val,
                                '--' + boundary);
                        }
                    }
                }
            } else {
                list = TP.keys(data);

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    arr.push(
                        TP.join(
                            'Content-disposition: form-data',
                            '; name="', list.at(i), '"',
                            'Content-Type: ', TP.PLAIN_TEXT_ENCODED,
                            '; charset=', charset),
                        TP.str(data.at(list.at(i))),
                        '--' + boundary);
                }
            }

            //  terminate final boundary
            arr.atPut(arr.getSize() - 1, arr.last() + '--');

            return arr.join('\n');

        default:

            //  nothing we can do but return the string version
            return TP.str(data);
    }

    return data;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpEncodeRequestBody',
function(aRequest) {

    /**
     * @name httpEncodeRequestBody
     * @synopsis Encodes the request body for transmission. Processing in this
     *     method makes use of keys in the request to drive a call to the
     *     TP.httpEncode() primitive. If you don't want this processing to occur
     *     you can put a key of 'noencode' with a value of true in the request.
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @returns {String} The string value of the encoded body content.
     */

    var body,
        mimetype,
        separator,
        mediatype,
        encoding;

    body = aRequest.at('body');
    if (TP.notValid(body)) {
        return;
    }

    //  check for "please don't change my body content" flag
    if (TP.isTrue(aRequest.at('noencode'))) {
        return body;
    }

    //  REQUIRED value for the encoding process
    mimetype = aRequest.at('mimetype');

    //  only used for URL_ENCODING, but we need to pass it along
    separator = aRequest.at('separator');

    //  only used for the multi-part encodings, but just in case :)
    mediatype = aRequest.at('mediatype');

    //  should be left alone 99% of the time so it defaults to UTF-8
    encoding = aRequest.at('encoding');

    return TP.httpEncode(body, mimetype, separator, mediatype, encoding);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpError',
function(targetUrl, aSignal, aContext, aRequest) {

    /**
     * @name httpError
     * @synopsis Low-level error handler for httpCall processing. This function
     *     will cause both the IO log and Error log to be updated to reflect the
     *     error condition.
     * @description aRequest could contain 1 or more of the following keys:
     *
     *     'uri' - the targetUrl 'uriparams' - URI query parameters 'headers' -
     *     call headers 'verb' - the command verb 'body' - string content 'xhr'
     *     - xml http request 'response' - TP.sig.Response 'object' - any error
     *     object 'message' - error string 'direction' - send/recv 'async' -
     *     true/false 'redirect' - boolean
     *
     *
     * @param {String} targetUrl The URL being accessed when the error occurred.
     * @param {String|TP.sig.Signal} aSignal The signal which should be raised
     *     by this call.
     * @param {arguments} aContext The calling context.
     * @param {TP.lang.Hash|TP.sig.Request} aRequest A request/hash with keys.
     * @raises HTTPException
     * @throws Error Throws an Error containing aString.
     * @todo
     */

    var args,
        signal,
        error;

    //  make sure we've got at least a basic TP.core.Request to work with
    args = TP.ifInvalid(aRequest, TP.request());

    //  make sure we tuck away the url if there's no prior value
    args.atPutIfAbsent('uri', targetUrl);

    //  rarely null, but just in case
    signal = TP.ifInvalid(aSignal, 'HTTPException');

    //  if we didn't get an error we can relay a new one
    error = args.atIfInvalid('object',
                                new Error(
                                    TP.ifEmpty(args.at('message'),
                                                signal)));

    //  make sure the IO log contains this data to show a complete record
    //  for access to the targetUrl
    args.atPut('message', 'HTTP request exception.');
    TP.ifError() ?
        TP.error(args, TP.IO_LOG, arguments) : 0;

    if (!TP.sys.shouldThrowExceptions()) {
        TP.raise(targetUrl, signal, arguments, args);
    } else {
        throw error;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpGetDefaultHeaders',
function() {

    /**
     * @name httpGetDefaultHeaders
     * @synopsis Builds and returns a set of default headers for a web call.
     * @returns {TP.lang.Hash} A hash of default headers which can be used for a
     *     standard web call.
     * @todo
     */

    //  NOTE that we build a new hash each time so it can be modified as
    //  needed by each request. Also note that this is done lazily so that
    //  we're sure we're getting a full hash object, not a TP.PHash
    return TP.hc('Pragma', 'no-cache',
                    'Cache-Control', TP.ac('no-cache', 'no-store'),
                    'Accept', TP.ac(TP.JS_TEXT_ENCODED,
                                    TP.JSON_ENCODED,
                                    TP.JSON_TEXT_ENCODED,
                                    TP.XML_ENCODED,
                                    TP.XML_TEXT_ENCODED,
                                    TP.XHTML_ENCODED,
                                    TP.HTML_TEXT_ENCODED,
                                    '*/*'));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpSetHeaders',
function(targetUrl, aRequest, httpObj) {

    /**
     * @name httpSetHeaders
     * @synopsis Sets the HTTP headers on httpObj for the URL, call type (HTTP
     *     Verb), and header collection provided.
     * @description TIBET manages certain headers by default, in particular
     *     Cache-control and Pragma headers that help ensure that requests for
     *     data get current data whenever possible. You can override this by
     *     simply providing those keys in the header collection to tell TIBET
     *     you have your own plans for how to manage the headers.
     *
     *     Also note that certain header management is handled by the TPHTTPURI
     *     type to help ensure that ETag processing and other cache-related
     *     behavior is done properly.
     * @param {String} targetUrl The URL accessed by the request.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @param {XMLHttpRequest} httpObj The request object to configure.
     * @returns {String} The headers in string form, for logging. Note that the
     *     httpObj provided will contain the new headers on return from this
     *     method.
     * @todo
     */

    var request,
        headers,
        h,

        hash,

        keys,
        len,
        i,
        key,
        val,
        j,
        body,
        url,

        method;

    request = TP.ifInvalid(aRequest, TP.request());
    headers = TP.ifKeyInvalid(request, 'headers',
                                TP.httpGetDefaultHeaders());
    request.atPut('headers', headers);

    //  NOTE we use the string of the body content here for Content-Length
    body = request.at('finalbody');
    url = request.at('uri');

    //  Default the mimetype based on body type as best we can.
    if (TP.notDefined(request.at('mimetype'))) {
        request.atPut('mimetype',
            TP.ietf.Mime.guessMIMEType(body, url, TP.URL_ENCODED));
    }

    //  typically we turn off cache behavior for these requests so we're
    //  sure we're getting the most current data

    //  on moz we have to avoid duplication of this header, which seems
    //  to appear as if by magic...
    if (TP.boot.isUA('GECKO')) {
        if (TP.isDefined(h = headers.at('Pragma'))) {
            if (h === 'no-cache') {
                headers.removeKey('Pragma');
            } else if (TP.isArray(h)) {
                h.remove('no-cache');
            }
        }
    } else if (TP.notDefined(headers.at('Pragma'))) {
        headers.atPut('Pragma', 'no-cache');
    }

    //  when no Cache-control is specified we want to bypass caches
    if (TP.notDefined(headers.at('Cache-Control'))) {
        headers.atPut('Cache-Control', TP.ac('no-cache', 'no-store'));
    }

    //  add a header for Content-Type if not already found. default is
    //  standard form encoding
    if (TP.notDefined(headers.at('Content-Type'))) {
        headers.atPut('Content-Type', request.at('mimetype'));
    }

    //  identify the request as coming from an XMLHttpRequest (ala Rails), but
    //  only if we'
    if (TP.notDefined(headers.at('X-Requested-With'))) {
        if (TP.uriNeedsPrivileges(targetUrl) &&
            TP.sys.cfg('tibet.simple_cors_only')) {
                //  targetUrl needs privileges but we're configured for 'simple
                //  CORS' only, which disallows custom 'X-' headers.
        } else {
            headers.atPut('X-Requested-With', 'XMLHttpRequest');
        }
    }

    //  if the request would like us to try to authenticate as part of the
    //  request (avoiding the initial round trip for the browser), we can
    //  try that here. Note that we only support 'HTTP Basic' authentication
    //  for now ('HTTP Digest' authentication requires a round-trip to the
    //  server anyway for the 'server nonce').
    if (request.at('auth') === TP.HTTP_BASIC) {
        //  if 'Authentication' authentication header wasn't supplied but a
        //  username/password was, then compute an 'HTTP Basic'
        //  authentication header
        if (TP.notDefined(headers.at('Authentication')) &&
                TP.isDefined(request.at('username')) &&
                TP.isDefined(request.at('password'))) {
            hash = TP.btoa(
                    TP.join(request.at('username'),
                            ':',
                            request.at('password')));

            headers.atPut('Authorization', 'Basic ' + hash);
        }
    }

    if (TP.notDefined(headers.at('X-HTTP-Method-Override'))) {
        if ((request.at('verb') === TP.HTTP_POST) &&
                TP.notEmpty(method = request.at('method'))) {
            headers.atPut('X-HTTP-Method-Override', method);
        }
    }

    //  now that we've got our header collection in place for this call we
    //  need to actually add those headers to the current request object
    keys = TP.keys(headers);
    len = keys.getSize();
    for (i = 0; i < len; i++) {
        key = keys.at(i);
        val = headers.at(key);

        if (TP.isArray(val)) {
            if (TP.boot.isUA('WEBKIT')) {
                //  It's an Array of settings, so we join it with a ', '
                httpObj.setRequestHeader(key, val.join(', '));
            } else {
                for (j = 0; j < val.length; j++) {
                    httpObj.setRequestHeader(key, val.at(i));
                }
            }
        } else {
            httpObj.setRequestHeader(key, val);
        }
    }

    return TP.str(headers);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$httpTimeout',
function(targetUrl, aRequest, httpObj) {

    /**
     * @name $httpTimeout
     * @synopsis Notifies the proper callback handlers and provides common
     *     signaling upon timeout of an HTTP request. This method is invoked
     *     automatically by the TP.httpCall() method when an asynchronous
     *     request times out.
     * @param {String} targetUrl The full target URI in string form.
     * @param {TP.sig.Request} aRequest The request object holding parameter
     *     data.
     * @param {XMLHttpRequest} httpObj The native XMLHttpRequest object used to
     *     service the request.
     * @todo
     */

    var request,
        type,
        sig,
        id;

    //  kill the native request activity so no other callbacks will fire
    TP.httpAbort(httpObj);

    request = TP.request(aRequest);

    //  make sure the request has access to the native http request object
    request.atPut('xhr', httpObj);

    //  configure the request's final output parameters to record the error
    request.atPut('direction', TP.RECV);
    request.atPut('object', new Error('Timeout'));
    request.atPut('message', 'HTTP request failed: Timeout');

    //  log it consistently with any other error
    TP.httpError(targetUrl, 'HTTPSendException', arguments, request);

    //  get a response object for the request that we can use to convey the
    //  bad news in a consistent fashion with normal success processing.
    if (TP.notValid(type = TP.sys.getTypeByName('TP.sig.HTTPResponse',
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

TP.definePrimitive('$httpWrapup',
function(targetUrl, aRequest, httpObj) {

    /**
     * @name $httpWrapup
     * @synopsis Notifies the proper callback handlers and provides common
     *     signaling upon completion of an HTTP request. Note that both
     *     synchronous and asynchronous requests will invoke this on completion
     *     of the request.
     * @param {String} targetUrl The full target URI in string form.
     * @param {TP.sig.Request} aRequest The request object holding parameter
     *     data.
     * @param {XMLHttpRequest} httpObj The native XMLHttpRequest object used to
     *     service the request.
     * @todo
     */

    var request,
        url,
        redirect,
        async,
        type,
        sig,
        id;

    TP.debug('break.http_wrapup');

    request = TP.request(aRequest);
    url = TP.ifInvalid(targetUrl, request.at('uri'));

    //  typically we'll allow redirects, but TP.httpDelete and others may
    //  set this to false to avoid potential problems
    redirect = request.atIfInvalid('redirect', true);

    //  if we got a redirection status we'll need to resubmit, provided that
    //  the particular request is not turning off redirection
    if (redirect && TP.httpDidRedirect(httpObj)) {
        //  update the url to the referred location...once
        url = httpObj.getResponseHeader('Location');

        //  if the original request was async that might cause another
        //  async call here...but we want to avoid that level of
        //  complexity here so we adjust when redirected
        async = request.at('async');
        if (TP.isTrue(async)) {
            //  TODO:   this could create a potential "hang" condition if
            //  the redirected site isn't available
            request.atPut('async', false);
        }

        try {
            httpObj = TP.httpCall(url, request);
        } catch (e) {
        } finally {
            request.atPut('async', async);
        }
    }

    //  make sure the request has access to the native http request object
    request.atPut('xhr', httpObj);

    //  create a signal that will carry the request to any callbacks in a
    //  fashion that allows it to treat it like a proper response object
    if (TP.notValid(type = TP.sys.getTypeByName('TP.sig.HTTPResponse',
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

    //  TODO:   do we want to signal something like an IORedirect ?

    //  with/without redirect, did we succeed?
    if (!TP.httpDidSucceed(httpObj)) {
        TP.httpError(url, 'HTTPException', arguments, request);
        sig.setSignalName('TP.sig.IOFailed');
        sig.fire(id);
    } else {
        sig.setSignalName('TP.sig.IOSucceeded');
        sig.fire(id);
    }

    sig.setSignalName('TP.sig.IOCompleted');
    sig.fire(id);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

