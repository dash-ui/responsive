import type {
  Styles,
  Style,
  StyleMap,
  StyleValue,
  DashTokens,
} from '@dash-ui/styles'
declare function responsive<
  Tokens extends DashTokens,
  MQ extends Record<string, string>,
  ThemeNames extends string
>(
  styles: Styles<Tokens, ThemeNames>,
  mediaQueries: MQ
): {
  <Variant extends string>(style: StyleMap<Variant, Tokens>): ResponsiveStyle<
    Variant,
    MQ
  >
  <Variant_1 extends string>(style: Style<Variant_1, Tokens>): ResponsiveStyle<
    Variant_1,
    MQ
  >
  <Variant_2 extends unknown>(
    style: ResponsiveCallback<Variant_2, Tokens, MQ>
  ): ResponsiveStyle<Variant_2, MQ>
}
export declare type ResponsiveCallback<
  Variant,
  Tokens extends DashTokens,
  MQ extends Record<string, string>
> = (
  queryValue: Variant,
  queryName: Extract<keyof MQ, string> | 'default'
) => StyleValue<Tokens>
export declare type Responsive<Variant, MQ extends Record<string, string>> =
  | Variant
  | {
      [key in Extract<keyof MQ, string>]?: Variant
    }
export interface ResponsiveStyle<Variant, MQ extends Record<string, string>> {
  (...variants: Responsive<Variant, MQ>[]): string
  css(...variants: Responsive<Variant, MQ>[]): string
}
export default responsive
