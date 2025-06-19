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
<script defer src="//unpkg.com/jul-js@latest"></script>

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

Jul state is one of the most important constructs in jul-js. It initializes a
new reactive piece of state. To access the value of a state, just use the name
of its property. The state scoped to the node it is defined in.

```html
<!-- Ok, counter in scope -->
<div jul-state="{counter: 1}">
  <p jul-text="counter"></p> <!-- textContent is 0 -->
</div>

<!-- Not ok, counter not in scope -->
<div jul-state="{counter: 1}"></div>
<p jul-text="counter"></p>
```

### jul-effect

Jul effect goes hand in hand with `jul-state`, and is the basis on which most
other constructs are built, like `jul-text` we just saw above.

```html
<div
  jul-state="{counterA: 1, counterB: 1}"
  jul-effect="console.log(counterA)"
>
  <button jul-on:click="counterA++">A++</button>
  <button jul-on:click="counterB++">B++</button>
</div>
```

For context, here `jul-on:click` attaches an onclick listener to the button,
more one that later.

The reactivity system used is based on "signals", each effect is run once
on init, during this init call we link the effect to its dependencies (here
"counterA"), thus each time the "counterA" value changes, the effect is ran
again, but not when "counterB" changes.

As you can now guess, jul-text internally is just a jul-effect that sets the
textContent property of the node it's attached to.

### jul-on:

Jul-on attaches a specific event listener to a node.

```html
<button jul-on:click="console.log('click!')">click</button>
```

Here, it attaches a "click" eventListener to the button. Whenever the button
is clicked, "click!" is logged.

### jul-bind:

Jul-bind sets a specific property to the evaluated expression or statement.

```html
<div jul-state="{style: {color: 'red'}}">
  <p jul-bind:style="style">Hello world</p>
</div>
```

Here, whenever the style value changes, the effect is reran and the style kept
in sync.

`jul-on:class` is an exception, instead of fully repacing the value, it adds
to the existing classes.

```html
<div jul-state="{inStock: false}">
  <p class="bg-red" jul-bind:class="isStock && 'underline'">Some product</p>
</div>
```

Here the original class stays intact, and the 'underline' class is added or
removed dynamically according to the value of inStock.

### jul-show

Jul-show allows to dynamically display dom elements.

```html
<div jul-state="{shouldShow: true}">
  <p jul-show="shouldShow == true">Hello world!<p>
</div>
```

Here, if shouldShow is true, "Hello world!" p is displayed, if the value is
changed to false, then the p's display will be set to none.

### jul-model

Jul-model allows for 2 ways data binding between an input field and a piece
of state.

```html
<div jul-state="{name: ''}">
  <input jul-model="name"/>
  <p jul-text="name"></p>
</div>
```

Here, the name state will be kept in sync with the input value. Thus, the p's
text as well.

### jul-for

Jul-for allows to loop over an array of elements.

```html
<div jul-state="{users: ['John', 'Jane']}">
  <div>
    <template jul-for="users">
      <!-- i is available inside the template -->
      <p jul-text="users[i]"></p>
    </template>
  </div>

  <button jul-on:click="users = [...users, 'Paul']">Add Paul</button
</div>
```

Here, we loop over the users array, and display a list of p containing their
names. Notice that just like react, to update state of object/arrays you must
pass in a new reference. Also note that no optimization in done for loops,
each time you change the array, all elements are removed from the dom and
reinjected from scratch, so do not rely on internal state in the template.
