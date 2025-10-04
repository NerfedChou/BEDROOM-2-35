## BEDROOM 2:35 (B235)

B235 is a cutting-edge CSS framework for building modern, responsive web layouts with minimal effort. Inspired by the flexibility of Tailwind (the "saw") and the composability of Bootstrap (the "LEGO brick"), B235 empowers developers to create UIs with ease.

### Philosophy

- **Minimal Learning Curve:** Use intuitive CSS custom properties (modifiers) like `--padding`, `--margin`, `--width`, and more. No need to relearn everything—just override what you need.
- **Composable & Modular:** Build layouts by stacking container blocks (LEGO) and customizing them with your own modifiers (SAW). Each container is isolated, so styles never clash.
- **Smart Responsiveness:** B235's JavaScript engine automatically calculates the optimal size and breakpoints for each container, generating responsive CSS on the fly. Multiple containers on the same page work independently.
- **Override-Driven:** Modifiers always win—customize any property by setting a CSS variable. The framework provides sensible defaults, but you stay in control.

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

Start building with B235 and experience a new level of speed, flexibility, and control in your web projects.

### Note: 

Still in early development. Feedback and contributions are welcome!