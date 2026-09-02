/**
 * Shine Coaching Institute - Secure Authentication Module
 * Built with Web Crypto API and pure JavaScript SHA-256/PBKDF2 fallback.
 * Works seamlessly in all environments (file:// protocol, localhost, HTTPS, and offline).
 */

const AUTH_STORAGE_KEY = "shine_admin_auth_v1";
const SECONDARY_AUTH_STORAGE_KEY = "shine_admin_sec_auth_v1";
const SESSION_STORAGE_KEY = "shine_admin_session_v1";
const SESSION_DURATION_HOURS = 8;
const DEFAULT_SECONDARY_PASSWORD = "44332211";

/**
 * Pure JavaScript SHA-256 implementation (Fallback for file:// and non-secure contexts)
 */
function sha256Pure(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }
    
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let lengthProperty = 'length';
    let i, j;
    let result = '';

    const words = [];
    const asciiBitLength = ascii[lengthProperty] * 8;
    
    let hash = sha256Pure.h = sha256Pure.h || [];
    let k = sha256Pure.k = sha256Pure.k || [];
    let primeCounter = k[lengthProperty];

    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 300; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
        }
    }
    
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return;
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength) | 0;
    
    for (j = 0; j < words[lengthProperty];) {
        const w = words.slice(j, j += 16);
        const oldHash = hash;
        hash = hash.slice(0, 8);
        
        for (i = 0; i < 64; i++) {
            const i2 = i + j;
            const w15 = w[i - 15], w2 = w[i - 2];

            const a = hash[0], e = hash[4];
            const temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                + ((e & hash[5]) ^ ((~e) & hash[6]))
                + k[i]
                + (w[i] = (i < 16) ? w[i] : (
                        w[i - 16]
                        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                        + w[i - 7]
                        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                    ) | 0
                );
            const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
            
            hash = [(temp1 + temp2) | 0].concat(hash);
            hash[4] = (hash[4] + temp1) | 0;
        }
        
        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }
    
    for (i = 0; i < 8; i++) {
        for (j = 3; j >= 0; j--) {
            const b = (hash[i] >> (8 * j)) & 255;
            result += (b < 16 ? '0' : '') + b.toString(16);
        }
    }
    return result;
}

const AuthManager = {
    /**
     * Generate a cryptographic salt
     */
    generateSalt: function() {
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint8Array(16);
            window.crypto.getRandomValues(array);
            return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        // Math.random fallback
        let salt = '';
        for (let i = 0; i < 32; i++) {
            salt += Math.floor(Math.random() * 16).toString(16);
        }
        return salt;
    },

    /**
     * Securely hash password with salt
     */
    hashPassword: async function(password, saltHex) {
        // Try Web Crypto API first if available in secure context
        if (window.crypto && window.crypto.subtle && window.isSecureContext) {
            try {
                const enc = new TextEncoder();
                const passwordBuffer = enc.encode(password);
                const keyMaterial = await window.crypto.subtle.importKey(
                    'raw',
                    passwordBuffer,
                    { name: 'PBKDF2' },
                    false,
                    ['deriveBits', 'deriveKey']
                );
                const saltBuffer = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                const derivedKey = await window.crypto.subtle.deriveKey(
                    {
                        name: 'PBKDF2',
                        salt: saltBuffer,
                        iterations: 10000,
                        hash: 'SHA-256'
                    },
                    keyMaterial,
                    { name: 'HMAC', hash: 'SHA-256', length: 256 },
                    true,
                    ['sign']
                );
                const exportedKey = await window.crypto.subtle.exportKey('raw', derivedKey);
                const hashArray = Array.from(new Uint8Array(exportedKey));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            } catch (err) {
                console.warn("WebCrypto unavailable, using robust pure JS SHA-256 engine.", err);
            }
        }

        // Pure JS PBKDF2 Multi-Round Hash Engine
        let current = password + ":" + saltHex;
        for (let i = 0; i < 1000; i++) {
            current = sha256Pure(current + ":" + saltHex);
        }
        return current;
    },

    /**
     * Ensure secondary password (44332211) is initialized
     */
    initSecondaryPassword: async function() {
        try {
            const existing = localStorage.getItem(SECONDARY_AUTH_STORAGE_KEY);
            if (!existing) {
                const salt = this.generateSalt();
                const hash = await this.hashPassword(DEFAULT_SECONDARY_PASSWORD, salt);
                const record = {
                    salt: salt,
                    hash: hash,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem(SECONDARY_AUTH_STORAGE_KEY, JSON.stringify(record));
            }
        } catch (e) {
            console.error("Error initializing secondary password:", e);
        }
    },

    /**
     * Check if master password has been configured
     */
    isPasswordConfigured: function() {
        try {
            const authRecord = localStorage.getItem(AUTH_STORAGE_KEY);
            if (!authRecord) return false;
            const parsed = JSON.parse(authRecord);
            return !!(parsed && parsed.hash && parsed.salt);
        } catch (e) {
            return false;
        }
    },

    /**
     * Set the initial master password (and secondary password)
     */
    setupInitialPassword: async function(password, secondaryPassword = DEFAULT_SECONDARY_PASSWORD) {
        if (!password || password.length < 6) {
            throw new Error("Master Password must be at least 6 characters long.");
        }
        if (this.isPasswordConfigured()) {
            throw new Error("Password is already configured. Use Change Password instead.");
        }

        const salt = this.generateSalt();
        const hash = await this.hashPassword(password, salt);
        const record = {
            salt: salt,
            hash: hash,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(record));

        // Initialize or customize secondary password
        const secPass = (secondaryPassword && secondaryPassword.trim()) ? secondaryPassword.trim() : DEFAULT_SECONDARY_PASSWORD;
        const secSalt = this.generateSalt();
        const secHash = await this.hashPassword(secPass, secSalt);
        const secRecord = {
            salt: secSalt,
            hash: secHash,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(SECONDARY_AUTH_STORAGE_KEY, JSON.stringify(secRecord));

        return this.createSession();
    },

    /**
     * Verify entered primary master password against stored hash
     */
    verifyPassword: async function(password) {
        const authRecord = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!authRecord) {
            return false;
        }
        try {
            const parsed = JSON.parse(authRecord);
            if (!parsed.salt || !parsed.hash) return false;

            const computedHash = await this.hashPassword(password, parsed.salt);
            return computedHash === parsed.hash;
        } catch (e) {
            console.error("Auth verification error:", e);
            return false;
        }
    },

    /**
     * Verify entered secondary security password (PIN / Key)
     */
    verifySecondaryPassword: async function(secPassword) {
        if (!secPassword) return false;
        let secRecordStr = localStorage.getItem(SECONDARY_AUTH_STORAGE_KEY);
        if (!secRecordStr) {
            await this.initSecondaryPassword();
            secRecordStr = localStorage.getItem(SECONDARY_AUTH_STORAGE_KEY);
        }
        try {
            const parsed = JSON.parse(secRecordStr);
            if (!parsed || !parsed.salt || !parsed.hash) return false;

            const computedHash = await this.hashPassword(secPassword, parsed.salt);
            return computedHash === parsed.hash;
        } catch (e) {
            console.error("Secondary auth verification error:", e);
            return false;
        }
    },

    /**
     * Verify Dual Authentication (Both Master Password + Secondary Security PIN)
     */
    verifyDualAuthentication: async function(masterPassword, secondaryPassword) {
        const isMasterValid = await this.verifyPassword(masterPassword);
        if (!isMasterValid) {
            throw new Error("Incorrect Primary Master Password.");
        }

        const isSecValid = await this.verifySecondaryPassword(secondaryPassword);
        if (!isSecValid) {
            throw new Error("Incorrect Secondary Security Password (PIN / Key).");
        }

        return true;
    },

    /**
     * Change existing primary master password
     */
    changePassword: async function(currentPassword, newPassword) {
        if (!newPassword || newPassword.length < 6) {
            throw new Error("New master password must be at least 6 characters long.");
        }
        
        const isCurrentValid = await this.verifyPassword(currentPassword);
        if (!isCurrentValid) {
            throw new Error("Incorrect current master password.");
        }

        const salt = this.generateSalt();
        const hash = await this.hashPassword(newPassword, salt);
        const record = {
            salt: salt,
            hash: hash,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(record));
        return this.createSession();
    },

    /**
     * Change existing secondary security password (PIN / Key)
     */
    changeSecondaryPassword: async function(currentSecPassword, newSecPassword) {
        if (!newSecPassword || newSecPassword.length < 4) {
            throw new Error("New secondary password must be at least 4 characters.");
        }

        const isCurrentValid = await this.verifySecondaryPassword(currentSecPassword);
        if (!isCurrentValid) {
            throw new Error("Incorrect current secondary security password.");
        }

        const salt = this.generateSalt();
        const hash = await this.hashPassword(newSecPassword, salt);
        const record = {
            salt: salt,
            hash: hash,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(SECONDARY_AUTH_STORAGE_KEY, JSON.stringify(record));
        return true;
    },

    /**
     * Create an authenticated session
     */
    createSession: function() {
        const token = this.generateSalt() + "-" + Date.now();
        const expiry = Date.now() + (SESSION_DURATION_HOURS * 60 * 60 * 1000);
        const session = {
            token: token,
            expiry: expiry,
            role: "admin",
            institute: "Shine Coaching Institute"
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        return session;
    },

    /**
     * Check if user is currently authenticated
     */
    isAuthenticated: function() {
        try {
            const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (!sessionData) return false;
            const session = JSON.parse(sessionData);
            if (!session || !session.token || !session.expiry) return false;
            
            if (Date.now() > session.expiry) {
                this.logout();
                return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Terminate session (Logout)
     */
    logout: function() {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
};

// Initialize default secondary password immediately
if (typeof window !== "undefined") {
    window.AuthManager = AuthManager;
    AuthManager.initSecondaryPassword();
}
