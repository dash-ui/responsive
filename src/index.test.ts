import { createStyles } from "@dash-ui/styles";
import responsive from "./index";

const mediaQueries = {
  phone: "only screen and (min-width: 0em)",
  tablet: "only screen and (min-width: 20em)",
  desktop: "only screen and (min-width: 50em)",
} as const;

let styles = createStyles({
  tokens: {
    color: {
      white: "#fff",
    },
  },
});

let responsiveStyles = responsive(styles, mediaQueries);

beforeEach(() => {
  styles = createStyles({
    tokens: {
      color: {
        white: "#fff",
      },
    },
  });
  responsiveStyles = responsive(styles, mediaQueries);
});

afterEach(() => {
  document.getElementsByTagName("html")[0].innerHTML = "";
});

describe("responsive()", () => {
  it("should have the same API as styles()", () => {
    expect(Object.keys(responsiveStyles).sort()).toEqual(
      Object.keys(styles).sort()
    );
  });

  it("should add styles in order", () => {
    const responsiveDisplay = responsiveStyles.variants({
      default: {
        display: "block",
      },
      flex: {
        display: "flex",
      },
      inlineBlock: {
        display: "inline-block",
      },
    });

    expect(
      responsiveDisplay.css("flex", { phone: "inlineBlock" }, { flex: true })
    ).toBe(
      `display:block;display:flex;@media ${mediaQueries.phone}{display:inline-block;}display:flex;`
    );
  });

  it("should work with nested objects", () => {
    const responsiveDisplay = responsiveStyles.variants({
      default: {
        display: "block",
      },
      flex: {
        display: "flex",
      },
      inlineBlock: {
        display: "inline-block",
      },
    });

    expect(
      responsiveDisplay.css({ phone: { inlineBlock: true, flex: true } })
    ).toBe(
      `display:block;@media ${mediaQueries.phone}{display:inline-block;display:flex;}`
    );
  });

  it("should work insert into dom with nested objects", () => {
    const responsiveDisplay = responsiveStyles.variants({
      default: {
        display: "block",
      },
      flex: {
        display: "flex",
      },
      inlineBlock: {
        display: "inline-block",
      },
    });

    expect(
      responsiveDisplay({ phone: { inlineBlock: true, flex: true } })
    ).not.toBe("");
    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(3);
    expect(document.querySelectorAll(`style[data-dash]`)[1]).toMatchSnapshot(
      "block"
    );
    expect(document.querySelectorAll(`style[data-dash]`)[2]).toMatchSnapshot(
      "inline-block+flex"
    );
  });

  it("should provide tokens", () => {
    const responsiveDisplay = responsiveStyles.variants({
      default: ({ color }) => ({ color: color.white }),
      backgroundColor: ({ color }) => ({ backgroundColor: color.white }),
    });
    expect(responsiveDisplay.css({ phone: "backgroundColor" })).toBe(
      `color:var(--color-white);@media ${mediaQueries.phone}{background-color:var(--color-white);}`
    );
  });

  it("should return add just the default", () => {
    const responsiveDisplay = responsiveStyles.variants({
      default: ({ color }) => ({ color: color.white }),
    });
    expect(responsiveDisplay.css()).toBe("color:var(--color-white);");
  });

  it("should return empty string for no variant match", () => {
    const responsiveDisplay = responsiveStyles.variants({
      backgroundColor: ({ color }) => ({ backgroundColor: color.white }),
    });
    expect(responsiveDisplay.css()).toBe("");
    expect(responsiveDisplay()).toBe("");
  });

  it("should work with style map", () => {
    const responsiveDisplay = responsiveStyles.variants({
      default: {
        display: "block",
      },
      flex: {
        display: "flex",
      },
      inlineBlock: {
        display: "inline-block",
      },
    });

    expect(responsiveDisplay.css("flex")).toBe("display:block;display:flex;");
  });

  it("should work without default in style map", () => {
    const responsiveDisplay = responsiveStyles.variants({
      flex: {
        display: "flex",
      },
      inlineBlock: {
        display: "inline-block",
      },
    });

    expect(responsiveDisplay.css("flex")).toBe("display:flex;");
  });

  it("should add media queries to style map", () => {
    const responsiveDisplay = responsiveStyles.variants({
      flex: {
        display: "flex",
      },
      inlineBlock: {
        display: "inline-block",
      },
    });

    expect(
      responsiveDisplay.css({ tablet: "inlineBlock", phone: "flex" })
    ).toBe(
      `@media ${mediaQueries.phone}{display:flex;}@media ${mediaQueries.tablet}{display:inline-block;}`
    );
  });

  it("should return empty string for misses", () => {
    const responsiveDisplay = responsiveStyles.variants({
      flex: {
        display: "flex",
      },
      inlineBlock: {
        display: "inline-block",
      },
    });

    expect(responsiveDisplay()).toBe("");
  });

  it("should hit base styles", () => {
    const responsiveDisplay = responsiveStyles.variants({
      flex: {
        display: "flex",
      },
      inlineBlock: {
        display: "inline-block",
      },
    });

    expect(responsiveDisplay("flex")).not.toBe("");
  });

  it("should insert class into the dom", () => {
    const responsiveDisplay = responsiveStyles.variants({
      flex: {
        display: "flex",
      },
      inlineBlock: {
        display: "inline-block",
      },
    });

    responsiveDisplay({
      tablet: "inlineBlock",
      phone: "flex",
    });

    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(3);
    expect(document.querySelectorAll(`style[data-dash]`)[1]).toMatchSnapshot(
      "flex"
    );
    expect(document.querySelectorAll(`style[data-dash]`)[2]).toMatchSnapshot(
      "inline-block"
    );
  });
});

describe("responsive.lazy()", () => {
  it("should insert into the dom", () => {
    const responsiveDisplay = responsiveStyles.lazy((value: string) => ({
      display: value,
    }));

    responsiveDisplay({
      tablet: "inline-block",
      phone: "flex",
      desktop: "inline-flex",
    });

    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(4);
    expect(document.querySelectorAll(`style[data-dash]`)[1]).toMatchSnapshot(
      "flex"
    );
    expect(document.querySelectorAll(`style[data-dash]`)[2]).toMatchSnapshot(
      "inline-block"
    );
    expect(document.querySelectorAll(`style[data-dash]`)[3]).toMatchSnapshot(
      "inline-flex"
    );
  });

  it("should add media queries to callback", () => {
    const responsiveDisplay = responsiveStyles.lazy((value: string) => ({
      display: value,
    }));

    expect(
      responsiveDisplay.css({ tablet: "inline-block", phone: "flex" })
    ).toBe(
      `@media ${mediaQueries.phone}{display:flex;}@media ${mediaQueries.tablet}{display:inline-block;}`
    );
  });

  it("should provide query name to callback", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const responsiveCallback = jest.fn((value, queryName) => ({
      display: value,
    }));
    const responsiveDisplay = responsiveStyles.lazy(responsiveCallback);

    responsiveDisplay.css({ phone: "flex" });
    expect(responsiveCallback).toBeCalledWith("flex", "phone");

    responsiveDisplay.css("block");
    expect(responsiveCallback).toBeCalledWith("block", "default");
  });

  it("should provide tokens to callback", () => {
    const responsiveDisplay = responsiveStyles.lazy(
      (value: "white") => (tokens) => ({
        color: tokens.color[value],
      })
    );

    expect(responsiveDisplay.css({ phone: "white" })).toBe(
      `@media ${mediaQueries.phone}{color:var(--color-white);}`
    );
  });
});

describe("responsive.one()", () => {
  it("should not insert class", () => {
    expect(
      responsiveStyles.one`
        color: red;
      `(false)
    ).toBe("");
    // This would be 2 if the class existed
    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(1);
  });

  it("should not create css", () => {
    expect(
      responsiveStyles.one`
        color: red;
      `.css(false)
    ).toBe("");
  });

  it("should act like a template literal style", () => {
    expect(
      typeof responsiveStyles.one`
        color: red;
      `()
    ).toBe("string");

    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(2);
    expect(document.querySelectorAll(`style[data-dash]`)[1]).toMatchSnapshot();
  });

  it("should act like a string style", () => {
    expect(
      typeof responsiveStyles.one(`
        color: red;
      `)()
    ).toBe("string");

    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(2);
    expect(document.querySelectorAll(`style[data-dash]`)[1]).toMatchSnapshot();
  });

  it("should act like an object style", () => {
    expect(
      typeof responsiveStyles.one({
        color: "red",
      })()
    ).toBe("string");

    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(2);
    expect(document.querySelectorAll(`style[data-dash]`)[1]).toMatchSnapshot();
  });

  it("should act like a callback style", () => {
    expect(
      typeof responsiveStyles.one(({ color }) => ({
        color: color.white,
      }))()
    ).toBe("string");

    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(2);
    expect(document.querySelectorAll(`style[data-dash]`)[1]).toMatchSnapshot();
  });

  it("should create a responsive style", () => {
    const one = responsiveStyles.one`
      color: red;
    `;

    one({
      phone: true,
      tablet: false,
      desktop: true,
    });

    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(3);
    expect(document.querySelectorAll(`style[data-dash]`)[1]).toMatchSnapshot(
      "phone"
    );
    expect(document.querySelectorAll(`style[data-dash]`)[2]).toMatchSnapshot(
      "desktop"
    );
  });
});

describe("responsive.cls()", () => {
  it("should act like a template literal style", () => {
    expect(
      typeof responsiveStyles.cls`
        color: red;
      `
    ).toBe("string");

    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(2);
    expect(document.querySelectorAll(`style[data-dash]`)[1]).toMatchSnapshot();
  });

  it("should act like a string style", () => {
    expect(
      typeof responsiveStyles.cls(`
        color: red;
      `)
    ).toBe("string");

    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(2);
    expect(document.querySelectorAll(`style[data-dash]`)[1]).toMatchSnapshot();
  });

  it("should act like an object style", () => {
    expect(
      typeof responsiveStyles.cls({
        color: "red",
      })
    ).toBe("string");

    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(2);
    expect(document.querySelectorAll(`style[data-dash]`)[1]).toMatchSnapshot();
  });

  it("should act like a callback style", () => {
    expect(
      typeof responsiveStyles.cls(({ color }) => ({
        color: color.white,
      }))
    ).toBe("string");

    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(2);
    expect(document.querySelectorAll(`style[data-dash]`)[1]).toMatchSnapshot();
  });

  it("should create a responsive style", () => {
    expect(
      typeof responsiveStyles.cls({
        desktop: `
          color: red;
        `,
        phone: ({ color }) => ({
          color: color.white,
        }),
        tablet: {
          color: "black",
        },
      })
    ).toBe("string");

    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(4);
    expect(document.querySelectorAll(`style[data-dash]`)[1]).toMatchSnapshot(
      "white"
    );
    expect(document.querySelectorAll(`style[data-dash]`)[2]).toMatchSnapshot(
      "black"
    );
    expect(document.querySelectorAll(`style[data-dash]`)[3]).toMatchSnapshot(
      "red"
    );
  });
});
