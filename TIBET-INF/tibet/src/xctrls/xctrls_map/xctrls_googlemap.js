//  ========================================================================
/*
NAME:   xctrls_googlemap.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.2, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.1
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
 * @type {TP.xctrls.googlemap}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.xctrls.map.defineSubtype('googlemap');

TP.xctrls.googlemap.shouldRegisterInstances(true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineAttribute('$controls');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('addControl',
function(aControlName) {

    /**
     * @name $addControl
     * @param {undefined} aControlName
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    var newControl;

    newControl = this.get('tpIFrame').constructObject(aControlName);
    this.get('map').addControl(newControl);
    this.get('$controls').push(newControl);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('$computeGoogleMapScriptSrc',
function() {

    /**
     * @name $computeGoogleMapScriptSrc
     * @returns {String} 
     * @abstract
     * @todo
     */

    var scriptSrcURL,
        promptResponse;

    //  NOTE we break this apart at the '=' to make lint happy
    scriptSrcURL = 'http://maps.google.com/maps?file' +
                    '=api&amp;v' +
                    '=2';

    if (TP.sys.getHost() === 'www.teamtibet.com') {
        scriptSrcURL += '&amp;key=';
        scriptSrcURL += 'ABQIAAAAzoA5NNjo_-QiYUYvQRpT0RSjtrq-CQXrGeMzST1i1B8lQE1tOxSt-Axj-Be6w0eRhU_n84bqnK92wA';

        return scriptSrcURL;
    } else if (TP.sys.getHost() === 'localhost') {
        scriptSrcURL += '&amp;key=';
        scriptSrcURL += 'ABQIAAAAzoA5NNjo_-QiYUYvQRpT0RT2yXp_ZAY8_ufC3CFXhHIE1NvwkxSGIytpSlL94aueLIRsScd7x4WogA';

        return scriptSrcURL;
    } else if (TP.isEmpty(TP.sys.getHost())) {
        //  File-based

        scriptSrcURL += '';

        return scriptSrcURL;
    } else {
        promptResponse = TP.prompt('You loaded a TIBET-based application from a domain that has no known Google Maps key: ' + TP.sys.getHost() + '. Please enter your Google Maps key (only the part after "key' + '=").');

        if (TP.notEmpty(promptResponse)) {
            scriptSrcURL += '&amp;key=';
            scriptSrcURL += promptResponse;
        }

        return scriptSrcURL;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('$convertLatLongToGoogleLatLong',
function(aLatLong) {

    /**
     * @name $convertLatLongToGoogleLatLong
     * @param {TP.core.LatLong} aLatLong 
     * @returns {Object} A Google LatLong object.
     * @abstract
     * @todo
     */

    return this.get('tpIFrame').constructObject('GLatLng',
                                                aLatLong.get('lat'),
                                                aLatLong.get('long'));
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('$convertMarkerToGoogleMarker',
function(aMarker) {

    /**
     * @name $convertMarkerToGoogleMarker
     * @param {TPMarker} aMarker 
     * @returns {Object} A Google marker object.
     * @abstract
     * @todo
     */

    var tpIFrame,

        optionsObj,
        optionValue,

        googleMarker;

    tpIFrame = this.get('tpIFrame');

    optionsObj = tpIFrame.constructObject('Object');

    if (TP.isValid(optionValue = aMarker.get('labelText'))) {
        optionsObj.title = optionValue;
    }

    if (TP.isValid(optionValue = aMarker.get('iconURL'))) {
        optionsObj.icon = tpIFrame.constructObject(
                'GIcon',
                tpIFrame.get('G_DEFAULT_ICON'),
                optionValue);
    }

    googleMarker = tpIFrame.constructObject(
                    'GMarker',
                    this.$convertLatLongToGoogleLatLong(
                                                aMarker.get('location')),
                    optionsObj);

    return googleMarker;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('init',
function(aNode, aURI) {

    /**
     * @name init
     * @synopsis Returns a newly initialized instance.
     * @param {Node} aNode A native node.
     * @param {TP.core.URI|String} aURI An optional URI from which the Node
     *     received its content.
     * @returns {TP.xctrls.googlemap} A new instance.
     * @todo
     */

    this.callNextMethod();

    this.set('$controls', TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('addControls',
function(hasPan, zoomType, hasOverview, hasScale, hasMapType) {

    /**
     * @name addControls
     * @param {undefined} hasPan
     * @param {undefined} zoomType
     * @param {undefined} hasOverview
     * @param {undefined} hasScale
     * @param {undefined} hasMapType
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    //  Remove all existing controls
    this.removeAllControls();

    if (TP.isValid(zoomType) || (TP.isTrue(hasPan))) {
        this.$addControl('GLargeMapControl');
    } else {
        this.$addControl('GSmallMapControl');
    }

    if (TP.isTrue(hasOverview)) {
        this.$addControl('GMapTypeControl');
    }

    if (TP.isTrue(hasScale)) {
        this.$addControl('GScaleControl');
    }

    if (TP.isTrue(hasMapType)) {
        this.$addControl('GOverviewMapControl');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('addLargeControls',
function() {

    /**
     * @name addLargeControls
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    this.$addControl('GLargeMapControl');
    this.$addControl('GMapTypeControl');
    this.$addControl('GScaleControl');
    this.$addControl('GOverviewMapControl');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('addMapTypeControls',
function() {

    /**
     * @name addMapTypeControls
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    this.$addControl('GMapTypeControl');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('addMarker',
function(aMarker) {

    /**
     * @name addMarker
     * @param {undefined} aMarker
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    var googleMarker;

    googleMarker = this.$convertMarkerToGoogleMarker(aMarker);
    aMarker.set('nativeMarker', googleMarker);

    //  Make sure and do this *before* we add the overlay to the native map
    //  object.
    this.get('tpIFrame').get('GEvent').addListener(
                googleMarker,
                'click',
                TP.windowBuildFunctionFor(
                    this.get('tpIFrame').getNativeContentWindow(),
                    function() {

                        this.signal('TP_xctrls_MapMarkerClicked',
                                        null,
                                        aMarker);
                    }.bind(this)));

    this.get('map').addOverlay(googleMarker);

    this.get('markers').push(aMarker);

    this.signal('TP_xctrls_MapMarkerAdded', null, aMarker);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('addSmallControls',
function() {

    /**
     * @name addSmallControls
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    this.$addControl('GSmallMapControl');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('configure',
function() {

    /**
     * @name configure
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    var tpIFrame,

        natIFrameWin,
        natIFrameDoc,

        mapNode,
        mapObj;

    tpIFrame = this.get('tpIFrame');

    natIFrameWin = tpIFrame.getNativeContentWindow();
    natIFrameDoc = tpIFrame.getNativeContentDocument();

    mapNode = TP.nodeGetElementById(natIFrameDoc, 'map_stub');
    mapObj = tpIFrame.constructObject('GMap2', mapNode);
    mapObj.setUIToDefault();

    this.set('map', mapObj);

    tpIFrame.get('GEvent').addListener(
            this.get('map'),
            'click',
            TP.windowBuildFunctionFor(
                natIFrameWin,
                function(marker, location) {

                    this.signal('TP_xctrls_MapClicked',
                                    null,
                                    TP.llc(location.x, location.y));
                }.bind(this)));

    tpIFrame.get('GEvent').addListener(
            this.get('map'),
            'moveend',
            TP.windowBuildFunctionFor(
                natIFrameWin,
                function() {

                    this.signal('TP_xctrls_MapPanned',
                                    null,
                                    this.getCenter());
                }.bind(this)));

    this.refresh();

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('getBounds',
function() {

    /**
     * @name getBounds
     * @returns {TP.core.MapBounds} 
     * @abstract
     * @todo
     */

    var googleBox,

        southWest,
        northEast,

        newBounds;

    googleBox = this.get('map').getBounds();

    southWest = googleBox.getSouthWest();
    northEast = googleBox.getNorthEast();

    newBounds = TP.core.MapBounds.construct(
                                    southWest.lat(), southWest.lng(),
                                    northEast.lat(), northEast.lng());

    return newBounds;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('getCenter',
function() {

    /**
     * @name getCenter
     * @returns {TP.core.LatLong} 
     * @abstract
     * @todo
     */

    var googleLatLong;

    googleLatLong = this.get('map').getCenter();

    return TP.llc(googleLatLong.lat(), googleLatLong.lng());
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('getLatLongForAddress',
function(anAddress) {

    /**
     * @name getLatLongForAddress
     * @param {String} anAddress The address to plot.
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    var geocoder;

    geocoder = this.get('tpIFrame').constructObject('GClientGeocoder');

    geocoder.getLocations(
        anAddress,
        function(response) {

            var responseLatLong;

            if (TP.notValid(response) || response.Status.code !== 200) {
                //  TODO: Log an error here
                return;
            }

            responseLatLong = TP.llc(
                    response.Placemark[0].Point.coordinates[1],     // lat
                    response.Placemark[0].Point.coordinates[0]);    // long

            responseLatLong.set('description',
                                response.Placemark[0].address);

            this.signal('TP_xctrls_MapGeocodeComplete',
                        null,
                        responseLatLong);
        }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('getMapType',
function() {

    /**
     * @name getMapType
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    var mapTypeConstants,

        ourMap,
        tpIFrame,

        currentMapType;

    mapTypeConstants = this.getType();

    ourMap = this.get('map');
    tpIFrame = this.get('tpIFrame');

    currentMapType = ourMap.getCurrentMapType();

    switch (currentMapType) {
        case tpIFrame.get('G_NORMAL_MAP'):

            return mapTypeConstants.at('ROAD');

        case tpIFrame.get('G_SATELLITE_MAP'):

            return mapTypeConstants.at('SATELLITE');

        case tpIFrame.get('G_HYBRID_MAP'):

            return mapTypeConstants.at('HYBRID');

        default:

        break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('getZoom',
function() {

    /**
     * @name getZoom
     * @returns {Number} 
     * @abstract
     * @todo
     */

    return this.get('map').getZoom();
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('getZoomLevelForMapBounds',
function(aMapBounds) {

    /**
     * @name getZoomLevelForMapBounds
     * @param {TP.core.MapBounds} aMapBounds 
     * @returns {Number} 
     * @abstract
     * @todo
     */

    var southWestGLatLong,
        northEastGLatLong,

        googleBox,
        zoom;

    northEastGLatLong = this.$convertLatLongToGoogleLatLong(
                                aMapBounds.get('northEastLatLong'));
    southWestGLatLong = this.$convertLatLongToGoogleLatLong(
                                aMapBounds.get('southWestLatLong'));

    googleBox = this.get('tpIFrame').constructObject('GLatLngBounds',
                                                        southWestGLatLong,
                                                        northEastGLatLong);

    zoom = this.get('map').getBoundsZoomLevel(googleBox);

    return zoom;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('hideAllMarkers',
function() {

    /**
     * @name hideAllMarkers
     * @synopsis Hides all of the markers without removing them from the marker
     *     list.
     * @returns {TP.xctrls.googlemap} The receiver.
     */

    this.get('map').clearOverlays();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('removeAllControls',
function() {

    /**
     * @name removeAllControls
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    var ourMap;

    ourMap = this.get('map');

    //  First, remove any existing controls.
    this.get('$controls').perform(
            function(aControl) {

                ourMap.removeControl(aControl);
            });

    //  Then, empty out our control list.
    this.get('$controls').empty();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('removeMarker',
function(aMarker) {

    /**
     * @name removeMarker
     * @param {undefined} aMarker
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    this.get('map').removeOverlay(aMarker.get('nativeMarker'));

    this.get('markers').remove(aMarker, TP.IDENTITY);

    this.signal('TP_xctrls_MapMarkerRemoved', null, aMarker);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('setBounds',
function(aMapBounds) {

    /**
     * @name setBounds
     * @param {undefined} aMapBounds
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    var southWestGLatLong,
        northEastGLatLong,

        googleBox;

    northEastGLatLong = this.$convertLatLongToGoogleLatLong(
                                aMapBounds.get('northEastLatLong'));
    southWestGLatLong = this.$convertLatLongToGoogleLatLong(
                                aMapBounds.get('southWestLatLong'));

    googleBox = this.get('tpIFrame').constructObject('GLatLngBounds',
                                                        southWestGLatLong,
                                                        northEastGLatLong);

    this.get('map').setCenter(
                googleBox.getCenter(),
                this.get('map').getBoundsZoomLevel(googleBox));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('setCenter',
function(aLatLong) {

    /**
     * @name setCenter
     * @param {undefined} aLatLong
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    var currentCenter,

        latLongParts,
        theLatLong;

    currentCenter = this.getCenter();

    if (TP.isString(aLatLong)) {
        latLongParts = aLatLong.split(',');
        theLatLong = TP.llc(latLongParts.at(0), latLongParts.at(1));
    } else {
        theLatLong = aLatLong;
    }

    //  If we're already at the center point, exit here and avoid possible
    //  signaling recursion (if we have maps that are observing each other).
    if ((currentCenter.get('lat') === theLatLong.get('lat')) &&
        (currentCenter.get('long') === theLatLong.get('long'))) {
        return this;
    }

    //  NB: We don't signal 'TP.xctrls.MapPanned' manually from here since
    //  the map infrastructure kicks our event handler that will do that
    //  when we center the map.

    this.get('map').setCenter(
            this.$convertLatLongToGoogleLatLong(theLatLong));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('setCenterAndZoom',
function(aLatLong, zoomLevel) {

    /**
     * @name setCenterAndZoom
     * @param {undefined} aLatLong
     * @param {undefined} zoomLevel
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    //  NB: We don't signal 'TP.xctrls.MapPanned' manually from here since
    //  the map infrastructure kicks our event handler that will do that
    //  when we center the map.

    this.get('map').setCenter(
            this.$convertLatLongToGoogleLatLong(aLatLong),
            zoomLevel);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('setIsDraggable',
function(shouldBeDraggable) {

    /**
     * @name setIsDraggable
     * @param {undefined} shouldBeDraggable
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    if (TP.isTrue(shouldBeDraggable)) {
        this.get('map').enableDragging();
    } else {
        this.get('map').disableDragging();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('setMapType',
function(aMapType) {

    /**
     * @name setMapType
     * @param {undefined} aMapType
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    var mapTypeConstants,

        ourMap,
        tpIFrame;

    mapTypeConstants = this.getType();

    ourMap = this.get('map');
    tpIFrame = this.get('tpIFrame');

    switch (aMapType) {
        case    mapTypeConstants.at('ROAD'):

            ourMap.setMapType(tpIFrame.get('G_NORMAL_MAP'));

        break;

        case    mapTypeConstants.at('SATELLITE'):

            ourMap.setMapType(tpIFrame.get('G_SATELLITE_MAP'));

        break;

        case    mapTypeConstants.at('HYBRID'):

            ourMap.setMapType(tpIFrame.get('G_HYBRID_MAP'));

        break;

        default:

            ourMap.setMapType(tpIFrame.get('G_NORMAL_MAP'));

        break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('setZoom',
function(zoomLevel) {

    /**
     * @name setZoom
     * @param {undefined} zoomLevel
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    this.get('map').setZoom(zoomLevel);

    this.signal('TP_xctrls_MapZoomed');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('showAllMarkers',
function() {

    /**
     * @name showAllMarkers
     * @synopsis Shows all of the markers from the marker list on the map.
     * @returns {TP.xctrls.googlemap} The receiver.
     */

    var tpIFrame,
        natIFrameWin;

    tpIFrame = this.get('tpIFrame');
    natIFrameWin = tpIFrame.getNativeContentWindow();

    this.get('markers').perform(
            function(aMarker) {

                var googleMarker;

                googleMarker = this.$convertMarkerToGoogleMarker(aMarker);
                aMarker.set('nativeMarker', googleMarker);

                //  Make sure and do this *before* we add the overlay to
                //  the native map object.
                tpIFrame.get('GEvent').addListener(
                            googleMarker,
                            'click',
                            TP.windowBuildFunctionFor(
                            natIFrameWin,
                            function() {

                                this.signal('TP_xctrls_MapMarkerClicked',
                                                null,
                                                aMarker);
                            }.bind(this)));

                this.get('map').addOverlay(googleMarker);
            }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('sizeTo',
function(width, height) {

    /**
     * @name sizeTo
     * @param {Number} width
     * @param {Number} height
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('startIFrameLoad',
function() {

    /**
     * @name startIFrameLoad
     * @synopsis Begins the iframe loading of the receiver. This method loads
     *     the content from the 'frameFileURI' into the iframe constructed by
     *     this type and sets up a callback handler that will call this type's
     *     'configure' method when the content from the iframe is all loaded and
     *     initialized.
     * @returns {TP.xctrls.googlemap} The receiver.
     */

    var tpIFrame;

    tpIFrame = this.get('tpIFrame');

    //  The following process of setting up a map for Google is quite
    //  convoluted, due to poor design of the loading API which almost ;-)
    //  precludes 'dynamic' loading of a Google Map. We worked around it
    //  though...

    //  Set the 'computeMapSrc' Function slot on our native iframe element
    //  that we constructed. This will be called by the code in the stub
    //  file, which will use the value returned by this Function (which is
    //  the API key mixed in with the URL) to set up its contents.
    //  What a mess...
    tpIFrame.getNativeNode().computeMapSrc =
                                this.$computeGoogleMapScriptSrc;

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.googlemap.Inst.defineMethod('swapMarker',
function(aMarker) {

    /**
     * @name swapMarker
     * @param {undefined} aMarker
     * @returns {TP.xctrls.googlemap} The receiver.
     * @abstract
     * @todo
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
