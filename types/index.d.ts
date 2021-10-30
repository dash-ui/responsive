import type {
  DashThemes,
  DashTokens,
  Falsy,
  LazyValue,
  StyleCallback,
  StyleMap,
  StyleObject,
  Styles,
  StyleValue,
} from "@dash-ui/styles";
declare function responsive<
  Tokens extends DashTokens,
  Themes extends DashThemes,
  MQ extends Record<string, string>
>(
  styles: Styles<Tokens, Themes>,
  mediaQueries: MQ
): ResponsiveStyles<Tokens, Themes, MQ>;
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
export declare type Responsive<
  Variant,
  MQ extends Record<string | number, string>
> = {
  [key in Extract<keyof MQ, string | number>]?: Variant;
};
export declare type ResponsiveStyleArguments<
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
export declare type ResponsiveLazy<
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
export declare type ResponsiveLazyCallback<
  Variant extends LazyValue,
  Tokens extends DashTokens,
  Themes extends DashThemes,
  MQ extends Record<string | number, string>
> = (
  value: Variant,
  queryName: "default" | Extract<keyof MQ, string | number>
) => StyleValue<Tokens, Themes>;
export declare type ResponsiveOne<MQ extends Record<string, string>> = {
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
