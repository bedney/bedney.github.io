//  ========================================================================
/*
NAME:   TIBETCSSTypes.js
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

//  ========================================================================
//  TP.core.CSSPropertyTransition
//  ========================================================================

/**
 * @type {TP.core.CSSPropertyTransition}
 * @synopsis A subtype (abstract) of TP.core.ObjectPropertyTransition that
 *     supplies some common methods for animating CSS properties. This type can
 *     also capture the property name, a property prefix and a property suffix
 *     as instance variables.
 */

//  ------------------------------------------------------------------------

TP.core.ObjectPropertyTransition.defineSubtype('CSSPropertyTransition');

//  This is an abstract type.
TP.core.CSSPropertyTransition.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.CSSPropertyTransition.Type.defineMethod('getConcreteType',
function(params) {

    /**
     * @name getConcreteType
     * @synopsis Returns the type to use for a particular transition.
     * @param {TP.lang.Hash} params A TP.lang.Hash of the following job control
     *     parameters: delay, interval, limit, count, compute, freeze.
     * @returns {TP.lang.RootObject.<TP.core.CSSProperty>} A TP.core.CSSProperty
     *     subtype type object.
     */

    var propertyName;

    propertyName = params.at('property');

    if (TP.CSS_COLOR_PROPERTIES.contains(propertyName)) {
        return TP.core.CSSColorTransition;
    }

    if (TP.CSS_LENGTH_PROPERTIES.contains(propertyName)) {
        return TP.core.CSSLengthTransition;
    }

    if (TP.CSS_UNITLESS_PROPERTIES.contains(propertyName)) {
        return TP.core.CSSValueTransition;
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.CSSPropertyTransition.Inst.defineAttribute('styleProperty');

TP.core.CSSPropertyTransition.Inst.defineAttribute('propPrefix');
TP.core.CSSPropertyTransition.Inst.defineAttribute('propSuffix');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CSSPropertyTransition.Inst.defineMethod('init',
function(controlParams, stepParams) {

    /**
     * @name init
     * @synopsis Initialize the instance.
     * @description Parameters supplied in the controlParams TP.lang.Hash for
     *     this method override any setting for the receiving transition. If a
     *     parameter value isn't supplied for a particular parameter, the
     *     receiving transition type will be queried via a 'get*()' method (i.e.
     *     get('limit'), get('count'), etc.) for a 'built-in' value. Note that
     *     the step params TP.lang.Hash is optional and may not be available,
     *     especially if this job is meant to be invoked repeatedly.
     * @param {TP.lang.Hash} controlParams A TP.lang.Hash of the following job
     *     control parameters: delay, interval, limit, count, compute, freeze.
     * @param {TP.lang.Hash} stepParams A TP.lang.Hash of the following job
     *     step parameters: target, property.
     * @returns {TP.core.CSSPropertyTransition} A new instance.
     * @todo
     */


    var newInst;

    newInst = this.callNextMethod();

    //  If a TP.core.Job couldn't be constructed, we may have gotten here.
    if (TP.notValid(newInst)) {
        return;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.CSSPropertyTransition.Inst.defineMethod('clearValues',
function(params) {

    /**
     * @name clearValues
     * @synopsis Clears the values for the targets given the property name.
     * @param {TP.lang.Hash} params The 'step parameters' supplied to the job.
     */

    var theTargets,
        theProperty,

        dummyVal;

    if (TP.isEmpty(theTargets = params.at('target'))) {
        return;
    }

    if (TP.isEmpty(theProperty = params.atIfInvalid('property',
                                                this.get('styleProperty')))) {
        return;
    }

    if (TP.isArray(theTargets)) {
        theTargets.perform(
            function(aTarget) {

                TP.elementClearStyleProperty(aTarget, theProperty);
            });

        //  Make sure that any drawing that needed to 'flush' to the window
        //  does so.
        dummyVal = TP.documentGetBody(TP.nodeGetDocument(
                                        theTargets.first())).offsetHeight;
    } else {
        TP.elementClearStyleProperty(theTargets, theProperty);
        dummyVal = TP.documentGetBody(TP.nodeGetDocument(
                                        theTargets)).offsetHeight;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.CSSPropertyTransition.Inst.defineMethod('constructWorkFunction',
function(transitionJob) {

    /**
     * @name constructWorkFunction
     * @synopsis Sets up a 'specialized' work function for transitions, since on
     *     some browsers its necessary to tweak the body's offsetHeight in order
     *     to get the transition to redraw.
     * @param {TP.core.Job} transitionJob The transition job that the work
     *     function will be used in.
     * @returns {Function} A new transition work function.
     */

    var step,
        func;

    //  grab the actual step function(s) so we can close around them
    step = transitionJob.$get('step');

    //  a simple wrapper around a potential set of functions which
    //  allows them all to run as a single work function.
    func = function(job, params) {

        var dummyVal;

        TP.isCallable(step) ?
                    job.wasSuccessful = step(job, params) :
                    job.wasSuccessful = step.apply(null, arguments);

        if (TP.notValid(func.targetBody)) {
            if (TP.isArray(params.at('target'))) {
                func.targetBody =
                    TP.documentGetBody(TP.nodeGetDocument(
                                            params.at('target').first()));
            } else {
                func.targetBody =
                    TP.documentGetBody(TP.nodeGetDocument(
                                            params.at('target')));
            }
        }

        dummyVal = func.targetBody.offsetHeight;

        return job.wasSuccessful;
    };

    //  support access for debugging purposes. this mirrors what we do
    //  with other wrapper functions such as bind (but may not always be
    //  a function if the work is an array of them)
    func.$realFunc = step;

    return func;
});

//  ------------------------------------------------------------------------

TP.core.CSSPropertyTransition.Inst.defineMethod('constructJob',
function(controlParams, stepParams) {

    /**
     * @name constructJob
     * @synopsis Constructs a TP.core.Job to execute the receiving transition
     *     type.
     * @description Parameters supplied in the controlParams TP.lang.Hash for
     *     this method override any setting for the receiving transition. If a
     *     parameter value isn't supplied for a particular parameter, the
     *     receiving transition type will be queried via a 'get*()' method (i.e.
     *     get('limit'), get('count'), etc.) for a 'built-in' value. Note that
     *     the step params TP.lang.Hash is optional and may not be available,
     *     especially if this job is meant to be invoked repeatedly. We override
     *     this here to provide a custom work function.
     * @param {TP.lang.Hash} controlParams A TP.lang.Hash of the following
     *     control parameters: delay, interval, limit, count, compute.
     * @param {TP.lang.Hash} stepParams A TP.lang.Hash of the following job step
     *     parameters: target, property.
     * @returns {TP.core.Job} The job constructed for executing the receiving
     *     transition.
     * @todo
     */

    var ctrlParams,
        transitionJob;

    //  Make sure that we're configuring the job to know that it's running a
    //  visual animation
    ctrlParams = TP.ifInvalid(controlParams, TP.hc());
    ctrlParams.atPut('isAnimation', true);
     
    //  Call next method to get the transition job.
    transitionJob = this.callNextMethod(ctrlParams, stepParams);

    //  Set a custom work function on it.
    transitionJob.set('work', this.constructWorkFunction(transitionJob));

    return transitionJob;
});

//  ------------------------------------------------------------------------

TP.core.CSSPropertyTransition.Inst.defineMethod('getComputeFunction',
function() {

    /**
     * @name getComputeFunction
     * @synopsis Returns the default compute Function for the receiving
     *     transition type.
     * @returns {Function} The default compute Function for this type.
     * @todo
     */

    //  Note that for this type we return 'null' since its best to let the
    //  TP.core.Job choose the compute function, based on whether we have
    //  'values' or not.

    return null;
});

//  ------------------------------------------------------------------------

TP.core.CSSPropertyTransition.Inst.defineMethod('preserveValues',
function(params) {

    /**
     * @name preserveValues
     * @synopsis Preserves the values for the targets given the property name.
     * @param {TP.lang.Hash} params The 'step parameters' supplied to the job.
     */

    var theTargets,
        theProperty,

        oldVal;

    if (TP.isEmpty(theTargets = params.at('target'))) {
        return;
    }

    if (TP.isEmpty(theProperty = params.atIfInvalid('property',
                                                this.get('styleProperty')))) {
        return;
    }

    if (TP.isArray(theTargets)) {
        theTargets.perform(
            function(aTarget) {

                var oldVal;

                oldVal = TP.elementGetStyleProperty(aTarget, theProperty);

                TP.elementPushStyleProperty(aTarget, theProperty, oldVal);
            });
    } else {
        oldVal = TP.elementGetStyleProperty(theTargets, theProperty);

        TP.elementPushStyleProperty(theTargets, theProperty, oldVal);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.CSSPropertyTransition.Inst.defineMethod('restoreValues',
function(params) {

    /**
     * @name restoreValues
     * @synopsis Restores the values for the targets given the property name.
     * @param {TP.lang.Hash} params The 'step parameters' supplied to the job.
     */

    var theTargets,
        theProperty,

        oldVal,

        dummyVal;

    if (TP.isEmpty(theTargets = params.at('target'))) {
        return;
    }

    if (TP.isEmpty(theProperty = params.atIfInvalid('property',
                                                this.get('styleProperty')))) {
        return;
    }

    if (TP.isArray(theTargets)) {
        theTargets.perform(
            function(aTarget) {

                var oldVal;

                oldVal = TP.elementPopStyleProperty(aTarget, theProperty);

                TP.elementGetStyleObj(aTarget)[theProperty] = oldVal;
            });

        //  Make sure that any drawing that needed to 'flush' to the window
        //  does so.
        dummyVal = TP.documentGetBody(TP.nodeGetDocument(
                                        theTargets.first())).offsetHeight;
    } else {
        oldVal = TP.elementPopStyleProperty(theTargets, theProperty);

        TP.elementGetStyleObj(theTargets)[theProperty] = oldVal;

        //  Make sure that any drawing that needed to 'flush' to the window
        //  does so.
        dummyVal = TP.documentGetBody(TP.nodeGetDocument(
                                        theTargets)).offsetHeight;
    }

    return;
});

//  ========================================================================
//  TP.core.CSSValueTransition
//  ========================================================================

/**
 * @type {TP.core.CSSValueTransition}
 * @synopsis A subtype of TP.core.CSSPropertyTransition that knows how to
 *     animate CSS values. It doesn't take into account unit lengths, but is
 *     good for non-unit values like opacity. A subtype of this type,
 *     TP.core.CSSLengthTransition, should be used for CSS values that have unit
 *     lengths.
 */

//  ------------------------------------------------------------------------

TP.core.CSSPropertyTransition.defineSubtype('CSSValueTransition');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CSSValueTransition.Inst.defineMethod('configure',
function(job, params) {

    /**
     * @name configure
     * @synopsis Configures the transition, based on what this particular type
     *     of transition is trying to accomplish.
     * @description Note that the 'job' parameter supplied here points to the
     *     same instance as our 'job' instance variable, but this method is used
     *     by the job control system, so our method signature must match.
     * @param {TP.core.Job} job The job object that is currently processing this
     *     configure method.
     * @param {TP.lang.Hash} params The 'step parameters' supplied to the job.
     * @returns {Boolean} Whether or not this method configured the transition
     *     successfully.
     * @todo
     */

    var styleProperty,
        element,

        from,
        to,
        by,

        fromAsNumber,
        toAsNumber,
        byAsNumber;

    styleProperty = params.atIfInvalid('property',
                                        this.get('styleProperty'));

    //  We can't proceed without a style property.
    if (TP.isEmpty(styleProperty)) {
        return false;
    }

    element = params.at('target');

    //  We can't proceed without a target element.
    if (TP.notValid(element)) {
        return false;
    }

    //  Note that the contents of 'target' could also be an Array of
    //  elements to be animated all at once. In this case, all computations
    //  below are done using the first element in this array.
    if (TP.isArray(element)) {
        element = element.first();
    }

    if (TP.CSS_DISALLOW_NEGATIVE_VALUES.contains(styleProperty)) {
        params.atPut('nonegvalues', true);
    }

    //  If we're animating across a set of values, then we're good to go. We
    //  assume that the caller has provided length units, etc. as necessary.
    if (TP.isArray(params.at('values'))) {
        return true;
    }

    //  Otherwise, we're using a 'from...to...by' model, so go ahead and
    //  grab those values.

    //  If the 'from' value is empty, we weren't given a 'from' value, so we
    //  need to compute one. This call ensures that the return value is in
    //  pixels.
    if (TP.isEmpty(from = params.at('from'))) {
        from = TP.elementGetComputedStyleObj(element)[styleProperty];
    }

    //  Make sure the stepping value prefix and suffix either use the
    //  instance variable value for their values or have an empty String
    //  if they're not defined.
    params.atPutIfAbsent('propPrefix',
                            TP.ifEmpty(this.get('propPrefix'), ''));

    params.atPutIfAbsent('propSuffix',
                            TP.ifEmpty(this.get('propSuffix'), ''));

    //  We might have been handed a value with percentage units, so make
    //  sure to convert it.
    fromAsNumber = TP.elementGetPropertyValueAsNumber(
                            element, styleProperty, from);

    //  If the 'to' value is not empty, then we were supplied with the value
    //  that the animation will stop at.
    if (TP.notEmpty(to = params.at('to'))) {
        //  We might have been handed a value with percentage units, so make
        //  sure to convert it.
        toAsNumber = TP.elementGetPropertyValueAsNumber(
                            element, styleProperty, to);
    } else if (TP.notEmpty(by = params.at('by'))) {
        //  Otherwise, we didn't have a 'to' value, but we did have a 'by'
        //  value, so we can compute a 'to' value from it by adding it to
        //  the 'from' value.

        //  We might have been handed a value with percentage units, so make
        //  sure to convert it.
        byAsNumber = TP.elementGetPropertyValueAsNumber(
                            element, styleProperty, by);

        //  It's easy to compute 'to' now - its just 'from' plus 'by'
        toAsNumber = fromAsNumber + byAsNumber;
    } else {
        //  No 'to' or 'by' - can't proceed from here.
        //  TODO: Raise an exception
        return false;
    }

    //  Reset the 'from' and 'to' based on our computed values.
    params.atPut('from', fromAsNumber);
    params.atPut('to', toAsNumber);

    return true;
});

//  ------------------------------------------------------------------------

TP.core.CSSValueTransition.Inst.defineMethod('step',
function(job, params) {

    /**
     * @name step
     * @synopsis Changes some aspect of the target element given when this
     *     transition was executed via the 'start()' method.
     * @description Note that the 'job' parameter supplied here points to the
     *     same instance as our 'job' instance variable, but this method is used
     *     by the job control system, so our method signature must match.
     * @param {TP.core.Job} job The job object that is currently processing this
     *     step method.
     * @param {TP.lang.Hash} params The 'step parameters' supplied to the job.
     * @returns {Boolean} Whether or not the 'step' processed successfully.
     * @todo
     */

    var styleProperty,

        element,

        stepval,

        len,
        i;

    styleProperty = params.atIfInvalid('property',
                                        this.get('styleProperty'));

    //  We can't proceed without a style property.
    if (TP.isEmpty(styleProperty)) {
        return false;
    }

    element = params.at('target');

    //  We can't proceed without a target element.
    if (TP.notValid(element)) {
        return false;
    }

    stepval = job.getStepValue();

    //  If we're not animating 'a set of values', then we go ahead and
    //  append a length unit onto the stepping value, if available.
    if (TP.notValid(params.at('values'))) {
        if ((stepval < 0) && TP.isTrue(params.at('nonnegvalues'))) {
            stepval = params.at('from') + stepval;
        }

        //  The step value may have prefixes and suffixes (a suffix might be
        //  a 'unit' like 'px').
        stepval = params.at('propPrefix') +
                    stepval +
                    params.at('propSuffix');
    }

    //  Note that the contents of 'target' could also be an Array of
    //  elements to be animated all at once.
    if (TP.isArray(element)) {
        len = element.getSize();
        for (i = 0; i < len; i++) {
            if (styleProperty === 'opacity') {
                TP.elementSetOpacity(element[i], stepval);
            } else {
                element[i].style[styleProperty] = stepval;
            }
        }
    } else {
        if (styleProperty === 'opacity') {
            TP.elementSetOpacity(element, stepval);
        } else {
            TP.elementGetStyleObj(element)[styleProperty] = stepval;
        }
    }

    return true;
});

//  ========================================================================
//  TP.core.CSSLengthTransition
//  ========================================================================

/**
 * @type {TP.core.CSSLengthTransition}
 * @synopsis A subtype of TP.core.CSSValueTransition that knows how to animate
 *     CSS values with unit lengths, such as top, left, width, height, etc.
 */

//  ------------------------------------------------------------------------

TP.core.CSSValueTransition.defineSubtype('CSSLengthTransition');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CSSLengthTransition.Inst.defineMethod('configure',
function(job, params) {

    /**
     * @name configure
     * @synopsis Configures the transition, based on what this particular type
     *     of transition is trying to accomplish.
     * @description Note that the 'job' parameter supplied here points to the
     *     same instance as our 'job' instance variable, but this method is used
     *     by the job control system, so our method signature must match.
     * @param {TP.core.Job} job The job object that is currently processing this
     *     configure method.
     * @param {TP.lang.Hash} params The 'step parameters' supplied to the job.
     * @returns {Boolean} Whether or not this method configured the transition
     *     successfully.
     * @todo
     */

    var styleProperty,
        element,

        from,

        results,

        to,
        by,

        fromAsNumber,
        toAsNumber,
        byAsNumber;

    styleProperty = params.atIfInvalid('property',
                                        this.get('styleProperty'));

    //  We can't proceed without a style property.
    if (TP.isEmpty(styleProperty)) {
        return false;
    }

    element = params.at('target');

    //  We can't proceed without a target element.
    if (TP.notValid(element)) {
        return false;
    }

    //  Note that the contents of 'target' could also be an Array of
    //  elements to be animated all at once. In this case, all computations
    //  below are done using the first element in this array.
    if (TP.isArray(element)) {
        element = element.first();
    }

    if (TP.CSS_DISALLOW_NEGATIVE_VALUES.contains(styleProperty)) {
        params.atPut('nonegvalues', true);
    }

    //  If we're animating across a set of values, then we're good to go. We
    //  assume that the caller has provided length units, etc. as necessary.
    if (TP.isArray(params.at('values'))) {
        return true;
    }

    //  Otherwise, we're using a 'from...to...by' model, so go ahead and
    //  grab those values.

    //  If the 'from' value is empty, we weren't given a 'from' value, so we
    //  need to compute one. This call ensures that the return value is in
    //  pixels.
    if (TP.isEmpty(from = params.at('from'))) {
        from = TP.elementGetComputedStyleObj(element)[styleProperty];
    }

    params.atPutIfAbsent('propPrefix',
                            TP.ifEmpty(this.get('propPrefix'), ''));

    if (TP.isArray(results = TP.regex.CSS_UNIT.match(from))) {
        params.atPut('propSuffix', results.at(3));
    } else {
        params.atPutIfAbsent('propSuffix',
                                TP.ifEmpty(this.get('propSuffix'), 'px'));
    }

    //  We might have been handed a value with units other than pixels (such
    //  as '%'ages or 'em's), so make sure to convert it.
    fromAsNumber = TP.elementGetPixelValue(
                                element, from, styleProperty);

    //  If the 'to' value is not empty, then we were supplied with the value
    //  that the animation will stop at.
    if (TP.notEmpty(to = params.at('to'))) {
        //  We might have been handed a value with units other than pixels
        //  (such as '%'ages or 'em's), so make sure to convert it.
        toAsNumber = TP.elementGetPixelValue(
                                element, to, styleProperty);
    } else if (TP.notEmpty(by = params.at('by'))) {
        //  Otherwise, we didn't have a 'to' value, but we did have a 'by'
        //  value, so we can compute a 'to' value from it by adding it to
        //  the 'from' value.

        //  We might have been handed a value with units other than pixels
        //  (such as '%'ages or 'em's), so make sure to convert it.
        byAsNumber = TP.elementGetPixelValue(
                                element, by, styleProperty);

        //  It's easy to compute 'to' now - its just 'from' plus 'by'
        toAsNumber = fromAsNumber + byAsNumber;
    } else {
        //  No 'to' or 'by' - can't proceed from here.
        //  TODO: Raise an exception
        return false;
    }

    //  Reset the 'from' and 'to' based on our computed values.
    params.atPut('from', fromAsNumber);
    params.atPut('to', toAsNumber);

    return true;
});

//  ========================================================================
//  TP.core.CSSColorTransition
//  ========================================================================

/**
 * @type {TP.core.CSSColorTransition}
 * @synopsis A subtype of TP.core.CSSValueTransition that knows how to animate
 *     CSS colors values, such as color, backgroundColor, etc.
 */

//  ------------------------------------------------------------------------

TP.core.CSSValueTransition.defineSubtype('CSSColorTransition');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CSSColorTransition.Inst.defineMethod('configure',
function(job, params) {

    /**
     * @name configure
     * @synopsis Configures the transition, based on what this particular type
     *     of transition is trying to accomplish.
     * @description Note that the 'job' parameter supplied here points to the
     *     same instance as our 'job' instance variable, but this method is used
     *     by the job control system, so our method signature must match.
     * @param {TP.core.Job} job The job object that is currently processing this
     *     configure method.
     * @param {TP.lang.Hash} params The 'step parameters' supplied to the job.
     * @returns {Boolean} Whether or not this method configured the transition
     *     successfully.
     * @todo
     */

    var styleProperty,
        element,

        values,
        from,
        to,
        by,

        valuesAsNumbers,
        fromAsNumber,
        toAsNumber,
        byAsNumber;

    styleProperty = params.atIfInvalid('property',
                                        this.get('styleProperty'));

    //  We can't proceed without a style property.
    if (TP.isEmpty(styleProperty)) {
        return false;
    }

    element = params.at('target');

    //  We can't proceed without a target element.
    if (TP.notValid(element)) {
        return false;
    }

    //  Note that the contents of 'target' could also be an Array of
    //  elements to be animated all at once. In this case, all computations
    //  below are done using the first element in this array.
    if (TP.isArray(element)) {
        element = element.first();
    }

    //  If we're animating across a set of values, then we should iterate
    //  across those values, converting the colors into their numerical
    //  representation for use by the animation system. Note how we set our
    //  new Array as the 'values' array for use by the animation system.
    if (TP.isArray(values = params.at('values'))) {
        valuesAsNumbers = values.collect(
                function(aValue) {

                    return TP.convertColorStringToLongNumber(aValue);
                });

        params.atPut('values', valuesAsNumbers);

        return true;
    }

    //  Otherwise, we're using a 'from...to...by' model, so go ahead and
    //  grab those values.

    //  We make sure to do 'asString's here, in case we got handed a
    //  TP.core.Color.
    if (TP.notEmpty(from = params.at('from'))) {
        from = from.asString();
    }

    if (TP.notEmpty(to = params.at('to'))) {
        to = to.asString();
    }

    if (TP.notEmpty(by = params.at('by'))) {
        by = by.asString();
    }

    //  If the 'from' value is not empty, then we were supplied with the
    //  value to start the animation from.
    if (TP.notEmpty(from)) {
        //  We were handed a 'color value' (a name, a hex, an rgb(...),
        //  etc.) string, so convert it into a number so that we can use it
        //  in the animation.
        fromAsNumber = TP.convertColorStringToLongNumber(from);
    } else {
        //  Otherwise, we weren't given a 'from' color value, so we need to
        //  compute one. If the property that we're changing is the
        //  background color, we use a special routine that will determine
        //  background color, even if the element is transparent.
        if (styleProperty === 'backgroundColor') {
            fromAsNumber = TP.convertColorStringToLongNumber(
                        TP.elementGetEffectiveBackgroundColor(element));
        } else {
            fromAsNumber = TP.convertColorStringToLongNumber(
                        TP.elementGetComputedStyleObj(element)[styleProperty]);
        }
    }

    //  If the 'to' value is not empty, then we were supplied with the value
    //  that the animation will stop at.
    if (TP.notEmpty(to)) {
        //  We were handed a 'color value' (a name, a hex, an rgb(...),
        //  etc.) string, so convert it into a number so that we can use it
        //  in the animation.
        toAsNumber = TP.convertColorStringToLongNumber(to);
    } else if (TP.notEmpty(by)) {
        //  Otherwise, we didn't have a 'to' value, but we did have a 'by'
        //  value, so we can compute a 'to' value from it by adding it to
        //  the 'from' value.

        //  We were handed a 'color value' (a name, a hex, an rgb(...),
        //  etc.) string, so convert it into a number so that we can use it
        //  in the animation.
        byAsNumber = TP.convertColorStringToLongNumber(by);

        //  It's easy to compute 'to' now - its just 'from' plus 'by'
        toAsNumber = fromAsNumber + byAsNumber;
    } else {
        //  No 'to' or 'by' - can't proceed from here.
        //  TODO: Raise an exception
    }

    params.atPut('from', fromAsNumber);
    params.atPut('to', toAsNumber);

    return true;
});

//  ------------------------------------------------------------------------

TP.core.CSSColorTransition.Inst.defineMethod('step',
function(job, params) {

    /**
     * @name step
     * @synopsis Changes some aspect of the target element given when this
     *     transition was executed via the 'start()' method.
     * @description Note that the 'job' parameter supplied here points to the
     *     same instance as our 'job' instance variable, but this method is used
     *     by the job control system, so our method signature must match.
     * @param {TP.core.Job} job The job object that is currently processing this
     *     step method.
     * @param {TP.lang.Hash} params The 'step parameters' supplied to the job.
     * @returns {Boolean} Whether or not the 'step' processed successfully.
     * @todo
     */

    var styleProperty,

        element,

        stepval,

        fromAsNumber,
        toAsNumber,
        colorStep,

        len,
        i;

    styleProperty = params.atIfInvalid('property',
                                        this.get('styleProperty'));

    //  We can't proceed without a style property.
    if (TP.isEmpty(styleProperty)) {
        return false;
    }

    element = params.at('target');

    //  We can't proceed without a target element.
    if (TP.notValid(element)) {
        return false;
    }

    //  If we're animating across a set of values, then there isn't any
    //  interpolation necessary between the start and end colors, so we just
    //  grab the value.
    if (TP.notEmpty(params.at('values'))) {
        stepval = TP.convertLongNumberToColorString(job.getStepValue());
    } else {
        fromAsNumber = params.at('from');
        toAsNumber = params.at('to');

        //  getPercentComplete() can return null if the caller is using a
        //  'Function based' limit - in that case, there's no way to know.
        if (TP.isNumber(colorStep = job.getPercentComplete())) {
            //  We compute the step color by using the step value in a color
            //  interpolation and then turn that into a hex color.
            stepval = TP.convertLongNumberToColorString(
                                            TP.interpolateColors(
                                                    fromAsNumber,
                                                    toAsNumber,
                                                    colorStep));
        } else {
            stepval = '';
        }
    }

    //  Note that the contents of 'target' could also be an Array of
    //  elements to be animated all at once.
    if (TP.isArray(element)) {
        len = element.getSize();
        for (i = 0; i < len; i++) {
            element[i].style[styleProperty] = stepval;
        }
    } else {
        TP.elementGetStyleObj(element)[styleProperty] = stepval;
    }

    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
