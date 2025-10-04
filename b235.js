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
            const position = window.getComputedStyle(child).getPropertyValue('position');
            return ['static', 'relative', 'sticky'].includes(position);
        });

        if (children.length === 0) {
            container.style.visibility = 'visible';
            return;
        }

        const containerStyles = window.getComputedStyle(container);
        const gap = parseFloat(containerStyles.getPropertyValue('column-gap')) || 0;

        const childWidths = children.map(child => {
            const childStyles = window.getComputedStyle(child);
            const width = parseFloat(childStyles.getPropertyValue('width'));
            const paddingLeft = parseFloat(childStyles.getPropertyValue('padding-left'));
            const paddingRight = parseFloat(childStyles.getPropertyValue('padding-right'));
            const borderLeft = parseFloat(childStyles.getPropertyValue('border-left-width'));
            const borderRight = parseFloat(childStyles.getPropertyValue('border-right-width'));
            const marginLeft = parseFloat(childStyles.getPropertyValue('margin-left'));
            const marginRight = parseFloat(childStyles.getPropertyValue('margin-right'));
            return width + paddingLeft + paddingRight + borderLeft + borderRight + marginLeft + marginRight;
        });

        const uniqueClassName = `b235-container-${containerId++}`;
        container.classList.add(uniqueClassName);

        let mediaQueries = '';
        // Set initial state for full width
        mediaQueries += `
    .${uniqueClassName} {
        --b235-items-per-row: ${children.length};
    }
`;

        // D. Iterative Loop to 320px (or 2 items)
        for (let i = children.length; i > 1; i--) {
            // Calculate width for `i` items
            let currentTotalWidth = childWidths.slice(0, i).reduce((a, b) => a + b, 0) + (i - 1) * gap;
            let collisionWidthPx = Math.ceil(currentTotalWidth);
            let collisionWidthRem = (collisionWidthPx - 1) / rootFontSize;

            // When viewport is smaller than width for `i` items, plan for `i-1`
            mediaQueries += `
@media (max-width: ${collisionWidthRem}rem) {
    .${uniqueClassName} {
        flex-wrap: wrap;
        --b235-items-per-row: ${i - 1};
    }
`;
            // On the last media query (when breaking to 1 item), allow children to shrink.
            if (i === 2) {
                mediaQueries += `
    .${uniqueClassName} > * {
        --flex-shrink: 1;
    }
`;
            }

            mediaQueries += `
}
`;
        }

        styleSheetContent += mediaQueries;
    });

    styleSheet.textContent = styleSheetContent;

    containers.forEach(container => container.style.visibility = 'visible');
});
