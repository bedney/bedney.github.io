//  ========================================================================
/*
NAME:   TP.sig.SOAPRequest.js
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

/**
 * @type {TP.sig.SOAPRequest}
 * @synopsis Signal/request type for SOAP messaging.
 */

//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.defineSubtype('SOAPRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.SOAPRequest.Type.defineAttribute('responseType', 'TP.sig.SOAPResponse');

//  ------------------------------------------------------------------------
//  Delegated Methods
//  ------------------------------------------------------------------------

TP.backstop(TP.ac('getFaultActor', 'getFaultDetails'),
            TP.sig.SOAPRequest.getInstPrototype(), true);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.SOAPRequest.Inst.defineMethod('asSOAPBody',
function(aRequest) {

    /**
     * @name asSOAPBody
     * @synopsis Formats the receiver as the body of a SOAP message. The
     *     resulting data can then be injected into a viable SOAP Body container
     *     for transmission. NOTE that to avoid any issues with namespace URIs
     *     its preferable to produce only the content of the <soap:Body>, not
     *     the Body itself.
     * @param {TP.sig.Request} aRequest The request to format for.
     * @returns {String} A viable SOAP payload in string form.
     */

    var request,
        body,
        node;

    //  default for a request is the request itself
    request = aRequest || this;

    //  no body? no params
    body = this.at('body');
    if (TP.notValid(body)) {
        return;
    }

    //  various types may encode differently based on the specific SOAP
    //  services they're intended to target
    if (TP.canInvoke(body, 'asSOAPBody')) {
        return body.asSOAPBody(request);
    }

    //  all other objects should be converted to viable XML and then into a
    //  reasonable string
    if (TP.isNode(body)) {
        node = body;
    } else if (TP.canInvoke(body, 'getNativeNode')) {
        node = body.getNativeNode();
    } else {
        node = TP.node(body);
        if (TP.notValid(node)) {
            this.raise('TP.sig.InvalidSOAPContent',
                        arguments,
                        'Unable to convert request body to XML.');
            return;
        }
    }

    return TP.isNode(node) ? TP.str(node) : null;
});

//  ------------------------------------------------------------------------

TP.sig.SOAPRequest.Inst.defineMethod('asSOAPMessage',
function() {

    /**
     * @name asSOAPMessage
     * @synopsis Returns the request object in XML format appropriate for use as
     *     an SOAP payload. This method is useful for processing SOAP requests
     *     as well as in leveraging other communication pathways to tunnel SOAP
     *     payloads (or for debugging).
     * @description Transforms the receiver into a viable SOAP message node. The
     *     'usenil' key, if any, in the receiver's payload defines whether a
     *     non-standard <nil/> is used when a parameter value is null/undefined.
     * @returns {Node} A valid SOAP message payload.
     */

    var arr,
        body;

    arr = TP.ac();

    //  TODO: The 'XML Schema' and 'XML Schema Instance' namespace URIs are
    //  different here than those defined in the kernel. Verify that these
    //  are correct.
    arr.push('<soap:Envelope ',
                'xmlns:soap="http://www.w3.org/2003/05/soap-envelope" ',
                'xmlns:xsi="http://www.w3.org/1999/XMLSchema-instance" ',
                'xmlns:xsd="http://www.w3.org/1999/XMLSchema">');

    //  produce any params element necessary based on body slot content
    body = TP.str(TP.ifInvalid(this.asSOAPBody(this), ''));

    //  optionally add body based on whether we see soap:Body
    if (body.indexOf('soap:Body') === TP.NOT_FOUND) {
        arr.push('<soap:Body>');
    }

    //  add the actual body content
    arr.push(body);

    //  close off body as needed
    if (body.indexOf('soap:Body') === TP.NOT_FOUND) {
        arr.push('</soap:Body>');
    }

    //  close off the envelope
    arr.push('</soap:Envelope>');

    return TP.node(arr.join(''));
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
