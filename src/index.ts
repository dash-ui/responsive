/* eslint-disable prefer-rest-params */
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

  function isMediaQuery(variant: Record<string | number, any>) {
    for (let i = 0; i < numMediaQueryKeys; i++)
      if (variant[mediaQueryKeys[i]] !== void 0) return true;

    return false;
  }

  const responsiveStyles: ResponsiveStyles<Tokens, Themes, MQ> = {
    ...styles,
    variants<Variant extends string | number>(
      styleMap: StyleMap<Variant, Tokens>
    ) {
      // We separate out the default style so that it will only be
      // applied one time
      const style = styles.variants(styleMap);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { default: defaultStyle, ...styleMapWithoutDefault } = styleMap;
      const styleWithoutDefault = styles.variants(
        styleMapWithoutDefault as any
      );
      const defaultCss = style.css();

      function css() {
        const variants = arguments as unknown as ResponsiveStyleArguments<
          Variant,
          MQ
        >[];
        let css = defaultCss;

        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];
          if (variant === void 0) continue;

          if (
            typeof variant === "object" &&
            variant !== null &&
            isMediaQuery(variant)
          ) {
            for (let j = 0; j < numMediaQueryKeys; j++) {
              const queryName = mediaQueryKeys[j];
              const queryValue = (variant as Responsive<Variant, MQ>)[
                queryName
              ];
              if (queryValue !== void 0) {
                css +=
                  "@media " +
                  mediaQueries[queryName] +
                  "{" +
                  styleWithoutDefault.css(queryValue) +
                  "}";
              }
            }
          } else {
            css += styleWithoutDefault.css(variant as any);
          }
        }

        return css;
      }
      const oneCache = new Map<string, StylesOne>();
      const responsiveStyle: ResponsiveStyle<Variant, Tokens, Themes, MQ> =
        function () {
          if (
            arguments.length === 0 ||
            (arguments.length === 1 && typeof arguments[0] !== "object")
          ) {
            return style(arguments[0]);
          }
          let key = "";
          for (let i = 0; i < arguments.length; i++) {
            key +=
              typeof arguments[i] === "object" && arguments[i] !== null
                ? fastStringify(arguments[i])
                : arguments[i] + "";
          }

          let cachedOne = oneCache.get(key);

          if (!cachedOne) {
            // eslint-disable-next-line prefer-spread
            cachedOne = styles.one(css.apply(null, arguments as any));
            oneCache.set(key, cachedOne);
          }

          return cachedOne();
        };

      responsiveStyle.styles = "css" in style ? (style.styles as any) : style;
      responsiveStyle.css = css;
      return responsiveStyle;
    },
    lazy<Variant extends LazyValue>(
      lazyFn: ResponsiveLazyCallback<Variant, Tokens, Themes, MQ>
    ) {
      const oneCache = new Map<string, StylesOne>();
      const baseLazy = styles.lazy(lazyFn as any);
      const responsiveLazy: ResponsiveLazy<Variant, MQ> = (variant) => {
        if (typeof variant !== "object" || variant === null)
          return baseLazy(variant);
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
          let css = "";

          for (let i = 0; i < numMediaQueryKeys; i++) {
            const queryName = mediaQueryKeys[i];
            const queryValue = (variant as Responsive<Variant, MQ>)[queryName];
            if (queryValue !== void 0) {
              css +=
                "@media " +
                mediaQueries[queryName] +
                "{" +
                compileStyles(
                  lazyFn(queryValue as any, queryName),
                  styles.tokens
                ) +
                "}";
            }
          }

          return css;
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
        if (typeof createClassName === "object" && createClassName !== null) {
          const key = fastStringify(createClassName);
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
          let css = "";
          for (let i = 0; i < numMediaQueryKeys; i++) {
            const queryName = mediaQueryKeys[i];
            const queryValue = (createCss as Responsive<any, MQ>)[queryName];
            if (queryValue !== void 0 && queryValue) {
              css +=
                "@media " + mediaQueries[queryName] + "{" + one.css() + "}";
            }
          }
          return css;
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
        // Media queries
        let css = "";

        for (let i = 0; i < numMediaQueryKeys; i++) {
          const queryName = mediaQueryKeys[i];
          const queryValue = (maybeResponsiveStyle as any)[queryName];
          if (queryValue !== void 0 && queryValue) {
            css +=
              "@media " +
              mediaQueries[queryName] +
              "{" +
              compileStyles(queryValue, styles.tokens) +
              "}";
          }
        }

        return styles.cls(css);
      }

      // eslint-disable-next-line prefer-rest-params
      return (styles.cls as any).apply(styles, arguments);
    },
  };

  return typeof process !== "undefined" && process.env.NODE_ENV !== "produciton"
    ? Object.freeze(responsiveStyles)
    : responsiveStyles;
}

function fastStringify(obj: Record<string, unknown>) {
  let key = "";
  for (const k in obj)
    key +=
      k +
      ":" +
      (typeof obj[k] === "object" && obj[k] !== null
        ? "{" + fastStringify(obj[k] as any) + "}"
        : obj[k]) +
      ";";
  return key;
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
