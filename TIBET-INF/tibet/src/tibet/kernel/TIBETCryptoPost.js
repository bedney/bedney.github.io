//	========================================================================
/*
NAME:   TIBETCryptoPrimitives.js
AUTH:	See below for credits.
NOTE:	Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
		Reserved. Patent Pending, Technical Pursuit Inc.

        Public TIBET api to ~lib/deps/forge-tpi.js See that file
        for more information.
*/
//	========================================================================

TP.definePrimitive('decryptStorageValue',
function(aValue, aPassword) {

    /**
     * @name decryptStorageValue
     * @synopsis Decrypts the supplied value with the supplied password.
     * @description Note that this method expects the value to be in a specific
     *      format, such as that produced by 'encryptStorageValue'.
     * @param {String} aValue The data to decrypt using the supplied key.
     * @param {String} aPassword The password to use to decrypt the supplied
     *      data.
     * @raises TP.sig.InvalidString
     * @returns {String} The decrypted value.
     */

    var valueRecord,

        saltStr,
        ivStr,
        encStr,

        encKey,
        encVal;

    if (!TP.isString(aValue) || !TP.isString(aPassword)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    //  If we can create a 'record' from the JSON string
    if (TP.notValid(valueRecord = TP.json2js(aValue))) {
        return null;
    }

    //  Make sure that the salt, iv and value are available.
    if (TP.isEmpty(saltStr =
                    TP.extern.forge.util.hexToBytes(valueRecord.at('salt')))) {
        return null;
    }

    if (TP.isEmpty(ivStr =
                    TP.extern.forge.util.hexToBytes(valueRecord.at('iv')))) {
        return null;
    }

    if (TP.isEmpty(encStr = valueRecord.at('value'))) {
        return null;
    }

    //  Go ahead and generate an encryption key off of the password and use it
    //  to decrypt the value.
    encKey = aPassword.computeEncryptionKey(saltStr);
    encVal = encStr.decrypt(encKey, TP.hc('iv', ivStr));

    return encVal;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('encryptStorageValue',
function(aValue, aPassword) {

    /**
     * @name encryptStorageValue
     * @synopsis Encrypts the supplied value with the supplied password.
     * @param {String} aValue The data to encrypt using the supplied key.
     * @param {String} aPassword The password to use to encrypt the supplied
     *      data.
     * @raises TP.sig.InvalidString
     * @returns {String} The encrypted value and attendant crypto information as
     *     a JSON-ified String.
     */

    var saltStr,
        ivStr,

        encKey,
        encVal,

        valueRecord,
        recordStr;

    if (!TP.isString(aValue) || !TP.isString(aPassword)) {
        return TP.raise(this, 'TP.sig.InvalidString', arguments);
    }

    //  Generate random values to use for the password 'salt' and the encryption
    //  'iv' value. These will be stored with the value in a JSON data structure
    //  that will be used as the real value.
    saltStr = TP.generateRandomValue(128 / 8);
    ivStr = TP.generateRandomValue(128 / 8);

    //  Generate an encryption key off of the password and use it to encrypt the
    //  value.
    encKey = aPassword.computeEncryptionKey(saltStr);
    encVal = aValue.encrypt(encKey, TP.hc('iv', ivStr));

    //  Construct a 'value record' of the salt used to generate the password,
    //  the 'iv' value supplied to the encryption route and the actual value
    //  encrypted and make a JSON string out of them.
    valueRecord = TP.hc('salt', TP.extern.forge.util.bytesToHex(saltStr),
                        'iv', TP.extern.forge.util.bytesToHex(ivStr),
                        'value', encVal);
    recordStr = TP.js2json(valueRecord);

    return recordStr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('hash',
function(anObject, aHashMode, aHashFormat) {

    /**
     * @name hash
     * @synopsis Hashes the string representation of the Object provided.
     * @param {Object} anObject The object to acquire a hash code for.
     * @param {Number} aHashMode TP.HASH_MD5 or TP.HASH_SHA1. The default is
     *     SHA-1 since MD5 has been cracked.
     * @param {Number} aHashFormat TP.HASH_HEX, TP.HASH_B64, or TP.HASH_LATIN1.
     *     The default is TP.HASH_HEX.
     * @raises TP.sig.InvalidParameter
     * @returns {String} The hashed string result.
     */

    var str,

        mode,
        fmt,

        result;

    if (TP.notValid(anObject)) {
        return TP.raise(null, 'TP.sig.InvalidParameter', arguments);
    }

    str = TP.str(anObject);

    mode = TP.ifInvalid(aHashMode, TP.HASH_SHA1);
    fmt = TP.ifInvalid(aHashFormat, TP.HASH_HEX);

    switch (mode) {
        case TP.HASH_MD5:

            result = TP.extern.forge.md.md5.create();
            result.update(str);

            break;

        case TP.HASH_SHA1:

            result = TP.extern.forge.md.sha1.create();
            result.update(str);

            break;
    }

    switch (fmt) {

        case TP.HASH_B64:

            return TP.extern.forge.util.encode64(result.digest().data);

        case TP.HASH_LATIN1:

            return result.digest().data;

        case TP.HASH_HEX:

            return result.digest().toHex();
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('hmac',
function(anObject, aKey, aHashMode, aHashFormat) {

    /**
     * @name hmac
     * @synopsis Generates an HMAC (hashed message authentication code)
     *     representation of the Object provided.
     * @param {Object} anObject The object to acquire a HMAC code for.
     * @param {String} aKey A string used as the key.
     * @param {Number} aHashMode TP.HASH_MD5 or TP.HASH_SHA1. The default is
     *     SHA-1 since MD5 has been cracked.
     * @param {Number} aHashFormat TP.HASH_HEX, TP.HASH_B64, or TP.HASH_LATIN1.
     *     The default is TP.HASH_HEX.
     * @raises TP.sig.InvalidParameter
     * @returns {String} The hashed message authentication code.
     */

    var str,

        mode,
        fmt,

        hmac;

    if (TP.notValid(anObject) || TP.notValid(aKey)) {
        return TP.raise(null, 'TP.sig.InvalidParameter', arguments);
    }

    str = TP.str(anObject);

    mode = TP.ifInvalid(aHashMode, TP.HASH_SHA1);
    fmt = TP.ifInvalid(aHashFormat, TP.HASH_HEX);

    hmac = TP.extern.forge.hmac.create();

    switch (mode) {
        case TP.HASH_MD5:

            hmac.start('MD5', aKey);
            hmac.update(str);

            break;

        case TP.HASH_SHA1:

            hmac.start('SHA1', aKey);
            hmac.update(str);

            break;
    }

    switch (fmt) {

        case TP.HASH_B64:

            return TP.extern.forge.util.encode64(hmac.digest().data);

        case TP.HASH_LATIN1:

            return hmac.digest().data;

        case TP.HASH_HEX:

            return hmac.digest().toHex();
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('generateRandomValue',
function(numberOfBytes) {

    /**
     * @name generateRandomValue
     * @synopsis Generates a reasonably secure random value given the
     *     supplied number of bytes.
     * @param {Number} numberOfBytes The number of bytes to generate.
     * @raises TP.sig.InvalidNumber
     * @returns {String} A String representing a random number of bytes.
     */

    if (!TP.isNumber(numberOfBytes)) {
        return TP.raise(null, 'TP.sig.InvalidNumber', arguments);
    }

    return TP.extern.forge.random.getBytesSync(numberOfBytes);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('computeEncryptionKey',
function(aSalt, params) {

    /**
     * @name computeEncryptionKey
     * @synopsis Computes an encryption key using the receiver as the 'password'
     *     and the supplied 'salt'. This method uses the PBKDF2 algorithm.
     * @param {String} aSalt The salt value to supply to the PBKDF2 algorithm.
     * @param {TP.lang.Hash} params Various optional parameters to use to
     *     compute the encryption key. These include 'keySize', which defaults
     *     to TP.PBKDF2_KEYSIZE and 'iterationCount' which defaults to
     *     TP.PBKDF2_ITERATION_COUNT.
     * @raises TP.sig.InvalidString
     * @returns {String} The computed encryption key.
     */

    var str,

        keySize,
        iterationCount,

        encKey;

    if (!TP.isString(aSalt)) {
        return this.raise('TP.sig.InvalidString', arguments);
    }

    //  Make sure the receiver is a String
    str = this.asString();

    //  Default the keySize to TP.PBKDF2_KEYSIZE and the iteration count to
    //  TP.PBKDF_ITERATION_COUNT if they're not defined (or 'params' isn't
    //  defined at all).
    if (TP.isKindOf(params, TP.lang.Hash)) {
        keySize = params.atIfInvalid('keySize', TP.PBKDF2_KEYSIZE);
        iterationCount = params.atIfInvalid('iterationCount',
                                            TP.PBKDF2_ITERATION_COUNT);
    } else {
        keySize = TP.PBKDF2_KEYSIZE;
        iterationCount = TP.PBKDF2_ITERATION_COUNT;
    }

    encKey = TP.extern.forge.pkcs5.pbkdf2(str, aSalt, iterationCount, keySize);

    return encKey;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('decrypt',
function(aKey, params) {

    /**
     * @name decrypt
     * @synopsis Performs an AES decryption on the receiver, returning the
     *     plaintext value.
     * @param {String} aKey A string used as the key.
     * @param {TP.lang.Hash} params Various optional parameters to the
     *     decryption method. These include 'iv', which is the AES IV size.
     * @raises TP.sig.InvalidString
     * @returns {String} The decrypted result string.
     */

    var str,

        opts,
        iv,

        cipher,
        buffer;

    if (!TP.isString(aKey)) {
        return this.raise('TP.sig.InvalidString', arguments);
    }

    //  Make sure the receiver is a String
    str = this.asString();

    opts = TP.ifInvalid(params, TP.hc());

    //  'iv' cannot be empty.
    if (TP.isEmpty(iv = opts.at('iv'))) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    cipher = TP.extern.forge.aes.createDecryptionCipher(aKey, 'CBC');

    buffer = TP.extern.forge.util.createBuffer(
                        TP.extern.forge.util.hexToBytes(str), 'raw');

    cipher.start(iv);
    cipher.update(buffer);
    cipher.finish();

    return cipher.output.data;
});

//  ------------------------------------------------------------------------

TP.defineCommonMethod('encrypt',
function(aKey, params) {

    /**
     * @name encrypt
     * @synopsis Performs an AES encryption on the receiver's string
     *     representation. The key must be a string.
     * @param {String} aKey A string used as the key.
     * @param {TP.lang.Hash} params Various parameters to the encryption method.
     *     These include 'iv', which is the AES 'iv' value and is required.
     * @raises TP.sig.InvalidString
     * @returns {String} The encrypted result string.
     */

    var str,

        opts,
        iv,

        cipher;

    if (!TP.isString(aKey)) {
        return this.raise('TP.sig.InvalidString', arguments);
    }

    //  Make sure the receiver is a String
    str = this.asString();

    opts = TP.ifInvalid(params, TP.hc());

    //  'iv' cannot be empty.
    if (TP.isEmpty(iv = opts.at('iv'))) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    cipher = TP.extern.forge.aes.createEncryptionCipher(aKey, 'CBC');

    cipher.start(iv);
    cipher.update(TP.extern.forge.util.createBuffer(str));
    cipher.finish();

    return cipher.output.toHex();
});

//	------------------------------------------------------------------------
//	end
//	========================================================================
