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

    const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
    const containers = document.querySelectorAll('.b235-container');
    if (containers.length === 0) return;

    containers.forEach(container => container.style.visibility = 'hidden');

    const styleSheet = document.createElement('style');
    document.head.appendChild(styleSheet);
    let styleSheetContent = '';
    let containerId = 0;

    const rootTokens = new Map();
    let containerCssContent = '';
    const breakpointsMap = new Map(); // Map to store breakpoints for each container

    styleSheetContent += `
/* B235 Recovery: structural safety net (applied dynamically) */
.b235-recover { overflow-x: hidden; }
.b235-recover > * { min-width: 0; width: 100%; --flex-shrink: 1; }
`;

    // Track initial eligible child counts to detect visibility changes later
    const initialEligibleCount = new WeakMap();

    containers.forEach(container => {
        const breakpoints = []; // <-- ADD THIS LINE to declare the array
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

        // Updated child width calculation to use getBoundingClientRect().width
        const childWidths = children.map(child => {
            const rectWidth = child.getBoundingClientRect().width || 0;
            const s = window.getComputedStyle(child);
            const marginLeft = parseFloat(s.getPropertyValue('margin-left')) || 0;
            const marginRight = parseFloat(s.getPropertyValue('margin-right')) || 0;
            return rectWidth + marginLeft + marginRight;
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
            const collisionWidthPx = Math.ceil(currentTotalWidth);

            // Store token; first-write-wins
            const bpTokenName = `--b235-bp-${children.length - i + 1}`;
            if (!rootTokens.has(bpTokenName)) {
                rootTokens.set(bpTokenName, `${collisionWidthRem}rem`);
            }

            breakpoints.push(collisionWidthPx);

            // Use the token in the @container query
            css += `
@container ${cqName} (max-width: var(${bpTokenName})) {
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

        // CHANGED: append container CSS to a separate buffer
        containerCssContent += css;
        breakpointsMap.set(container, breakpoints.reverse());
    });

    // Emit a single consolidated :root with ordered tokens
    if (rootTokens.size) {
        styleSheetContent += `:root {\n`;
        const ordered = Array.from(rootTokens.entries()).sort((a, b) => {
            const ai = parseInt(a[0].split('--b235-bp-')[1], 10);
            const bi = parseInt(b[0].split('--b235-bp-')[1], 10);
            return ai - bi;
        });
        for (const [name, value] of ordered) {
            styleSheetContent += `    ${name}: ${value};\n`;
        }
        styleSheetContent += `}\n`;
    }

    // Append container CSS
    styleSheetContent += containerCssContent;

    styleSheet.textContent = styleSheetContent;

    containers.forEach(container => container.style.visibility = 'visible');

    const observer = new ResizeObserver(entries => {
        entries.forEach(entry => {
            const container = entry.target;
            const breakpoints = breakpointsMap.get(container);
            if (!breakpoints) return;

            const width = entry.contentRect.width;
            let itemsPerRow = breakpoints.length + 1;

            for (let i = 0; i < breakpoints.length; i++) {
                if (width <= breakpoints[i]) {
                    itemsPerRow = breakpoints.length - i;
                    break;
                }
            }

            container.setAttribute('data-b235-items', itemsPerRow);
        });
    });

    containers.forEach(container => observer.observe(container));

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
(function B235() {
    const href = 'CSS/b235.css';
    const domReady = document.readyState === 'loading'
        ? new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }))
        : Promise.resolve();

    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

    Promise.all([domReady, fontsReady])
        .then(() => ensureStylesheetAtHeadTop(href))
        .then(() => b235Calculate())
        .catch(() => b235Calculate()); // Fallback: still run even if CSS fails to load
})();
