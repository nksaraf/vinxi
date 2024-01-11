// Rewrite from https://github.com/Subash/mkcert 1.5.1 (MIT)
import { promisify } from "node:util";
import nodeOS from "node:os";
import { promises as fs } from "node:fs";
import forge from "node-forge";
import ipRegex from "ip-regex";
import { defu } from "defu";
export async function resolveCertificate(options) {
    let https;
    if (typeof options === "object" && options.key && options.cert) {
        // Resolve actual certificate and cert
        https = await resolveCert(options);
        if (options.passphrase) {
            https.passphrase = options.passphrase;
        }
    }
    else if (typeof options === "object" && options.pfx) {
        // Resolve certificate and key from PKCS#12 (PFX) store
        const pfx = await resolvePfx(options);
        if (!pfx.safeContents ||
            pfx.safeContents.length < 2 ||
            pfx.safeContents[0].safeBags.length === 0 ||
            pfx.safeContents[1].safeBags.length === 0) {
            throw new Error("keystore not containing a cert AND a key");
        }
        // Maybe the order of the cert/key differs sometimes. Tests should show this
        const _cert = pfx.safeContents[0].safeBags[0].cert;
        const _key = pfx.safeContents[1].safeBags[0].key;
        https = {
            key: forge.pki.privateKeyToPem(_key),
            cert: forge.pki.certificateToPem(_cert),
        };
    }
    else {
        const { cert } = await generateCertificates(options);
        https = cert;
    }
    return https;
}
async function generateCertificates(options) {
    const defaults = {
        commonName: "localhost",
        countryCode: "US",
        state: "Michigan",
        locality: "Berkley",
        organization: "Testing Corp",
        organizationalUnit: "IT department",
        domains: ["localhost", "127.0.0.1", "::1"],
        validityDays: 1,
        bits: 2048,
    };
    const caOptions = defu(options, defaults);
    caOptions.passphrase = options.signingKeyPassphrase;
    const ca = await generateCACert(caOptions);
    const domains = Array.isArray(options.domains)
        ? options.domains
        : ["localhost", "127.0.0.1", "::1"];
    const certOptions = defu(options, defaults);
    const cert = await generateTLSCert({
        ...certOptions,
        signingKeyCert: ca.cert,
        signingKey: ca.key,
        domains,
    });
    return { ca, cert };
}
async function resolveCert(options) {
    // Use cert if provided
    if (options && options.key && options.cert) {
        const isInline = (s = "") => s.startsWith("--");
        const r = (s) => (isInline(s) ? s : fs.readFile(s, "utf8"));
        return {
            key: await r(options.key),
            cert: await r(options.cert),
        };
    }
    throw new Error("Certificate or Private Key not present");
}
async function resolvePfx(options) {
    if (options && options.pfx) {
        const pfx = await fs.readFile(options.pfx, "binary");
        const p12Asn1 = forge.asn1.fromDer(pfx);
        if (options.passphrase) {
            return forge.pkcs12.pkcs12FromAsn1(p12Asn1, options.passphrase);
        }
        return forge.pkcs12.pkcs12FromAsn1(p12Asn1, "");
    }
    throw new Error("Error resolving the pfx store");
}
function createAttributes(options) {
    // Certificate Attributes: https://git.io/fptna
    return [
        options.commonName && { name: "commonName", value: options.commonName },
        options.countryCode && { name: "countryName", value: options.countryCode },
        options.state && { name: "stateOrProvinceName", value: options.state },
        options.locality && { name: "localityName", value: options.locality },
        options.organization && {
            name: "organizationName",
            value: options.organization,
        },
        options.organizationalUnit && {
            name: "organizationalUnitName",
            value: options.organizationalUnit,
        },
        options.emailAddress && {
            name: "emailAddress",
            value: options.emailAddress,
        },
    ].filter(Boolean);
}
function createCertificateInfo(options) {
    if (!options.domains || (options.domains && options.domains.length === 0)) {
        options.domains = ["localhost.local"];
    }
    options.commonName = options.commonName || options.domains[0];
    const attributes = createAttributes(options);
    // Required certificate extensions for a tls certificate
    const extensions = [
        { name: "basicConstraints", cA: false, critical: true },
        {
            name: "keyUsage",
            digitalSignature: true,
            keyEncipherment: true,
            critical: true,
        },
        { name: "extKeyUsage", serverAuth: true, clientAuth: true },
        {
            name: "subjectAltName",
            altNames: options.domains.map((domain) => {
                // Available Types: https://git.io/fptng
                const types = { domain: 2, ip: 7 };
                const isIp = ipRegex({ exact: true }).test(domain);
                if (isIp) {
                    return { type: types.ip, ip: domain };
                }
                return { type: types.domain, value: domain };
            }),
        },
    ];
    return { attributes, extensions };
}
function createCaInfo(options) {
    const attributes = createAttributes(options);
    // Required certificate extensions for a certificate authority
    const extensions = [
        { name: "basicConstraints", cA: true, critical: true },
        { name: "keyUsage", keyCertSign: true, critical: true },
    ];
    return { attributes, extensions };
}
async function generateTLSCert(options) {
    // Certificate Attributes (https://git.io/fptna)
    const { attributes, extensions } = createCertificateInfo(options);
    const ca = forge.pki.certificateFromPem(options.signingKeyCert);
    return await generateCert({
        bits: options.bits,
        subject: attributes,
        issuer: ca.subject.attributes,
        extensions,
        validityDays: options.validityDays || 1,
        signingKey: options.signingKey,
        signingKeyPassphrase: options.signingKeyPassphrase,
        passphrase: options.passphrase,
    });
}
async function generateCACert(options = {}) {
    const { attributes, extensions } = createCaInfo(options);
    return await generateCert({
        ...options,
        bits: options.bits || 2048,
        subject: attributes,
        issuer: attributes,
        extensions,
        validityDays: options.validityDays || 1,
    });
}
function signCertificate(options, cert) {
    if (options.signingKey) {
        if (isValidPassphrase(options.signingKeyPassphrase)) {
            // Sign with provided encrypted ca private key
            const encryptedPrivateKey = forge.pki.encryptedPrivateKeyFromPem(options.signingKey);
            const decryptedPrivateKey = forge.pki.decryptPrivateKeyInfo(encryptedPrivateKey, options.signingKeyPassphrase);
            cert.sign(forge.pki.privateKeyFromAsn1(decryptedPrivateKey), forge.md.sha256.create());
        }
        else {
            // Sign with provided unencrypted ca private key
            cert.sign(forge.pki.privateKeyFromPem(options.signingKey), forge.md.sha256.create());
        }
    }
    else {
        // Self-sign the certificate with it's own private key if no separate signing key is provided
        cert.sign(cert.privateKey, forge.md.sha256.create());
    }
}
function createCertificateFromKeyPair(keyPair, options) {
    // Create serial from and integer between 50000 and 99999
    const serial = Math.floor(Math.random() * 95_000 + 50_000).toString();
    const cert = forge.pki.createCertificate();
    cert.publicKey = keyPair.publicKey;
    cert.privateKey = keyPair.privateKey;
    cert.serialNumber = Buffer.from(serial).toString("hex"); // serial number must be hex encoded
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setDate(cert.validity.notAfter.getDate() + options.validityDays);
    cert.setSubject(options.subject);
    cert.setIssuer(options.issuer);
    cert.setExtensions(options.extensions);
    return cert;
}
async function generateKeyPair(bits = 2048) {
    const _generateKeyPair = promisify(forge.pki.rsa.generateKeyPair.bind(forge.pki.rsa));
    return await _generateKeyPair({
        bits,
        workers: nodeOS.availableParallelism
            ? nodeOS.availableParallelism()
            : nodeOS.cpus().length,
    });
}
function isValidPassphrase(passphrase) {
    return typeof passphrase === "string" && passphrase.length < 2000;
}
async function generateCert(options) {
    const keyPair = await generateKeyPair(options.bits);
    const cert = createCertificateFromKeyPair(keyPair, options);
    if (isValidPassphrase(options.passphrase)) {
        // encrypt private key with given passphrase
        const asn1PrivateKey = forge.pki.privateKeyToAsn1(keyPair.privateKey);
        const privateKeyInfo = forge.pki.wrapRsaPrivateKey(asn1PrivateKey);
        const encryptedPrivateKeyInfo = forge.pki.encryptPrivateKeyInfo(privateKeyInfo, options.passphrase, {
            algorithm: "aes256",
        });
        signCertificate({
            signingKey: options.signingKey,
            signingKeyPassphrase: options.signingKeyPassphrase,
        }, cert);
        return {
            key: forge.pki.encryptedPrivateKeyToPem(encryptedPrivateKeyInfo),
            cert: forge.pki.certificateToPem(cert),
            passphrase: options.passphrase,
        };
    }
    else {
        signCertificate({
            signingKey: options.signingKey,
            signingKeyPassphrase: options.signingKeyPassphrase,
        }, cert);
        return {
            key: forge.pki.privateKeyToPem(keyPair.privateKey),
            cert: forge.pki.certificateToPem(cert),
        };
    }
}
