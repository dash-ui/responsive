import dashMq from "@dash-ui/mq";
import { compileStyles } from "@dash-ui/styles";
import type {
  DashThemes,
  DashTokens,
  Falsy,
  LazyValue,
  StyleCallback,
  StyleMap,
  StyleObject,
  Styles,
  StylesOne,
  StyleValue,
} from "@dash-ui/styles";

function responsive<
  Tokens extends DashTokens,
  Themes extends DashThemes,
  MQ extends Record<string, string>
>(styles: Styles<Tokens, Themes>, mediaQueries: MQ) {
  const mediaQueryKeys = Object.keys(mediaQueries) as Extract<
    keyof MQ,
    string | number
  >[];
  const numMediaQueryKeys = mediaQueryKeys.length;
  const mq = dashMq(styles, mediaQueries);
  function isMediaQuery(variant: Record<string, any>) {
    for (let i = 0; i < numMediaQueryKeys; i++)
      if (String(mediaQueryKeys[i]) in variant) return true;

    return false;
  }

  const responsiveStyles: ResponsiveStyles<Tokens, Themes, MQ> = {
    ...styles,
    variants<Variant extends string | number>(
      styleMap: StyleMap<Variant, Tokens>
    ) {
      // We separate out the default style so that it will only be
      // applied one time
      const { default: defaultStyle, ...other } = styleMap;
      const defaultCss = defaultStyle
        ? compileStyles(defaultStyle, styles.tokens)
        : "";
      const style = styles.variants(other as any);

      function css(...variants: ResponsiveStyleArguments<Variant, MQ>) {
        let css = defaultCss;

        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];
          if (variant === void 0) continue;

          if (
            typeof variant === "object" &&
            variant !== null &&
            isMediaQuery(variant)
          ) {
            // Media queries
            const mqs: Partial<
              Record<
                Extract<keyof MQ, string | number>,
                StyleValue<Tokens, Themes>
              >
            > = {};

            for (let i = 0; i < mediaQueryKeys.length; i++) {
              const queryName = mediaQueryKeys[i];
              const queryValue = (variant as Responsive<Variant, MQ>)[
                queryName
              ];
              if (queryValue !== void 0) {
                mqs[queryName] = style.css(queryValue);
              }
            }

            css += mq(mqs);
          } else {
            css += style.css(variant as any);
          }
        }

        return css;
      }

      const responsiveStyle: ResponsiveStyle<Variant, Tokens, Themes, MQ> = (
        ...variants: ResponsiveStyleArguments<Variant, MQ>
      ) => {
        const variantCss = css(...variants);
        if (!variantCss) return "";
        return styles.cls(variantCss);
      };

      responsiveStyle.styles = "css" in style ? (style.styles as any) : style;
      responsiveStyle.css = css;
      return responsiveStyle;
    },
    lazy<Variant extends LazyValue>(
      lazyFn: ResponsiveLazyCallback<Variant, Tokens, Themes, MQ>
    ) {
      const oneCache = new Map<string, StylesOne>();
      const responsiveLazy: ResponsiveLazy<Variant, MQ> = (variant) => {
        const key = JSON.stringify(variant);
        let cachedOne = oneCache.get(key);

        if (!cachedOne) {
          cachedOne = styles.one(responsiveLazy.css(variant));
          oneCache.set(key, cachedOne);
        }

        return cachedOne();
      };

      responsiveLazy.css = (variant) => {
        if (
          typeof variant === "object" &&
          variant !== null &&
          isMediaQuery(variant as Responsive<any, MQ>)
        ) {
          // Media queries
          const mqs: Partial<Record<keyof MQ, StyleValue<Tokens, Themes>>> = {};
          return mq(
            mediaQueryKeys.reduce((acc, queryName) => {
              const queryValue = (variant as Responsive<Variant, MQ>)[
                queryName
              ];
              if (queryValue !== void 0) {
                acc[queryName] = compileStyles(
                  lazyFn(queryValue as any, queryName),
                  styles.tokens
                );
              }
              return acc;
            }, mqs)
          );
        }

        return compileStyles(lazyFn(variant as any, "default"), styles.tokens);
      };

      return responsiveLazy;
    },
    one() {
      // eslint-disable-next-line
      const one = styles.one.apply(styles, arguments as any);
      const oneCache = new Map<string, StylesOne>();
      const responsiveOne: ResponsiveOne<MQ> = (createClassName) => {
        if (!createClassName && createClassName !== void 0) return "";
        if (typeof createClassName === "object") {
          const key = JSON.stringify(createClassName);
          let cachedOne = oneCache.get(key);

          if (!cachedOne) {
            cachedOne = styles.one(responsiveOne.css(createClassName));
            oneCache.set(key, cachedOne);
          }

          return cachedOne();
        } else {
          return one();
        }
      };

      responsiveOne.css = (createCss) => {
        if (typeof createCss === "object" && createCss !== null) {
          // Media queries
          const mqs: Partial<Record<keyof MQ, StyleValue<Tokens, Themes>>> = {};
          return mq(
            mediaQueryKeys.reduce((acc, queryName) => {
              const queryValue = createCss[queryName];
              if (queryValue) {
                acc[queryName] = one.css(queryValue);
              }
              return acc;
            }, mqs)
          );
        }

        return one.css(createCss);
      };

      return responsiveOne;
    },
    cls() {
      // eslint-disable-next-line prefer-rest-params
      const maybeResponsiveStyle = arguments[0];
      if (
        typeof maybeResponsiveStyle === "object" &&
        maybeResponsiveStyle !== null &&
        !Array.isArray(maybeResponsiveStyle) &&
        isMediaQuery(maybeResponsiveStyle)
      ) {
        const mqs: Partial<Record<keyof MQ, StyleValue<Tokens, Themes>>> = {};

        return styles.cls(
          mq(
            mediaQueryKeys.reduce((acc, queryName) => {
              const queryValue = (maybeResponsiveStyle as any)[queryName];
              if (queryValue !== void 0) {
                acc[queryName] = queryValue;
              }
              return acc;
            }, mqs)
          )
        );
      }

      // eslint-disable-next-line prefer-rest-params
      return (styles.cls as any).apply(styles, arguments);
    },
  };

  return typeof process !== "undefined" && process.env.NODE_ENV !== "produciton"
    ? Object.freeze(responsiveStyles)
    : responsiveStyles;
}

export interface ResponsiveStyles<
  Tokens extends DashTokens,
  Themes extends DashThemes,
  MQ extends Record<string, string>
> extends Styles<Tokens, Themes> {
  variants<Variant extends string | number>(
    styleMap: StyleMap<Variant, Tokens, Themes>
  ): ResponsiveStyle<Variant, Tokens, Themes, MQ>;

  lazy<Variant extends LazyValue>(
    lazyFn: ResponsiveLazyCallback<Variant, Tokens, Themes, MQ>
  ): ResponsiveLazy<Variant, MQ>;

  one(
    literals:
      | TemplateStringsArray
      | string
      | StyleObject
      | StyleCallback<Tokens, Themes>,
    ...placeholders: string[]
  ): ResponsiveOne<MQ>;

  cls(
    style:
      | TemplateStringsArray
      | string
      | StyleObject
      | StyleCallback<Tokens, Themes>
      | Responsive<string | StyleObject | StyleCallback<Tokens, Themes>, MQ>
  ): string;
}

export type Responsive<Variant, MQ extends Record<string | number, string>> = {
  [key in Extract<keyof MQ, string | number>]?: Variant;
};

export type ResponsiveStyleArguments<
  Variant extends string | number,
  MQ extends Record<string | number, string>
> = (
  | Variant
  | Falsy
  | {
      [Name in Variant]?: boolean | null | undefined | string | number;
    }
  | Responsive<Variant | Falsy, MQ>
  | Responsive<
      {
        [Name in Variant]?: boolean | null | undefined | string | number;
      },
      MQ
    >
)[];

export interface ResponsiveStyle<
  Variant extends string | number,
  Tokens extends DashTokens,
  Themes extends DashThemes,
  MQ extends Record<string | number, string>
> {
  (...variants: ResponsiveStyleArguments<Variant, MQ>): string;
  css(...variants: ResponsiveStyleArguments<Variant, MQ>): string;
  styles: StyleMap<Variant, Tokens, Themes>;
}

export type ResponsiveLazy<
  Value extends LazyValue,
  MQ extends Record<string | number, string>
> = {
  (value?: Value | Responsive<Value, MQ>): string;
  /**
   * A method that returns indeterminate CSS strings based on the value
   * when called.
   *
   * @param value - A JSON serializable value to create indeterminate
   *   styles from
   */
  css(value?: Value | Responsive<Value, MQ>): string;
};

export type ResponsiveLazyCallback<
  Variant extends LazyValue,
  Tokens extends DashTokens,
  Themes extends DashThemes,
  MQ extends Record<string | number, string>
> = (
  value: Variant,
  queryName: "default" | Extract<keyof MQ, string | number>
) => StyleValue<Tokens, Themes>;

export type ResponsiveOne<MQ extends Record<string, string>> = {
  (
    createClassName?:
      | boolean
      | number
      | string
      | null
      | Responsive<boolean | number | string | null, MQ>
  ): string;
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
  ): string;
};

export default responsive;
