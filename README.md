# JUL-JS

_"Le J c le S"_

Tiny reactivity library for people alergic to vanilla.

## Features

- Tiny (<1kB minified gzipped)
- No build, just serve as static script
- Most of the nicites expected of a "reactive library" (state, effect, close
  to zero manual dom manipulation)

## Why ?

After tasting the sweetness frontend frameworks provide, it just feels really
annoying to go back to vanilla js. However in some cases it is way overkill to
introduce such frameworks, or simply not possible because they generally come
with a build step.

Here's where jul-js comes in, the goal is to be able introduce dynamic behavior
into no build websites/microfrontends, with React-ish ergonomics, basically
"for free" (<1kB lib bundle size).

And I'm a huge fan of the Alpine.js library by Caleb Porzio. This is probably all a
big excuse for building a minimal version of it myself.

## Overview

The idea is to "sprinkle" js behaviour on top of the html directly rather than
having to bother whith manual dom stuff. Here's a basic example of what you can
do with jul-js:

```html
<script defer src="//unpkg.com/jul-js@0.0.1"></script>

<div
  jul-state="{counter: 1}"
  jul-effect="if(counter == 5) alert('counter reached 5!')"
>
    <p jul-text="counter"></p>
    <button jul-on:click="counter++">inc</button>
</div>
```

A few things are happening here:

- **jul-state="{counter: 1}"**: initializes a node-scope reactive variable
  `counter` with a value of 1.
- **jul-effect="if(counter == 5) alert('counter reached 5!')"**: effect reran
  each time one of its dependencies (`counter` in that case) changes.
- **jul-text="counter"**: assigns and syncs the textContent property of the p
  node to the value of `counter`.
- **jul-on:click="counter++"**: attaches an "onclick" event to the button,
  whenever the button is clicked, the reactive `counter` is mutated, thus all
  dependent get updated.

## API

### jul-state

### jul-effect

### jul-on:

### jul-bind:

### jul-show

### jul-model

### jul-for
