import type nodeForge from "node-forge";
import type { Certificate, HTTPSOptions } from "@vinxi/listhen";
export interface CertificateOptions {
    validityDays: number;
    subject: nodeForge.pki.CertificateField[];
    issuer: nodeForge.pki.CertificateField[];
    extensions: any[];
}
export interface CommonCertificateOptions {
    commonName?: string;
    countryCode?: string;
    state?: string;
    locality?: string;
    organization?: string;
    organizationalUnit?: string;
    emailAddress?: string;
    domains?: string[];
}
export interface SigningOptions {
    signingKey?: string;
    signingKeyCert?: string;
    signingKeyPassphrase?: string;
}
export interface TLSCertOptions extends CommonCertificateOptions, SigningOptions {
    bits?: number;
    validityDays?: number;
    passphrase?: string;
}
export declare function resolveCertificate(options: HTTPSOptions): Promise<Certificate>;
