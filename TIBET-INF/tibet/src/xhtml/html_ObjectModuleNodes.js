//  ========================================================================
/*
NAME:   html_ObjectModuleNodes.js
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
//  TP.html.audio (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.audio}
 * @synopsis 'audio' tag. Embedded audio.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('audio');

//  ========================================================================
//  TP.html.canvas (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.canvas}
 * @synopsis A subtype of TP.html.Attrs that manages HTML Canvas objects.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('canvas');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.html.canvas.Type.defineConstant('TWO_D_CONTEXT_PROPERTY_NAMES',
        TP.ac(
            //  back-reference to canvas
            'canvas',
            //  compositing
            'globalAlpha', 'globalCompositeOperation',
            //  colors and styles
            'strokeStyle', 'fillStyle',
            //  line caps/joins
            'lineWidth', 'lineCap', 'lineJoin', 'miterLimit',
            //  shadows
            'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'shadowColor',
            //  text
            'font', 'textAlign', 'textBaseline'
            ));
TP.html.canvas.Type.defineConstant('TWO_D_CONTEXT_METHOD_NAMES',
        TP.ac(
            //  state
            'save', 'restore',
            //  transformations
            'scale', 'rotate', 'translate', 'transform', 'setTransform',
            //  colors and styles
            'createLinearGradient', 'createRadialGradient', 'createPattern',
            //  rects
            'clearRect', 'fillRect', 'strokeRect',
            //  paths
            'beginPath', 'closePath', 'moveTo', 'lineTo',
                'quadraticCurveTo', 'bezierCurveTo', 'arcTo', 'rect', 'arc',
                'fill', 'stroke', 'clip', 'isPointInPath',
            //  drawing images
            'drawImage',
            //  pixel manipulation
            'createImageData', 'getImageData', 'putImageData',
            //  text
            'fillText', 'strokeText'
            ));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('toDataURL',
function(type) {

    /**
     * @name toDataURL
     * @synopsis Returns the data which contains a representation of the canvas
     *     as an image.
     * @param {String} type The MIME type indicating which data type to return.
     * @returns {String} The image data.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.toDataURL(type);
});

//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('get2DContext',
function() {

    /**
     * @name get2DContext
     * @synopsis Returns the receiver's '2D graphics context'.
     * @returns {Object} The receiver's 2D graphics context.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.getContext('2d');
});

//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('getContext',
function(contextId) {

    /**
     * @name getContext
     * @synopsis Returns the receiver's graphics context matching the supplied
     *     context id.
     * @param {String} contextId The ID of the context to fetch.
     * @returns {Object} The receiver's matching graphics context.
     * @raise TP.sig.InvalidNode
     * @todo
     */

    var node;

    if (TP.notValid(node = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    return node.getContext(contextId);
});

//  ------------------------------------------------------------------------
//  DNU/Backstop
//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('canResolveDNU',
function(anOrigin, aMethodName, anArgArray, aContext) {

    /**
     * @name canResolveDNU
     * @synopsis Provides an instance that has triggered DNU machinery with an
     *     opportunity to handle the problem itself.
     * @param {Object} anOrigin The object asking for help. The receiver in this
     *     case.
     * @param {String} aMethodName The method name that failed.
     * @param {arguments} anArgArray Optional arguments to function.
     * @param {Function|Context} aContext The calling context.
     * @returns {Boolean} TRUE means resolveDNU() will be called. FALSE means
     *     the standard DNU machinery will continue processing. The default is
     *     TRUE for TP.core.Node subtypes.
     * @todo
     */

    //  If the method name is in the list of method names that a 2D context
    //  (which is the object that we will redispatch to) can respond to,
    //  then we return true.
    if (this.getType().TWO_D_CONTEXT_METHOD_NAMES.contains(aMethodName)) {
        return true;
    }

    //  Couldn't find it in our list. Call up the chain.
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('resolveDNU',
function(anOrigin, aMethodName, anArgArray, aContext) {

    /**
     * @name resolveDNU
     * @synopsis Invoked by the main DNU machinery when the instance has
     *     responded TRUE to canResolveDNU() for the parameters given.
     * @description Handles resolution of methods which have triggered the
     *     inferencer. For TP.core.Window the resolution process is used in
     *     conjunction with method aspects to allow the receiver to translate
     *     method calls.
     * @param {Object} anOrigin The object asking for help.
     * @param {String} aMethodName The method name that failed.
     * @param {arguments} anArgArray Optional arguments to function.
     * @param {Function|Context} aContext The calling context.
     * @returns {Object} The result of invoking the method using the native
     *     window object.
     * @todo
     */

    var the2DContext,
        func;

    //  Make sure that we can obtain a valid 2D context. Without that, we're
    //  going nowhere.
    if (TP.notValid(the2DContext = this.get2DContext())) {
        return this.raise('TP.sig.InvalidContext', arguments);
    }

    try {
        if (!TP.isCallable(func = the2DContext[aMethodName])) {
            return this.raise('TP.sig.InvalidFunction', arguments);
        }
    } catch (e) {
        return this.raise('TP.sig.InvalidFunction', arguments, TP.ec(e));
    }

    //  If there weren't any arguments in the arg array, then we have only
    //  to call the func.
    if (TP.notValid(anArgArray) || (anArgArray.length === 0)) {
        //  Return the execution of the func
        return the2DContext.func();
    }

    //  Return the application of the func using the array of arguments as
    //  the argument array for  invocation.
    return func.apply(the2DContext, anArgArray);
});

//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('$get',
function(attributeName) {

    /**
     * @name $get
     * @synopsis Primitive $get() hook. Allows instances of this type to look up
     *     globals on their 2D context if a value for the attribute cannot be
     *     found on the receiver itself.
     * @param {String} attributeName The name/key of the attribute to return.
     * @returns {Object} 
     * @raise TP.sig.InvalidContext
     * @todo
     */

    var val,
        the2DContext;

    //  Start by looking for the attribute (or a method) on this object.
    val = this.callNextMethod();

    //  If we got back an undefined value, then try to see if its a 'slot'
    //  on our content window (very useful if we've loaded our content
    //  window with other code bases).
    if (TP.notDefined(val)) {
        //  Make sure that we can obtain a valid 2D context. Without that,
        //  we're going nowhere.
        if (TP.notValid(the2DContext = this.get2DContext())) {
            return this.raise('TP.sig.InvalidContext', arguments);
        }

        val = the2DContext[attributeName];
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.html.canvas.Inst.defineMethod('$set',
function(attributeName, attributeValue) {

    /**
     * @name $set
     * @synopsis Primitive $set() hook. Allows instances of this type to set
     *     globals on their 2D context if the attribute cannot be found on the
     *     receiver itself.
     * @param {String} attributeName The attribute to set.
     * @param {Object} attributeValue The value to set it to.
     * @returns {Object} 
     * @raise TP.sig.InvalidContext
     * @todo
     */

    var the2DContext;

    //  If the attribute name is not in the list of property names that a 2D
    //  context (which is the object that we will redispatch to) can respond
    //  to, then we return the result of calling up our chain.
    if (!this.getType().TWO_D_CONTEXT_PROPERTY_NAMES.contains(attributeName)) {
        return this.callNextMethod();
    }

    //  Make sure that we can obtain a valid 2D context. Without that, we're
    //  going nowhere.
    if (TP.notValid(the2DContext = this.get2DContext())) {
        return this.raise('TP.sig.InvalidContext', arguments);
    }

    the2DContext[attributeName] = attributeValue;

    return attributeValue;
});

//  ========================================================================
//  TP.html.embed (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.embed}
 * @synopsis 'embed' tag. Embedded object.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('embed');

TP.html.embed.set('uriAttrs', TP.ac('src'));

//  ========================================================================
//  TP.html.object
//  ========================================================================

/**
 * @type {TP.html.object}
 * @synopsis 'object' tag. Embedded object.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('object');

TP.html.object.isAbstract(true);

TP.html.object.set('uriAttrs', TP.ac('classid', 'codebase', 'usemap', 'data'));

//  ------------------------------------------------------------------------

TP.html.object.Type.defineMethod('getConcreteType',
function(aNodeOrId) {

    /**
     * @name getConcreteType
     * @synopsis Returns the subtype to use for the node provided. Note that for
     *     TP.html.object elements the specific type returned is based on the
     *     value of the type attribute.
     * @param {Node|String} aNodeOrId The native node to wrap or an ID used to
     *     locate it.
     * @returns {TP.lang.RootObject.<TP.html.object>} A TP.html.object subtype
     *     type object.
     */

    var type;

    if (TP.isString(aNodeOrId)) {
        return TP.byOID(aNodeOrId);
    }

    type = TP.ietf.Mime.get('info').at(
            TP.elementGetAttribute(aNodeOrId, 'type')).at('objectNodeType');

    return type.asType();
});

//  ========================================================================
//  TP.html.param
//  ========================================================================

/**
 * @type {TP.html.param}
 * @synopsis 'param' tag. Applet parameter.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('param');

//  ========================================================================
//  TP.html.source (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.source}
 * @synopsis 'source' tag. Video or audio source.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('source');

TP.html.source.set('uriAttrs', TP.ac('src'));

//  ========================================================================
//  TP.html.video (HTML 5)
//  ========================================================================

/**
 * @type {TP.html.video}
 * @synopsis 'video' tag. Embedded video.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('video');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
