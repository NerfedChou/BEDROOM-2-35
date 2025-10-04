// First Load

window.addEventListener('load', () => {
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

        const containerStyles = window.getComputedStyle(container);

        // Robust gap read (prefer column-gap, fallback to gap shorthand)
        let gap = parseFloat(containerStyles.getPropertyValue('column-gap'));
        if (Number.isNaN(gap)) {
            const gapShorthand = containerStyles.getPropertyValue('gap'); // e.g. "16px 24px"
            const parsed = parseFloat(gapShorthand);
            gap = Number.isNaN(parsed) ? 0 : parsed;
        }

        const containerPaddingLeft = parseFloat(containerStyles.getPropertyValue('padding-left')) || 0;
        const containerPaddingRight = parseFloat(containerStyles.getPropertyValue('padding-right')) || 0;
        const containerBorderLeft = parseFloat(containerStyles.getPropertyValue('border-left-width')) || 0;
        const containerBorderRight = parseFloat(containerStyles.getPropertyValue('border-right-width')) || 0;

        // Freeze flex behaviors during measurement to avoid shrink/grow affecting widths
        const prevContainerWrap = container.style.getPropertyValue('--flex-wrap');
        container.style.setProperty('--flex-wrap', 'nowrap');

        const rollback = [];
        children.forEach(child => {
            const prevGrow = child.style.getPropertyValue('--flex-grow');
            const prevShrink = child.style.getPropertyValue('--flex-shrink');
            rollback.push([child, prevGrow, prevShrink]);
            child.style.setProperty('--flex-grow', '0');
            child.style.setProperty('--flex-shrink', '0');
        });

        // Force a reflow so computed styles reflect the frozen state
        // eslint-disable-next-line no-unused-expressions
        container.offsetWidth;

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

        // Restore flex behaviors after measurement
        if (prevContainerWrap) {
            container.style.setProperty('--flex-wrap', prevContainerWrap);
        } else {
            container.style.removeProperty('--flex-wrap');
        }
        rollback.forEach(([child, prevGrow, prevShrink]) => {
            if (prevGrow) child.style.setProperty('--flex-grow', prevGrow); else child.style.removeProperty('--flex-grow');
            if (prevShrink) child.style.setProperty('--flex-shrink', prevShrink); else child.style.removeProperty('--flex-shrink');
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
            // On the last step (breaking to 1 item), allow children to shrink to avoid overflow.
            if (i === 2) {
                css += `
    .${uniqueClassName} > * {
        --flex-shrink: 1;
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
});
