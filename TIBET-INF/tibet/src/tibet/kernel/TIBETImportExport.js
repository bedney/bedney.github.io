//  ========================================================================
/*
NAME:   TIBETImportExport.js
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
//  ========================================================================

/*
The elements of this file are focused on code and content import. Of
particular interest are the elements that support TIBET's type and method
"autoloader" capability which allows code to be dynamically loaded without
programmer intervention. This is a powerful feature since it means you can
tune your load packages to create a smaller startup footprint, migrating
features among various packages without having to alter source code that
consumes those resources. Mention a type or method and TIBET will autoload
it if it's not yet available. All that's required is current metadata so
TIBET knows where to find the various types/methods you will want to load.
This metadata is constructed automatically during application execution, you
simply save it from the development environment and you're ready to go.
*/

//  ------------------------------------------------------------------------
//  XML CATALOG / STORED METADATA
//  ------------------------------------------------------------------------

/*
Included in this section are a number of methods which work with the
XMLCatalog standard from OASIS to assist with mapping URIs to various
locations based on current user, runtime state, etc.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getURIXML',
function(forceRefresh) {

    /**
     * @name getURIXML
     * @synopsis Returns a DOM reference to the XML Catalog file used to store
     *     URI mappings for the current application.
     * @description At runtime TIBET will use data in this file to assist with
     *     URI lookup, caching, loading, and storage. This file is typically
     *     named uris.xml but that name can be altered in the tibet.xml file
     *     using the 'uris' boot parameter. You can also change it using the
     *     parameter tibet.uri_file. Either approach should resolve to a URI
     *     which can be passed to the TP.core.URI type for lookup. Note that
     *     this file should be in the form required by the XML Catalog standard.
     * @param {Boolean} forceRefresh True if the current cached copy should be
     *     cleared and the data reloaded from its source file. Defaults to
     *     false.
     * @returns {Node} The XML content containing the URI map.
     * @todo
     */

    var node,
        flag,
        fname,
        url;

    if (TP.isTrue(forceRefresh)) {
        TP.sys.$uriXML = null;
    }

    //  we cache the node for performance
    if (TP.isNode(node = TP.sys.$uriXML)) {
        return TP.isEmpty(node) ? null : node;
    }

    //  turn off notification for a moment
    flag = TP.sys.shouldLogRaise();
    TP.sys.shouldLogRaise(false);

    try {
        //  first choice is whatever the boot system parameter tells us
        if (TP.notEmpty(fname = TP.sys.cfg('tibet.uris'))) {
            try {
                fname = TP.uriExpandPath(fname);
                if (TP.isURI(url = TP.uc(fname))) {
                    //  NOTE: We do *not* use 'url.getNativeNode()' here
                    //  since this gets loaded very early in the startup
                    //  process. Note that this is a *synchronous* load.
                    node = TP.$fileLoad(url.getLocation(),
                                        TP.hc('resultType', TP.DOM));
                }
            } catch (e) {
            }
        }

        if (TP.notValid(node)) {
            try {
                fname = TP.uriExpandPath(TP.sys.cfg('tibet.uri_file'));
                if (TP.isURI(url = TP.uc(fname))) {
                    //  NOTE: We do *not* use 'url.getNativeNode()' here
                    //  since this gets loaded very early in the startup
                    //  process. Note that this is a *synchronous* load.
                    node = TP.$fileLoad(url.getLocation(),
                                        TP.hc('resultType', TP.DOM));
                }
            } catch (e) {
            }

            if (TP.notValid(node)) {
                node = TP.documentFromString(
                    '<xcat:catalog xmlns:xcat="' +
                    'urn:oasis:names:tc:entity:xmlns:xml:catalog' +
                    '"></xcat:catalog>');
            }
        }

        TP.sys.$uriXML = node;
    } catch (e) {
    } finally {
        //  restore notification state
        TP.sys.shouldLogRaise(flag);
    }

    return node;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getURIXMLString',
function(forceRefresh) {

    /**
     * @name getURIXMLString
     * @synopsis Returns a String representation of the XML file used to store
     *     URI mappings for the current application.
     * @description At runtime TIBET will use data in this file to assist with
     *     URI lookup, caching, loading, and storage. RegExp-based tests are the
     *     fastest at determining exact matches for keys so this string is
     *     reused quite heavily.
     * @param {Boolean} forceRefresh True if the current cached copy should be
     *     cleared and the data reloaded from its source file. Defaults to
     *     false.
     * @returns {Node} The XML content containing the URI map.
     * @todo
     */

    var str,
        node;

    if (TP.isTrue(forceRefresh)) {
        TP.sys.$uriSTR = null;
    }

    //  we cache the string for performance
    if (TP.isString(str = TP.sys.$uriSTR)) {
        return str;
    }

    try {
        //  build it again...
        node = TP.sys.getURIXML(forceRefresh);
        TP.sys.$uriSTR = TP.nodeAsString(node);
    } catch (e) {
    }

    return TP.sys.$uriSTR;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('initializeXMLCatalog',
function(aNode) {

    /**
     * @name initializeXMLCatalog
     * @synopsis Initializes an XML Catalog node so that any embedded TIBET URI
     *     references are fully expanded to their resource URI values (file: or
     *     http: uri values).
     * @param {Node} aNode An XML Catalog document which may contain unexpanded
     *     TIBET URIs.
     * @returns {Node} The XML content containing the URI map.
     */

    var elem,
        items,
        len,
        i,
        item,
        attr;

    //  resolve to a real element
    elem = TP.isDocument(aNode) ? aNode.documentElement : aNode;

    //  once we process a catalog we don't need to do it again
    if (TP.elementGetAttribute(elem, 'tibet:phase', true) === 'Finalize') {
        return aNode;
    }

    //  now we want to update all the URI references to expand them if
    //  they're TIBET URIs most nodes will have uris in some form
    items = TP.nodeGetElementsByTagName(aNode, '*');

    len = items.getSize();
    for (i = 0; i < len; i++) {
        item = items[i];

        if (TP.notEmpty(attr = TP.elementGetAttribute(item, 'name'))) {
            if (TP.regex.TIBET_URI.test(attr)) {
                TP.elementSetAttribute(item,
                                        'name',
                                        TP.uriExpandPath(attr),
                                        true);
            }
        }

        if (TP.notEmpty(attr = TP.elementGetAttribute(item, 'uri'))) {
            if (TP.regex.TIBET_URI.test(attr)) {
                TP.elementSetAttribute(item,
                                        'uri',
                                        TP.uriExpandPath(attr),
                                        true);
            }
        }

        if (TP.notEmpty(attr = TP.elementGetAttribute(
                                            item, 'tibet:localuri', true))) {
            if (TP.regex.TIBET_URI.test(attr)) {
                TP.elementSetAttribute(item,
                                        'tibet:localuri',
                                        TP.uriExpandPath(attr),
                                        true);
            }
        }

        if (TP.notEmpty(attr = TP.elementGetAttribute(item, 'catalog'))) {
            if (TP.regex.TIBET_URI.test(attr)) {
                TP.elementSetAttribute(item,
                                        'catalog',
                                        TP.uriExpandPath(attr),
                                        true);
            }
        }
    }

    //  turn off future initialization passes
    TP.elementSetAttribute(elem, 'tibet:phase', 'Finalize', true);

    return aNode;
});

//  ------------------------------------------------------------------------
//  LOADED SCRIPT AND MODULE METADATA
//  ------------------------------------------------------------------------

TP.sys.defineMethod('getLoadedScripts',
function() {

    /**
     * @name getLoadedScripts
     * @synopsis Returns a list of all scripts loaded in the current system.
     * @returns {Array} An array of all script nodes loaded in the system.
     * @todo
     */

    var nodes,
        scripts,
        len,
        i,
        path;

    scripts = TP.ac();
    nodes = document.getElementsByTagName('script');
    len = nodes.length;

    for (i = 0; i < len; i++) {
        path = nodes[i].getAttribute('src') ||
                nodes[i].getAttribute('source');

        //  trim out non-path values like inline, and adjust any relative
        //  paths to the overall application root.
        if (TP.notEmpty(path) && (path !== 'inline')) {
            scripts.push(TP.uriJoinPaths('~app/', path));
        }
    }

    return scripts.compact();
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getPackageScripts',
function(aPath) {

    /**
     * @name getPackageScripts
     * @synopsis Returns a list of all scripts loaded from a particular package
     *     path.
     * @param {String} aPath The package path to obtain the scripts for.
     * @returns {Array} An array of all script nodes loaded from the supplied
     *     package path.
     * @todo
     */

    var path,
        nodes,
        len,
        i,
        scripts;

    path = TP.uriExpandPath(TP.str(aPath));

    scripts = TP.ac();
    nodes = document.getElementsByTagName('script');
    len = nodes.length;

    for (i = 0; i < len; i++) {
        if (nodes[i].getAttribute(TP.LOAD_PACKAGE) === path) {
            scripts.push(nodes[i].getAttribute('src') ||
                            nodes[i].getAttribute('source'));
        }
    }

    return scripts.compact();
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getPackageTypes',
function(aPath) {

    /**
     * @name getPackageTypes
     * @synopsis Returns a list of all types loaded from the package defined by
     *     either a URI or root object. When a URI is provided it should be a
     *     package configuration URI.
     * @param {String} aPath The package path to obtain the types for.
     * @returns {Array} An array of all TIBET types loaded from the supplied
     *     package path.
     * @todo
     */

    var scripts,
        types;

    scripts = this.getPackageScripts(aPath);
    types = this.getCustomTypes().getValues();

    return types.select(
        function(type) {
            return scripts.contains(TP.objectGetLoadPath(type));
    });
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getScriptTypes',
function(aPath) {

    /**
     * @name getScriptTypes
     * @synopsis Returns a list of all types loaded from the script path
     *     defined.
     * @param {String} aPath The script path to obtain the types for.
     * @returns {Array} An array of all TIBET types loaded from the supplied
     *     script path.
     * @todo
     */

    var path,
        types;

    path = TP.uriExpandPath(TP.str(aPath));
    types = this.getCustomTypes().getValues();

    return types.select(
        function(type) {
            return TP.objectGetLoadPath(type) === path;
        });
});

//  ------------------------------------------------------------------------
//  AUTOLOADING METHODS
//  ------------------------------------------------------------------------

TP.sys.defineMethod('importPackage',
function(aPackageName, aTarget, aBaseDir, shouldReload, loadSync) {

    /**
     * @name importPackage
     * @synopsis Optionally imports a package and target by name. No attempt to
     *     manage inter-package dependencies is made. Using the shouldReload
     *     flag allows you to force reloading of package content when a
     *     particular package has already been loaded. NOTE that you can not
     *     reload the Kernel package.
     * @description This method is a useful way to load code from a package
     *     target. To assist with determining whether a particular target has
     *     already been loaded the target will default to 'base' during the test
     *     phase. This is the typical core target and using base also avoids
     *     issues with nested target references which are common with the full
     *     target. If the full target is found in the load record it is assumed
     *     that all other targets have been loaded. If no target was specified
     *     and neither the base or full target appear to have been loaded the
     *     package will be imported using whatever target was specified, or the
     *     package's default target.
     * @param {String} aPackageName The package name to locate and import as
     *     needed. The package's XML configuration file is presumed to live in
     *     the TIBET configuration directory or in the boot dir of the
     *     application itself. Prefix this name with an appropriate ~ path as
     *     needed to ensure app vs. lib resolution. Default is
     *     ~lib_cfg/[aPackageName].xml.
     * @param {String} aTarget The target name to load. Default is whatever is
     *     listed as the default for that package (usually base).
     * @param {String|TP.core.URI} aBaseDir The base directory to use for
     *     resolving file paths. Normally you should leave this null.
     * @param {Boolean} shouldReload True if the package should be reloaded if
     *     already loaded. The default is false. Note that when you force reload
     *     of a package that package's script elements are reloaded as well.
     * @param {Boolean} loadSync Should the load be done synchronously? Default
     *     is true.
     * @returns {Number} The number of unique nodes loaded from the package
     *     during the import process.
     * @todo
     */

    var sync,
        reload,

        file;

    sync = TP.ifInvalid(loadSync, true);
    reload = TP.ifInvalid(shouldReload, false);

    //  only work on string type references
    if (!TP.isString(aPackageName)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    //  process the URI reference into something explicit for the package
    //  load primitive to use
    if (TP.regex.VIRTUAL_URI_PREFIX.test(aPackageName)) {
        //  if we have what looks like a TIBET URI then we resolve that out
        //  to the true location here
        file = TP.uriExpandPath(aPackageName);
    } else if (!TP.regex.HAS_COLON.test(aPackageName)) {
        //  if the package name includes a scheme separator we presume it's a
        //  full path reference, otherwise we build it up ourselves...

        //  look for the cfg path and build up package file name. note that
        //  this leverages some knowledge that the path will result in a
        //  TIBET uri instance...
        file = TP.uriExpandPath('~lib_cfg/' + aPackageName + '.xml');
    } else {
        file = aPackageName;
    }

    if (!reload) {
        if (TP.sys.hasPackage(file, aTarget)) {
            TP.ifInfo() ?
                TP.info('Skipping package: ' + aPackageName + ' target: ' +
                        (TP.notValid(aTarget) ? 'default' : aTarget) +
                        ' import. ' + 'Target \'' +
                        aTarget + '\' already imported.',
                        TP.LOG, arguments) : 0;

            return 0;
        }
    }

    TP.ifInfo() ?
        TP.info('Importing package: ' + aPackageName +
                ' target: ' + (TP.notValid(aTarget) ? 'default' : aTarget) +
                ' from file: ' + file,
                TP.LOG, arguments) : 0;

    //  NOTE the TP.boot reference here, which means boot code must exist
    return TP.boot.$importPackage(file, aTarget, aBaseDir, sync);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('importNamespace',
function(aNamespaceURI, aPackageName) {

    /**
     * @name importNamespace
     * @synopsis Loads the canonically prefixed target for the specified
     *     namespace provided that the namespace's canonical prefix is mentioned
     *     as a target in either the TNS.xml configuration file or in the XMLNS
     *     'info' hash.
     * @param {String} aNamespaceURI The registered URI for the desired
     *     namespace.
     * @param {String} aPackageName The package name to locate the namespace
     *     prefix in.
     * @returns {Number} The number of unique nodes loaded from the package
     *     during the import process.
     * @todo
     */

    var prefix,
        package;

    package = TP.ifEmpty(aPackageName, 'TNS');
    prefix = TP.w3.Xmlns.get('info').at(aNamespaceURI).at('prefix');

    return TP.sys.importPackage(package, prefix);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('importScript',
function(aURI, aRequest) {

    /**
     * @name importScript
     * @synopsis Loads the uri provided (which should be a JavaScript uri),
     *     adding its code to the currently running application. Note that this
     *     call is done in a synchronous fashion, even though a callback
     *     function may be provided.
     * @param {TP.core.URI|String} aURI A TP.core.URI or String referencing the
     *     script location.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A set of request
     *     parameters. The only meaningful one here is 'callback' which should
     *     point to a function to call on complete.
     * @returns {html:script} The HTML Script node holding the script.
     * @todo
     */

    var url;

    url = TP.uc(aURI);
    if (TP.notValid(url)) {
        return this.raise('TP.sig.InvalidURI', arguments);
    }

    //  adjust the path per any rewrite rules in place for the URI. Note
    //  that we only do this if the url is absolute
    if (TP.uriIsAbsolute(url.getLocation())) {
        url = url.rewrite();
    }

    return TP.boot.$uriImport(url.getLocation(),
                                TP.ifKeyInvalid(aRequest, 'callback', null),
                                true,
                                false);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('importType',
function(aTypeName, shouldReload, isProxy) {

    /**
     * @name importType
     * @synopsis Optionally imports a type by name. Note that this method makes
     *     no attempt to load supertypes, use TP.sys.require for that behavior.
     *     This method is leveraged by the require() function to load single
     *     types, reloading them if forced via the shouldReload flag.
     * @param {String} aTypeName The type name to locate and import as needed.
     * @param {Boolean} shouldReload True if the type should be reloaded if
     *     already found in the system.
     * @param {Boolean} isProxy Is this call being done in support of a type
     *     proxy? If true then certain registration-related tasks are performed
     *     to properly fault in the type. Default is false.
     * @returns {TP.lang.RootObject} A Type object.
     * @todo
     */

    var reload,
        proxy,
        type,
        typeinfo;

    TP.debug('break.require');

    reload = TP.ifInvalid(shouldReload, false);
    proxy = TP.ifInvalid(isProxy, false);

    //  only work on string type references
    if (!TP.isString(aTypeName)) {
        if (TP.isType(aTypeName)) {
            return aTypeName;
        }

        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    //  we get called with a variety of inputs...don't bother if the string
    //  isn't a valid JS identifier or simple "qualified name" TIBET can
    //  handle for types
    if (!TP.isTypeName(aTypeName)) {
        return;
    }

    //  if the type's already loaded then we get off easy...but we have to
    //  qualify here for whether we'll accept a proxy back. when false this
    //  tells getTypeByName not to fault in types (which is good since it
    //  calls this method and we'd recurse)
    if (TP.isType(type = TP.sys.getTypeByName(aTypeName, !proxy))) {
        if (!reload) {
            return type;
        } else {
            //  if the type is already loaded then we don't need to do
            //  anything to get new metadata, we can use what's in place
            typeinfo = TP.sys.getMetadata('types');
        }
    }

    /*
     * TODO Scott: Both metadata and packaging has changed since this was
     * written... is this logic still valid?

    var notfounds,
        typename,
        entries,
        types,
        entry,
        len,
        i,
        parts,
        file,
        url,
        request;

    typeinfo = TP.ifInvalid(typeinfo, TP.sys.getMetadata('types'));

    typename = aTypeName;
    entries = TP.ac();
    types = TP.ac();

    //  check to see if we've already been here...unless reload is true.
    notfounds = TP.sys.getMissingTypes();
    if (TP.notTrue(reload)) {
        if (notfounds.hasKey(typename)) {
            return;
        }
    }

    //  loop until we find the first ancestor that is loaded. along the way
    //  we'll capture the types we have to load into a list
    while (TP.notValid(TP.sys.getTypeByName(typename, !proxy))) {
        notfounds = notfounds || TP.sys.getMissingTypes();
        entry = typeinfo.at(typename);
        if (TP.notValid(entry)) {
            notfounds.atPut(typename, null);
            TP.ifWarn(TP.$$DEBUG && TP.$$VERBOSE) ?
                TP.warn('No metadata for type: ' + typename,
                        TP.LOG, arguments) : 0;

                return;
        } else {
            notfounds.removeKey(typename);
        }

        //  unshift pushes on the front so when we start iterating below
        //  we'll be working from the highest supertype in the tree first.
        entries.unshift(typename, entry);

        //  supertype is first portion of the current type's entry. capture
        //  that and keep feeding the loop until we find a type that's
        //  already been loaded.
        typename = entry.split('|').first();
    }

    request = TP.request();

    len = entries.getSize();
    for (i = 0; i < len; i += 2) {
        typename = entries.at(i);
        entry = entries.at(i + 1);
        parts = entry.split('|');

        //  a type entry is a string of the form supertype|filepath
        file = parts.at(1);
        file = TP.sys.$$decodeMetadata(file);

        //  get TP.core.URI to do the work of making sure we've got a proper
        //  file reference, that we expand it from TIBET form, etc.
        url = TP.uc(file);
        if (TP.isURI(url)) {
            if (TP.sys.hasLoaded()) {
                TP.ifTrace(TP.$DEBUG && TP.$VERBOSE) ?
                    TP.trace('Importing type: ' + typename +
                                    ' from file: ' + file,
                                TP.LOG, arguments) : 0;
            } else {
                TP.boot.$stdout(
                    'Loading ' + TP.boot.$uriInTIBETFormat(file) +
                    ' for type ' + typename + '.', TP.TRACE);
            }

            TP.boot.$scriptWillLoad(file);

            //  NOTE that we don't force reload on supers, only the primary
            //  target type
            if (i + 2 === len) {
                request.atPut('refresh', reload);
            } else {
                request.atPut('refresh', false);
            }
            TP.sys.importScript(url, request);

            TP.boot.$scriptDidLoad(file);
        } else {
            //  if we don't have a valid file then we're out of luck
            TP.ifWarn(TP.$DEBUG && TP.$VERBOSE) ?
                TP.warn('Unable to lookup script file for: ' + typename,
                        TP.LOG, arguments) : 0;

            return;
        }

        //  if TP.core.URI was successful then the type is now registered...
        type = TP.sys.getTypeByName(typename, !proxy);

        if (TP.notValid(type)) {
            TP.ifWarn(TP.$DEBUG && TP.$VERBOSE) ?
                TP.warn('Unable to import type: ' + typename,
                        TP.LOG, arguments) : 0;

            return;
        } else {
            types.push(type);
        }
    }

    //  just like the initial load process, we wait for all types to load,
    //  then initialize those that we loaded along the way
    len = types.getSize();
    for (i = 0; i < len; i++) {
        type = types.at(i);
        if (TP.canInvoke(type, 'initialize') &&
            (type.initialize[TP.OWNER] === type)) {
            try {
                type.initialize();
                type.isInitialized(true);
            } catch (e) {
                this.raise('TP.sig.InitializationException',
                            arguments,
                            'Unable to initialize ' + type.getName());
            }
        }
    }

    return type;
    */

    return null;
});

//  ------------------------------------------------------------------------

//  simple alias that doesn't change the actual method name/owner info.
TP.sys.require = TP.sys.importType;

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
