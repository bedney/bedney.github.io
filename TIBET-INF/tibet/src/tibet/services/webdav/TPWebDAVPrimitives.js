//  ========================================================================
/*
NAME:   TPWebDAVPrimitives.js
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
//  ========================================================================

/**
 * @Basic support for WebDAV calls via XMLHttpRequest.
 * @todo
 */

//  ------------------------------------------------------------------------
//  WebDAV 'cover methods'
//  ------------------------------------------------------------------------

TP.definePrimitive('webdavGetACL',
function(targetUrl, aRequest) {

    /**
     * @name webdavGetACL
     * @synopsis Gets the ACL information for the versioned controlled WebDAV
     *     resource at the target URL specified.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request;

    request = TP.ifInvalid(aRequest, TP.hc());

    request.atPut('propertyXML', '<D:acl/>');

    return TP.webdavPropFind(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavGetACLPrincipalPropSetReport',
function(targetUrl, aRequest) {

    /**
     * @name webdavGetACLPrincipalPropSetReport
     * @synopsis Reports on all set properties for the principals involved with
     *     the versioned controlled WebDAV resource at the target URL specified.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,
        headers,
        content;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_REPORT);

    headers = TP.ifKeyInvalid(request, 'headers', TP.hc());
    request.atPut('headers', headers);

    //  Default the WebDAV specific header 'Depth' to say that we only want
    //  ACL property values for the resource itself.
    headers.atPutIfAbsent('Depth', '0');

    content = TP.join(
                TP.XML_10_UTF8_HEADER, '\n',
                '<D:acl-principal-prop-set xmlns:D="DAV:">\n',
                    '<D:prop>\n',
                        '<D:displayname/>\n',
                    '</D:prop>\n',
                '</D:acl-principal-prop-set>');

    request.atPut('body', content);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavGetAllProperties',
function(targetUrl, aRequest) {

    /**
     * @name webdavGetAllProperties
     * @synopsis Gets all properties defined on the resource at the target URL.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @example Assume that the TDS (TIBET Development Server) is running after
     *     having been launched in ~app_inf/bin and is running on localhost
     *     on port 8080. This code will get all of the properties for the
     *     resource named 'foo.txt' in the application's directory.
     *
     *     result = TP.webdavGetAllProperties(
     *     TP.uc('http://localhost:8080/TIBET-INF/bin/wdtst/foo.txt'));
     *
     *     result is an XHR object whose 'status' should be 207.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request;

    request = TP.ifInvalid(aRequest, TP.hc());

    request.atPut('propertyXML', '<D:allprop/>');

    return TP.webdavPropFind(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavGetAllIncludedProperties',
function(targetUrl, aRequest) {

    /**
     * @name webdavGetAllIncludedProperties
     * @synopsis Gets all of the live, dead and 2 live properties defined in RFC
     *     3253 for the versioned controlled WebDAV resource at the target URL
     *     specified.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request;

    request = TP.ifInvalid(aRequest, TP.hc());

    request.atPut('propertyXML',
                    TP.join(
                        '<D:allprop/>',
                        '<D:include>',
                            '<D:supported-live-property-set/>',
                            '<D:supported-report-set/>',
                        '</D:include>'));

    return TP.webdavPropFind(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavGetCurrentUserPrivilegeSet',
function(targetUrl, aRequest) {

    /**
     * @name webdavGetCurrentUserPrivilegeSet
     * @synopsis Gets the exact set of privileges granted to the current HTTP
     *     user for the versioned controlled WebDAV resource at the target URL
     *     specified.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request;

    request = TP.ifInvalid(aRequest, TP.hc());

    request.atPut('propertyXML', '<D:current-user-privilege-set/>');

    return TP.webdavPropFind(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavGetDAVPropertyValues',
function(targetUrl, aRequest) {

    /**
     * @name webdavGetDAVPropertyValues
     * @synopsis Gets all 'WebDAV' properties (and only WebDAV properties - no
     *     custom properties) defined on the resource at the target URL.
     * @description This call expects an additional parameter in the request
     *     called 'propertyNames' that contains an Array with the names of the
     *     properties to retrieve values for.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request additional
     *     parameters. For this method, this includes an additional parameter of
     *     'propertyNames'.
     * @raises TP.sig.InvalidParameter
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,

        propertyNames,
        content,
        i;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  have to have a list of property names to retrieve the values for.
    propertyNames = request.at('propertyNames');
    if (TP.notValid(propertyNames) || !TP.isArray(propertyNames)) {
        TP.raise('TP.sig.InvalidParameter',
                    arguments,
                    'Must provide property name Array for WebDAV get ' +
                    'properties operation.');

        return;
    }

    content = TP.ac('<D:prop>');

    for (i = 0; i < propertyNames.getSize(); i++) {
        content.push('<D:', TP.str(propertyNames.at(i)), '/>');
    }

    content.push('</D:prop>');
    content = content.join('');

    request.atPut('propertyXML', content);

    return TP.webdavPropFind(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavGetExpandPropertyReport',
function(targetUrl, aRequest) {

    /**
     * @name webdavGetExpandPropertyReport
     * @synopsis Reports in one request all properties linked using 'href's for
     *     the versioned controlled WebDAV resource at the target URL specified.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,
        content;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_REPORT);

    content = TP.join(
                TP.XML_10_UTF8_HEADER, '\n',
                '<D:expand-property xmlns:D="DAV:">\n',
                    '<D:property name="version-history">\n',
                        '<D:property name="version-set">\n',
                            '<D:property name="creator-displayname"/>\n',
                            '<D:property name="activity-set"/>\n',
                        '</D:property>\n',
                    '</D:property>\n',
                '</D:expand-property>');

    request.atPut('body', content);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavGetPrincipalMatchReport',
function(targetUrl, aRequest) {

    /**
     * @name webdavGetPrincipalMatchReport
     * @synopsis Reports on all principals that match the current user for the
     *     versioned controlled WebDAV resource at the target URL specified.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,
        headers,
        content;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_REPORT);

    headers = TP.ifKeyInvalid(request, 'headers', TP.hc());
    request.atPut('headers', headers);

    //  Default the WebDAV specific header 'Depth' to say that we only want
    //  ACL property values for the resource itself.
    headers.atPutIfAbsent('Depth', '0');

    content = TP.join(
                TP.XML_10_UTF8_HEADER, '\n',
                '<D:principal-match xmlns:D="DAV:">\n',
                    '<D:principal-property>\n',
                        '<D:owner/>\n',
                    '</D:principal-property>\n',
                '</D:principal-match>');

    request.atPut('body', content);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavGetPrincipalSearchPropertySetReport',
function(targetUrl, aRequest) {

    /**
     * @name webdavGetPrincipalSearchPropertySetReport
     * @synopsis Reports on the set of searchable properties for the versioned
     *     controlled WebDAV resource at the target URL specified.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,
        headers,
        content;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_REPORT);

    headers = TP.ifKeyInvalid(request, 'headers', TP.hc());
    request.atPut('headers', headers);

    //  Default the WebDAV specific header 'Depth' to say that we only want
    //  ACL property values for the resource itself.
    headers.atPutIfAbsent('Depth', '0');

    content = TP.join(
                TP.XML_10_UTF8_HEADER, '\n',
                '<D:principal-search-property-set xmlns:D="DAV:"/>');

    request.atPut('body', content);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavGetProperty',
function(targetUrl, aRequest) {

    /**
     * @name webdavGetProperty
     * @synopsis Gets the supplied property(s) of a versioned controlled WebDAV
     *     resource at the target URL specified.
     * @description This call expects an additional parameter in the request
     *     called 'property' that contains a TP.lang.Hash with the following
     *     format:
     *
     *     TP.hc('name', 'author', 'ns',
     *     'http://www.w3.org/standards/z39.50/');
     *
     *
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters. For this method, this includes an additional
     *     parameter of 'property'.
     * @example Assume that the TDS (TIBET Development Server) is running after
     *     having been launched in ~app_inf/bin and is running on localhost
     *     on port 8080. This code will get the 'creationdate' property for the
     *     resource named 'foo.txt' in the 'wdtst' directory.
     *
     *     result = TP.webdavGetProperty(
     *     TP.uc('http://localhost:8080/TIBET-INF/bin/wdtst/foo.txt'),
     *     TP.hc('property', TP.hc('name', 'creationdate')));
     *
     *     result is an XHR object whose 'status' should be 207.
     * @raises TP.sig.InvalidParameter
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,

        propertyEntry,
        content;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  have to have a property entry to retrieve the value for.
    propertyEntry = request.at('property');
    if (TP.notValid(propertyEntry)) {
        TP.raise('TP.sig.InvalidParameter',
                    arguments,
                    'Must provide property TP.lang.Hash for WebDAV get ' +
                    'property operation.');

        return;
    }

    content = TP.ac();
    content.push('<D:prop>',
                    '<P:', propertyEntry.at('name'),
                    ' xmlns:P="',
                        TP.ifInvalid(propertyEntry.at('ns'), 'DAV:'),
                    '">',
                    propertyEntry.at('value'),
                    '</P:', propertyEntry.at('name'), '>',
                    '</D:prop>');

    content = content.join('');

    request.atPut('propertyXML', content);

    return TP.webdavPropFind(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavGetPropertyNames',
function(targetUrl, aRequest) {

    /**
     * @name webdavGetPropertyNames
     * @synopsis Returns all of the property names for the resource.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request;

    request = TP.ifInvalid(aRequest, TP.hc());

    request.atPut('propertyXML', '<D:propname/>');

    return TP.webdavPropFind(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavGetVersionTreeReport',
function(targetUrl, aRequest) {

    /**
     * @name webdavGetVersionTreeReport
     * @synopsis Reports on the version tree of a versioned controlled WebDAV
     *     resource at the target URL specified.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,
        content;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_REPORT);

    content = TP.join(TP.XML_10_UTF8_HEADER, '\n',
                        '<D:version-tree xmlns:D="DAV:">\n',
                            '<D:version-name/>\n',
                            '<D:creator-displayname/>\n',
                            '<D:successor-set/>\n',
                        '</D:version-tree>');

    request.atPut('body', content);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavRemoveProperty',
function(targetUrl, aRequest) {

    /**
     * @name webdavRemoveProperty
     * @synopsis Removes the supplied property(s) from a versioned controlled
     *     WebDAV resource at the target URL specified.
     * @description This call expects an additional parameter in the request
     *     called 'property' that contains a TP.lang.Hash with the following
     *     format:
     *
     *     TP.hc('name', 'author', 'value', 'Roy Fielding', 'ns',
     *     'http://www.w3.org/standards/z39.50/');
     *
     *
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters. For this method, this includes an additional
     *     parameter of 'property'.
     * @raises TP.sig.InvalidParameter
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,

        propertyEntry;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  have to have a property entry to retrieve the value for.
    propertyEntry = request.at('property');
    if (TP.notValid(propertyEntry)) {
        TP.raise('TP.sig.InvalidParameter',
                    arguments,
                    'Must provide property TP.lang.Hash for WebDAV get ' +
                    'property operation.');

        return;
    }

    request.atPut('removeList', TP.ac(propertyEntry));

    return TP.webdavPropPatch(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavSetProperty',
function(targetUrl, aRequest) {

    /**
     * @name webdavSetProperty
     * @synopsis Sets the supplied property(s) of a versioned controlled WebDAV
     *     resource at the target URL specified.
     * @description This call expects an additional parameter in the request
     *     called 'property' that contains a TP.lang.Hash with the following
     *     format:
     *
     *     TP.hc('name', 'author', 'value', 'Roy Fielding', 'ns',
     *     'http://www.w3.org/standards/z39.50/');
     *
     *
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters. For this method, this includes an additional
     *     parameter of 'property'.
     * @example Assume that the TDS (TIBET Development Server) is running after
     *     having been launched in ~app_inf/bin and is running on localhost
     *     on port 8080. This code will set the 'getlastmodified' property for
     *     the resource named 'foo.txt' in the 'wdtst' directory.
     *
     *     result = TP.webdavSetProperty(
     *     TP.uc('http://localhost:8080/TIBET-INF/bin/wdtst/foo.txt'),
     *     TP.hc('property', TP.hc('name', 'getlastmodified', 'value',
     *     TP.dc().as('TP.iso.ISO8601'))));
     *
     *     result is an XHR object whose 'status' should be 200.
     * @raises TP.sig.InvalidParameter
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,

        propertyEntry;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  have to have a property entry to retrieve the value for.
    propertyEntry = request.at('property');
    if (TP.notValid(propertyEntry)) {
        TP.raise('TP.sig.InvalidParameter',
                    arguments,
                    'Must provide property TP.lang.Hash for WebDAV get ' +
                    'property operation.');

        return;
    }

    request.atPut('setList', TP.ac(propertyEntry));

    return TP.webdavPropPatch(targetUrl, request);
});

//  ------------------------------------------------------------------------
//  WebDAV primitives
//  ------------------------------------------------------------------------

TP.definePrimitive('webdavCall',
function(targetUrl, aRequest, useQuery) {

    /**
     * @name webdavCall
     * @synopsis Makes a WebDAV call to the server. This method abstracts common
     *     functionality used when making all WebDAV calls, such as setting
     *     common headers, etc.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters. For most WebDAV operations these include the
     *     normal HTTP parameters for headers, timeout, username, and password.
     * @param {Boolean} useQuery Whether or not to use a TP.$httpQuery() call or
     *     a TP.$httpSend() call (the default).
     * @raises TP.sig.InvalidParameter
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,
        verb,
        headers;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  have to have a verb for the operation
    verb = request.at('verb');

    if (TP.notValid(verb)) {
        TP.raise('TP.sig.InvalidParameter',
                    arguments,
                    'Must provide verb for WebDAV operation.');

        return;
    }

    headers = TP.ifKeyInvalid(request, 'headers', TP.hc());
    request.atPut('headers', headers);

    //  tell the server that we're going to tell it about transfer encodings
    headers.atPutIfAbsent('Connection', 'TE');
    headers.atPutIfAbsent('TE', 'trailers,deflate,gzip,compress');
    headers.atPutIfAbsent('Translate', 'f');

    //  content for this operation is XML
    headers.atPut('Content-Type', TP.XML_ENCODED);

    //  tell http primitive what to signal if we have an exception
    request.atPut('exceptionType', 'WebDAVException');

    if (TP.isTrue(useQuery)) {
        //  use httpQuery since its NOT a state-changing request
        return TP.$httpQuery(verb, targetUrl, request);
    } else {
        //  use httpSend since its a state-changing request
        return TP.$httpSend(verb, targetUrl, request);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavCheckin',
function(targetUrl, aRequest) {

    /**
     * @name webdavCheckin
     * @synopsis Checks in a versioned controlled WebDAV resource at the target
     *     URL specified to produce a new version.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_CHECKIN);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavCheckout',
function(targetUrl, aRequest) {

    /**
     * @name webdavCheckout
     * @synopsis Checks out a versioned controlled WebDAV resource at the target
     *     URL specified.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_CHECKOUT);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavCopy',
function(targetUrl, aRequest) {

    /**
     * @name webdavCopy
     * @synopsis Copies a resource from the source path (given in the target
     *     URL) to the destination path.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters. For this method, this includes additional
     *     parameters of 'destination' and 'overwrite' which should contain a
     *     URL and a Boolean value respectively.
     * @example Assume that the TDS (TIBET Development Server) is running after
     *     having been launched in ~app_inf/bin and is running on localhost
     *     on port 8080. This code will copy a directory named 'wdtest' in the
     *     application's directory to a directory named 'wdtest2':
     *
     *     result = TP.webdavCopy(
     *     TP.uc('http://localhost:8080/TIBET-INF/bin/wdtst/'), TP.hc(
     *     'destination', TP.uc('http://localhost:8080/TIBET-INF/bin/wdtst2/'),
     *     'overwrite', true));
     *
     *     result is an XHR object whose 'status' should be 201.
     * @raises TP.sig.InvalidParameter
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,
        destination,
        headers,
        overwrite,
        content;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_COPY);

    //  have to have a destination url for the copy
    destination = request.at('destination');
    if (TP.notValid(destination)) {
        TP.raise('TP.sig.InvalidParameter',
                    arguments,
                    'Must provide destination for WebDAV copy operation.');

        return;
    }

    headers = TP.ifKeyInvalid(request, 'headers', TP.hc());
    request.atPut('headers', headers);

    //  convert any TP.core.URI value into a viable string url value
    headers.atPut('Destination', destination.getLocation());

    //  convert overwrite into a proper string from boolean
    overwrite = request.at('overwrite');
    if (TP.isTrue(overwrite)) {
        headers.atPut('Overwrite', 'T');
    } else {
        headers.atPut('Overwrite', 'F');
    }

    content = TP.join(TP.XML_10_UTF8_HEADER, '\n',
                    '<D:propertybehavior xmlns:D="DAV:">\n',
                    '<D:keepalive>*</D:keepalive>\n',
                    '</D:propertybehavior>');

    request.atPut('body', content);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavLock',
function(targetUrl, aRequest) {

    /**
     * @name webdavLock
     * @synopsis Sets a lock on the resource at the target URL. The returning
     *     XMLHttpRequest object will have the unique lock token used to unlock
     *     the resource as part of its response data.
     * @description The supplied request object has three parameters that are
     *     used when setting the lock. These should be one of the TP.WEBDAV_*
     *     constants as follows:
     *
     *     lockscope: either TP.WEBDAV_LOCKSCOPE_EXCLUSIVE or
     *     TP.WEBDAV_LOCKSCOPE_SHARED locktype: for now, always
     *     TP.WEBDAV_LOCKTYPE_WRITE lockowner: the owner of the lock as an
     *     'href': http://www.foo.com/joe.html locktimeout: A value which
     *     indicates how long the resource *should* be locked (note that servers
     *     will try to honor this, but may not - given server vagaries). The
     *     default for this value is TP.WEBDAV_LOCKTIMEOUT_DEFAULT. To lock a
     *     resource indefinitely use TP.WEBDAV_LOCKTIMEOUT_INFINITE.
     *
     *
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters. For this method, this includes additional
     *     parameters of 'lockscope', 'locktype', 'lockowner' and 'locktimeout'
     *     as described in the method comment.
     * @example Assume that the TDS (TIBET Development Server) is running after
     *     having been launched in ~app_inf/bin and is running on localhost
     *     on port 8080. This code will lock a file named 'foo.txt' in the 'boo'
     *     directory (note how the 'owner' is supplied as an 'href'):
     *
     *     result = TP.webdavLock( TP.uc(
     *     'http://localhost:8080/TIBET-INF/bin/boo/foo.txt'), TP.hc(
     *     'lockscope', TP.WEBDAV_LOCKSCOPE_EXCLUSIVE, 'lockowner',
     *     'http://www.foo.com/joe.html'));
     *
     *     result is an XHR object whose 'status' should be 200 and whose
     *     content will contain the lock token.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,
        headers,

        locktimeout,

        locktype,
        lockscope,
        lockowner,

        effectiveUser,

        content;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_LOCK);

    headers = TP.ifKeyInvalid(request, 'headers', TP.hc());
    request.atPut('headers', headers);

    locktimeout = TP.ifKeyInvalid(request,
                            'locktimeout',
                            TP.WEBDAV_LOCKTIMEOUT_DEFAULT);
    headers.atPut('Timeout', locktimeout);

    //  these values are blended into the content itself
    locktype = TP.ifKeyInvalid(request,
                                'locktype',
                                TP.WEBDAV_LOCKTYPE_WRITE);
    lockscope = TP.ifKeyInvalid(request,
                                'lockscope',
                                TP.WEBDAV_LOCKSCOPE_SHARED);
    if (TP.notValid(lockowner = request.at('lockowner'))) {
        if (TP.isValid(effectiveUser = TP.core.User.getEffectiveUser())) {
            lockowner = effectiveUser.get('resourceID');
        } else {
            lockowner = '<D:unauthenticated/>';
        }
    }

    content = TP.join(
                TP.XML_10_UTF8_HEADER, '\n',
                '<D:lockinfo xmlns:D="DAV:">\n',
                    '<D:lockscope><D:', lockscope, '/></D:lockscope>',
                    '<D:locktype><D:', locktype, '/></D:locktype>',
                    '<D:owner>', lockowner, '</D:owner>',
                '</D:lockinfo>');

    request.atPut('body', content);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavMkCol',
function(targetUrl, aRequest) {

    /**
     * @name webdavMkCol
     * @synopsis Creates a new WebDAV 'collection' at the target URL specified.
     * @description When executed against a 'file system' WebDAV resource, this
     *     function creates a directory at the specified target. Note that the
     *     specification states that *all* ancestors (i.e. parent directories)
     *     must exist in order for this call to succeed.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @example Assume that the TDS (TIBET Development Server) is running after
     *     having been launched in ~app_inf/bin and is running on localhost
     *     on port 8080. This code will create a directory named 'wdtst' in the
     *     application's directory:
     *
     *     result = TP.webdavMkCol(
     *     TP.uc('http://localhost:8080/TIBET-INF/bin/wdtst/'));
     *
     *     result is an XHR object whose 'status' should be 201.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_MKCOL);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavMove',
function(targetUrl, aRequest) {

    /**
     * @name webdavMove
     * @synopsis Moves a resource from the source path (given in the target URL)
     *     to the destination path provided in the request's 'destination' URL
     *     value.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters. For this method, this includes additional
     *     parameters of 'destination' and 'overwrite' which should contain a
     *     URL and a Boolean value respectively.
     * @example Assume that the TDS (TIBET Development Server) is running after
     *     having been launched in ~app_inf/bin and is running on localhost
     *     on port 8080. This code will move a directory named 'wdtst' in the
     *     application's directory to a directory named 'wdtst2':
     *
     *     result = TP.webdavMove(
     *     TP.uc('http://localhost:8080/TIBET-INF/bin/wdtst/'),
     *     TP.hc('destination',
     *     TP.uc('http://localhost:8080/TIBET-INF/bin/wdtst2/'), 'overwrite',
     *     true));
     *
     *     result is an XHR object whose 'status' should be 201.
     * @raises TP.sig.InvalidParameter
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,
        destination,
        headers,
        overwrite,
        content;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_MOVE);

    //  have to have a destination url for the move
    destination = request.at('destination');
    if (TP.notValid(destination)) {
        TP.raise('TP.sig.InvalidParameter',
                    arguments,
                    'Must provide destination for WebDAV move operation.');

        return;
    }

    headers = TP.ifKeyInvalid(request, 'headers', TP.hc());
    request.atPut('headers', headers);

    //  convert any TP.core.URI value into a viable string url value
    headers.atPut('Destination', destination.getLocation());

    //  convert overwrite into a proper string from boolean
    overwrite = request.at('overwrite');
    if (TP.isTrue(overwrite)) {
        headers.atPut('Overwrite', 'T');
    } else {
        headers.atPut('Overwrite', 'F');
    }

    content = TP.join(TP.XML_10_UTF8_HEADER, '\n',
                        '<D:propertybehavior xmlns:D="DAV:">\n',
                        '<D:keepalive>*</D:keepalive>',
                        '</D:propertybehavior>');

    request.atPut('body', content);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavPropFind',
function(targetUrl, aRequest) {

    /**
     * @name webdavPropFind
     * @synopsis Gets properties defined on the resource at the target URL.
     * @description This call takes an optional parameter containing XML that
     *     defines the names of the properties to retrieve values for. This XML
     *     must start and end with 'prop' tags. It can assume that the 'D' XML
     *     namespace prefix has been defined as the 'DAV:' namespace, as per the
     *     WebDAV spec. E.g.
     *
     *     <D:prop xmlns:P="http://www.foo.bar/boxschema"> <P:bigbox/>
     *     <P:author/> <P:DingALing/> <P:Random/> </D:prop>
     *
     *     Otherwise, this call will return the values of all of the properties
     *     of the resource.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters. For this method, this includes an additional
     *     parameter of 'propertyXML' which should be a string or node
     *     containing the property information being queried for.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,
        headers,
        propXML,
        content;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_PROPFIND);

    headers = TP.ifKeyInvalid(request, 'headers', TP.hc());
    request.atPut('headers', headers);

    //  Default the WebDAV specific header 'Depth' to say that we only want
    //  property values for the resource itself.
    headers.atPutIfAbsent('Depth', '0');

    content = TP.ac(TP.XML_10_UTF8_HEADER, '\n',
                    '<D:propfind xmlns:D="DAV:">\n');

    propXML = request.at('propertyXML');

    if (TP.notValid(propXML)) {
        content.push('<D:allprop/>\n');
    } else {
        content.push(TP.str(propXML), '\n');
    }

    content.push('</D:propfind>');
    content = content.join('');

    request.atPut('body', content);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server. Note how we pass 'true' here, since this is a 'query'
    //  and $httpQuery() should be used.
    return TP.webdavCall(targetUrl, request, true);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavPropPatch',
function(targetUrl, aRequest) {

    /**
     * @name webdavPropPatch
     * @synopsis Sets or removes properties defined on the resource at the
     *     target URL.
     * @description This call uses the 'setList' and 'removeList' parameters of
     *     the supplied request. Each parameter should contain an Array with the
     *     following format:
     *
     *     TP.ac(TP.hc('name', 'author', 'value', 'Jim Whitehead', 'ns',
     *     'http://www.w3.org/standards/z39.50/'), TP.hc('name',
     *     'getlastmodified', 'value', TP.dc().as('TP.iso.ISO8601')));
     *
     *
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters. For this method, this includes additional
     *     parameters of either 'setList' or 'removeList' (or both) parameters,
     *     containing entries of the form shown in the discussion section.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,
        headers,

        setList,
        removeList,

        i,
        setHash,
        removeHash,

        content;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_PROPPATCH);

    headers = TP.ifKeyInvalid(request, 'headers', TP.hc());
    request.atPut('headers', headers);

    content = TP.ac(TP.XML_10_UTF8_HEADER, '\n',
                    '<D:propertyupdate xmlns:D="DAV:">\n');

    setList = request.at('setList');
    if (TP.notEmpty(setList)) {
        for (i = 0; i < setList.getSize(); i++) {
            setHash = setList.at(i);

            content.push('<D:set><D:prop>',
                            '<P:', setHash.at('name'),
                            ' xmlns:P="',
                                TP.ifInvalid(setHash.at('ns'), 'DAV:'),
                            '">',
                            setHash.at('value'),
                            '</P:', setHash.at('name'), '>',
                            '</D:prop></D:set>');
        }
    }

    removeList = request.at('removeList');
    if (TP.notEmpty(removeList)) {
        for (i = 0; i < removeList.getSize(); i++) {
            removeHash = removeList.at(i);

            content.push('<D:remove><D:prop>',
                            '<P:', removeHash.at('name'),
                            ' xmlns:P="',
                                TP.ifInvalid(removeHash.at('ns'), 'DAV:'),
                            '">',
                            removeHash.at('value'),
                            '</P:', removeHash.at('name'), '>',
                            '</D:prop></D:remove>');
        }
    }

    content.push('</D:propertyupdate>');
    content = content.join('');

    request.atPut('body', content);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavReport',
function(targetUrl, aRequest) {

    /**
     * @name webdavReport
     * @synopsis Reports on the WebDAV resource at the target URL specified.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_REPORT);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavUnlock',
function(targetUrl, aRequest) {

    /**
     * @name webdavUnlock
     * @synopsis Removes a lock on the resource at the target URL. The lock is
     *     identified by the supplied unique lock token. The token is typically
     *     acquired via a previous webdavLock request.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters. For this method, this includes an additional
     *     parameter of 'locktoken' containing the lock token previously
     *     acquired when the resource was locked.
     * @example Assume that the TDS (TIBET Development Server) is running after
     *     having been launched in ~app_inf/bin and is running on localhost
     *     on port 8080. This code will unlock a file named 'foo.txt' in the
     *     'boo' directory (note how the 'owner' is supplied as an 'href'):
     *
     *     result = TP.webdavLock(
     *     TP.uc('http://localhost:8080/TIBET-INF/bin/boo/foo.txt'),
     *     TP.hc('locktoken',
     *     '<opaquelocktoken:a515cfa4-5da4-22e1-f5b5-00a0451e6bf7>'));
     *
     *     result is an XHR object whose 'status' should be 204.
     * @raises TP.sig.InvalidParameter
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request,
        headers,
        locktoken;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_UNLOCK);

    headers = TP.ifKeyInvalid(request, 'headers', TP.hc());
    request.atPut('headers', headers);

    headers.atPut('Connection', 'close');

    locktoken = request.at('locktoken');
    if (TP.notValid(locktoken)) {
        TP.raise('TP.sig.InvalidParameter',
                    arguments,
                    'Must provide lock token for WebDAV unlock operation.');

        return;
    }

    headers.atPut('Lock-Token', '<' + locktoken + '>');

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('webdavVersionControl',
function(targetUrl, aRequest) {

    /**
     * @name webdavVersionControl
     * @synopsis Creates a versioned controlled WebDAV resource at the target
     *     URL specified.
     * @param {String} targetUrl The request's target URL.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     additional parameters.
     * @returns {XMLHttpRequest} The native XMLHttpRequest object used for the
     *     request.
     * @todo
     */

    var request;

    request = TP.ifInvalid(aRequest, TP.hc());

    //  make sure we're aiming the desired target/operation
    request.atPut('verb', TP.WEBDAV_VERSIONCONTROL);

    //  call our standardized TP.webdevCall() routine to actually talk to
    //  the server
    return TP.webdavCall(targetUrl, request);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
