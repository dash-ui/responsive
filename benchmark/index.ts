import bench from '@essentials/benchmark'
import {styles} from '@dash-ui/styles'
// eslint-disable-next-line
import responsive from '../dist/module'

const responsiveStyle = responsive(styles, {
  sm: 'only screen and (min-width: 20em)',
  md: 'only screen and (min-width: 50em)',
})

const responsiveA = responsiveStyle({
  default: {
    width: 200,
    height: 600,
  },
  md: {
    width: 400,
    height: 800,
  },
})

bench('normal variant', () => {
  responsiveA('md')
})

bench(`responsive variant`, () => {
  responsiveA({sm: 'md'})
})

const responsiveB = responsiveStyle({
  default: `
    width: 200px;
    height: 600px;
  `,
  md: `
    width: 400px;
    height: 800px;
  `,
})

bench('normal variant [string]', () => {
  responsiveB('md')
})

bench(`responsive variant [string]`, () => {
  responsiveB({sm: 'md'})
})

const responsiveC = responsiveStyle((queryValue) => {
  if (queryValue === 'md') {
    return `
      width: 400px;
      height: 800px;
    `
  }

  return `
      width: 200px;
      height: 600px;
    `
})

bench('normal variant [callback]', () => {
  responsiveC('md')
})

bench(`responsive variant [callback]`, () => {
  responsiveC({sm: 'md'})
})

const responsiveD = responsiveStyle((queryValue) => {
  if (queryValue === 'md') {
    return {
      width: 400,
      height: 800,
    }
  }

  return {
    width: 200,
    height: 600,
  }
})

bench('normal variant [callback obj]', () => {
  responsiveD('md')
})

bench(`responsive variant [callback obj]`, () => {
  responsiveD({sm: 'md'})
})
