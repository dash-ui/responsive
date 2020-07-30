<hr/>

# @dash-ui/responsive

> A library for adding responsive styles to components with [dash-ui](https://github.com/dash-ui)

```sh
npm i @dash-ui/responsive
```

<p>
  <a href="https://bundlephobia.com/result?p=@dash-ui/responsive">
    <img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/@dash-ui/responsive?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Types" href="https://www.npmjs.com/package/@dash-ui/responsive">
    <img alt="Types" src="https://img.shields.io/npm/types/@dash-ui/responsive?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Code coverage report" href="https://codecov.io/gh/dash-ui/responsive">
    <img alt="Code coverage" src="https://img.shields.io/codecov/c/gh/dash-ui/responsive?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Build status" href="https://travis-ci.com/dash-ui/responsive">
    <img alt="Build status" src="https://img.shields.io/travis/com/dash-ui/responsive?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@dash-ui/responsive">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/@dash-ui/responsive?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="License" href="https://jaredlunde.mit-license.org/">
    <img alt="MIT License" src="https://img.shields.io/npm/l/@dash-ui/responsive?style=for-the-badge&labelColor=24292e">
  </a>
</p>

---

## Quick start

```tsx
import {styles} from '@dash-ui/styles'
import responsive from '@dash-ui/responsive'

const responsiveStyle = responsive(styles, {
  phone: 'only screen and (min-width: 0em)'
  tablet: 'only screen and (min-width: 20em)'
  desktop: 'only screen and (min-width: 50em)'
})

const myResponsiveStyle = responsiveStyle({
  default: {
    display: 'block'
  },
  flex: {
    display: 'flex'
  }
})

const MyComponent = ({display}) => {
  return <div className={myResponsiveStyle(display)}/>
}

<MyComponent display={{phone: 'default', tablet: 'flex'}}/>
```

## API

### responsive()

#### Arguments

| Name | Type | Default | Required? | Description |
| ---- | ---- | ------- | --------- | ----------- |
|      |      |         |           |             |

## LICENSE

MIT
