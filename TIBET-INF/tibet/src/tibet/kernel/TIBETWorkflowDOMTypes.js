//  ========================================================================
/*
NAME:   TIBETWorkflowDOMTypes.js
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
//  TP.vcard_temp.vCard
//  ========================================================================

/**
 * @type {TP.vcard_temp.vCard}
 * @synopsis A VCard based on the Jabber/XEP-0054 vcard-temp specification.
 * @description The primary purpose of this type in TIBET is to support
 *     TP.core.User instances in the definition of their organization and role
 *     affiliations. By virtue of vCard association types can autoload
 *     organization-specific role/unit types which serve as delegates for
 *     permission-specific behaviors and as keepers of associated keys/keyrings.
 *     
 *     Given the relatively limited goals for this type at the present time we
 *     focus only on the FN, ROLE, and ORG elements and their associated
 *     children. Additional aspect mappings, and an expanded node template,
 *     would allow this type to be a full-featured wrapper for the full XEP-0054
 *     vCard element.
 *     
 *     See http://www.xmpp.org/extensions/xep-0054.html for more info.
 *     
 *     See the vcards.xml sample file for specific markup examples.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('vcard_temp:vCard');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Type.defineConstant('template',
    TP.elementFromString(TP.join(
        '<vCard>',
            '<VERSION>1.1</VERSION>',
            '<FN>fullname</FN>',
            '<N>name</N>',
            '<ROLE>role;role;role</ROLE>',
            '<ORG>',
                '<ORGNAME>org</ORGNAME>',
                '<ORGUNIT>unit;unit;unit</ORGUNIT>',
            '</ORG>',
        '</vCard>')
    ));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Type.defineMethod('getInstanceById',
function(anID) {

    /**
     * @name getInstanceById
     * @synopsis Returns the vCard instance whose FN entry matches the ID
     *     provided. NOTE that the FN data doesn't have to match the ID of the
     *     TP.core.User you'll associate it with, allowing you to reuse commonly
     *     named vCard instances across numerous users.
     * @description This method defaults to loading the shared vCard data
     *     normally found at ~app_dat/vcards.xml. When your needs are simple
     *     this is probably adequate, but in more complex applications you
     *     probably want to override this method and replace it with one that
     *     calls a web service to return a single TP.vcard_temp.vCard element
     *     with the requested ID/FN.
     * @returns {TP.vcard_temp.vCard} A vCard element wrapper.
     * @todo
     */

    var xml,
        elem;

    xml = this.getVCardXML();
    if (TP.notValid(xml)) {
        return this.raise('TP.sig.InvalidXML', arguments,
                                    'Unable to acquire vCard XML');
    }

    elem = TP.nodeEvaluateXPath(
                xml,
                TP.join('//$def:FN[text()="', anID, '"]/..'),
                TP.FIRST_NODE);

    if (TP.notValid(elem)) {
        //  ignore missing vcard entries
        return;
    }

    return this.construct(elem);
});

//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Type.defineMethod('getVCardXML',
function(forceRefresh) {

    /**
     * @name getVCardXML
     * @synopsis Returns the vCard XML containing the application's set of
     *     vCards. This method is typically used by applications that don't
     *     required a large number of unique vCard entries.
     * @description The vCard data file location can be altered by setting the
     *     environment parameter 'vcards', or by altering the tibet.vcard_file
     *     parameter. This URI is then loaded to provide the application vCard
     *     XML data.
     *     
     *     NOTE that this call is only used by the getInstanceById call for
     *     vCard instances, so you can avoid the file-level approach by
     *     overriding that method and invoking a web service or using other
     *     means to locate a vCard by ID.
     * @param {Boolean} forceRefresh True will force the file content to be
     *     reloaded.
     * @returns {XMLDocument} An XML document containing vCard data. The root
     *     element is a vCards element, while each vCard is a vCard element
     *     conforming to the XMPP XEP-0054 specification.
     */

    var node,
        flag,
        fname,
        url;

    if (TP.ifInvalid(forceRefresh, false)) {
        TP.sys.$vcardXML = null;
    }

    if (TP.isNode(node = TP.sys.$vcardXML)) {
        return node;
    }

    flag = TP.sys.shouldLogRaise();
    TP.sys.shouldLogRaise(false);

    try {
        try {
            if (TP.notEmpty(fname = TP.sys.cfg('tibet.vcards'))) {
                fname = TP.uriExpandPath(fname);
                if (TP.isURI(url = TP.uc(fname))) {
                    //  NOTE: We do *not* use 'url.getNativeNode()' here
                    //  since it causes a recursion when it tries to
                    //  instantiate a TP.core.RESTService which then tries
                    //  to configure itself from a vCard which then leads us
                    //  back here...
                    //  Note that this is a *synchronous* load.
                    node = TP.$fileLoad(url.getLocation(),
                                        TP.hc('resultType', TP.DOM));
                }
            }
        } catch (e) {
        }

        try {
            if (TP.notValid(node)) {
                fname = TP.uriExpandPath(TP.sys.cfg('tibet.vcard_file'));
                if (TP.isURI(url = TP.uc(fname))) {
                    //  NOTE: We do *not* use 'url.getNativeNode()' here
                    //  since it causes a recursion when it tries to
                    //  instantiate a TP.core.RESTService which then tries
                    //  to configure itself from a vCard which then leads us
                    //  back here...
                    //  Note that this is a *synchronous* load.
                    node = TP.$fileLoad(url.getLocation(),
                                        TP.hc('resultType', TP.DOM));
                }
            }
        } catch (e) {
        }

        if (TP.notValid(node)) {
            node = TP.documentFromString(
                        '<vCards xmlns="vcard-temp"></vCards>');
        }

        TP.sys.$vcardXML = node;
    } catch (e) {
    } finally {
        TP.sys.shouldLogRaise(flag);
    }

    return node;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Note the use of the non-standard '$def:' TIBET extension used to query
//  elements in default namespaces.

TP.vcard_temp.vCard.Inst.defineAttribute(
        'version',
        {'value': TP.xpc('./$def:VERSION', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'fullname',
        {'value': TP.xpc('./$def:FN', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'shortname',
        {'value': TP.xpc('./$def:N', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'jid',
        {'value': TP.xpc('./$def:JABBERID', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'url',
        {'value': TP.xpc('./$def:URL', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'role',
        {'value': TP.xpc('./$def:ROLE', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'orgname',
        {'value': TP.xpc('./$def:ORG/$def:ORGNAME', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'orgunit',
        {'value': TP.xpc('./$def:ORG/$def:ORGUNIT', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'key',
        {'value': TP.xpc('./$def:KEY', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'secretkey',
        {'value': TP.xpc('./$def:X-SECRET-KEY', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'username',
        {'value': TP.xpc('./$def:X-USERNAME', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'password',
        {'value': TP.xpc('./$def:X-PASSWORD', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'auth',
        {'value': TP.xpc('./$def:X-AUTH', true).
                                    set('extractWith', 'value')});

TP.vcard_temp.vCard.Inst.defineAttribute(
        'iswebdav',
        {'value': TP.xpc('./$def:X-IS-WEBDAV', true).
                                    set('extractWith', 'value')});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Inst.defineMethod('getAccessKeys',
function() {

    /**
     * @name getAccessKeys
     * @synopsis Returns an array of permission keys defined by the receiver's
     *     role and unit definitions.
     * @returns {Array} An array of permission keys (strings).
     * @todo
     */

    var keys,
        roles,
        units;

    //  NOTE
    //  we cache the key string to avoid recomputation overhead
    if (TP.notEmpty(keys = this.getAttribute('keys'))) {
        return keys.split(' ');
    }

    keys = TP.ac();

    roles = this.getRoles();
    keys = roles.injectInto(
        keys,
        function(role, accum) {

            accum.push.apply(accum, role.getAccessKeys());

            return accum;
        });

    units = this.getUnits();
    keys = units.injectInto(
        keys,
        function(unit, accum) {

            accum.push.apply(accum, unit.getAccessKeys());

            return accum;
        });

    //  since we've blended keys from a number of sources, unique and sort
    //  for easier debugging in the UI
    return keys.unique().sort();
});

//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Inst.defineMethod('getRoleNames',
function() {

    /**
     * @name getRoleNames
     * @synopsis Returns an array of role names found in the vCard instance.
     *     NOTE that TIBET automatically "namespace-qualifies" the content of
     *     the ROLE element with the content of the ORGNAME element to produce
     *     these names.
     * @returns {Array} An array of role names (TP.core.Role subtype names).
     * @todo
     */

    var org,
        role,
        names;

    org = this.get('orgname');
    role = this.get('role');
    if (TP.isEmpty(role)) {
        return TP.ac();
    }

    names = role.split(';');
    return names.collect(
            function(name) {

                return TP.join(org, ':', name);
            });
});

//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Inst.defineMethod('getRoles',
function() {

    /**
     * @name getRoles
     * @synopsis Returns an array of TP.core.Role types that were found for the
     *     receiver. When a named role can't be loaded it won't be included in
     *     this list, and a warning will be logged.
     * @returns {Array} An array containing loadable TP.core.Role types.
     * @todo
     */

    var names;

    names = this.getRoleNames();

    return names.collect(
                function(name) {

                    return TP.sys.require(name);
                }).compact();
});

//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Inst.defineMethod('getUnitNames',
function() {

    /**
     * @synopsis Returns an array of unit names found in the vCard instance.
     *     NOTE that TIBET automatically "namespace-qualifies" the content of
     *     the ORGUNIT element with the content of the ORGNAME element in
     *     producing this list.
     * @returns {Array} An array of unit names (TP.core.Unit subtype names).
     * @method
     * @todo
     */

    var org,
        unit,
        names;

    org = this.get('orgname');
    unit = this.get('orgunit');
    if (TP.isEmpty(unit)) {
        return TP.ac();
    }

    names = unit.split(';');
    return names.collect(
            function(name) {

                return TP.join(org, ':', name);
            });
});

//  ------------------------------------------------------------------------

TP.vcard_temp.vCard.Inst.defineMethod('getUnits',
function() {

    /**
     * @name getUnits
     * @returns {Array} 
     * @abstract
     * @todo
     */

    var names;

    names = this.getUnitNames();

    return names.collect(
                function(name) {

                    return TP.sys.require(name);
                }).compact();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

//  ========================================================================
//  TP.tibet.keyring
//  ========================================================================

/**
 * @type {TP.tibet.keyring}
 * @synopsis A keyring is a container for one or more keys, strings that
 *     represent individual permissions within an application.
 * @description To help manage permissions in the most flexible way possible
 *     TIBET uses the concept of keys, strings you define to have some meaning
 *     relative to permissions in your application. These keys can be grouped
 *     within keyrings, which can be nested to keep things easier to maintain in
 *     large systems.
 *     
 *     When a user logs in you assign that user a vCard which defines the
 *     user's organization-qualified role and unit affiliations. The role and
 *     unit definitions found in the vCard provide one or more keyrings to their
 *     associated user(s), granting members their permissions.
 *     
 *     See the keyrings.xml sample file for specific markup examples.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('tibet:keyring');

//  ------------------------------------------------------------------------
//  Types Methods
//  ------------------------------------------------------------------------

TP.tibet.keyring.Type.defineMethod('getInstanceById',
function(anID) {

    /**
     * @name getInstanceById
     * @synopsis Returns the keyring instance whose id attribute matches the ID
     *     provided.
     * @description This method defaults to loading the shared keyring data
     *     normally found at ~app_dat/keyrings.xml. When your needs are simple
     *     this is probably adequate, but in more complex applications you
     *     probably want to override this method and replace it with one that
     *     calls a web service to return a single keyring element with the
     *     requested ID.
     * @returns {tibet:keyring} A keyring element wrapper.
     * @todo
     */

    var xml,
        elem;

    xml = this.getKeyringXML();
    if (TP.notValid(xml)) {
        return this.raise('TP.sig.InvalidXML', arguments,
                                    'Unable to acquire keyring XML');
    }

    elem = TP.nodeGetElementById(xml, anID);
    if (TP.notValid(elem)) {
        return; //  ignore missing keyring entries
    }

    return this.construct(elem);
});

//  ------------------------------------------------------------------------

TP.tibet.keyring.Type.defineMethod('getKeyringXML',
function(forceRefresh) {

    /**
     * @name getKeyringXML
     * @synopsis Returns the keyring XML containing the application's set of
     *     keyrings. This method is typically used by applications that don't
     *     required a large number of unique keyring entries.
     * @description The keyring data file location can be altered by setting the
     *     environment parameter 'keyrings', or by altering the
     *     tibet.keyring_file setting. This URI is then loaded to provide the
     *     application keyring XML data.
     *     
     *     NOTE that this call is only used by the getInstanceById call for
     *     keyring instances, so you can avoid the file-level approach by
     *     overriding that method and invoking a web service or using other
     *     means to locate a keyring by ID.
     * @param {Boolean} forceRefresh True will force the file content to be
     *     reloaded.
     * @returns {XMLDocument} An XML document containing vCard data. The root
     *     element is a vCards element, while each vCard is a vCard element
     *     conforming to the XMPP XEP-0054 specification.
     */

    var node,
        flag,
        fname,
        url;

    if (TP.ifInvalid(forceRefresh, false)) {
        TP.sys.$keyringXML = null;
    }

    if (TP.isNode(node = TP.sys.$keyringXML)) {
        return node;
    }

    flag = TP.sys.shouldLogRaise();
    TP.sys.shouldLogRaise(false);

    try {
        try {
            if (TP.notEmpty(fname = TP.sys.cfg('tibet.keyrings'))) {
                fname = TP.uriExpandPath(fname);
                if (TP.isURI(url = TP.uc(fname))) {
                    //  NOTE: We do *not* use 'url.getNativeNode()' here
                    //  since this gets loaded very early in the startup
                    //  process. Note that this is a *synchronous* load.
                    node = TP.$fileLoad(url.getLocation(),
                                        TP.hc('resultType', TP.DOM));
                }
            }
        } catch (e) {
        }

        try {
            if (TP.notValid(node)) {
                fname = TP.uriExpandPath(
                            TP.sys.cfg('tibet.keyring_file'));
                if (TP.isURI(url = TP.uc(fname))) {
                    //  NOTE: We do *not* use 'url.getNativeNode()' here
                    //  since this gets loaded very early in the startup
                    //  process. Note that this is a *synchronous* load.
                    node = TP.$fileLoad(url.getLocation(),
                                        TP.hc('resultType', TP.DOM));
                }
            }
        } catch (e) {
        }

        if (TP.notValid(node)) {
            node = TP.documentFromString(
                    TP.join('<keyrings xmlns="', TP.w3.Xmlns.TIBET, '">',
                            '</keyrings>'));
        }

        TP.sys.$keyringXML = node;
    } catch (e) {
    } finally {
        TP.sys.shouldLogRaise(flag);
    }

    return node;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.keyring.Inst.defineMethod('getAccessKeys',
function() {

    /**
     * @name getAccessKeys
     * @synopsis Returns an array of the string keys found in the receiver.
     * @returns {Array} An array containing the string keys of the receiver.
     * @todo
     */

    var keys,
        arr,
        rings;

    //  NOTE
    //  we cache the key string to avoid recomputation overhead,
    //  particularly around nested keyrings.
    //  ALSO
    //  since we use the keys attribute as a cache this can be leveraged by
    //  any web service you may write as a way to return an element of the
    //  form <keyring keys="ab cd ef"/> rather than a nested structure.
    if (TP.notEmpty(keys = this.getAttribute('keys'))) {
        return keys.split(' ');
    }

    //  build an empty array we can inject into the following processes
    keys = TP.ac();

    //  first we'll gather up any keys from our "child" keyrings
    rings = this.getKeyrings();
    keys = rings.injectInto(
        keys,
        function(ring, accum) {

            //  the apply will flatten the nested keys into the keyset
            accum.push.apply(accum, ring.getAccessKeys());

            //  injectInto requires that we return the injected data
            return accum;
        });

    //  now we want to add our local keys (make sure that we get an Array
    //  even if there's only one)
    arr = this.evaluateXPath('./$def:key/@id', TP.NODESET);
    keys = arr.injectInto(
        keys,
        function(attr, accum) {

            //  turn attribute nodes into string values
            accum.push(TP.str(attr.value));

            //  injectInto requires that we return the injected data
            return accum;
        });

    //  since we've blended keys from a number of sources, unique and sort
    //  for easier debugging in the UI
    keys = keys.unique().sort();

    //  cache the result
    this.setAttribute('keys', keys.join(' '));

    return keys;
});

//  ------------------------------------------------------------------------

TP.tibet.keyring.Inst.defineMethod('getKeyrings',
function() {

    /**
     * @name getKeyrings
     * @synopsis Returns an array of any nested keyrings found in the receiver.
     *     This list's related keys also become part of the overall key set
     *     returned by the getAccessKeys() method so you rarely need to call it
     *     directly.
     * @returns {Array} An array containing the string keys of the receiver.
     * @todo
     */

    var arr;

    //  NB: we make sure that we get an Array even if there's only one
    arr = this.evaluateXPath('./$def:keyring/@ref', TP.NODESET);
    arr.convert(
        function(attr) {

            return TP.tibet.keyring.getInstanceById(TP.str(attr.value));
        });

    return arr;
});

//  ------------------------------------------------------------------------

TP.tibet.keyring.Inst.defineMethod('hasAccessKey',
function(aKey) {

    /**
     * @name hasAccessKey
     * @synopsis Returns true if the receiving key ring has the named key.
     * @returns {Boolean} True if the key is found.
     */

    return this.getAccessKeys().contains(aKey);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
