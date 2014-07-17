//  ========================================================================
/*
NAME:   xs_.js
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
 * @type {xs:}
 * @synopsis The XML Schema namespace type, which serves as an entry point for
 *     all XML Schema validation and support methods which don't start directly
 *     from an XML Schema data type.
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('xs:XMLNS');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xs.XMLNS.Type.defineMethod('validate',
function(aValue, aNode) {

    /**
     * @name validate
     * @synopsis Validates a string as having a proper value for the element
     *     provided. The element is checked for various XML Schema attachments
     *     including xsi:type attributes, xsi:schemaLocation parent references,
     *     etc.
     * @param {String} aValue The string to validate.
     * @param {Node} aNode The target node for the value.
     * @returns {Boolean} True if the value is valid for the target node.
     * @todo
     */

    var node,

        type,
        typeName,

        schema,

        list,
        path,

        url,
        tpuri,

        attr;

    TP.debug('break.validate');

    //  have to have a schema reference of some kind
    if (TP.notValid(aNode)) {
        return this.raise('TP.sig.InvalidParameter', arguments,
                            'Invalid target node for schema validation.');
    }

    //  start with finding the xml schema node we have to work from
    if (TP.isNode(aNode)) {
        node = aNode;
    } else if (TP.isMethod(aNode.getNativeNode)) {
        node = aNode.getNativeNode();
    }

    TP.ifTrace(TP.$DEBUG) ?
        TP.trace(TP.boot.$annotate(node, 'xs: validating: ' + aValue),
                    TP.LOG, arguments) : 0;

    //  simple check is whether there's an xsi:type attribute and a type to
    //  handle it
    if (TP.notEmpty(typeName = TP.elementGetAttribute(node,
                                                        'xsi:type',
                                                        true))) {
        TP.ifTrace(TP.$DEBUG) ?
            TP.trace('found xsi:type ' + typeName,
                        TP.LOG, arguments) : 0;

        if (TP.isType(type = TP.sys.require(typeName))) {
            return type.validate(aValue, aNode);
        }

        TP.ifTrace(TP.$DEBUG) ?
            TP.trace('xsi:type ' + typeName + ' not available',
                        TP.LOG, arguments) : 0;
    } else if ((node.namespaceURI === TP.w3.Xmlns.XFORMS) &&
                TP.notEmpty(typeName =
                                TP.elementGetAttribute(node, 'type'))) {
        TP.ifTrace(TP.$DEBUG) ?
            TP.trace('found xforms:type ' + typeName,
                        TP.LOG, arguments) : 0;

        //  secondary check (HACK) is for xforms:model/type attributes
        if (TP.isType(type = TP.sys.require(typeName))) {
            return type.validate(aValue, aNode);
        }

        TP.ifTrace(TP.$DEBUG) ?
            TP.trace('xforms:type ' + typeName + ' not available',
                        TP.LOG, arguments) : 0;
    }

    //  next question is can we find the type definition in a schema file
    //  associated with this node? this means checking based on whether the
    //  node has a namespace or not so we know which attribute to go after
    if (TP.isEmpty(node.namespaceURI)) {
        TP.ifTrace(TP.$DEBUG && TP.$VERBOSE) ?
            TP.trace('no namespace uri',
                        TP.LOG, arguments) : 0;

        if (TP.isAttributeNode(attr = TP.nodeEvaluateXPath(
                node,
                './ancestor-or-self::*/@*[name() = "xsi:noNamespaceSchemaLocation"]',
                TP.FIRST_NODE))) {
            url = attr.value;
        }
    } else {
        TP.ifTrace(TP.$DEBUG) ?
            TP.trace('namespace uri ' + node.namespaceURI,
                        TP.LOG, arguments) : 0;

        if (TP.isAttributeNode(attr = TP.nodeEvaluateXPath(
                node,
                './ancestor-or-self::*/@*[name() = "xsi:schemaLocation"]',
                TP.FIRST_NODE))) {
            list = attr.value;
            if (TP.isString(list.match(node.namespaceURI))) {
                //  slice off everything in front of our target uri, then we
                //  can split and our schema uri will end up at position 1
                list = list.slice(list.indexOf(node.namespaceURI));
                list = list.split(' ');
                url = list.at(1);
            }
        }
    }

    //  if the uri is empty at this point then we don't really have a schema
    //  to check against. we'll default to true in that case to allow any
    //  set() calls to succeed since we can't be sure about the data
    if (TP.isEmpty(url)) {
        return true;
    }

    TP.ifTrace(TP.$DEBUG) ?
        TP.trace('uri ' + url,
                    TP.LOG, arguments) : 0;

    if (TP.notValid(tpuri = TP.uc(url))) {
        TP.ifWarn() ?
            TP.warn('Unable to resolve XML Schema URI: ' + url,
                    TP.LOG, arguments) : 0;

        return true;
    }

    if (TP.notValid(schema = tpuri.getNativeNode(TP.hc('async', false)))) {
        TP.ifWarn() ?
            TP.warn('Unable to load XML Schema from URI: ' + url,
                    TP.LOG, arguments) : 0;

        return true;
    }

    TP.ifTrace(TP.$DEBUG) ?
        TP.trace(TP.boot.$annotate(schema, 'Schema: '),
                    TP.LOG, arguments) : 0;

    //  try to find an element-level type definition if we don't have one
    //  already from xsi:type information. once we have this we can find the
    //  type definition referenced via the element tag
    if (TP.isEmpty(typeName)) {
        TP.ifTrace(TP.$DEBUG) ?
            TP.trace('empty typename',
                        TP.LOG, arguments) : 0;

        typeName = node.nodeName;

        path = '//*[name() = "xs:element" and @name="' + typeName + '"]';
        TP.ifTrace(TP.$DEBUG) ?
            TP.trace('using element path: ' + path,
                        TP.LOG, arguments) : 0;

        list = TP.nodeEvaluateXPath(schema, path, TP.NODESET);

        TP.ifTrace(TP.$DEBUG) ?
            TP.trace('element path found ' + list.length + ' nodes',
                        TP.LOG, arguments) : 0;

        switch (list.length) {
            case 0:

                //  none found, can't process
                TP.ifWarn() ?
                    TP.warn('Unable to find XML Schema element: ' +
                                typeName + ' in XML Schema: ' + url,
                            TP.LOG, arguments) : 0;

                return true;

            case 1:

                //  one and only one, so we can use the type attribute
                TP.ifTrace(TP.$DEBUG) ?
                    TP.trace('found: ' + TP.nodeAsString(list.at(0)),
                                TP.LOG, arguments) : 0;

                typeName = TP.elementGetAttribute(list.at(0), 'type');

                //  if we have that type built in then we can use it,
                //  otherwise we're going to fall through to the secondary
                //  schema description lookup phase
                if (TP.isType(type = TP.sys.require(typeName))) {
                    return type.validate(aValue, aNode);
                }

                break;

            default:

                //  more than one. now we have to worry about structure and
                //  parent hierarchy (which we're not going to support for
                //  now)
                TP.ifWarn() ?
                    TP.warn('Unsupported multi-element schema definition' +
                                ' found for: ' + typeName,
                            TP.LOG, arguments) : 0;

                return true;
        }
    }

    TP.ifTrace(TP.$DEBUG) ?
        TP.trace('Looking up schema definition',
                    TP.LOG, arguments) : 0;

    //  now we try to find a simpleType or complexType definition node
    path = '//*[name() = "xs:simpleType" and @name = "' + typeName + '"]';

    TP.ifTrace(TP.$DEBUG) ?
        TP.trace('using simpleType path: ' + path,
                    TP.LOG, arguments) : 0;

    list = TP.nodeEvaluateXPath(schema, path, TP.NODESET);

    TP.ifTrace(TP.$DEBUG) ?
        TP.trace('using simpleType path found ' + list.length + ' nodes',
                    TP.LOG, arguments) : 0;

    if (TP.isEmpty(list)) {
        path = '//*[name() = "xs:complexType" and @name = "' +
                typeName +
                '"]';

        TP.ifTrace(TP.$DEBUG) ?
            TP.trace('using complexType path: ' + path,
                        TP.LOG, arguments) : 0;

        list = TP.nodeEvaluateXPath(schema,
                '//*[name() = "xs:complexType" and @name = "' +
                typeName +
                '"]',
                TP.NODESET);

        TP.ifTrace(TP.$DEBUG) ?
            TP.trace('using complex path found ' + list.length + ' nodes',
                        TP.LOG, arguments) : 0;
    }

    if (TP.isEmpty(list)) {
        TP.ifWarn() ?
            TP.warn('Unable to resolve XML Schema type: ' + typeName +
                        ' in XML Schema: ' + url,
                    TP.LOG, arguments) : 0;

        return true;
    }

    if (TP.notValid(type = TP.sys.require(list.at(0).nodeName))) {
        TP.ifWarn() ?
            TP.warn('Unable to load/require XML Schema type: ' + typeName +
                        ' in XML Schema: ' + url,
                    TP.LOG, arguments) : 0;

        return true;
    }

    //  now defer to the individual node type to do the detailed work
    return type.validate(aValue, aNode, list.at(0));
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
