//  ========================================================================
/*
NAME:   ev_script.js
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
 * @type {TP.ev.script}
 * @synopsis Provides a mechanism for supporting script blocks that conform to
 *     those found in the XML Events 2 examples (and hence some XForms examples)
 *     in which script blocks are targeted as handlers. Note however that in
 *     TIBET the default type for an TP.ev.script block is TIBET Shell, not
 *     JavaScript so to use an TP.ev.script tag with javascript you use
 *     type="text/javascript".
 * @todo
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('ev:script');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.ev.script.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @name tshExecute
     * @synopsis Runs the receiver, effectively invoking its action.
     * @description For this type, this method invokes the script content of the
     *     receiver. The content should have been encapsulated in a CDATA block
     *     to avoid potential problems with entity encoding.
     * @param {TP.sig.Request} aRequest The TP.sig.TSHRunRequest or other shell
     *     related request responsible for this tag.
     * @returns {Constant} A TSH shell loop control constant.
     */

    var node,

        funcID,
        win,
        result,

        src,
        source,
        url,
        type,
        req,
        
        shell,
        
        signal;

    node = aRequest.at('cmdNode');

    //  see if we've been able to build a cached function for this script
    //  block on a prior invocation. if so we'll call that directly
    if (TP.notEmpty(funcID =
                    TP.elementGetAttribute(node, 'tibet:function', true))) {
        //  caching is done on the node's native window (if it has one) or
        //  on the current TIBET code window
        win = TP.nodeGetWindow(node) || window;
        if (TP.canInvoke(win, funcID)) {
            try {
                result = win[funcID](aRequest, aRequest.at('cmdTrigger'));

                return aRequest.complete(result);
            } catch (e) {
                return aRequest.fail(
                        TP.FAILURE,
                        TP.join('Error executing TP.ev.script function: ',
                            this.asString()),
                        'EvalException');
            }
        }
    }

    //  See if an external 'src' URI has been defined. this is equivalent to the
    //  src attribute of a standard html:script tag
    src = TP.elementGetAttribute(node, 'ev:src', true);
    if (TP.isEmpty(src)) {
        source = TP.nodeGetTextContent(node);
    } else {
        //  when we have a src attribute our goal is to get the text content of
        //  that URI so we can process it
        if (TP.notValid(url = TP.uc(src))) {
            return aRequest.fail(
                    TP.FAILURE,
                    'Invalid src attribute value: ' + src);
        }

        source = url.getResourceText(TP.hc('async', false));
    }

    if (TP.isEmpty(source)) {
        return aRequest.fail('No source code found for: ' + TP.str(node));
    }

    //  Check on the type of source, we support both text/javascript and TSH
    //  syntax with this tag but we default to TSH...otherwise you'd have likely
    //  been using an html:script tag right? ;)
    type = TP.ifEmpty(TP.elementGetAttribute(node, 'ev:type', true),
                        TP.ietf.Mime.TSH);

    if (type === TP.ietf.Mime.TSH) {
        //  TSH source, if already processed, can be managed by the current
        //  request if we can get it into child content where TP.DESCEND could
        //  work effectively, otherwise we need to process it in a full
        //  subrequest and join to that for result processing.

        req = TP.sig.ShellRequest.construct(
            TP.hc('cmd', source,
                    'cmdAsIs', aRequest.at('cmdAsIs'),
                    'cmdExecute', true,
                    'cmdHistory', false,
                    'cmdInteractive', false,
                    'cmdLiteral', aRequest.at('cmdLiteral'),
                    'cmdPhases', 'nocache',
                    'cmdShell', aRequest.at('cmdShell'),
                    'cmdSilent', true,
                    'execContext',
                        TP.ifInvalid(TP.nodeGetWindow(node), window)
            ));

        shell = aRequest.at('cmdShell');

        req.defineMethod('cancelJob',
            function(aFaultCode, aFaultString) {

                //  Make sure to unset the variable on the shell that contains
                //  the signal that fired us.
                shell.unsetVariable('SIGNAL');
                shell.unsetVariable('TARGET');

                return aRequest.cancel(
                    TP.ifInvalid(aFaultCode, TP.FAILURE),
                    TP.ifInvalid(aFaultString, 'TP.ev.script cancelled.'));
            });

        req.defineMethod('completeJob',
            function(aResult) {

                //  Make sure to unset the variable on the shell that contains
                //  the signal that fired us.
                shell.unsetVariable('SIGNAL');
                shell.unsetVariable('TARGET');

                if (arguments.length > 0) {
                    return aRequest.complete(aResult);
                } else {
                    return aRequest.complete();
                }
            });

        req.defineMethod('failJob',
            function(aFaultCode, aFaultString) {

                //  Make sure to unset the variable on the shell that contains
                //  the signal that fired us.
                shell.unsetVariable('SIGNAL');
                shell.unsetVariable('TARGET');

                return aRequest.fail(
                        TP.ifInvalid(aFaultCode, TP.FAILURE),
                        TP.ifInvalid(aFaultString, 'TP.ev.script failed.'));
            });

        //  Configure STDIO that any nested command operations will output to
        //  the location(s) we desire we connect our IO to the subrequest.
        req.configureSTDIO(aRequest);

        //  ensure we map the action input we want/need for STDIN.
        req.atPut(TP.STDIN, this.getActionInput(aRequest));

        //  Set a variable on the shell that will contain the signal that fired
        //  us.
        if (TP.isValid(signal = aRequest.at('cmdTrigger'))) {
            shell.setVariable('SIGNAL', signal);
            shell.setVariable('TARGET', signal.getTarget());
        }

        shell.handleShellRequest(req);
    } else if (type === TP.ietf.Mime.JS) {
        //  Build a function and cache it on the receiver's window, updating the
        //  node to hold it's ID for next time
        funcID = TP.genID('ev_script');
        source = 'function(shellRequest, triggerSignal) {' + source + '};';

        try {
            //  NOTE that by running the eval here in the window context we'll
            //  build the function such that its internal references
            //  to window/document are proper
            win = TP.nodeGetWindow(node) || window;
            /* jshint -W061 */
            eval('win.$$handler = ' + source);
            /* jshint +W061 */
            win[funcID] = win.$$handler;
        } catch (e) {
            return aRequest.fail(
                TP.FAILURE,
                TP.join('Error creating TP.ev.script function: ',
                        source, '. ', TP.str(e)));
        }

        //  Cache the 'function ID' back on the element so that it can be used
        //  above for lookup and we won't eval the code again.
        TP.elementSetAttribute(node, 'tibet:function', funcID, true);

        try {
            result = win[funcID](aRequest, aRequest.at('cmdTrigger'));

            aRequest.complete(result);
        } catch (e) {
            return aRequest.fail(
                    TP.FAILURE,
                    TP.join('Error executing TP.ev.script function: ',
                            this.asString()),
                            'EvalException');
        }
    } else {
        return aRequest.fail(
                TP.FAILURE,
                TP.join('Invalid TP.ev.script source type: ', type));
    }

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
