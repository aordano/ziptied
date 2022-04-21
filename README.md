# Ziptied

Modernizing static sites the easy way.

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/8479c7e72cdf4e1b81d1acbe2d37f660)](https://www.codacy.com/gh/nodoambiental/ziptied/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=nodoambiental/ziptied&amp;utm_campaign=Badge_Grade) [![DeepSource](https://deepsource.io/gh/nodoambiental/ziptied.svg/?label=active+issues&show_trend=true&token=wB-9fMynOQMJ1Kkt_0wiegLw)](https://deepsource.io/gh/nodoambiental/ziptied/?ref=repository-badge)

![GitHub last commit](https://img.shields.io/github/last-commit/nodoambiental/ziptied) ![GitHub commit activity](https://img.shields.io/github/commit-activity/m/nodoambiental/ziptied)

![License](https://img.shields.io/github/license/nodoambiental/ziptied) ![GitHub issues](https://img.shields.io/github/issues/nodoambiental/ziptied)

## What is ziptied?

Zipitied is a simplified system of [hydrated](https://en.wikipedia.org/wiki/Hydration_(web_development)) [reactive](https://en.wikipedia.org/wiki/Reactive_programming) [components](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements), ready to zip-tie to existing [SSG](https://about.gitlab.com/blog/2016/06/10/ssg-overview-gitlab-pages-part-2/) [templated](https://en.wikipedia.org/wiki/Template_processor)
webpages.

## Why ziptied?

There are a lot of reactive web frameworks in the wild, and most of them are concerned with the creation of dynamism and interactivity from the outset; you need to use their concepts from the start, and trying to bolt on pieces of functionality later is a nightmare. You ether would need to create a new website and serve only the routes that actually are finished or mix a bloated system with your existing code.

This library allows you to make minimal modifications to your existing markup, add only the functionality you need on new code, and bolt on the desired interactivity only to the parts you need.

Therefore, you could grab a regular [Hugo](https://gohugo.io/) or [Jekyll](https://jekyllrb.com/) site and add new functionality with minimal effort and minimal disruption of legacy code, and without the need to extend the generator with custom, cumbersome plugins.

In fact, this library was _born_ from that usecase, when a Jekyll site got so crufty and fragile that we got locked to an obsolete version of [Ruby](https://www.ruby-lang.org/en/), and adding any new functionality to it was impossible without rewriting a lot of third-party code.

## How it works

Ziptied is built on top of [RxJS](https://rxjs.dev/) and [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components).

To use it, you add this library to your existing JS code, define the components you need (or use some of the builtin ones), and then mark existing elements with custom classes and data attributes to indicate with elements will be replaced by the interactive components, and if there is some initial state to be passed.

This rather inelegant implementation allows you to only modify the existing markup by appending easily modifiable attributes to the elements; no matter if you are using a site builder or a premade template, you only need to be able to add a new class (and load the script) to transform any existing element into a reactive component.

Check out [the docs](/docs) for more info.

## Installation

Using NPM:

```bash
npm install --save ziptied
```

Using CDN:

```html
<script src="https://unpkg.com/ziptied@latest/umd/ziptied.js"></script>
```

## Contributors

- Code, design, and documentation: [@aordano](https://github.com/aordano)
