//  ========================================================================
/*
NAME:   TP.goog.GoogleContactsService.js
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
 * @type {TP.goog.GoogleContactsService}
 * @synopsis A subtype of GoogleService that communicates with the Google-hosted
 *     Google Contacts server.
 * @example If the TP.goog.GoogleContactsRequest / TP.sig.GoogleContactsResponse
 *     processing model is used, it is unnecessary to manually set up an
 *     TP.goog.GoogleContactsService. As part of the TIBET infrastructure of
 *     using request/response pairs, a 'default' instance of this service will
 *     be instantiated and registered to handle all
 *     TP.goog.GoogleContactsRequests.
 *     
 *     This 'default' instance of the service will be registered with the
 *     system under the name 'TP.goog.GoogleContactsServiceDefault'. It should
 *     have a vCard entry in the currently executing project (with an 'FN' of
 *     'TP.goog.GoogleContactsServiceDefault'). If this vCard cannot be found,
 *     the user will be prompted to enter the information about the default
 *     server. If only part of the information is found the user can be prompted
 *     to enter the missing information.
 *     
 *     It is possible, however, to manually set up a server. To do so, simply
 *     instantiate a server:
 *     
 *     contactsService = TP.goog.GoogleContactsService.construct(
 *     'GoogleContactsTestServer');
 *     
 *     Or have a vCard entry where the 'FN' entry matches the resource ID that
 *     is passed to the 'construct' call as detailed here:
 *     
 *     E.g.
 *     
 *     Parameter vCard entry ----------- ----------- resourceID
 *     <FN>GoogleContactsTestServer</FN>
 *     
 *     and then construct it using:
 *     
 *     contactsService = TP.goog.GoogleContactsService.construct(
 *     'GoogleContactsTestServer');
 *     
 *     You will then need to register your service instance so that it services
 *     TP.goog.GoogleContactsRequests (otherwise, the TIBET machinery will
 *     instantiate the 'default' instance of TP.goog.GoogleContactsService as
 *     described above and register it to service these kinds of requests):
 *     
 *     contactsService.register();
 * @todo
 */

//  ------------------------------------------------------------------------

TP.goog.GoogleService.defineSubtype('GoogleContactsService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.goog.GoogleContactsService.Type.defineAttribute(
                        'triggerSignals', 'TP.sig.GoogleContactsRequest');

//  We basically ignore serviceURI, auth and iswebdav for Contacts, but
//  we need to give them values to avoid prompting on service creation.
TP.goog.GoogleContactsService.Type.defineAttribute('defaultedParameters',
                TP.hc('serviceURI', TP.NONE,
                        'auth', TP.NONE,
                        'iswebdav', false));

TP.goog.GoogleContactsService.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.goog.GoogleContactsService.Inst.defineMethod('finalizeRequest',
function(aRequest) {

    /**
     * @name finalizeRequest
     * @synopsis Perform any final updates or processing on the request to make
     *     sure it is ready to send to TP.httpCall() for processing.
     * @param {TP.goog.GoogleContactsRequest} aRequest The request being
     *     finalized.
     * @returns {TP.goog.GoogleContactsRequest} The request to send. NOTE that
     *     this may not be the original request.
     */

    var params;

    //  All requests to Google Contacts are async...
    aRequest.atPut('async', true);

    params = aRequest.atPutIfAbsent('uriparams', TP.hc());

    switch (aRequest.at('action')) {
        case 'login':

            //  All GData service logins require us to 'stamp in' the
            //  service we're requesting access to - in this case, 'cp' for
            //  Google Contacts.
            params.atPut('service', 'cp');

        break;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.goog.GoogleContactsService.Inst.defineMethod('rewriteRequestURI',
function(aRequest) {

    /**
     * @name rewriteRequestURI
     * @synopsis Rewrites the request's URI.
     * @param {TP.goog.GoogleContactsRequest} aRequest The request to rewrite.
     * @returns {TP.core.URI} The new/updated URI instance.
     */

    switch (aRequest.at('action')) {
        case 'fetchContacts':

            return 'http://www.google.com/m8/feeds/contacts/' +
                                            aRequest.at('userEmail') +
                                            '/full';
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.goog.GoogleContactsService.Inst.defineMethod('rewriteRequestVerb',
function(aRequest) {

    /**
     * @name rewriteRequestVerb
     * @synopsis Returns the HTTP verb to use for the request. For Contacts
     *     requests, this varies depending on operation.
     * @param {TP.goog.GoogleContactsRequest} aRequest The request whose
     *     parameters define the HTTP request.
     * @returns {Constant} A TIBET HTTP Verb constant such as TP.HTTP_GET.
     */

    switch (aRequest.at('action')) {
        case 'fetchContacts':

            return TP.HTTP_GET;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
