# ottavino
> The piccolo /ˈpɪkəloʊ/ (Italian pronunciation: [ˈpikkolo]; Italian for "small", but named ottavino in Italy)

![](https://user-images.githubusercontent.com/1084459/57871139-55c10100-7811-11e9-8499-cbb4cfafb315.png)

## Tiny, Fast and Declarative User Interface Development
Using native custom elements API (but not only)

[![Build Status](https://semaphoreci.com/api/v1/eavichay/ottavino/branches/master/badge.svg)](https://semaphoreci.com/eavichay/ottavino)


As simple as it gets.

### [See the docs](https://betterthancode.github.io/ottavino/globals.html)

```typescript
import { component } from 'ottavino'

component({
  tag: 'tiny-moji',
  template: '<span>{{this.moodIcon}}</span>',
  shadow: true, // optional shadow DOM
  properties: {
    moodIcon: '😃'
  },
  attributes: {
    mood: function(newValue /*, oldValue, domElement */) {
      this.moodIcon = newValue === 'sad' ? '😢' : '😃'
    }
  }
})
```
```html
<tiny-moji></tiny-moji>
<tiny-moji mood="sad"></tiny-moji>
```

IIFE Version (no es-modules)
```html
<script src="/path/to/ottavino/index.nomodule.js"></script>
```
```javascript
window.ottavino.component({
  // here you go
});
```

## Footprint (KBGzipped) ~1.5
Small: ![npm bundle size](https://img.shields.io/bundlephobia/minzip/ottavino?label=bundle%20size)

## API
`component(options: ComponentDescriptor<T?>) => ComponentProxy<T>`

### ComponentDescriptor<T>
- **tag**? When creating a custom element, this will be the DOM tag name.
- **mount**? When you want to "upgrade" a legacy element on the DOM (like a `<div>`) and make it behave just like it was a custom element. It can be a queryselector to be executed on the document or a reference to an element instance
  - If no `tag` nor `mount` are used (or both used) - expect dragons.
- **template**: string (or reference for an existing HTML template element for reuse)
- **properties**? key-value properties that are reflected from the DOM element into the component handler ("proxy")
- **attributes**? key-value of functions handling attribute changes. Functions receives the new and old values and a reference to the DOM element. `this` will refer to the handler
- **init**? Initialization function during component construction. The passed argument is the DOM reference
- **this**? Your (optional) component handler. Anything can go here. From within the template, and usage of `this` would reach this object. If none defined, it will generate a default component proxy
- **shadow**? opt in for shadow DOM
- **closed**? opt in for **closed** mode shadow DOM
- **connectedCallback**? linked with the DOM connectedCallback
- **disconnectedCallback**? linked with the DOM disconnectedCallback

### Under the hood
```html
<span>{{this.counter}}</span>
<button onclick="{{this.counter++}}">Count UP!</button>
<button onclick="{{this.counter = 0}}">Reset</button>
<button onclick="{{this.hereBeDragons()}}DONT PUSH BUTTON</button>
```
Anything evaluated between mustache-braces will be executed within the component's context.
Every execution can reach `this` (the component logic) and `component` as a reference to the DOM element.
The **component-handler** is a component-proxy object that reflects anything to the actual DOM element and vice versa. The proxy is reachable from the DOM via `proxy` property name.
Event handlers (any attribute that starts with "on...") also can use `event` as an argument passed into the expression.

## Fun
Try mounting your awesome component (with shadow DOM) to the document body instead of using a custom element. In your template, don't use slots. Embed it in another webpage. Fun :unicorn:

## Contribution / Roadmap
This project attempts to create the simplest developer experience while using the lastest and greatest features the borwser can provide.
Next in the list:
- "directives" (custom attributes that executes... anything),
- Lifecycle global hooks
- Plugins
- Suggest your idea


#usetheplatform
