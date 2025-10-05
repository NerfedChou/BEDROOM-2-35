## BEDROOM 2:35 (B235)

B235 is a cutting-edge CSS framework for building modern, responsive web layouts with minimal effort. Inspired by the flexibility of Tailwind (the "saw") and the composability of Bootstrap (the "LEGO brick"), B235 empowers developers to create UIs with ease.

### Philosophy

- **Minimal Learning Curve:** Use intuitive CSS custom properties (modifiers) like `--padding`, `--margin`, `--width`, and more. No need to relearn everything—just override what you need.
- **Composable & Modular:** Build layouts by stacking container blocks (LEGO) and customizing them with your own modifiers (SAW). Each container is isolated, so styles never clash.
- **Smart Responsiveness:** B235's JavaScript engine automatically calculates the optimal size and breakpoints for each container, generating responsive CSS on the fly. Multiple containers on the same page work independently.
- **Override-Driven:** Modifiers always win—customize any property by setting a CSS variable. The framework provides sensible defaults, but you stay in control.

---

## Why B235's ODA (Override-Driven Architecture) Is Essential

B235 is not just a unit converter. Its ODA system is the catalyst for a full Layout Integrity Guarantee. Here’s what sets it apart:

| Feature                     | Developer Action (Simple)      | B235 Smart Engine Action (The Magic) |
|-----------------------------|---------------------------------|--------------------------------------|
| **1. Accessibility**        | `--width: 500px;`               | Converts to `31.25rem` for breakpoints, ensuring scaling with user zoom and root font size. |
| **2. Layout Integrity**     | `--width: 500px;`               | Injects min-width, max-width, and structural rules to prevent overflow/collapse. |
| **3. Content-Out Responsiveness | `--width: 500px;`         | Dynamically calculates and injects perfect breakpoints and container queries based on content. |

**Why not just use rem?**

If you manually set `width: 31.25rem;`, you miss out on:
- Automatic layout constraints (min/max/structural rules)
- Dynamic, content-based breakpoints
- The guarantee that your layout will always be robust and accessible

B235’s ODA is the single, automated input that solves these engineering problems for you. You get guaranteed layout integrity and true content-driven responsiveness—something manual rem units can’t provide alone.

---

### Features

- **Easy to Use:** Get started in minutes. Just add a container, set your modifiers, and build.
- **Highly Customizable:** Override any property with a CSS variable. No complex class names or configuration files.
- **Automatic Responsive Layouts:** The smart engine adapts containers to any device, using container queries and dynamic breakpoints.
- **Safe & Isolated:** Each container is scoped and independent. No global pollution or style conflicts.
- **Beginner Friendly, Power User Ready:** Simple for newcomers, powerful for advanced users who want full control.

### Example Usage

```html
<div class="b235-container" style="--padding: 2rem; --max-width: 800px;">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### How It Works

1. **Add a container:** Use the `.b235-container` class for any layout block.
2. **Customize with modifiers:** Set CSS variables (e.g., `--padding`, `--gap`, `--width`) inline or in your stylesheet.
3. **Let the engine handle responsiveness:** The JavaScript engine measures your content and generates responsive CSS automatically.
4. **Override as needed:** Use your own modifier classes or inline styles to fine-tune any property.

---

### Frequently Asked Questions

#### Why use the ODA (Override-Driven Architecture) instead of native CSS properties?

**Q:** Why should I use B235's ODA (e.g., `--width: 500px;`) instead of just setting native CSS properties like `width: 500px;`?

**A:**

While native CSS properties work and B235's engine will measure and adapt to them, using the ODA provides significant advantages:

- **Predictable API & Theming:** ODA variables act as a clear, documented API for your components. This makes them easier to theme, maintain, and scale across large projects.
- **No Specificity Battles:** Overriding a variable (e.g., `--width`) is cleaner and avoids the need for more specific selectors or `!important`.
- **Contextual Control:** You can set ODA variables on parent elements to control many components at once, enabling powerful theming and context-aware design.
- **Automatic Layout Guarantees:** The ODA is the trigger for B235's smart engine to inject layout constraints, dynamic breakpoints, and accessibility features. Native CSS alone does not provide these guarantees.
- **Future-Proofing:** As B235 evolves, new features and layout logic will always hook into the ODA system, ensuring your codebase stays compatible and benefits from updates.

In summary, ODA is not just about setting a value—it's about unlocking the full power, flexibility, and safety of the B235 framework.

#### Can I use native CSS for other properties like justify-content?

**Q:** Can I use native CSS properties (e.g., `justify-content: center`) instead of custom properties like `--justify-content: center`?

**A:**

Yes! For layout, alignment, and most styling (such as `justify-content`, `align-items`, `color`, etc.), you can use native CSS properties as usual. B235 is designed to be flexible and lets you use standard CSS for everything except width and height.

**However, for `width` and `height`, you should use the ODA custom properties (`--width`, `--height`).**

This is crucial because B235’s smart engine relies on these variables to:
- Measure and calculate the true size of your container and its children
- Inject dynamic breakpoints and responsive container queries
- Guarantee layout integrity and prevent overflow/collapse
- Ensure accessibility by converting units and scaling with user settings

If you use native `width` or `height`, the engine may not be able to provide these guarantees. For all other properties, feel free to use native CSS for maximum flexibility and familiarity.

#### Should I use custom properties for everything?

**Q:** Do I need to use `--padding`, `--gap`, or other custom properties for B235 to work?

**A:**

No. For B235’s smart engine, only `--width` and `--height` are crucial for responsive layout and layout integrity. All other properties—such as `padding`, `gap`, `border`, `color`, `justify-content`, etc.—can and should be set using native CSS for simplicity and familiarity. This keeps your codebase clean and easy to maintain. Use custom properties only for width and height where you want B235’s advanced features.

---

## Override Bridge: Exposing Dynamic Breakpoints (How • Why • Ways)

1) How (the mechanism)
- The engine measures each .b235-container’s children, computes collision widths, and generates a sequence of breakpoints.
- It emits global tokens once on :root: --b235-bp-1, --b235-bp-2, ...
- It uses those tokens inside @container rules: (max-width: var(--b235-bp-N)).
- A ResizeObserver updates each container with data-b235-items="<N>" in real time as size changes.

Examples (copy/paste in your CSS)
```css
/* Attribute bridge: react to the live per-row state */
.b235-container[data-b235-items="5"] > .o { /* styles for 5-per-row */ }
.b235-container[data-b235-items="3"] > .o { /* styles for 3-per-row */ }
.b235-container[data-b235-items="2"] > .o { /* styles for 2-per-row */ }
.b235-container[data-b235-items="1"] > .o { /* styles for 1-per-row */ }
```

```css
/* Direct container query with tokens (advanced) */
@container b235cq-b235-container-0 (max-width: var(--b235-bp-2)) {
  .b235-container-0 > .o { border-radius: 8px; }
}
```

2) Why (the purpose)
- Remove magic numbers; no pixel guessing or CSS inspection needed.
- Global override power via tokens; redefine once, affect all dependent rules.
- Transparency and control: the math is exposed as tokens and as a live attribute.
- Ergonomics: the attribute bridge is simple, composable, and framework-agnostic.

3) Why do it this way (the design choices)
- Single :root emission avoids bloat and conflicts.
- var(--b235-bp-N) in @container makes every breakpoint overrideable with pure CSS.
- First-write-wins token strategy prevents cross-container token collisions.
- data-b235-items provides a CSS-only hook; no JS needed in userland.

4) What are the ways (to interact)
```css
/* Recommended: Attribute Bridge */
.b235-container[data-b235-items="4"] > .o { gap: .5rem; }
.b235-container[data-b235-items="2"] > .o { font-weight: 600; }

/* Direct @container with tokens */
@container b235cq-b235-container-1 (max-width: var(--b235-bp-3)) {
  .b235-container-1 > .o { box-shadow: 0 2px 8px rgba(0,0,0,.1); }
}

/* Optional global override: shift a core breakpoint for the whole site */
:root { --b235-bp-3: 52rem; }
```

5) What can you do (practical recipes)
```css
.b235-container[data-b235-items="2"].chamber {
        flex-direction: column;
}
```
In here you can see I can change the column direction.
By accessing the data-b235-items attribute. Once more thing is that you can manipulate the container
each breakpoint the JS engine generates for you. By having these power everything can be possible.

6) Why is it implemented (philosophy)
- Deliver a minimal, memorable API that grants full control without leaking complexity.
- Keep layouts mathematically correct while enabling easy global or local overrides.
- Uphold the Layout Integrity Guarantee with maximum developer freedom and zero guesswork.
