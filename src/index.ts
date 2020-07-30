import {compileStyles} from '@dash-ui/styles'
import dashMq from '@dash-ui/mq'
import type {
  Styles,
  Style,
  StyleMap,
  StyleValue,
  StylesOne,
  DashTokens,
} from '@dash-ui/styles'

function responsive<
  Tokens extends DashTokens,
  MQ extends Record<string, string>,
  ThemeNames extends string
>(styles: Styles<Tokens, ThemeNames>, mediaQueries: MQ) {
  const mediaQueryKeys = Object.keys(mediaQueries) as Extract<
    keyof MQ,
    string
  >[]
  const mq = dashMq<Tokens>(mediaQueries)
  const one = getOneCache(styles)

  function responsiveStyles<Variant extends string>(
    style: StyleMap<Variant, Tokens>
  ): ResponsiveStyle<Variant, Tokens, MQ>
  function responsiveStyles<Variant extends string>(
    style: Style<Variant, Tokens>
  ): ResponsiveStyle<Variant, Tokens, MQ>
  function responsiveStyles<Variant extends unknown>(
    style: ResponsiveCallback<Variant, Tokens, MQ>
  ): ResponsiveStyleWithCallback<Variant, Tokens, MQ>
  function responsiveStyles<Variant extends string>(
    style:
      | Style<Variant, Tokens>
      | StyleMap<Variant, Tokens>
      | ResponsiveCallback<Variant, Tokens, MQ>
  ): any {
    let styleMap: StyleMap<Variant, Tokens> | undefined
    let defaultStyle: StyleValue<Tokens> | undefined
    // We separate out the default style so that it will only be
    // applied one time
    if (typeof style === 'object') {
      const {default: mapDefaultStyle, ...other} = style
      defaultStyle = mapDefaultStyle
      styleMap = other as any
    } else if ('css' in style) {
      const {default: mapDefaultStyle, ...other} = style.styles
      defaultStyle = mapDefaultStyle
      styleMap = other as any
    }

    const nextStyle =
      typeof style === 'object' || 'css' in style
        ? styles(styleMap || {})
        : style

    function css(...variants: (Responsive<Variant, MQ> | undefined)[]) {
      let css = defaultStyle ? compileStyles(defaultStyle, styles.tokens) : ''

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i]
        if (variant === void 0) continue

        if (typeof variant === 'object' && !Array.isArray(variant)) {
          // Media queries
          const mqs: Partial<Record<keyof MQ, StyleValue<Tokens>>> = {}

          for (let i = 0; i < mediaQueryKeys.length; i++) {
            const queryName = mediaQueryKeys[i]
            const queryValue = variant[queryName]

            if (queryValue !== void 0) {
              mqs[queryName] =
                typeof nextStyle === 'function' && 'css' in nextStyle
                  ? nextStyle.css(queryValue)
                  : compileStyles(
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      nextStyle(queryValue!, queryName),
                      styles.tokens
                    )
            }
          }

          css += compileStyles(mq(mqs), styles.tokens)
        } else {
          css +=
            typeof nextStyle === 'function' && 'css' in nextStyle
              ? nextStyle.css(variant)
              : compileStyles(
                  nextStyle(variant as Variant, 'default'),
                  styles.tokens
                )
        }
      }

      return css
    }

    function responsiveStyle(
      ...variants: (Responsive<Variant, MQ> | undefined)[]
    ) {
      const variantCss = css(...variants)
      if (!variantCss) return ''
      return one(variantCss)()
    }

    responsiveStyle.styles = 'css' in style ? style.styles : style
    responsiveStyle.css = css
    return responsiveStyle
  }

  return responsiveStyles
}

// This puts string styles on a hot path that makes their class
// name retrieval 10x faster.
function getOneCache<Tokens extends DashTokens, ThemeNames extends string>(
  styles: Styles<Tokens, ThemeNames>
) {
  const initialCache = oneCache.get(styles)
  let cache: Map<string, StylesOne>

  /* istanbul ignore next */
  if (!initialCache) {
    cache = new Map<string, StylesOne>()
    oneCache.set(styles, cache)
  } else {
    cache = initialCache
  }

  return (style: string) => {
    let value = cache.get(style)

    if (value === void 0) {
      value = styles.one(style)
      cache.set(style, value)
    }

    return value
  }
}

const oneCache = new WeakMap<Styles<any, any>, Map<string, StylesOne>>()

export type ResponsiveCallback<
  Variant,
  Tokens extends DashTokens,
  MQ extends Record<string, string>
> = (
  queryValue: Variant,
  queryName: Extract<keyof MQ, string> | 'default'
) => StyleValue<Tokens>

export type Responsive<Variant, MQ extends Record<string, string>> =
  | Variant
  | {
      [key in Extract<keyof MQ, string>]?: Variant
    }

export interface ResponsiveStyle<
  Variant extends string,
  Tokens extends DashTokens,
  MQ extends Record<string, string>
> {
  (...variants: (Responsive<Variant, MQ> | undefined)[]): string
  css(...variants: (Responsive<Variant, MQ> | undefined)[]): string
  styles: StyleMap<Variant, Tokens>
}

export interface ResponsiveStyleWithCallback<
  Variant extends unknown,
  Tokens extends DashTokens,
  MQ extends Record<string, string>
> {
  (...variants: (Responsive<Variant, MQ> | undefined)[]): string
  css(...variants: (Responsive<Variant, MQ> | undefined)[]): string
  styles: ResponsiveCallback<Variant, Tokens, MQ>
}

export default responsive
