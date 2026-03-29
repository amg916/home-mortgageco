/**
 * Hidden honeypot fields component
 * These fields are invisible to humans but bots often fill them automatically
 * If any of these fields have values, the visitor is likely a bot
 */
const HoneypotFields = () => {
    return (
        <div
            aria-hidden="true"
            style={{
                position: 'absolute',
                left: '-9999px',
                top: '-9999px',
                opacity: 0,
                height: 0,
                width: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: -1,
            }}
        >
            {/* Honeypot field 1: Looks like a website field */}
            <label htmlFor="hp_website">Website</label>
            <input
                type="text"
                id="hp_website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                placeholder="Your website"
            />

            {/* Honeypot field 2: Looks like a secondary phone */}
            <label htmlFor="hp_phone2">Secondary Phone</label>
            <input
                type="tel"
                id="hp_phone2"
                name="phone2"
                tabIndex={-1}
                autoComplete="off"
                placeholder="Secondary phone"
            />

            {/* Honeypot field 3: Looks like a fax number (very tempting for bots) */}
            <label htmlFor="hp_fax">Fax Number</label>
            <input
                type="text"
                id="hp_fax"
                name="fax_number"
                tabIndex={-1}
                autoComplete="off"
                placeholder="Fax number"
            />
        </div>
    );
};

export default HoneypotFields;
