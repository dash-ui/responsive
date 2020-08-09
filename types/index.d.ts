import type {
  Styles,
  StyleMap,
  StyleValue,
  StyleCallback,
  StyleObject,
  DashTokens,
  Falsy,
  LazyValue,
} from '@dash-ui/styles'
declare function responsive<
  Tokens extends DashTokens,
  MQ extends Record<string, string>,
  ThemeNames extends string
>(
  styles: Styles<Tokens, ThemeNames>,
  mediaQueries: MQ
): ResponsiveStyles<Tokens, MQ, ThemeNames>
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
export declare type Responsive<Variant, MQ extends Record<string, string>> = {
  [key in Extract<keyof MQ, string>]?: Variant
}
export declare type ResponsiveStyleArguments<
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
export declare type ResponsiveLazy<
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
export declare type ResponsiveLazyCallback<
  Variant extends LazyValue,
  Tokens extends DashTokens,
  MQ extends Record<string, string>
> = (
  value: Variant,
  queryName: 'default' | Extract<keyof MQ, string>
) => StyleValue<Tokens>
export declare type ResponsiveOne<MQ extends Record<string, string>> = {
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
