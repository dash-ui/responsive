import {compileStyles} from '@dash-ui/styles'
import dashMq from '@dash-ui/mq'
import type {
  Styles,
  StyleMap,
  StyleValue,
  StyleCallback,
  StyleObject,
  StylesOne,
  DashTokens,
  Falsy,
  LazyValue,
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
  function isMediaQuery(variant: Record<string, any>) {
    return mediaQueryKeys.some((key) => key in variant)
  }

  const responsiveStyles: ResponsiveStyles<Tokens, MQ, ThemeNames> = <
    Variant extends string
  >(
    styleMap: StyleMap<Variant, Tokens>
  ) => {
    // We separate out the default style so that it will only be
    // applied one time
    const {default: defaultStyle, ...other} = styleMap
    const defaultCss = defaultStyle
      ? compileStyles(defaultStyle, styles.tokens)
      : ''
    const style = styles(other as any)

    function css(...variants: ResponsiveStyleArguments<Variant, MQ>) {
      let css = defaultCss

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i]
        if (variant === void 0) continue

        if (
          typeof variant === 'object' &&
          variant !== null &&
          isMediaQuery(variant)
        ) {
          // Media queries
          const mqs: Partial<Record<keyof MQ, StyleValue<Tokens>>> = {}

          for (let i = 0; i < mediaQueryKeys.length; i++) {
            const queryName = mediaQueryKeys[i]
            const queryValue = (variant as Responsive<Variant, MQ>)[queryName]
            if (queryValue !== void 0) {
              mqs[queryName] = style.css(queryValue)
            }
          }

          css += compileStyles(mq(mqs), styles.tokens)
        } else {
          css += style.css(variant as any)
        }
      }

      return css
    }

    const responsiveStyle: ResponsiveStyle<Variant, Tokens, MQ> = (
      ...variants: ResponsiveStyleArguments<Variant, MQ>
    ) => {
      const variantCss = css(...variants)
      if (!variantCss) return ''
      return styles.cls(variantCss)
    }

    responsiveStyle.styles = 'css' in style ? style.styles : style
    responsiveStyle.css = css
    return responsiveStyle
  }

  responsiveStyles.join = styles.join
  responsiveStyles.keyframes = styles.keyframes
  responsiveStyles.insertGlobal = styles.insertGlobal
  responsiveStyles.insertTokens = styles.insertTokens
  responsiveStyles.insertThemes = styles.insertThemes
  responsiveStyles.theme = styles.theme
  responsiveStyles.hash = styles.hash
  responsiveStyles.tokens = styles.tokens
  responsiveStyles.dash = styles.dash

  responsiveStyles.lazy = function <Variant extends LazyValue>(
    lazyFn: ResponsiveLazyCallback<Variant, Tokens, MQ>
  ) {
    const oneCache = new Map<string, StylesOne>()
    const responsiveLazy: ResponsiveLazy<Variant, MQ> = (variant) => {
      const key = JSON.stringify(variant)
      let cachedOne = oneCache.get(key)

      if (!cachedOne) {
        cachedOne = styles.one(responsiveLazy.css(variant))
        oneCache.set(key, cachedOne)
      }

      return cachedOne()
    }

    responsiveLazy.css = (variant) => {
      if (
        typeof variant === 'object' &&
        variant !== null &&
        isMediaQuery(variant as Responsive<any, MQ>)
      ) {
        // Media queries
        const mqs: Partial<Record<keyof MQ, StyleValue<Tokens>>> = {}
        return compileStyles(
          mq(
            mediaQueryKeys.reduce((acc, queryName) => {
              const queryValue = (variant as Responsive<Variant, MQ>)[queryName]
              if (queryValue !== void 0) {
                acc[queryName] = compileStyles(
                  lazyFn(queryValue as any, queryName),
                  styles.tokens
                )
              }
              return acc
            }, mqs)
          ),
          styles.tokens
        )
      }

      return compileStyles(lazyFn(variant as any, 'default'), styles.tokens)
    }

    return responsiveLazy
  }

  responsiveStyles.one = function (...args) {
    // eslint-disable-next-line prefer-rest-params
    const one = styles.one(...args)
    const oneCache = new Map<string, StylesOne>()
    const responsiveOne: ResponsiveOne<MQ> = (createClassName) => {
      if (!createClassName && createClassName !== void 0) return ''
      if (typeof createClassName === 'object') {
        const key = JSON.stringify(createClassName)
        let cachedOne = oneCache.get(key)

        if (!cachedOne) {
          cachedOne = styles.one(responsiveOne.css(createClassName))
          oneCache.set(key, cachedOne)
        }

        return cachedOne()
      } else {
        return one()
      }
    }

    responsiveOne.css = (createCss) => {
      if (typeof createCss === 'object' && createCss !== null) {
        // Media queries
        const mqs: Partial<Record<keyof MQ, StyleValue<Tokens>>> = {}
        return compileStyles(
          mq(
            mediaQueryKeys.reduce((acc, queryName) => {
              const queryValue = createCss[queryName]
              if (queryValue) {
                acc[queryName] = one.css(queryValue)
              }
              return acc
            }, mqs)
          ),
          styles.tokens
        )
      }

      return one.css(createCss)
    }

    return responsiveOne
  }

  responsiveStyles.cls = function (...args) {
    const maybeResponsiveStyle = args[0]
    if (
      typeof maybeResponsiveStyle === 'object' &&
      maybeResponsiveStyle !== null &&
      !Array.isArray(maybeResponsiveStyle) &&
      isMediaQuery(maybeResponsiveStyle)
    ) {
      const mqs: Partial<Record<keyof MQ, StyleValue<Tokens>>> = {}

      return styles.cls(
        mq(
          mediaQueryKeys.reduce((acc, queryName) => {
            const queryValue = (maybeResponsiveStyle as any)[queryName]
            if (queryValue !== void 0) {
              acc[queryName] = queryValue
            }
            return acc
          }, mqs)
        )
      )
    }

    return (styles.cls as any)(...args)
  }

  return responsiveStyles
}

export interface ResponsiveStyles<
  Tokens extends DashTokens,
  MQ extends Record<string, string>,
  ThemeNames extends string
> extends Styles<Tokens, ThemeNames> {
  <Variant extends string>(
    styleMap: StyleMap<Variant, Tokens>
  ): ResponsiveStyle<Variant, Tokens, MQ>

  lazy<Variant extends LazyValue>(
    lazyFn: ResponsiveLazyCallback<Variant, Tokens, MQ>
  ): ResponsiveLazy<Variant, MQ>

  one(
    literals:
      | TemplateStringsArray
      | string
      | StyleObject
      | StyleCallback<Tokens>,
    ...placeholders: string[]
  ): ResponsiveOne<MQ>

  cls(
    style:
      | TemplateStringsArray
      | string
      | StyleObject
      | StyleCallback<Tokens>
      | Responsive<string | StyleObject | StyleCallback<Tokens>, MQ>
  ): string
}

export type Responsive<Variant, MQ extends Record<string, string>> = {
  [key in Extract<keyof MQ, string>]?: Variant
}

export type ResponsiveStyleArguments<
  Variant extends string,
  MQ extends Record<string, string>
> = (
  | Variant
  | Falsy
  | {
      [Name in Variant]?: boolean | null | undefined | string | number
    }
  | Responsive<Variant | Falsy, MQ>
  | Responsive<
      {
        [Name in Variant]?: boolean | null | undefined | string | number
      },
      MQ
    >
)[]

export interface ResponsiveStyle<
  Variant extends string,
  Tokens extends DashTokens,
  MQ extends Record<string, string>
> {
  (...variants: ResponsiveStyleArguments<Variant, MQ>): string
  css(...variants: ResponsiveStyleArguments<Variant, MQ>): string
  styles: StyleMap<Variant, Tokens>
}

export type ResponsiveLazy<
  Value extends LazyValue,
  MQ extends Record<string, string>
> = {
  (value?: Value | Responsive<Value, MQ>): string
  /**
   * A method that returns indeterminate CSS strings based on the value
   * when called.
   *
   * @param value A JSON serializable value to create indeterminate
   *   styles from
   */
  css(value?: Value | Responsive<Value, MQ>): string
}

export type ResponsiveLazyCallback<
  Variant extends LazyValue,
  Tokens extends DashTokens,
  MQ extends Record<string, string>
> = (
  value: Variant,
  queryName: 'default' | Extract<keyof MQ, string>
) => StyleValue<Tokens>

type ResponsiveOne<MQ extends Record<string, string>> = {
  (
    createClassName?:
      | boolean
      | number
      | string
      | null
      | Responsive<boolean | number | string | null, MQ>
  ): string
  /**
   * A method that returns a CSS string when the first argument
   * is not falsy
   */
  css(
    createCss?:
      | boolean
      | number
      | string
      | null
      | Responsive<boolean | number | string | null, MQ>
  ): string
}

export default responsive
