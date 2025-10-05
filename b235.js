// NEW: Ensure CSS is inserted at the very top of <head> and wait until it's loaded
function ensureStylesheetAtHeadTop(href) {
    const head = document.head || document.getElementsByTagName('head')[0];
    const targetUrl = new URL(href, document.baseURI).href;

    // Find existing matching stylesheet (by absolute URL)
    let link = Array.from(head.querySelectorAll('link[rel="stylesheet"]')).find(l => {
        try { return new URL(l.href, document.baseURI).href === targetUrl; } catch { return l.href === href; }
    });

    // Create if missing
    if (!link) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
    }

    // Move/insert to be the first child of <head>
    if (head.firstChild !== link) {
        head.insertBefore(link, head.firstChild);
    }

    // Wait until loaded (or resolve immediately if already present)
    return new Promise((resolve, reject) => {
        const isLoaded = () => Array.from(document.styleSheets).some(s => {
            try { return s.href && new URL(s.href, document.baseURI).href === targetUrl; } catch { return false; }
        });

        if (isLoaded()) {
            resolve(link);
            return;
        }

        link.addEventListener('load', () => resolve(link), { once: true });
        link.addEventListener('error', () => reject(new Error('Failed to load stylesheet: ' + href)), { once: true });
    });
}

// NEW: Wrap the original load-handler body into a callable function
let __b235_ran = false;
function b235Calculate() {
    if (__b235_ran) return;
    __b235_ran = true;

    // The B235 Smart Engine
    const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);

    // 1. The Setup & Filtering
    const containers = document.querySelectorAll('.b235-container');
    if (containers.length === 0) return;

    containers.forEach(container => container.style.visibility = 'hidden');

    const styleSheet = document.createElement('style');
    document.head.appendChild(styleSheet);
    let styleSheetContent = '';
    let containerId = 0;

    // Recovery CSS (structural safety net; applied only when overflow/visibility changes are detected)
    styleSheetContent += `
/* B235 Recovery: structural safety net (applied dynamically) */
.b235-recover { overflow-x: hidden; }
.b235-recover > * { min-width: 0; width: 100%; --flex-shrink: 1; }
`;

    // Track initial eligible child counts to detect visibility changes later
    const initialEligibleCount = new WeakMap();

    containers.forEach(container => {
        const children = Array.from(container.children).filter(child => {
            const cs = window.getComputedStyle(child);
            const position = cs.getPropertyValue('position');
            const display = cs.getPropertyValue('display');
            return (display !== 'none') && ['static', 'relative', 'sticky'].includes(position);
        });

        if (children.length === 0) {
            container.style.visibility = 'visible';
            return;
        }

        // Record the initial eligible child count
        initialEligibleCount.set(container, children.length);

        const containerStyles = window.getComputedStyle(container);

        // Robust gap read (prefer column-gap, fallback to gap shorthand)
        let gap = parseFloat(containerStyles.getPropertyValue('column-gap'));
        if (Number.isNaN(gap)) {
            const gapShorthand = containerStyles.getPropertyValue('gap'); // e.g. "16px 24px"
            const parsed = parseFloat(gapShorthand);
            gap = Number.isNaN(parsed) ? 0 : parsed;
        }

        // Child used widths (computed in px, unit-agnostic)
        const childWidths = children.map(child => {
            const s = window.getComputedStyle(child);
            const width = parseFloat(s.getPropertyValue('width')) || 0;
            const paddingLeft = parseFloat(s.getPropertyValue('padding-left')) || 0;
            const paddingRight = parseFloat(s.getPropertyValue('padding-right')) || 0;
            const borderLeft = parseFloat(s.getPropertyValue('border-left-width')) || 0;
            const borderRight = parseFloat(s.getPropertyValue('border-right-width')) || 0;
            const marginLeft = parseFloat(s.getPropertyValue('margin-left')) || 0;
            const marginRight = parseFloat(s.getPropertyValue('margin-right')) || 0;
            return width + paddingLeft + paddingRight + borderLeft + borderRight + marginLeft + marginRight;
        });

        // Worst-case packing: sort widths desc and use prefix sums of top-i items
        const sorted = [...childWidths].sort((a, b) => b - a);
        const prefix = new Array(sorted.length + 1).fill(0);
        for (let i = 0; i < sorted.length; i++) prefix[i + 1] = prefix[i] + sorted[i];

        const uniqueClassName = `b235-container-${containerId++}`;
        container.classList.add(uniqueClassName);

        // Ensure this element is a size container and uniquely named (for scoped @container queries)
        const cqName = `b235cq-${uniqueClassName}`;
        container.style.setProperty('container-type', 'inline-size');
        container.style.setProperty('container-name', cqName);

        let css = `
    /* Base state hint for widest layout */
    .${uniqueClassName} > * {
        --b235-items-per-row: ${children.length};
    }
`;

        // D. Iterative Loop (from max items down to 2)
        // Epsilon: keep 0 to align to exact content-box collision; adjust if you need earlier snap
        const epsilonPx = 0;

        for (let i = children.length; i > 1; i--) {
            // Sum of top-i widest items + gaps (container query uses content box; exclude container padding/border)
            const childrenTotalWidth = prefix[i];
            const gapsTotalWidth = (i - 1) * gap;
            const currentTotalWidth = childrenTotalWidth + gapsTotalWidth;

            const collisionWidthRem = (Math.ceil(currentTotalWidth) + epsilonPx) / rootFontSize;

            // Always base on the parent width
            css += `
@container ${cqName} (max-width: ${collisionWidthRem}rem) {
    .${uniqueClassName} > * {
        --b235-items-per-row: ${i - 1};
    }
`;
            // Final smallest breakpoint: force single-column integrity and defeat intrinsic min-size
            if (i === 2) {
                css += `
    .${uniqueClassName} {
        flex-wrap: wrap;
    }
    .${uniqueClassName} > * {
        --flex-shrink: 1;
        min-width: 0;
        width: 100%;
    }
`;
            }
            css += `
}
`;
        }

        styleSheetContent += css;
    });

    styleSheet.textContent = styleSheetContent;

    containers.forEach(container => container.style.visibility = 'visible');

    // --- Hybrid Assurance: debounced watchdog for overflow/visibility changes ---

    const debounce = (fn, wait = 250) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(null, args), wait);
        };
    };

    const eligibleChildrenNow = (container) =>
        Array.from(container.children).filter(child => {
            const cs = window.getComputedStyle(child);
            const position = cs.getPropertyValue('position');
            const display = cs.getPropertyValue('display');
            return (display !== 'none') && ['static', 'relative', 'sticky'].includes(position);
        }).length;

    const isOverflowing = (el) => el.scrollWidth > el.clientWidth;

    const policeIntegrity = () => {
        containers.forEach(container => {
            // If new children appeared (e.g., mobile -> desktop menu), or overflow happens, apply recovery
            const baseline = initialEligibleCount.get(container) ?? 0;
            const now = eligibleChildrenNow(container);
            if (now > baseline || isOverflowing(container)) {
                container.classList.add('b235-recover');
            } else {
                container.classList.remove('b235-recover');
            }
        });
    };

    window.addEventListener('resize', debounce(policeIntegrity, 250));
    // Run once after load to catch initial edge cases (e.g., fonts/images late load)
    setTimeout(policeIntegrity, 0);
}

// NEW: Auto-inject CSS and then run the calculation
(function bootstrapB235() {
    const href = 'CSS/b235.css';
    const domReady = document.readyState === 'loading'
        ? new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }))
        : Promise.resolve();

    domReady
        .then(() => ensureStylesheetAtHeadTop(href))
        .then(() => b235Calculate())
        .catch(() => b235Calculate()); // Fallback: still run even if CSS fails to load
})();
