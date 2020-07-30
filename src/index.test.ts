import {createStyles} from '@dash-ui/styles'
import responsive from './index'

describe('responsive()', () => {
  const styles = createStyles({
    tokens: {
      color: {
        white: '#fff',
      },
    },
  })
  const mediaQueries = {
    phone: 'only screen and (min-width: 0em)',
    tablet: 'only screen and (min-width: 20em)',
  } as const
  const responsiveStyles = responsive(styles, mediaQueries)

  it('should work with styles() instance', () => {
    const display = styles({
      default: {
        display: 'block',
      },
      flex: {
        display: 'flex',
      },
      inlineBlock: {
        display: 'inline-block',
      },
    })

    const responsiveDisplay = responsiveStyles(display)
    expect(responsiveDisplay.css('flex')).toBe('display:block;display:flex;')
    expect(responsiveDisplay('flex')).toBe(
      'ui-' + styles.hash('display:block;display:flex;')
    )
  })

  it('should add styles in order with styles() instance', () => {
    const display = styles({
      default: {
        display: 'block',
      },
      flex: {
        display: 'flex',
      },
      inlineBlock: {
        display: 'inline-block',
      },
    })

    const responsiveDisplay = responsiveStyles(display)
    expect(responsiveDisplay.css('flex', {phone: 'inlineBlock'}, 'flex')).toBe(
      `display:block;display:flex;@media ${mediaQueries.phone}{display:inline-block;}display:flex;`
    )
  })

  it('should provide tokens to styles() instance', () => {
    const display = styles({
      default: ({color}) => ({color: color.white}),
      backgroundColor: ({color}) => ({backgroundColor: color.white}),
    })

    const responsiveDisplay = responsiveStyles(display)
    expect(responsiveDisplay.css({phone: 'backgroundColor'})).toBe(
      `color:var(--color-white);@media ${mediaQueries.phone}{background-color:var(--color-white);}`
    )
  })

  it('should return add just the default', () => {
    const display = styles({
      default: ({color}) => ({color: color.white}),
    })

    const responsiveDisplay = responsiveStyles(display)
    expect(responsiveDisplay.css()).toBe('color:var(--color-white);')
  })

  it('should return empty string for no variant match', () => {
    const display = styles({
      backgroundColor: ({color}) => ({backgroundColor: color.white}),
    })

    const responsiveDisplay = responsiveStyles(display)
    expect(responsiveDisplay.css()).toBe('')
    expect(responsiveDisplay()).toBe('')
  })

  it('should work without default in styles() instance', () => {
    const display = styles({
      flex: {
        display: 'flex',
      },
      inlineBlock: {
        display: 'inline-block',
      },
    })

    const responsiveDisplay = responsiveStyles(display)
    expect(responsiveDisplay.css('flex')).toBe('display:flex;')
    expect(responsiveDisplay.css({phone: 'flex'})).toBe(
      `@media ${mediaQueries.phone}{display:flex;}`
    )
  })

  it('should work with style map', () => {
    const responsiveDisplay = responsiveStyles({
      default: {
        display: 'block',
      },
      flex: {
        display: 'flex',
      },
      inlineBlock: {
        display: 'inline-block',
      },
    })

    expect(responsiveDisplay.css('flex')).toBe('display:block;display:flex;')
  })

  it('should work without default in style map', () => {
    const responsiveDisplay = responsiveStyles({
      flex: {
        display: 'flex',
      },
      inlineBlock: {
        display: 'inline-block',
      },
    })

    expect(responsiveDisplay.css('flex')).toBe('display:flex;')
  })

  it('should add media queries to style map', () => {
    const responsiveDisplay = responsiveStyles({
      flex: {
        display: 'flex',
      },
      inlineBlock: {
        display: 'inline-block',
      },
    })

    expect(responsiveDisplay.css({tablet: 'inlineBlock', phone: 'flex'})).toBe(
      `@media ${mediaQueries.phone}{display:flex;}@media ${mediaQueries.tablet}{display:inline-block;}`
    )
  })

  it('should add media queries to callback', () => {
    const responsiveDisplay = responsiveStyles((value: string) => ({
      display: value,
    }))

    expect(responsiveDisplay.css({tablet: 'inline-block', phone: 'flex'})).toBe(
      `@media ${mediaQueries.phone}{display:flex;}@media ${mediaQueries.tablet}{display:inline-block;}`
    )
  })

  it('should provide query name to callback', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const responsiveCallback = jest.fn((value, queryName) => ({
      display: value,
    }))
    const responsiveDisplay = responsiveStyles(responsiveCallback)

    responsiveDisplay.css({phone: 'flex'})
    expect(responsiveCallback).toBeCalledWith('flex', 'phone')

    responsiveDisplay.css('block')
    expect(responsiveCallback).toBeCalledWith('block', 'default')
  })

  it('should provide tokens to callback', () => {
    const responsiveDisplay = responsiveStyles(
      (value: 'white') => (tokens) => ({
        color: tokens.color[value],
      })
    )

    expect(responsiveDisplay.css({phone: 'white'})).toBe(
      `@media ${mediaQueries.phone}{color:var(--color-white);}`
    )
  })
})
