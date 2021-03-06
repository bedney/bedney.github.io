//  ========================================================================
/*
NAME:   tsh_uri.js
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
 * @type {TP.tsh.uri}
 * @synopsis Provides support for the TIBET Shell (TSH) processing of URIs for
 *     input and output redirection and piping.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:uri');

TP.tsh.uri.addTraitsFrom(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.uri.Type.defineMethod('cmdAddContent',
function(aRequest) {

    /**
     * @name cmdAddContent
     * @synopsis Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using an
     *     appending operation such as .>>.
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.uri.Type.defineMethod('cmdFilterInput',
function(aRequest) {

    /**
     * @name cmdFilterInput
     * @synopsis Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to filter standard input using a
     *     filter operation such as .|?.
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.uri.Type.defineMethod('cmdGetContent',
function(aRequest) {

    /**
     * @name cmdGetContent
     * @synopsis Invoked by the TSH when the receiver is the data source for a
     *     command sequence which is piping data from the receiver.
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.uri.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @name cmdRunContent
     * @synopsis Runs the receiver, effectively invoking its action. For
     *     TP.tsh.uri this method is responsible for dispatching all the
     *     variations of pipe methods which are suitable for use with a URI.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     */

    var shell,
        node,
        body,

        href,
        url,

        params,
        stdin,

        attrs,
        len,
        i,
        item,
        name,
        value,
        resolvedValue;

    TP.debug('break.tsh_uri');

    shell = aRequest.at('cmdShell');

    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.showDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debug_resolve', null, false)) {
        return this.showDebug(aRequest, true, true);
    }

    node = aRequest.at('cmdNode');
    body = TP.nodeGetTextContent(node);

    //  during desugaring we place the original href value into a 'tsh:'
    //  prefixed href parameter for easier filtering. If this parameter
    //  isn't found this isn't a valid URI tag.

    //  NB: Note how we supply 'null' as a default value for 'tsh:href'
    href = shell.getArgument(aRequest, 'tsh:href', null, true);
    if (TP.isEmpty(href)) {
        aRequest.fail(TP.FAILURE, 'Invalid href for URI');

        return;
    }

    //  presuming we have an href value we need to confirm we can construct
    //  a viable URI instance from it. If not then we've got another error.
    url = TP.uc(href);
    if (TP.notValid(url)) {
        aRequest.fail(TP.FAILURE, 'Badly formed href for URI');

        return;
    }

    //  URI is the only parameter we rename beyond simply removing the
    //  tsh: prefixing, so construct the base parameter hash with that
    //  one.
    params = TP.hc('uri', href);

    //  all parameters should be named, those with tsh: prefixes are used
    //  by the enclosing request.
    attrs = shell.getArguments(aRequest).getItems();
    len = attrs.getSize();
    for (i = 0; i < len; i++) {
        item = attrs.at(i);
        name = item.first();
        value = item.last();

        switch (name) {
            case 'tsh:href':
                //  Already processed.
                break;
            case 'tsh:async':
                params.atPut('async', TP.bc(value));
                break;
            case 'tsh:pipe':
                params.atPut('pipe', value);
                break;
            case 'tsh:refresh':
                params.atPut('refresh', TP.bc(value));
                break;
            case 'tsh:verb':
                params.atPut('verb', value.toUpperCase());
                break;
            default:

                //  We don't process 'tsh:' arguments beyond the ones handled
                //  above, nor do we process the 'ARGV' 'special' argument.
                if (/^(tsh:|ARGV)/.test(name)) {
                    continue;
                }

                resolvedValue = shell.resolveObjectReference(value, aRequest);

                params.atPut(name, resolvedValue);

                break;
        }
    }

    //  if there is an explicit body set via something like .[[ content .]]
    //  then we capture that as the content of the impending request. inline
    //  content is always processed first, then potentially overwritten by
    //  input redirections and/or piping of stdio.
    if (TP.notEmpty(body)) {
        params.atPut('body', body);

        //  when provided with inline content the first step is always to
        //  set that as the new content for the URI
        url.setResource(body);
    }

    //  inline content can be overwritten by input redirection provided
    //  there was an input redirect or "here document" for the new content.
    //  Note that there could potentially be multiples here...and the last
    //  one wins up through a maximum of 9.
    i = 9;
    stdin = aRequest.stdin();
    while (i > 0) {
        body = stdin.at(i);
        if (TP.isValid(body)) {
            params.atPut('body', body);
            url.setResource(body);
            break;
        }
        i--;
    }

    //  Now that we've gathered all of the parameters and the body, call the core
    //  TP.core.URI's 'cmdRunContent' manually to do the work.

    //  First, though, put the URL instance that we've generated so that
    //  cmdRunContent (a type method) can find it and use it.
    aRequest.atPut('cmdInstance', url);

    //  Also, supply any parameters that we've captured on the command line or
    //  in our body with a unique key that tells that method where these
    //  parameters are coming from.
    aRequest.atPut('TP.tsh.uri.params', params);

    //  Call cmdRunContent and supply the kind of redirection that was supplied
    //  (if any). This will be one of: TP.GET, TP.SET, TP.FILTER, TP.TRANSFORM,
    //  TP.ADD or TP.NONE.
    TP.core.URI.cmdRunContent(aRequest, TP.wrap(node).getRedirectionType());

    return;
});

//  ------------------------------------------------------------------------

TP.tsh.uri.Type.defineMethod('cmdSetContent',
function(aRequest) {

    /**
     * @name cmdSetContent
     * @synopsis Invoked by the TSH when the receiver is the data sink for a
     *     command sequence which is piping data to the receiver using a simple
     *     set operation such as .>
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.uri.Type.defineMethod('cmdTransformInput',
function(aRequest) {

    /**
     * @name cmdTransformInput
     * @synopsis Invoked by the TSH when the receiver is a segment in a pipe
     *     where the implied operation is to transform standard input using a
     *     simple transform operation such as .|
     * @description On this type, this method merely invokes 'cmdRunContent'
     *     against the receiver.
     * @param {TP.sig.Request} aRequest The shell request being processed.
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------

TP.tsh.uri.Type.defineMethod('tshCompile',
function(aRequest) {

    /**
     * @name tshCompile
     * @synopsis Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Array} An array containing the new node and a TSH loop control
     *     constant, TP.DESCEND by default.
     * @todo
     */

    var node,
        newNode;

    //  Don't copy attributes with defaulting of namespaces, just leave them
    //  as they were input.
    node = aRequest.at('cmdNode');
    newNode = TP.elementBecome(
                    node,
                    'code',
                    TP.hc('class', 'tibet-action'),
                    TP.w3.Xmlns.XHTML,
                    false);         //   THIS IS KEY, PRESERVES URIPARAMS.

    return TP.ac(newNode, TP.DESCEND);
});

//  ------------------------------------------------------------------------

TP.tsh.uri.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @inheritDoc 
     * @todo
     */

    return this.cmdRunContent(aRequest);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
