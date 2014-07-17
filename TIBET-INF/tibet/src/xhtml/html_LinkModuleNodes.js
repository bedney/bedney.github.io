//  ========================================================================
/*
NAME:   html_LinkModuleNodes.js
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
//  TP.html.link
//  ========================================================================

/**
 * @type {TP.html.link}
 * @synopsis 'link' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('link');

TP.html.link.set('uriAttrs', TP.ac('href'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.link.Type.defineMethod('tshPrecompile',
function(aRequest) {

    /**
     * @name tshPrecompile
     * @synopsis Replaces the link element with a css:style element suitable for
     *     compiling or otherwise processing the CSS.
     * @param {aRequest} TP.sig.Request The request containing parameters.
     */

    var node,
        href,
        url,
        content,
        str,
        newNode;

    TP.debug('break.css_processing');

    //  wall off conversion of TP.html.link elements so the css processing
    //  pipeline never gets off the ground.
    if (!TP.sys.cfg('css.process_styles')) {
        return TP.CONTINUE;
    }

    if (TP.notValid(node = aRequest.at('cmdNode'))) {
        return aRequest.fail(TP.FAILURE, 'Unable to find command node');
    }

    href = node.href || TP.elementGetAttribute(node, 'href');
    if (TP.isEmpty(href)) {
        return aRequest.fail(TP.FAILURE,
            'TP.html.link must have href attribute.',
            'TP.sig.InvalidElement');
    }

    //  Make sure that the href is resolved against the xml:base
    href = TP.uriJoinPaths(
            TP.elementComputeXMLBaseFrom(node),
            href);

    url = TP.uc(href);
    if (TP.notValid(url)) {
        return aRequest.fail(TP.FAILURE,
            'TP.html.link href not a valid URI.',
            'TP.sig.InvalidURI');
    }

    //  bring in the content, inline it, and create an equivalent style node
    //  with annotations we can leverage for normalizing embedded imports
    //  and other url() references
    content = url.getResourceText(TP.hc('async', false));

    //str = TP.join('<css:sheet type="link" src="', href, '" ',
        //'xmlns:css="', TP.w3.Xmlns.CSSML, '"/>');
    str = TP.join('<html:style type="text/css" src="', href, '" ',
        'xmlns:html="', TP.w3.Xmlns.XHTML, '"><![CDATA[',
        content,
        ']]></html:style>');

    newNode = TP.nodeFromString(str);
    if (TP.notValid(newNode)) {
        return aRequest.fail(TP.FAILURE,
            'TP.html.link href not a valid URI.',
            'Unable to create new css:sheet node from :' + str,
            'TP.sig.InvalidNode');
    }

    //  Replace the link element with our new style element, then
    //  reset to Include so the style element can process @import
    //  rules etc. NOTE that we _must_ update the cmdNode to be sure
    //  that the old link element doesn't continue to be processed.
    newNode = TP.nodeReplaceChild(node.parentNode, newNode, node);

    return newNode;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
